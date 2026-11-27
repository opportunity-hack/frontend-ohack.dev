import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

jest.mock("next/link", () => ({
  __esModule: true,
  default: ({ href, children, style }) => (
    <a href={href} style={style}>
      {children}
    </a>
  ),
}));
jest.mock("@propelauth/react", () => ({ useAuthInfo: () => ({ accessToken: "tok" }) }));
jest.mock("../../../../lib/ga", () => ({ trackEvent: jest.fn() }));
jest.mock("../../../../lib/lettersApi", () => ({
  __esModule: true,
  default: { pdf: jest.fn() },
  letterFilename: (id) => `OpportunityHack-Letter-${id}.pdf`,
  saveBlob: jest.fn(),
}));

import LetterActions from "../LetterActions";
import lettersApi, { saveBlob } from "../../../../lib/lettersApi";
import { trackEvent } from "../../../../lib/ga";

const base = { event_id: "fall26", event_title: "Fall 2026", role: "judge" };

describe("LetterActions", () => {
  it("not eligible: disabled button and the reason text", () => {
    render(<LetterActions row={{ ...base, eligible: false, reason: "no_scores" }} onRequest={jest.fn()} />);
    expect(screen.getByRole("button", { name: "Get your letter" })).toBeDisabled();
    expect(screen.getByText(/submitted judging scores/)).toBeInTheDocument();
    expect(screen.getByTestId("letter-actions-fall26-judge")).toHaveAttribute("data-state", "not_eligible");
  });

  it("eligible: 'Get your letter' opens the dialog for that row", () => {
    const onRequest = jest.fn();
    const row = { ...base, eligible: true };
    render(<LetterActions row={row} onRequest={onRequest} />);
    fireEvent.click(screen.getByRole("button", { name: "Get your letter" }));
    expect(onRequest).toHaveBeenCalledWith(row);
  });

  it("issued: download and copy verification link", async () => {
    lettersApi.pdf.mockResolvedValue({ blob: new Blob(["%PDF"]) });
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue() } });
    render(
      <LetterActions
        row={{ ...base, eligible: true, letter_id: "ABCDEFGHJKMN", status: "issued" }}
        onRequest={jest.fn()}
      />,
    );
    expect(screen.queryByRole("button", { name: "Get your letter" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /Download letter/ }));
    await waitFor(() => expect(saveBlob).toHaveBeenCalled());
    expect(lettersApi.pdf).toHaveBeenCalledWith("ABCDEFGHJKMN", "tok");
    expect(trackEvent).toHaveBeenCalledWith(
      expect.objectContaining({ action: "letter_download" }),
    );
    fireEvent.click(screen.getByRole("button", { name: /Copy verification link/ }));
    await waitFor(() =>
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("/letters/verify/ABCDEFGHJKMN"),
      ),
    );
    expect(await screen.findByRole("button", { name: /Copied/ })).toBeInTheDocument();
  });

  it("revoked: notice with a contact link and no actions", () => {
    render(
      <LetterActions
        row={{ ...base, letter_id: "ABCDEFGHJKMN", status: "revoked" }}
        onRequest={jest.fn()}
      />,
    );
    expect(screen.getByText(/This letter was revoked/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Contact us" })).toHaveAttribute("href", "/contact");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("shows a download failure instead of failing silently", async () => {
    lettersApi.pdf.mockRejectedValue(new Error("This letter was revoked."));
    render(
      <LetterActions
        row={{ ...base, letter_id: "ABCDEFGHJKMN", status: "issued" }}
        onRequest={jest.fn()}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Download letter/ }));
    expect(await screen.findByRole("alert")).toHaveTextContent("This letter was revoked.");
  });

  it("shows the certificate link beside the letter action", () => {
    render(
      <LetterActions
        row={{ ...base, eligible: false, reason: "no_scores" }}
        onRequest={jest.fn()}
        certificateUrl="https://cdn.ohack.dev/certificates/c.png"
      />,
    );
    expect(screen.getByRole("link", { name: /View certificate/ })).toHaveAttribute(
      "href",
      "https://cdn.ohack.dev/certificates/c.png",
    );
  });
});
