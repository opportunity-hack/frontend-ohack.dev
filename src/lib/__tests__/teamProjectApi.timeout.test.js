import {
  APPROVE_TIMEOUT_COPY,
  APPROVE_TIMEOUT_MS,
  QUEUE_TIMEOUT_COPY,
  QUEUE_TIMEOUT_MS,
  approveTeamProject,
  isRequestTimeout,
  queueTeam,
  toTeamProjectError,
} from "../teamProjectApi";

const timeoutError = (code = "ECONNABORTED") => {
  const err = new Error("timeout of 30000ms exceeded");
  err.code = code;
  return err;
};

describe("client timeouts", () => {
  it("recognises axios timeouts only when no response arrived", () => {
    expect(isRequestTimeout(timeoutError())).toBe(true);
    expect(isRequestTimeout(timeoutError("ETIMEDOUT"))).toBe(true);
    const withResponse = timeoutError();
    withResponse.response = { status: 504 };
    expect(isRequestTimeout(withResponse)).toBe(false);
    expect(isRequestTimeout(new Error("Network Error"))).toBe(false);
  });

  it("maps a timeout to code 'timeout' with the still-running copy", () => {
    const err = toTeamProjectError(timeoutError(), "Failed", "Still going");
    expect(err.code).toBe("timeout");
    expect(err.message).toBe("Still going");
  });

  it("approve waits long enough and reports a timeout as 'may still finish'", async () => {
    const client = { post: jest.fn().mockRejectedValue(timeoutError()) };
    await expect(
      approveTeamProject(
        { teamId: "t1", nonprofitId: "n1", problemStatementId: "p1" },
        { token: "tok", orgId: "org" },
        { client },
      ),
    ).rejects.toMatchObject({ code: "timeout", message: APPROVE_TIMEOUT_COPY });
    expect(client.post.mock.calls[0][2].timeout).toBe(APPROVE_TIMEOUT_MS);
  });

  it("team creation waits long enough and reports a timeout as 'may have gone through'", async () => {
    const client = { post: jest.fn().mockRejectedValue(timeoutError()) };
    await expect(
      queueTeam({ name: "x" }, { token: "tok" }, { client }),
    ).rejects.toMatchObject({ code: "timeout", message: QUEUE_TIMEOUT_COPY });
    expect(client.post.mock.calls[0][2].timeout).toBe(QUEUE_TIMEOUT_MS);
  });

  it("a real refusal is unchanged", () => {
    const err = new Error("HTTP 409");
    err.response = { status: 409, data: { error: "already_approved" } };
    const out = toTeamProjectError(err, "Failed", "Still going");
    expect(out.code).toBe("already_approved");
    expect(out.status).toBe(409);
  });
});
