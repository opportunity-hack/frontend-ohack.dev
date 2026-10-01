/** @jest-environment node */
import { fetchTeamAndEvent } from "../teamPageData";

const res = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });

function mockFetch(teamRes, eventRes) {
  global.fetch = jest.fn((url) => Promise.resolve(url.includes("/team/") ? teamRes : eventRes));
}

test("team 503 throws (ISR keeps the last good copy instead of caching a 404)", async () => {
  mockFetch(res(503, {}), res(200, { id: "e" }));
  await expect(fetchTeamAndEvent("e", "t")).rejects.toThrow(/503/);
});

test("team 404 -> notFound", async () => {
  mockFetch(res(404, {}), res(200, { id: "e" }));
  await expect(fetchTeamAndEvent("e", "t")).resolves.toEqual({ notFound: true });
});

test("ok -> teamData + eventData; event failure -> eventData null", async () => {
  mockFetch(res(200, { team: { id: "t" } }), res(200, { id: "e" }));
  await expect(fetchTeamAndEvent("e", "t")).resolves.toEqual({ teamData: { id: "t" }, eventData: { id: "e" } });
  mockFetch(res(200, { id: "t" }), res(500, {}));
  await expect(fetchTeamAndEvent("e", "t")).resolves.toEqual({ teamData: { id: "t" }, eventData: null });
});
