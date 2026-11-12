import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import GiveawaysTab, { missingProfileFields } from "../GiveawaysTab";
import { ApiError } from "../../../../lib/teamDashboardApi";

const mockAuth = {
  loading: false,
  isLoggedIn: true,
  user: { userId: "propel-1" },
  accessToken: "tok",
};
jest.mock("@propelauth/react", () => ({ useAuthInfo: () => mockAuth }));
jest.mock("../../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => <img src={props.src} alt={props.alt} />,
}));

const mockOpen = jest.fn();
const mockSave = jest.fn();
const mockWithdraw = jest.fn();
jest.mock("../../../../lib/giveawayApi", () => {
  const actual = jest.requireActual("../../../../lib/giveawayApi");
  return {
    ...actual,
    getOpenGiveaways: (...a) => mockOpen(...a),
    saveGiveawayEntry: (...a) => mockSave(...a),
    withdrawGiveawayEntry: (...a) => mockWithdraw(...a),
  };
});

const WEIGHT = {
  entries: 42,
  breakdown: {
    profile_fields: 6,
    profile_fields_total: 17,
    profile_entries: 30,
    github_entries: 12,
    github_cap: 45,
  },
  github_unavailable: false,
};

const PRIZES = [
  { id: "p1", name: "Headphones", description: "Noise cancelling", quantity: 1, sort_order: 0 },
  { id: "p2", name: "Keyboard", quantity: 3, sort_order: 1, product_url: "https://example.com/kb" },
];

const giveaway = (over = {}) => ({
  id: "fall-2026",
  title: "Fall giveaway",
  description: "Thanks for building with us.",
  status: "open",
  accepting_entries: true,
  must_be_present: true,
  closes_at: "2026-11-14T16:00:00-07:00",
  prizes: PRIZES,
  my_entry: null,
  my_win: null,
  ...over,
});

const respond = (giveaways, weight = WEIGHT) =>
  mockOpen.mockResolvedValue({ giveaways, my_weight: weight });

beforeEach(() => {
  mockOpen.mockReset();
  mockSave.mockReset();
  mockWithdraw.mockReset();
});

test("first render with a pending fetch shows the skeleton, never 'no giveaways'", () => {
  mockOpen.mockReturnValue(new Promise(() => {}));
  const { container } = render(<GiveawaysTab profile={{}} />);
  expect(container.querySelector('[aria-busy="true"]')).toBeTruthy();
  expect(screen.queryByText(/No giveaway is open/)).toBeNull();
});

test("shows the weight, the close time and gentle must-be-present copy", async () => {
  respond([giveaway()]);
  render(<GiveawaysTab profile={{ role: "hacker" }} />);
  expect(await screen.findByText("Fall giveaway")).toBeInTheDocument();
  expect(screen.getByText("42")).toBeInTheDocument();
  expect(screen.getByText(/30 from your profile \(6 of 17\s+fields\) · 12 from GitHub \(max 45\)/)).toBeInTheDocument();
  expect(screen.getByText(/Entries close Sat Nov 14, 4:00 PM Arizona time/)).toBeInTheDocument();
  expect(screen.getByText(/plan to be there/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Enter giveaway" })).toBeDisabled();
});

test("picking a prize then saving sends only the picked ids", async () => {
  respond([giveaway()]);
  mockSave.mockResolvedValue({
    entry: { all_prizes: false, prize_ids: ["p2"], entries: 42, breakdown: WEIGHT.breakdown },
  });
  render(<GiveawaysTab profile={{}} />);
  fireEvent.click(await screen.findByRole("checkbox", { name: /Keyboard/ }));
  fireEvent.click(screen.getByRole("button", { name: "Enter giveaway" }));
  await waitFor(() => expect(mockSave).toHaveBeenCalled());
  expect(mockSave.mock.calls[0][0]).toBe("fall-2026");
  expect(mockSave.mock.calls[0][1]).toEqual({ all_prizes: false, prize_ids: ["p2"] });
  expect(await screen.findByText("You're in! Good luck.")).toBeInTheDocument();
  expect(screen.getByText("You're in for 1 of 2 prizes.")).toBeInTheDocument();
});

test("'Enter me for everything' sends all_prizes and locks the cards", async () => {
  respond([giveaway()]);
  mockSave.mockResolvedValue({ entry: { all_prizes: true, prize_ids: [], entries: 42, breakdown: WEIGHT.breakdown } });
  render(<GiveawaysTab profile={{}} />);
  fireEvent.click(await screen.findByRole("checkbox", { name: /Enter me for everything/ }));
  expect(screen.getByRole("checkbox", { name: /Headphones/ })).toBeDisabled();
  expect(screen.getByRole("checkbox", { name: /Headphones/ })).toBeChecked();
  fireEvent.click(screen.getByRole("button", { name: "Enter giveaway" }));
  await waitFor(() => expect(mockSave).toHaveBeenCalled());
  expect(mockSave.mock.calls[0][1]).toEqual({ all_prizes: true, prize_ids: [] });
});

test("a failed load shows Retry, never the empty state", async () => {
  mockOpen.mockRejectedValueOnce(new ApiError(500, { error: "boom" }));
  render(<GiveawaysTab profile={{}} />);
  expect(await screen.findByRole("button", { name: "Retry" })).toBeInTheDocument();
  expect(screen.queryByText(/No giveaway is open/)).toBeNull();
  respond([]);
  fireEvent.click(screen.getByRole("button", { name: "Retry" }));
  expect(await screen.findByText(/No giveaway is open right now/)).toBeInTheDocument();
});

test("a 404 (older backend) says giveaways aren't available", async () => {
  mockOpen.mockRejectedValueOnce(new ApiError(404, null));
  render(<GiveawaysTab profile={{}} />);
  expect(await screen.findByText("Giveaways aren't available right now.")).toBeInTheDocument();
});

test("closed giveaways are read-only", async () => {
  respond([
    giveaway({
      status: "closed",
      accepting_entries: false,
      my_entry: { all_prizes: false, prize_ids: ["p1"], entries: 40, breakdown: WEIGHT.breakdown },
    }),
  ]);
  render(<GiveawaysTab profile={{}} />);
  expect(await screen.findByText(/Entries are closed. Winners are drawn at the closing ceremony./)).toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: /Headphones/ })).toBeChecked();
  expect(screen.getByRole("checkbox", { name: /Headphones/ })).toBeDisabled();
  expect(screen.queryByRole("button", { name: /Enter giveaway|Update my picks/ })).toBeNull();
  expect(screen.queryByText(/Withdraw/)).toBeNull();
});

test("drawn: a winner sees their prize", async () => {
  respond([giveaway({ status: "drawn", accepting_entries: false, my_entry: { entries: 1 }, my_win: { prize_id: "p1", name: "Headphones" } })]);
  render(<GiveawaysTab profile={{}} />);
  expect(await screen.findByText("You won")).toBeInTheDocument();
  expect(screen.getByText("Headphones")).toBeInTheDocument();
});

test("withdraw is a two-step inline confirm", async () => {
  respond([giveaway({ my_entry: { all_prizes: true, prize_ids: [], entries: 42, breakdown: WEIGHT.breakdown } })]);
  mockWithdraw.mockResolvedValue({ withdrawn: true });
  render(<GiveawaysTab profile={{}} />);
  fireEvent.click(await screen.findByRole("button", { name: "Withdraw from this giveaway" }));
  expect(mockWithdraw).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Yes, withdraw" }));
  await waitFor(() => expect(mockWithdraw).toHaveBeenCalledWith("fall-2026", { token: "tok" }));
  expect(await screen.findByRole("button", { name: "Enter giveaway" })).toBeInTheDocument();
});

test("missingProfileFields lists fillable fields only", () => {
  const missing = missingProfileFields({ role: "hacker", github: "ada", propel_id: "" });
  expect(missing).not.toContain("Role");
  expect(missing).not.toContain("Propel ID");
  expect(missing).toContain("Shirt Size");
});
