import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import MentorTeamsTable from "../MentorTeamsTable";

// The global mock renders a bare div; assert real hrefs here.
jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Mentors need to see which problem statement each team picked. The event
// payload only carries ids, so the table looks titles up once (one request
// per distinct project) and links each to /project/<id>.
const teams = [
  { id: "t1", name: "Dream", active: "True", problem_statements: ["ps-a"] },
  { id: "t2", name: "Karma.js", active: "True", problem_statements: ["ps-a"] },
  {
    id: "t3",
    name: "Straw Hats",
    active: "True",
    problem_statements: ["ps-b"],
  },
  { id: "t4", name: "Loners", active: "True" },
];

const TITLES = {
  "ps-a": "Donor & Funder Platform",
  "ps-b": "Volunteer Scheduler",
};

beforeEach(() => {
  global.fetch = jest.fn((url) => {
    const id = decodeURIComponent(url.split("/").pop());
    if (id === "ps-b") return Promise.resolve({ ok: false, status: 500 });
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ id, title: TITLES[id] }),
    });
  });
});

afterEach(() => {
  delete global.fetch;
});

test("shows each team's problem statement, one fetch per distinct id", async () => {
  render(<MentorTeamsTable teams={teams} eventId="fall-2026" />);

  expect(
    screen.getByRole("columnheader", { name: /problem statement/i }),
  ).toBeInTheDocument();

  const links = await screen.findAllByRole("link", {
    name: "Donor & Funder Platform",
  });
  expect(links).toHaveLength(2);
  links.forEach((l) => expect(l).toHaveAttribute("href", "/project/ps-a"));

  // A failed lookup still links to the project — never a blank or a "no".
  expect(screen.getByRole("link", { name: "View project" })).toHaveAttribute(
    "href",
    "/project/ps-b",
  );
  expect(global.fetch).toHaveBeenCalledTimes(2);
});

test("search matches the problem statement title", async () => {
  render(<MentorTeamsTable teams={teams} eventId="fall-2026" />);
  await screen.findAllByRole("link", { name: "Donor & Funder Platform" });

  fireEvent.change(screen.getByPlaceholderText(/search teams/i), {
    target: { value: "donor" },
  });
  await waitFor(() =>
    expect(screen.queryByRole("link", { name: "Straw Hats" })).toBeNull(),
  );
  expect(screen.getByRole("link", { name: "Dream" })).toBeInTheDocument();
});
