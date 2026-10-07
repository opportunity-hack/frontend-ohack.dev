/** @jest-environment node */
import { fetchForStaticProps, NOT_FOUND_REVALIDATE } from "../ssgFetch";

const res = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

beforeEach(() => {
  global.fetch = jest.fn();
});

test("404 -> not_found", async () => {
  fetch.mockResolvedValue(res(404, {}));
  await expect(fetchForStaticProps("u")).resolves.toEqual({ kind: "not_found" });
});

test("200 + isEmpty -> not_found", async () => {
  fetch.mockResolvedValue(res(200, { nonprofits: null }));
  await expect(fetchForStaticProps("u", { isEmpty: (d) => !d.nonprofits })).resolves.toEqual({ kind: "not_found" });
});

test.each([429, 500])("%i -> throws", async (status) => {
  fetch.mockResolvedValue(res(status, {}));
  await expect(fetchForStaticProps("http://x/y")).rejects.toThrow(`Upstream ${status} for http://x/y`);
});

test("network error -> throws", async () => {
  fetch.mockRejectedValue(new TypeError("fetch failed"));
  await expect(fetchForStaticProps("u")).rejects.toThrow("fetch failed");
});

test("200 -> ok with data, passes a timeout signal", async () => {
  fetch.mockResolvedValue(res(200, { a: 1 }));
  await expect(fetchForStaticProps("u", { init: { headers: { h: "1" } } })).resolves.toEqual({ kind: "ok", data: { a: 1 } });
  const [, init] = fetch.mock.calls[0];
  expect(init.headers).toEqual({ h: "1" });
  expect(init.signal).toBeDefined();
  expect(NOT_FOUND_REVALIDATE).toBe(60);
});
