import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import DemoVideoEditor from "../DemoVideoEditor";
import { saveTeamDemoVideo } from "../../../lib/teamDashboardApi";
import { HOSTING_OPTIONS } from "../demoVideoGuide";

jest.mock("../../../lib/teamDashboardApi", () => ({
  saveTeamDemoVideo: jest.fn(),
  isSubmissionsClosed: () => false,
  isNotTeamMember: () => false,
}));
jest.mock("../../../lib/ga", () => ({
  trackEvent: jest.fn(),
  EventCategory: { ENGAGEMENT: "engagement" },
}));
jest.mock("../../VideoDisplay/VideoDisplay", () => () => <div>video</div>);

const YT = "dQw4w9WgXcQ";

function setup(team = { id: "t1" }) {
  const onNotify = jest.fn();
  const onTeamUpdated = jest.fn();
  render(
    <DemoVideoEditor
      team={team}
      event={{}}
      accessToken="tok"
      onNotify={onNotify}
      onTeamUpdated={onTeamUpdated}
    />,
  );
  return { onNotify, onTeamUpdated };
}

const type = (v) =>
  fireEvent.change(screen.getByLabelText(/demo video url/i), {
    target: { value: v },
  });

beforeEach(() => {
  jest.useFakeTimers();
  saveTeamDemoVideo.mockReset().mockResolvedValue({});
  global.fetch = jest.fn().mockResolvedValue({ ok: true, status: 200 });
});
afterEach(() => {
  jest.useRealTimers();
});

const settle = async () => {
  await act(async () => {
    jest.advanceTimersByTime(700);
  });
};

test("renders steps, hosts helper text and the hosting disclosure", () => {
  setup();
  expect(screen.getByText(/Record your screen/)).toBeInTheDocument();
  expect(screen.getByText(/Paste the link here/)).toBeInTheDocument();
  expect(
    screen.getByText("YouTube, Loom, Vimeo or Google Drive links work."),
  ).toBeInTheDocument();
  HOSTING_OPTIONS.forEach((o) =>
    expect(screen.getAllByText(o.name).length).toBeGreaterThan(0),
  );
});

test("a Shorts link enables Save and saves the trimmed URL", async () => {
  const { onTeamUpdated } = setup();
  const url = `https://www.youtube.com/shorts/${YT}`;
  type(`  ${url}  `);
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /save video/i }));
  });
  expect(saveTeamDemoVideo).toHaveBeenCalledWith("t1", url, "tok");
  expect(onTeamUpdated).toHaveBeenCalledWith("t1", { demo_video_url: url });
});

test("a Studio link shows its own message and never saves", () => {
  setup();
  type(`https://studio.youtube.com/video/${YT}/edit`);
  expect(screen.getByText(/YouTube Studio editing link/)).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: /save video/i }));
  expect(saveTeamDemoVideo).not.toHaveBeenCalled();
});

test("oEmbed 401 shows the Unlisted hint; Save still works", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 401 });
  setup();
  type(`https://youtu.be/${YT}`);
  await settle();
  expect(await screen.findByRole("status")).toHaveTextContent(
    /can't be played by others yet/,
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: /save video/i }));
  });
  expect(saveTeamDemoVideo).toHaveBeenCalled();
});

test("a failed oEmbed request shows no warning", async () => {
  global.fetch = jest.fn().mockRejectedValue(new Error("network"));
  setup();
  type(`https://youtu.be/${YT}`);
  await settle();
  expect(global.fetch).toHaveBeenCalled();
  expect(screen.queryByRole("status")).toBeNull();
});

test("a server error (5xx) is not treated as a no", async () => {
  global.fetch = jest.fn().mockResolvedValue({ ok: false, status: 503 });
  setup();
  type(`https://youtu.be/${YT}`);
  await settle();
  expect(screen.queryByRole("status")).toBeNull();
});

test("'Check it plays' only renders once a video is saved", () => {
  const { unmount } = render(
    <DemoVideoEditor team={{ id: "t1" }} event={{}} accessToken="t" />,
  );
  expect(screen.queryByText(/check it plays/i)).toBeNull();
  unmount();
  render(
    <DemoVideoEditor
      team={{ id: "t1", demo_video_url: `https://youtu.be/${YT}` }}
      event={{}}
      accessToken="t"
    />,
  );
  const link = screen.getByText(/check it plays/i);
  expect(link.closest("a")).toHaveAttribute("target", "_blank");
  expect(link.closest("a")).toHaveAttribute("href", `https://youtu.be/${YT}`);
});
