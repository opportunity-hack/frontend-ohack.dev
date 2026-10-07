import {
  fetchGatewayKeyStatuses,
  fetchAdminGatewayKey,
  rotateGatewayKey,
  provisionGatewayKey,
  gatewayErrorMessage,
} from "../adminTeamApi";

const params = { apiServerUrl: "https://api.test", accessToken: "tok", orgId: "org-1" };
const notFound = () => Object.assign(new Error("404"), { response: { status: 404, data: {} } });

describe("adminTeamApi gateway helpers", () => {
  it("fetches statuses in one call with Bearer + X-Org-Id and merges the keys map", async () => {
    const client = {
      get: jest.fn().mockResolvedValue({ data: { keys: { a: { status: "active" }, b: { status: "missing" } } } }),
    };
    const out = await fetchGatewayKeyStatuses(["a", "b", "a", null], params, { client });
    expect(client.get).toHaveBeenCalledTimes(1);
    const [url, opts] = client.get.mock.calls[0];
    expect(url).toBe("https://api.test/api/team/admin/gateway-keys");
    expect(opts.params).toEqual({ team_ids: "a,b" });
    expect(opts.headers).toEqual({ Authorization: "Bearer tok", "X-Org-Id": "org-1" });
    expect(out).toEqual({ a: { status: "active" }, b: { status: "missing" } });
  });

  it("chunks large id lists under the backend cap", async () => {
    const client = { get: jest.fn().mockResolvedValue({ data: { keys: {} } }) };
    await fetchGatewayKeyStatuses(Array.from({ length: 301 }, (_, i) => `t${i}`), params, { client });
    expect(client.get).toHaveBeenCalledTimes(3);
  });

  it("resolves null on a 404 (older backend) so the UI can hide the column", async () => {
    const client = { get: jest.fn().mockRejectedValue(notFound()) };
    await expect(fetchGatewayKeyStatuses(["a"], params, { client })).resolves.toBeNull();
  });

  it("returns {} without calling the backend when there are no ids", async () => {
    const client = { get: jest.fn() };
    await expect(fetchGatewayKeyStatuses([], params, { client })).resolves.toEqual({});
    expect(client.get).not.toHaveBeenCalled();
  });

  it("reveal / rotate / provision hit the per-team routes", async () => {
    const client = {
      get: jest.fn().mockResolvedValue({ data: { key: "sk-1", spend: 2 } }),
      post: jest.fn().mockResolvedValue({ data: { key_alias: "fall26-t 1" } }),
    };
    await expect(fetchAdminGatewayKey("t 1", params, { client })).resolves.toEqual({ key: "sk-1", spend: 2 });
    expect(client.get.mock.calls[0][0]).toBe("https://api.test/api/team/t%201/gateway-key");
    await rotateGatewayKey("t 1", params, { client });
    expect(client.post.mock.calls[0][0]).toBe("https://api.test/api/team/t%201/gateway-key/rotate");
    await provisionGatewayKey("t 1", params, { client });
    expect(client.post.mock.calls[1][0]).toBe("https://api.test/api/team/t%201/gateway-key/retry");
  });

  it("turns backend error codes into readable messages", () => {
    const mk = (status, data) => Object.assign(new Error("x"), { response: { status, data } });
    expect(gatewayErrorMessage(mk(404, { error: "key_not_provisioned" }))).toMatch(/No key has been minted/);
    expect(gatewayErrorMessage(mk(403, { error: "not_team_member" }))).toMatch(/Not allowed/);
    expect(gatewayErrorMessage(mk(502, { error: "rotation failed: boom" }))).toBe("rotation failed: boom");
    expect(gatewayErrorMessage(mk(404, {}))).toMatch(/doesn't support gateway keys/);
    expect(gatewayErrorMessage(mk(502, {}))).toMatch(/gateway didn't respond/);
    expect(gatewayErrorMessage(new Error("Network Error"))).toBe("Network Error");
  });
});
