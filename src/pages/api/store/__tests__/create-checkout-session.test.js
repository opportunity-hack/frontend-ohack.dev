/** @jest-environment node */
const mockCreate = jest
  .fn()
  .mockResolvedValue({ id: "cs_1", url: "https://stripe.test/x" });
jest.mock("stripe", () =>
  jest.fn().mockImplementation(() => ({
    checkout: { sessions: { create: mockCreate } },
  }))
);

process.env.STRIPE_SECRET_KEY = "sk_test_x";
const handler = require("../create-checkout-session").default;
const products = require("../../../../data/store-products.json");

const withVariations = products.find((p) => p.variations);

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.setHeader = jest.fn();
  return res;
}

function call(items) {
  const req = {
    method: "POST",
    headers: { host: "localhost:3000" },
    body: { items },
  };
  const res = mockRes();
  return handler(req, res).then(() => res);
}

function validVariations(product) {
  return Object.fromEntries(
    Object.entries(product.variations).map(([k, v]) => [k, v[0]])
  );
}

beforeEach(() => mockCreate.mockClear());

describe("store create-checkout-session", () => {
  it("prices from the catalog, not the request body", async () => {
    const res = await call([
      {
        id: withVariations.id,
        name: "Free stuff",
        price: 0.01,
        image: "/evil.png",
        quantity: 2,
        selectedVariations: validVariations(withVariations),
      },
    ]);
    expect(res.status).toHaveBeenCalledWith(200);
    const line = mockCreate.mock.calls[0][0].line_items[0];
    expect(line.price_data.unit_amount).toBe(
      Math.round(withVariations.price * 100)
    );
    expect(line.price_data.product_data.name).toBe(withVariations.name);
    expect(line.quantity).toBe(2);
  });

  it.each([
    ["unknown product id", { id: "nope", quantity: 1 }],
    [
      "invalid variation value",
      { id: withVariations.id, quantity: 1, selectedVariations: { Size: "XXXXL" } },
    ],
    [
      "unknown variation key",
      { id: withVariations.id, quantity: 1, selectedVariations: { Price: "0" } },
    ],
    ["quantity 0", { id: withVariations.id, quantity: 0 }],
    ["quantity 51", { id: withVariations.id, quantity: 51 }],
  ])("rejects %s with 400", async (_label, item) => {
    const res = await call([item]);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
