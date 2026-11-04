import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import ShareKit from "../ShareKit";

jest.mock("../../../lib/ga", () => ({ trackEvent: jest.fn() }));

const EVENT = {
  event_id: "fall-2026",
  title: "Opportunity Hack Fall 2026 — Hackathon for Nonprofits",
  start_date: "2026-10-10",
  end_date: "2026-10-11",
  location: "ASU Tempe, Arizona",
  timezone: "America/Phoenix",
};
const VOLUNTEER = {
  id: "v1",
  name: "Ada Lovelace",
  photoUrl: null,
  subtitle: "",
};

const renderKit = () =>
  render(<ShareKit event={EVENT} type="judge" volunteer={VOLUNTEER} />);

describe("ShareKit post row", () => {
  let writeText;
  beforeEach(() => {
    writeText = jest.fn().mockResolvedValue();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    delete navigator.canShare;
    delete navigator.share;
  });

  it("offers Instagram, Facebook and Threads alongside LinkedIn, X, WhatsApp and email", () => {
    renderKit();
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      "https://www.instagram.com/",
    );
    expect(
      screen.getByRole("link", { name: "Facebook" }).getAttribute("href"),
    ).toMatch(/facebook\.com\/sharer/);
    expect(
      screen.getByRole("link", { name: "Threads" }).getAttribute("href"),
    ).toMatch(/threads\.net\/intent\/post\?text=/);
    expect(
      screen.getByRole("link", { name: "Open LinkedIn" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Post on X" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "WhatsApp" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Email" })).toBeInTheDocument();
  });

  it("Instagram on a desktop copies the caption and explains the manual post", async () => {
    renderKit();
    fireEvent.click(screen.getByRole("link", { name: "Instagram" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
    expect(writeText.mock.calls[0][0]).toContain("fall-2026");
    expect(screen.getByRole("status").textContent).toMatch(/tap Create/);
  });

  it("Instagram on a phone hands the PNG to the share sheet instead of navigating", async () => {
    navigator.canShare = jest.fn(() => true);
    navigator.share = jest.fn().mockResolvedValue();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["png"], { type: "image/png" })),
    });
    renderKit();
    const link = await screen.findByRole("link", { name: "Instagram" });
    const prevented = !fireEvent.click(link);
    expect(prevented).toBe(true);
    await waitFor(() => expect(navigator.share).toHaveBeenCalledTimes(1));
    expect(navigator.share.mock.calls[0][0].files[0].type).toBe("image/png");
    expect(screen.getByRole("status").textContent).toMatch(/share sheet/);
  });

  it("Threads and Facebook copy the caption as insurance", async () => {
    renderKit();
    fireEvent.click(screen.getByRole("link", { name: "Threads" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toMatch(/Threads/),
    );
    expect(writeText).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("link", { name: "Facebook" }));
    await waitFor(() =>
      expect(screen.getByRole("status").textContent).toMatch(/unfurls/),
    );
    expect(writeText).toHaveBeenCalledTimes(2);
  });
});
