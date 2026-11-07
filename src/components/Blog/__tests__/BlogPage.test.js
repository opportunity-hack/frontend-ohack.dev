import React from "react";
import {
  act,
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom";

import * as ga from "../../../lib/ga";

jest.mock("../../../lib/ga", () => ({
  __esModule: true,
  initFacebookPixel: jest.fn(),
  trackPageView: jest.fn(),
  trackEvent: jest.fn(),
  trackStructuredEvent: jest.fn(),
  EventCategory: {
    CONTENT: "content",
    NAVIGATION: "navigation",
    CONVERSION: "conversion",
  },
  EventAction: {
    VIEW: "view",
    SEARCH: "search",
    FILTER: "filter",
    CLICK: "click",
  },
}));

const mockReplace = jest.fn();
let mockQuery = {};
jest.mock("next/router", () => ({
  useRouter: () => ({
    pathname: "/blog",
    query: mockQuery,
    push: jest.fn(),
    replace: mockReplace,
    isReady: true,
  }),
}));

// jest.setup.js reduces next/link to bare children; the CtaBand's Join
// Slack click handler lives on the Link, so render a real anchor.
jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});

// Records every props object PostList is rendered with so tests can inspect
// exactly what the very FIRST render pass — before any effect — received.
var mockListCalls = [];
jest.mock("../PostList", () => {
  return function MockPostList(props) {
    mockListCalls.push(props);
    const { posts, loading } = props;
    return (
      <div data-testid="post-list">
        {loading ? (
          <div>Loading...</div>
        ) : posts && posts.length > 0 ? (
          posts.map((item) => (
            <div key={item.id} data-testid={`post-${item.id}`}>
              {item.title}
            </div>
          ))
        ) : (
          <div>No posts</div>
        )}
      </div>
    );
  };
});

process.env.NEXT_PUBLIC_API_SERVER_URL = "http://localhost:3000";

import BlogPage from "../BlogPage";

const mockPosts = [
  {
    id: "1",
    title: "Test Post 1",
    description: "This is post 1 #react",
    links: [{ url: "#general", name: "general" }],
  },
  {
    id: "2",
    title: "Test Post 2",
    description: "This is post 2 #javascript",
    links: [],
  },
  {
    id: "3",
    title: "Test Post 3",
    description: "This is post 3 #javascript #react",
    links: [],
  },
];

const chipsIn = (cloud) =>
  within(cloud)
    .getAllByRole("button")
    .filter((b) => b.textContent.startsWith("#"));

const tagCloud = () => screen.getByText("Browse by tag:").parentElement;

describe("BlogPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockQuery = {};
    mockListCalls.length = 0;
    global.fetch = jest.fn(() =>
      Promise.resolve({ json: () => Promise.resolve({ text: mockPosts }) }),
    );
  });

  test("renders with loading state initially (no posts prop)", () => {
    render(<BlogPage />);
    expect(screen.getByTestId("post-list")).toHaveTextContent("Loading...");
  });

  test("renders posts passed as props without fetching", async () => {
    render(<BlogPage posts={mockPosts} />);
    await waitFor(() => {
      expect(screen.getByTestId("post-list")).not.toHaveTextContent(
        "Loading...",
      );
    });
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("seeds state from the posts prop on the very first render (SSR contract)", () => {
    render(<BlogPage posts={mockPosts} />);
    expect(screen.getByText("Test Post 1")).toBeInTheDocument();
    expect(mockListCalls[0].loading).toBe(false);
    expect(mockListCalls[0].posts).toEqual(mockPosts);
    expect(global.fetch).not.toHaveBeenCalled();
  });

  test("fetches posts when none are provided as props", async () => {
    render(<BlogPage />);
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/messages/news?limit=50"),
      );
    });
  });

  test("initialises the Facebook pixel once on mount", () => {
    render(<BlogPage posts={mockPosts} />);
    expect(ga.initFacebookPixel).toHaveBeenCalledTimes(1);
  });

  test("search filters instantly but fires ONE GA event after the debounce", () => {
    jest.useFakeTimers();
    try {
      render(<BlogPage posts={mockPosts} />);
      const input = screen.getByPlaceholderText(/search posts/i);
      fireEvent.change(input, { target: { value: "po" } });
      fireEvent.change(input, { target: { value: "post 1" } });
      // filtered at once
      expect(screen.getByText("Test Post 1")).toBeInTheDocument();
      expect(screen.queryByText("Test Post 2")).toBeNull();
      expect(screen.getByText(/1 result for “post 1”/)).toBeInTheDocument();
      expect(ga.trackStructuredEvent).not.toHaveBeenCalledWith(
        "content",
        "search",
        expect.anything(),
        null,
        expect.anything(),
      );
      act(() => {
        jest.advanceTimersByTime(600);
      });
      const searchCalls = ga.trackStructuredEvent.mock.calls.filter(
        (c) => c[1] === "search",
      );
      expect(searchCalls).toEqual([
        ["content", "search", "blog_content", null, { search_term: "post 1" }],
      ]);
    } finally {
      jest.useRealTimers();
    }
  });

  test("tag chip filters, writes ?tag= shallowly and fires the filter GA event", async () => {
    render(<BlogPage posts={mockPosts} />);
    const react = within(tagCloud()).getByRole("button", { name: /#react/ });
    fireEvent.click(react);
    expect(react).toHaveAttribute("aria-pressed", "true");
    expect(mockReplace).toHaveBeenCalledWith(
      { pathname: "/blog", query: { tag: "react" } },
      undefined,
      { shallow: true, scroll: false },
    );
    await waitFor(() => {
      expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
        "content",
        "filter",
        "blog_tag",
        null,
        expect.objectContaining({ selected_tag: "react" }),
      );
    });
    expect(screen.queryByText("Test Post 2")).toBeNull();
    expect(screen.getByText(/2 posts tagged #react/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    expect(screen.getByText("Test Post 2")).toBeInTheDocument();
    expect(mockReplace).toHaveBeenLastCalledWith(
      { pathname: "/blog", query: {} },
      undefined,
      { shallow: true, scroll: false },
    );
  });

  test("hydrates the selected tag from ?tag= on load", () => {
    mockQuery = { tag: "javascript" };
    render(<BlogPage posts={mockPosts} />);
    expect(
      screen.getByRole("heading", { name: /tagged #javascript/i }),
    ).toBeInTheDocument();
    expect(screen.queryByText("Test Post 1")).toBeNull();
  });

  test("tag cloud shows the top 8 by count, hides junk, and expands with Show all", () => {
    const many = Array.from({ length: 12 }, (_, i) => ({
      id: `m${i}`,
      title: `M${i}`,
      // tag0 appears in every post, tagN in posts >= N → descending counts
      description:
        Array.from({ length: i + 1 }, (_, j) => `#tag${j}`).join(" ") +
        " #C01CMCF4BUN #55",
      links: [],
    }));
    render(<BlogPage posts={many} />);
    const cloud = tagCloud();
    expect(chipsIn(cloud)).toHaveLength(8);
    expect(chipsIn(cloud)[0]).toHaveTextContent("#tag0 · 12");
    expect(
      within(cloud).queryByRole("button", { name: /C01CMCF4BUN|#55/ }),
    ).toBeNull();

    const showAll = within(cloud).getByRole("button", { name: /show all 12/i });
    expect(showAll).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(showAll);
    expect(chipsIn(tagCloud())).toHaveLength(12);
    expect(
      within(tagCloud()).getByRole("button", { name: /show fewer/i }),
    ).toHaveAttribute("aria-expanded", "true");
  });

  test("no tag block at all when posts carry no tags", () => {
    render(
      <BlogPage
        posts={[
          { id: "x", title: "Plain", description: "no tags here", links: [] },
        ]}
      />,
    );
    expect(screen.queryByText("Browse by tag:")).toBeNull();
  });

  test("tracks the GitHub 'how these posts are made' link", () => {
    render(<BlogPage posts={mockPosts} />);
    fireEvent.click(screen.getByText(/how these posts are made/i));
    expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
      "navigation",
      "click",
      "github_code_link",
    );
  });

  test("tracks click on Join Slack in the closing band", () => {
    render(<BlogPage posts={mockPosts} />);
    fireEvent.click(screen.getByText("Join Slack"));
    expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
      "conversion",
      "click",
      "join_slack",
    );
    expect(screen.getByText("Join Slack").closest("a")).toHaveAttribute(
      "href",
      "/signup",
    );
  });

  test("forwards post clicks as blog_list_post with position", () => {
    render(<BlogPage posts={mockPosts} />);
    const { onPostClick } = mockListCalls[mockListCalls.length - 1];
    onPostClick(mockPosts[1], 2);
    expect(ga.trackStructuredEvent).toHaveBeenCalledWith(
      "navigation",
      "click",
      "blog_list_post",
      null,
      { post_id: "2", position: 2 },
    );
  });
});
