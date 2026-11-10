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

  it("renders nothing when embedded without a check-in permission", () => {
    currentOrg = ORG("heart.admin");
    const { container } = renderEmbedded();
    expect(container).toBeEmptyDOMElement();
    expect(global.fetch).not.toHaveBeenCalled();
    currentOrg = ORG("checkin.admin");
  });
});
