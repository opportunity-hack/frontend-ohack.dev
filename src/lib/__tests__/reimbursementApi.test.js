jest.mock("axios", () => {
  const fn = jest.fn();
  fn.get = jest.fn();
  fn.post = jest.fn();
  return { __esModule: true, default: fn };
});

import axios from "axios";
import reimbursementApi, { ReimbursementApiError } from "../reimbursementApi";

const httpError = (status, data) => ({
  response: { status, data },
  message: `HTTP ${status}`,
});

beforeEach(() => {
  axios.mockReset();
  process.env.NEXT_PUBLIC_API_SERVER_URL = "http://api.test";
});

describe("reimbursementApi", () => {
  it("submit posts the camelCase payload to /api/reimbursements", async () => {
    axios.mockResolvedValueOnce({
      data: {
        success: true,
        id: "1",
        referenceId: "RMB-123",
        status: "submitted",
      },
    });
    const payload = {
      submitterName: "Greg",
      submitterEmail: "g@x.org",
      expenseDate: "2026-11-14",
      vendor: "Costco",
      amount: 125.5,
      businessPurpose: "Dinner",
      fedDescription: "Volunteers",
      paymentMethod: "personal_card",
      reimbursementMethod: "ach",
      attestation: true,
      receiptBlobPath: "r/x.pdf",
      receiptFilename: "x.pdf",
      receiptContentType: "application/pdf",
      recaptchaToken: "tok",
    };
    const result = await reimbursementApi.submit(payload);
    expect(result.referenceId).toBe("RMB-123");
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "post",
        url: "http://api.test/api/reimbursements",
        data: payload,
      }),
    );
  });

  it("submit throws a ReimbursementApiError carrying the backend message", async () => {
    axios.mockRejectedValueOnce(
      httpError(400, {
        success: false,
        error: "validation",
        message: "Bad amount",
      }),
    );
    let caught;
    try {
      await reimbursementApi.submit({});
    } catch (err) {
      caught = err;
    }
    expect(caught).toBeInstanceOf(ReimbursementApiError);
    expect(caught.status).toBe(400);
    expect(caught.message).toBe("Bad amount");
  });

  it("lookupStatus queries by email and reference_id", async () => {
    axios.mockResolvedValueOnce({
      data: { referenceId: "RMB-1", status: "approved", amountCents: 5000 },
    });
    const result = await reimbursementApi.lookupStatus("g@x.org", "RMB-1");
    expect(result.status).toBe("approved");
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "get",
        url: "http://api.test/api/reimbursements/status",
        params: { email: "g@x.org", reference_id: "RMB-1" },
      }),
    );
  });

  it("admin calls send the token and X-Org-Id headers", async () => {
    axios.mockResolvedValueOnce({ data: { data: [], count: 0 } });
    await reimbursementApi.listAdmin({ status: "submitted" }, "tok", "org-1");
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "get",
        url: "http://api.test/api/reimbursements/admin",
        headers: expect.objectContaining({
          Authorization: "Bearer tok",
          "X-Org-Id": "org-1",
        }),
      }),
    );
  });

  it("reviewAdmin PATCHes status and reviewNote", async () => {
    axios.mockResolvedValueOnce({ data: { success: true } });
    await reimbursementApi.reviewAdmin(
      "abc",
      { status: "approved", reviewNote: "Looks good" },
      "tok",
      "org-1",
    );
    expect(axios).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "patch",
        url: "http://api.test/api/reimbursements/admin/abc",
        data: { status: "approved", reviewNote: "Looks good" },
      }),
    );
  });
});
