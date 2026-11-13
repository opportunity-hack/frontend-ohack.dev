/**
 * A `checkin.admin`-only desk helper can use the workbench, and every call
 * goes to the narrow /api/checkin routes (one GET per role for counts+list,
 * one POST per check-in — never the legacy admin PATCH).
 */
import React from "react";
import {
  render,
  screen,
  waitFor,
  fireEvent,
  act,
} from "@testing-library/react";

const ORG = (...perms) => ({
  orgId: "org-1",
  hasPermission: (p) => perms.includes(p),
});
let currentOrg = ORG("checkin.admin");

jest.mock("@propelauth/react", () => ({
  useAuthInfo: () => ({
    accessToken: "tok",
    user: { userId: "propel-desk", email: "desk@example.com" },
  }),
  withRequiredAuthInfo: (C) => C,
}));
// Captures the scanner's props so a test can simulate a scan.
const mockScanner = { props: null };
jest.mock("react-qr-scanner", () => ({
  __esModule: true,
  default: (props) => {
    mockScanner.props = props;
    return null;
  },
}));
jest.mock("../../../../hooks/use-hackathon-events", () => ({
  __esModule: true,
  default: () => ({ hackathons: [] }),
}));
jest.mock("../../AdminPage", () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="admin-page">{children}</div>,
}));

process.env.NEXT_PUBLIC_API_SERVER_URL = "http://api.test";
const { CheckInWorkbench } = require("../CheckInWorkbench");

const userClass = { getOrgByName: () => currentOrg };

const jsonResponse = (body, status = 200) =>
  Promise.resolve({
    ok: status < 400,
    status,
    json: () => Promise.resolve(body),
  });

beforeEach(() => {
  global.fetch = jest.fn((url, opts = {}) => {
    if (/\/api\/checkin\/fall-2026\/checkins\/hacker$/.test(url)) {
      return jsonResponse({
        data: [
          {
            id: "v1",
            name: "Ada Lovelace",
            checkedIn: true,
            checkedInAt: "2026-10-10T16:00:00Z",
          },
        ],
        count: 1,
      });
    }
    if (/\/api\/checkin\/fall-2026\/checkins\//.test(url))
      return jsonResponse({ data: [], count: 0 });
    if (/\/api\/checkin\/fall-2026\/roster\/hacker$/.test(url)) {
      return jsonResponse({
        data: [
          {
            id: "v2",
            name: "Grace Hopper",
            email: "grace@example.com",
            checkedIn: false,
          },
        ],
      });
    }
    if (
      opts.method === "POST" &&
      /\/api\/checkin\/fall-2026\/hacker\/v2$/.test(url)
    ) {
      return jsonResponse({
        data: { id: "v2", name: "Grace Hopper", checkedIn: true },
        already_checked_in: false,
      });
    }
    return jsonResponse({ message: "unexpected " + url }, 500);
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

const renderEmbedded = (onSnack = jest.fn()) =>
  render(
    <CheckInWorkbench
      userClass={userClass}
      embedded
      externalEventId="fall-2026"
      onSnack={onSnack}
    />,
  );

const scan = async (text) => {
  fireEvent.click(screen.getByRole("button", { name: /start scanning/i }));
  await act(async () => {
    await mockScanner.props.onScan({ text });
  });
};

describe("CheckInWorkbench with checkin.admin only", () => {
  it("renders and reads counts + the checked-in list from /api/checkin", async () => {
    renderEmbedded();
    expect(await screen.findByText("Ada Lovelace")).toBeInTheDocument();
    const urls = global.fetch.mock.calls.map(([u]) => u);
    expect(
      urls.filter((u) => u.includes("/api/checkin/fall-2026/checkins/")),
    ).toHaveLength(5);
    expect(urls.some((u) => u.includes("/api/messages/"))).toBe(false);
    const [, opts] = global.fetch.mock.calls[0];
    expect(opts.headers).toMatchObject({
      authorization: "Bearer tok",
      "X-Org-Id": "org-1",
    });
  });

  it("checks someone in with ONE narrow POST (no roster fetch, no PATCH)", async () => {
    renderEmbedded();
    await screen.findByText("Ada Lovelace");
    global.fetch.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /manual entry/i }));
    const dialog = await screen.findByRole("dialog");
    // Pick a role → the lean roster for that role loads.
    fireEvent.mouseDown(screen.getByRole("combobox", { name: /role/i }));
    fireEvent.click(await screen.findByRole("option", { name: "Hacker" }));
    await waitFor(() =>
      expect(
        global.fetch.mock.calls.some(([u]) => /\/roster\/hacker$/.test(u)),
      ).toBe(true),
    );
    const combo = await screen.findByRole("combobox", {
      name: /name or email/i,
    });
    fireEvent.change(combo, { target: { value: "Grace" } });
    fireEvent.click(await screen.findByText(/Grace Hopper/));
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /^check in$/i }));
    });

    const post = global.fetch.mock.calls.find(
      ([, o]) => o && o.method === "POST",
    );
    expect(post).toBeTruthy();
    expect(post[0]).toBe("http://api.test/api/checkin/fall-2026/hacker/v2");
    expect(post[1].body).toBeUndefined();
    expect(
      global.fetch.mock.calls.some(([, o]) => o && o.method === "PATCH"),
    ).toBe(false);
    expect(dialog).toBeTruthy();
  });

  it("reports a successful scan through the host snackbar when embedded", async () => {
    const onSnack = jest.fn();
    renderEmbedded(onSnack);
    await screen.findByText("Ada Lovelace");

    await scan("fall-2026|v2|hacker");

    expect(onSnack).toHaveBeenCalledWith(
      "Successfully checked in Grace Hopper",
      "success",
    );
    expect(
      await screen.findByText("Successfully checked in Grace Hopper"),
    ).toBeInTheDocument();
  });

  it("never shows a success card for a scan the server rejected", async () => {
    const onSnack = jest.fn();
    renderEmbedded(onSnack);
    await screen.findByText("Ada Lovelace");
    const base = global.fetch.getMockImplementation();
    global.fetch.mockImplementation(async (url, opts = {}) =>
      opts.method === "POST"
        ? {
            ok: false,
            status: 409,
            json: async () => ({ error: "wrong_event" }),
          }
        : base(url, opts),
    );

    await scan("other-event|v9|hacker");

    expect(
      await screen.findByText(
        /This QR code is for a different event or role\./,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Not checked in:/)).toBeInTheDocument();
    expect(screen.queryByText(/Successfully/)).not.toBeInTheDocument();
    expect(onSnack).toHaveBeenCalledWith(
      "Check-in failed: This QR code is for a different event or role.",
      "error",
    );
  });

  it("refuses a QR for another event without posting, even if the server would accept it", async () => {
    // Last season's QR: the backend compares the doc's event_id to the event
    // in the QR itself, so it would answer 200 and check the person in on the
    // OLD event while they stay un-checked-in today.
    const onSnack = jest.fn();
    renderEmbedded(onSnack);
    await screen.findByText("Ada Lovelace");
    const base = global.fetch.getMockImplementation();
    global.fetch.mockImplementation(async (url, opts = {}) =>
      opts.method === "POST"
        ? {
            ok: true,
            status: 200,
            json: async () => ({ data: { id: "v2", name: "Grace Hopper" } }),
          }
        : base(url, opts),
    );
    global.fetch.mockClear();

    await scan("fall-2025|v2|hacker");

    expect(
      global.fetch.mock.calls.some(([, o]) => o && o.method === "POST"),
    ).toBe(false);
    expect(
      await screen.findByText(
        /This QR code is for a different event or role\./,
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Successfully/)).not.toBeInTheDocument();
    expect(onSnack).toHaveBeenCalledWith(
      "Check-in failed: This QR code is for a different event or role.",
      "error",
    );
  });

  it("renders nothing when embedded without a check-in permission", () => {
    currentOrg = ORG("heart.admin");
    const { container } = renderEmbedded();
    expect(container).toBeEmptyDOMElement();
    expect(global.fetch).not.toHaveBeenCalled();
    currentOrg = ORG("checkin.admin");
  });
});

describe("Reset check-ins (full admins only)", () => {
  const MENTORS = [
    {
      id: "m-early",
      name: "Early Mentor",
      checkedIn: true,
      isCheckedIn: true,
      checkInTime: "2026-11-01T09:00:00-07:00",
    },
    {
      id: "m-desk",
      name: "Desk Mentor",
      checkedIn: true,
      checkedInAt: "2026-11-14T16:00:00Z",
    },
  ];
  let mentorsCheckedIn;

  beforeEach(() => {
    mentorsCheckedIn = MENTORS;
    const base = global.fetch;
    global.fetch = jest.fn((url, opts = {}) => {
      if (/\/api\/checkin\/fall-2026\/checkins\/mentor$/.test(url)) {
        return jsonResponse({ data: mentorsCheckedIn, count: mentorsCheckedIn.length });
      }
      if (opts.method === "POST" && /\/api\/checkin\/fall-2026\/reset\/mentor$/.test(url)) {
        const body = JSON.parse(opts.body);
        const ids = body.all ? MENTORS.map((m) => m.id) : body.volunteer_ids;
        mentorsCheckedIn = mentorsCheckedIn.filter((m) => !ids.includes(m.id));
        return jsonResponse({ reset: ids.length, ids, skipped: [] });
      }
      return base(url, opts);
    });
  });

  afterEach(() => {
    currentOrg = ORG("checkin.admin");
  });

  it("is hidden for a checkin.admin-only helper", async () => {
    currentOrg = ORG("checkin.admin");
    renderEmbedded();
    await screen.findByText("Ada Lovelace");
    expect(screen.queryByRole("button", { name: /reset check-ins/i })).toBeNull();
  });

  it("posts the selected ids for the role, refetches and toasts via onSnack", async () => {
    currentOrg = ORG("volunteer.admin");
    const onSnack = jest.fn();
    render(
      <CheckInWorkbench
        userClass={userClass}
        embedded
        externalEventId="fall-2026"
        onSnack={onSnack}
      />,
    );
    await screen.findByText("Early Mentor");
    fireEvent.click(screen.getByRole("button", { name: /reset check-ins/i }));
    const dialog = await screen.findByRole("dialog");

    // Mentors is the default role; both are listed and selected.
    expect(await screen.findByText("Online self check-in")).toBeInTheDocument();
    expect(screen.getByText("Desk")).toBeInTheDocument();
    const confirm = screen.getByRole("button", { name: /reset 2 mentor check-ins/i });

    // Un-tick the desk mentor → only the early one is sent (as ids, not all).
    fireEvent.click(screen.getByRole("checkbox", { name: "Desk Mentor" }));
    expect(screen.getByRole("button", { name: /reset 1 mentor check-in$/i })).toBeInTheDocument();
    global.fetch.mockClear();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: /reset 1 mentor check-in$/i }));
    });

    const post = global.fetch.mock.calls.find(([, o]) => o && o.method === "POST");
    expect(post[0]).toBe("http://api.test/api/checkin/fall-2026/reset/mentor");
    expect(JSON.parse(post[1].body)).toEqual({ volunteer_ids: ["m-early"] });
    expect(post[1].headers).toMatchObject({ "X-Org-Id": "org-1" });
    await waitFor(() => expect(onSnack).toHaveBeenCalledWith("Reset 1 check-in", "success"));
    // The list was refetched after the reset.
    expect(
      global.fetch.mock.calls.some(([u]) => /\/checkins\/mentor$/.test(u)),
    ).toBe(true);
    await waitFor(() => expect(screen.queryByText("Early Mentor")).toBeNull());
    expect(screen.getAllByText("Desk Mentor").length).toBeGreaterThan(0);
    expect(confirm).toBeTruthy();
    expect(dialog).toBeTruthy();
  });

  it("sends {all: true} only when everyone listed is selected; 404 explains", async () => {
    currentOrg = ORG("volunteer.admin");
    const onSnack = jest.fn();
    const base = global.fetch;
    global.fetch = jest.fn((url, opts = {}) => {
      if (opts.method === "POST" && /\/reset\/mentor$/.test(url)) {
        return jsonResponse({ message: "not found" }, 404);
      }
      return base(url, opts);
    });
    render(
      <CheckInWorkbench
        userClass={userClass}
        embedded
        externalEventId="fall-2026"
        onSnack={onSnack}
      />,
    );
    await screen.findByText("Early Mentor");
    fireEvent.click(screen.getByRole("button", { name: /reset check-ins/i }));
    await act(async () => {
      fireEvent.click(await screen.findByRole("button", { name: /reset 2 mentor check-ins/i }));
    });
    const post = global.fetch.mock.calls.find(([, o]) => o && o.method === "POST");
    expect(JSON.parse(post[1].body)).toEqual({ all: true });
    await waitFor(() =>
      expect(onSnack).toHaveBeenCalledWith("Reset isn't available on this backend yet.", "error"),
    );
  });
});
