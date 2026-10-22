/**
 * The judge API client must THROW on failure. The previous version returned
 * fake `{ success: true }` stubs from submitScore/saveDraft, so a 403/409/500
 * showed "Score submitted successfully!" while the score was lost.
 */
jest.mock("axios", () => {
  const fn = jest.fn();
  fn.get = jest.fn();
  fn.post = jest.fn();
  return { __esModule: true, default: fn };
});

import axios from "axios";
import judgeApi, {
  JudgeApiError,
  isRoundLocked,
  isNotFound,
} from "../judgeApi";

const httpError = (status, data) => ({
  response: { status, data },
  message: `HTTP ${status}`,
});

beforeEach(() => {
  axios.mockReset();
  process.env.NEXT_PUBLIC_API_SERVER_URL = "http://api.test";
});

describe("judgeApi error contract", () => {
  it("submitScore throws a JudgeApiError carrying the 409 round_locked body", async () => {
    axios.mockRejectedValueOnce(
      httpError(409, { error: "round_locked", round: "round2" }),
    );
    let caught;
    try {
      await judgeApi.submitScore(
        "j",
        "t",
        "e",
        { scopeImpact: 3 },
        "round2",
        "tok",
        { general: "x" },
      );
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(JudgeApiError);
    expect(caught.status).toBe(409);
    expect(isRoundLocked(caught)).toBe(true);
    expect(caught.message).toBe("round_locked");
  });

  it("saveDraft and getJudgeTeams throw instead of returning stub data", async () => {
    axios.mockRejectedValueOnce(httpError(500, { error: "boom" }));
    await expect(
      judgeApi.saveDraft("j", "t", "e", {}, "round1", "tok"),
    ).rejects.toBeInstanceOf(JudgeApiError);
    axios.mockRejectedValueOnce({ message: "Network Error" });
    await expect(judgeApi.getJudgeTeams("j", "e", "tok")).rejects.toMatchObject(
      {
        message: expect.stringMatching(/network error/i),
      },
    );
  });

  it("getRoundLocks and getJudgingProgress treat 404 as 'not available' rather than failing", async () => {
    axios.mockRejectedValueOnce(httpError(404, {}));
    await expect(judgeApi.getRoundLocks("e", "tok")).resolves.toEqual({
      locks: null,
    });
    axios.mockRejectedValueOnce(httpError(404, {}));
    await expect(
      judgeApi.getJudgingProgress("e", "round1", "tok", "org"),
    ).resolves.toBeNull();
    axios.mockRejectedValueOnce(httpError(403, { error: "Forbidden" }));
    let forbidden;
    try {
      await judgeApi.getJudgingProgress("e", "round1", "tok", "org");
    } catch (err) {
      forbidden = err;
    }
    expect(forbidden).toBeInstanceOf(JudgeApiError);
    expect(forbidden.status).toBe(403);
    expect(isNotFound(forbidden)).toBe(false);
  });

  it("sends the Bearer token and X-Org-Id on admin calls", async () => {
    axios.mockResolvedValueOnce({ data: { success: true } });
    await judgeApi.setRoundLock("fall-2026", "round1", true, "tok", "org-1");
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "post",
        url: "http://api.test/api/judge/admin/locks/fall-2026/round1",
        data: { locked: true },
        headers: expect.objectContaining({
          Authorization: "Bearer tok",
          "X-Org-Id": "org-1",
        }),
      }),
    );
  });
});
