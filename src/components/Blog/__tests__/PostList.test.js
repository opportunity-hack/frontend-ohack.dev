import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";

jest.mock("next/link", () => {
  const ReactLib = require("react");
  const MockLink = ReactLib.forwardRef(({ children, href, ...rest }, ref) =>
    ReactLib.createElement("a", { href, ref, ...rest }, children),
  );
  MockLink.displayName = "MockLink";
  return MockLink;
});
jest.mock("next/image", () => {
  const ReactLib = require("react");
  // eslint-disable-next-line react/display-name
  return ({ fill, ...props }) =>
    ReactLib.createElement("img", { ...props, "data-next-image": "true" });
});

import PostList, { CARD_COUNT } from "../PostList";

const makePost = (i) => ({
  id: `p${i}`,
  title: `Post number ${i}`,
  description: `Body of post ${i} with #tag${i} and #shared`,
  published_at: `2026-11-${String(10 - (i % 9)).padStart(2, "0")}T15:00:00Z`,
  image: i === 1 ? "https://cdn.ohack.dev/news/p1.png" : null,
  links: i === 2 ? [{ url: "#C01CMCF4BUN", name: "C01CMCF4BUN" }] : [],
});
const posts = Array.from({ length: 10 }, (_, i) => makePost(i + 1));

describe("PostList", () => {
  it("renders the first CARD_COUNT posts as cards and the rest as rows", () => {
    render(<PostList posts={posts} loading={false} />);
    expect(CARD_COUNT).toBe(8);
    expect(screen.getAllByRole("article")).toHaveLength(8);
    const earlier = screen.getByRole("region", { name: /earlier posts/i });
    expect(within(earlier).getAllByRole("listitem")).toHaveLength(2);
    expect(
      within(earlier).getByRole("link", { name: "Post number 9" }),
    ).toHaveAttribute("href", "/blog/p9");
    expect(
      screen.getAllByRole("link", { name: "Post number 1" })[0],
    ).toHaveAttribute("href", "/blog/p1");
  });

  it("omits the Earlier section when everything fits in cards", () => {
    render(<PostList posts={posts.slice(0, 3)} loading={false} />);
    expect(screen.queryByRole("region", { name: /earlier posts/i })).toBeNull();
    expect(screen.getAllByRole("article")).toHaveLength(3);
  });

  it("formats dates in UTC via formatPublished — never relative time", () => {
    render(<PostList posts={[posts[0]]} loading={false} />);
    expect(screen.getByText("November 9, 2026")).toBeInTheDocument();
    expect(screen.queryByText(/ago/)).toBeNull();
  });

  it("tag buttons call onTagClick and hide junk; images are next/image for the CDN", () => {
    const onTagClick = jest.fn();
    const { container } = render(
      <PostList
        posts={posts.slice(0, 2)}
        loading={false}
        onTagClick={onTagClick}
        selectedTag="shared"
      />,
    );
    const first = screen.getAllByRole("article")[0];
    fireEvent.click(within(first).getByRole("button", { name: "#tag1" }));
    expect(onTagClick).toHaveBeenCalledWith("tag1");
    expect(
      within(first).getByRole("button", { name: "#shared" }),
    ).toHaveAttribute("aria-pressed", "true");
    const second = screen.getAllByRole("article")[1];
    expect(
      within(second).queryByRole("button", { name: /C01CMCF4BUN/ }),
    ).toBeNull();
    expect(container.querySelector("img[data-next-image]")).not.toBeNull();
  });

  it("reports clicks with the post and its 1-based position", () => {
    const onPostClick = jest.fn();
    render(
      <PostList posts={posts} loading={false} onPostClick={onPostClick} />,
    );
    fireEvent.click(screen.getByRole("link", { name: "Post number 10" }));
    expect(onPostClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "p10" }),
      10,
    );
    fireEvent.click(screen.getAllByRole("link", { name: "Post number 2" })[0]);
    expect(onPostClick).toHaveBeenCalledWith(
      expect.objectContaining({ id: "p2" }),
      2,
    );
  });

  it("shows a skeleton while loading and skips posts without an id", () => {
    render(<PostList posts={[]} loading />);
    expect(
      screen.getByRole("status", { name: /loading posts/i }),
    ).toHaveAttribute("aria-busy", "true");

    const { container } = render(
      <PostList posts={[{ title: "No id" }, posts[0]]} loading={false} />,
    );
    expect(within(container).getAllByRole("article")).toHaveLength(1);
  });
});
