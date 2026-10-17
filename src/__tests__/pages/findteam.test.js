/**
 * Page-level render test for /hack/[event_id]/findteam (refined rewrite,
 * Oct 2026). Lives under src/__tests__/pages — never under src/pages (Next
 * would treat it as a route and the build would fail).
 */
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

const API = "http://api.test";
process.env.NEXT_PUBLIC_API_SERVER_URL = API;

jest.mock("next/router", () => ({
  useRouter: () => ({
    query: { event_id: "fall-2026" },
    push: jest.fn(),
    replace: jest.fn(),
    pathname: "/hack/[event_id]/findteam",
    asPath: "/hack/fall-2026/findteam",
  }),
}));

// A STABLE auth object — a fresh `user` per render would re-create the
// page's filter callback every render and loop its effect.
const AUTH = {
  user: { userId: "me-propel", email: "me@example.com" },
  accessToken: "token",
  isLoggedIn: true,
  userClass: { getOrgByName: () => ({ orgId: "org-1" }) },
};
jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => AUTH,
  RequiredAuthProvider: ({ children }) => <>{children}</>,
  RedirectToLogin: () => null,
}));

jest.mock("../../context/env.context", () => ({
  useEnv: () => ({ slackSignupUrl: "https://slack.example/signup" }),
}));

jest.mock("axios", () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));
import axios from "axios";

import FindTeam from "../../pages/hack/[event_id]/findteam";

function hacker(overrides) {
  return {
    user_id: "u-" + overrides.name,
    name: overrides.name,
    isSelected: true,
    teamStatus: "I'm looking for team members",
    socialCauses: "Education, Housing",
    primaryRoles: "Backend",
    skills: overrides.skills || "Python",
    participantType: "Student",
    schoolOrganization: "ASU",
    inPerson: "Yes",
    teamMatchingPreferences: {
      preferredSkills: ["React"],
      preferredSize: "3-4",
    },
    ...overrides,
  };
}

function mockBackend({ myApp }) {
  axios.get.mockImplementation((url) => {
    if (url === `${API}/api/users/profile`) {
      return Promise.resolve({
        data: { id: "db-me", name: "Me Myself", github: "me" },
      });
    }
    if (url === `${API}/api/hacker/application/fall-2026`) {
      return Promise.resolve({ data: myApp ? { data: myApp } : null });
    }
    if (url === `${API}/api/messages/hackathon/fall-2026`) {
      return Promise.resolve({
        data: { title: "Fall 2026", event_id: "fall-2026" },
      });
    }
    if (url === `${API}/api/hacker/applications/fall-2026`) {
      return Promise.resolve({
        data: {
          data: [
            hacker({ name: "Ada Lovelace", skills: "React, Python" }),
            hacker({
              name: "Grace Hopper",
              socialCauses: "Climate",
              skills: "Go",
            }),
            hacker({ name: "Not Selected", isSelected: false }),
            hacker({ name: "Me Myself", user_id: "me-propel" }),
          ],
        },
      });
    }
    return Promise.reject(new Error(`unexpected ${url}`));
  });
}

beforeEach(() => {
  localStorage.clear();
  axios.get.mockReset();
});

describe("/hack/[event_id]/findteam", () => {
  it("renders the refined masthead, your profile, and ranked teammate cards", async () => {
    mockBackend({
      myApp: hacker({
        name: "Me Myself",
        user_id: "me-propel",
        socialCauses: "Education",
      }),
    });
    render(<FindTeam />);

    expect(await screen.findByRole("heading", { level: 1 })).toHaveTextContent(
      /Find your teammates/,
    );
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: "Potential teammates" }),
      ).toBeInTheDocument(),
    );

    // Only selected hackers who aren't me are listed.
    const list = await screen.findAllByRole("article");
    const names = list.map((a) => a.textContent);
    expect(names.some((t) => t.includes("Ada Lovelace"))).toBe(true);
    expect(names.some((t) => t.includes("Grace Hopper"))).toBe(true);
    expect(names.some((t) => t.includes("Not Selected"))).toBe(false);
    expect(names.some((t) => t.includes("Me Myself"))).toBe(false);

    // Ranked: Ada shares a cause with me and has the React I want → first.
    expect(list[0]).toHaveTextContent("Ada Lovelace");
    expect(list[0]).toHaveTextContent(/% match/);

    // Your profile card + no raw MUI rainbow chips.
    expect(
      screen.getByRole("complementary", { name: /your profile/i }),
    ).toHaveTextContent("Me Myself");
    expect(document.querySelector(".MuiChip-colorPrimary")).toBeNull();
  });

  it("stars a favorite, surfaces the create-team band, and persists to localStorage", async () => {
    mockBackend({ myApp: hacker({ name: "Me Myself", user_id: "me-propel" }) });
    render(<FindTeam />);
    const star = (
      await screen.findAllByRole("button", { name: /☆ Favorite/ })
    )[0];
    fireEvent.click(star);

    expect(
      await screen.findByText(/1 favorite teammate starred/),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Create a team with your favorites/ }),
    ).toBeInTheDocument();
    expect(
      JSON.parse(localStorage.getItem("favorites_fall-2026")),
    ).toHaveLength(1);

    // Un-starring the last favorite clears storage (old code left it stale).
    fireEvent.click(screen.getByRole("button", { name: /★ Favorited/ }));
    await waitFor(() =>
      expect(
        JSON.parse(localStorage.getItem("favorites_fall-2026")),
      ).toHaveLength(0),
    );
  });

  it("shows the shared gating panel when there is no application", async () => {
    mockBackend({ myApp: null });
    render(<FindTeam />);
    expect(
      await screen.findByText("Apply first to use the Team Finder"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/The Team Finder is only available/),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Potential teammates" }),
    ).toBeNull();
  });

  it("shows the awaiting-confirmation panel when isSelected is false", async () => {
    mockBackend({ myApp: hacker({ name: "Me Myself", isSelected: false }) });
    render(<FindTeam />);
    expect(
      await screen.findByText("Your application is awaiting confirmation"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/so the Team Finder is locked for now/),
    ).toBeInTheDocument();
  });
});
