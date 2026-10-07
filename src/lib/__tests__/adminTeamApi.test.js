import { fetchAdminTeamDetail, isNotFound } from "../adminTeamApi";

describe("fetchAdminTeamDetail", () => {
  const opts = {
    apiServerUrl: "https://api.example.com",
    accessToken: "token-123",
    orgId: "org-abc",
  };

  const expectedHeaders = {
    Authorization: `Bearer ${opts.accessToken}`,
    "X-Org-Id": opts.orgId,
  };

  it("returns the admin route's data and never calls the public route when the admin route resolves", async () => {
    const adminData = { team: { id: "t1", admin_notes: "secret" } };
    const client = { get: jest.fn().mockResolvedValue({ data: adminData }) };

    const result = await fetchAdminTeamDetail("t1", opts, { client });

    expect(result).toEqual(adminData);
    expect(client.get).toHaveBeenCalledTimes(1);
    expect(client.get).toHaveBeenCalledWith(
      "https://api.example.com/api/team/admin/t1",
      { headers: expectedHeaders },
    );
  });

  it("falls back to the public route on a 404 from the admin route, using the same headers", async () => {
    const publicData = { team: { id: "t1" } };
    const notFoundError = { response: { status: 404 } };
    const client = {
      get: jest
        .fn()
        .mockRejectedValueOnce(notFoundError)
        .mockResolvedValueOnce({ data: publicData }),
    };

    const result = await fetchAdminTeamDetail("t1", opts, { client });

    expect(result).toEqual(publicData);
    expect(client.get).toHaveBeenCalledTimes(2);
    expect(client.get).toHaveBeenNthCalledWith(
      1,
      "https://api.example.com/api/team/admin/t1",
      { headers: expectedHeaders },
    );
    expect(client.get).toHaveBeenNthCalledWith(
      2,
      "https://api.example.com/api/messages/team/t1",
      { headers: expectedHeaders },
    );
  });

  it("rethrows non-404 errors from the admin route without calling the public route", async () => {
    const serverError = { response: { status: 500 } };
    const client = { get: jest.fn().mockRejectedValue(serverError) };

    await expect(fetchAdminTeamDetail("t1", opts, { client })).rejects.toBe(
      serverError,
    );
    expect(client.get).toHaveBeenCalledTimes(1);
  });
});

describe("isNotFound", () => {
  it.each([
    [{ response: { status: 404 } }, true],
    [{ response: { status: 500 } }, false],
    [{ response: { status: 200 } }, false],
    [{}, false],
    [null, false],
    [undefined, false],
  ])("isNotFound(%o) -> %s", (err, expected) => {
    expect(isNotFound(err)).toBe(expected);
  });
});
