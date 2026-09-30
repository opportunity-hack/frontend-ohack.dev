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
process.env.NEXT_PUBLIC_API_SERVER_URL = "https://api.test";
const handler = require("../checkout").default;

function mockRes() {
  const res = {};
  res.status = jest.fn(() => res);
  res.json = jest.fn(() => res);
  res.setHeader = jest.fn();
  return res;
}

function eventResponse(hackerDeposit) {
  return Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({ constraints: { hacker_deposit: hackerDeposit } }),
  });
}

async function call(amount_cents) {
  const req = {
    method: "POST",
    headers: { host: "localhost:3000" },
    body: { event_id: "fall-2026", amount_cents, disposition: "refund" },
  };
  const res = mockRes();
  await handler(req, res);
  return res;
}

beforeEach(() => {
  mockCreate.mockClear();
  global.fetch = jest.fn();
  jest.spyOn(console, "warn").mockImplementation(() => {});
});

describe("hacker-deposit checkout", () => {
  it("rejects when the event has deposits disabled", async () => {
    global.fetch.mockReturnValue(eventResponse({ enabled: false }));
    const res = await call(1000);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "deposits_disabled" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects an amount below the event minimum", async () => {
    global.fetch.mockReturnValue(
      eventResponse({ enabled: true, default_amount_cents: 2500 })
    );
    const res = await call(500);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "amount_below_minimum",
      minimum_cents: 2500,
    });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("fails open when the event lookup throws", async () => {
    global.fetch.mockRejectedValue(new Error("timeout"));
    const res = await call(500);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("creates the session at/above the minimum with no-store caching", async () => {
    global.fetch.mockReturnValue(
      eventResponse({ enabled: true, default_amount_cents: 2500 })
    );
    const res = await call(2500);
    expect(global.fetch.mock.calls[0][0]).toBe(
      "https://api.test/api/messages/hackathon/fall-2026"
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(mockCreate.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(2500);
    expect(res.setHeader).toHaveBeenCalledWith("Cache-Control", "private, no-store");
  });
});
