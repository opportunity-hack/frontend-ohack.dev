import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/head", () => ({ __esModule: true, default: ({ children }) => <>{children}</> }));
jest.mock("../../lib/ga", () => ({ trackEvent: jest.fn() }));

import VerifyLetterPage, { getServerSideProps } from "../../pages/letters/verify/[id]";
import { trackEvent } from "../../lib/ga";

const view = {
  status: "valid",
  name: "Ada King",
  role: "Mentor",
  eventTitle: "Opportunity Hack Fall 2026",
  servedDate: "November 14, 2026",
  issued: "November 27, 2026",
};

describe("/letters/verify/[id]", () => {
  it("renders a valid letter and tracks the view", () => {
    render(<VerifyLetterPage letterId="ABCDEFGHJKMN" view={view} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Valid letter");
    expect(screen.getByText("Ada King")).toBeInTheDocument();
    expect(screen.getByText("ABCDEFGHJKMN")).toBeInTheDocument();
    expect(trackEvent).toHaveBeenCalledWith({ action: "letter_verify_view", params: { status: "valid" } });
  });

  it("renders revoked and not-found states", () => {
    const { rerender } = render(
      <VerifyLetterPage letterId="ABCDEFGHJKMN" view={{ ...view, status: "revoked" }} />,
    );
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Revoked letter");
    rerender(<VerifyLetterPage letterId="ZZZ" view={{ status: "not_found" }} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Letter not found");
    expect(screen.queryByText("Name")).toBeNull();
  });

  describe("getServerSideProps", () => {
    const res = { setHeader: jest.fn() };
    afterEach(() => {
      delete global.fetch;
    });

    it("never calls the API for a malformed id", async () => {
      global.fetch = jest.fn();
      const out = await getServerSideProps({ params: { id: "../x" }, res });
      expect(out.props.view.status).toBe("not_found");
      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("maps 404 and network failures", async () => {
      global.fetch = jest.fn().mockResolvedValue({ status: 404, ok: false });
      expect((await getServerSideProps({ params: { id: "ABCDEFGHJKMN" }, res })).props.view.status)
        .toBe("not_found");
      global.fetch = jest.fn().mockRejectedValue(new Error("down"));
      expect((await getServerSideProps({ params: { id: "ABCDEFGHJKMN" }, res })).props.view.status)
        .toBe("unavailable");
    });

    it("maps a valid payload", async () => {
      global.fetch = jest.fn().mockResolvedValue({
        status: 200,
        ok: true,
        json: async () => ({ name_on_letter: "Ada", role: "judge", status: "issued" }),
      });
      const out = await getServerSideProps({ params: { id: "abcdefghjkmn" }, res });
      expect(out.props.letterId).toBe("ABCDEFGHJKMN");
      expect(out.props.view).toMatchObject({ status: "valid", name: "Ada", role: "Judge" });
    });
  });
});
