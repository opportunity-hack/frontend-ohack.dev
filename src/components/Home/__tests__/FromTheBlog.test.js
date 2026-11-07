import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import FromTheBlog, { PostImage } from "../FromTheBlog";

// jest.setup.js mocks next/link down to bare children; the hrefs ARE the
// assertions here, so render a real anchor.
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

const posts = [
  {
    id: "p1",
    title: "Chapterstack is live",
    excerpt: "We shipped it.",
    image: "https://cdn.ohack.dev/news/p1.png",
    date: "2026-11-04 15:00:00",
  },
  {
    id: "p2",
    title: "Fall recap",
    excerpt: "Recap.",
    image: null,
    date: "2026-10-20T10:00:00Z",
  },
  {
    id: "p3",
    title: "Mentors wanted",
    excerpt: "",
    image: "https://example.com/x.jpg",
    date: null,
  },
];

describe("FromTheBlog", () => {
  it("renders nothing without posts", () => {
    const { container } = render(<FromTheBlog posts={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a featured card and two rows with blog hrefs", () => {
    render(<FromTheBlog posts={posts} onTrack={jest.fn()} />);
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /what we're writing about/i,
      }),
    ).toBeInTheDocument();
    const featured = screen.getByRole("link", {
      name: /chapterstack is live/i,
    });
    expect(featured).toHaveAttribute("href", "/blog/p1");
    expect(screen.getByRole("link", { name: "Fall recap" })).toHaveAttribute(
      "href",
      "/blog/p2",
    );
    expect(
      screen.getByRole("link", { name: "Mentors wanted" }),
    ).toHaveAttribute("href", "/blog/p3");
    expect(screen.getByRole("link", { name: /all posts/i })).toHaveAttribute(
      "href",
      "/blog",
    );
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
  });

  it("formats dates via formatPublished", () => {
    render(<FromTheBlog posts={posts} />);
    expect(screen.getByText("November 4, 2026")).toBeInTheDocument();
    expect(screen.getByText("October 20, 2026")).toBeInTheDocument();
  });

  it("uses next/image for the CDN and a plain img elsewhere; placeholder when no image", () => {
    const { container } = render(<FromTheBlog posts={[posts[0]]} />);
    expect(container.querySelector("img[data-next-image]")).not.toBeNull();

    const { container: c2 } = render(<FromTheBlog posts={[{ ...posts[2] }]} />);
    const img = c2.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).not.toHaveAttribute("data-next-image");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("width", "560");

    const { container: c3 } = render(<FromTheBlog posts={[posts[1]]} />);
    expect(c3.querySelector("img")).toBeNull();
    expect(c3.textContent).toContain("F");
  });

  it("falls back to the placeholder when the image errors", () => {
    const { container } = render(<FromTheBlog posts={[posts[2]]} />);
    fireEvent.error(container.querySelector("img"));
    expect(container.querySelector("img")).toBeNull();
  });

  it("tracks post and all-posts clicks", () => {
    const onTrack = jest.fn();
    render(<FromTheBlog posts={posts} onTrack={onTrack} />);
    fireEvent.click(screen.getByRole("link", { name: "Fall recap" }));
    expect(onTrack).toHaveBeenCalledWith("home_blog_post", "Fall recap", {
      post_id: "p2",
      position: 2,
    });
    fireEvent.click(
      screen.getByRole("link", { name: /chapterstack is live/i }),
    );
    expect(onTrack).toHaveBeenCalledWith(
      "home_blog_post",
      "Chapterstack is live",
      { post_id: "p1", position: 1 },
    );
    fireEvent.click(screen.getByRole("link", { name: /all posts/i }));
    expect(onTrack).toHaveBeenCalledWith("home_blog_all_posts", "All posts");
  });

  it("PostImage keeps the homepage's 16:9 default; /blog passes ratio + sizes", () => {
    const { container } = render(<PostImage url={null} title="Owls" />);
    // jsdom drops aspect-ratio from inline styles; the wrapper mirrors it.
    expect(container.firstChild).toHaveAttribute("data-ratio", "16 / 9");

    const { container: c2 } = render(
      <PostImage
        url="https://cdn.ohack.dev/x.png"
        title="Owls"
        ratio="1 / 1"
        sizes="112px"
        imgWidth={224}
        imgHeight={224}
      />,
    );
    expect(c2.firstChild).toHaveAttribute("data-ratio", "1 / 1");
    expect(c2.querySelector("img[data-next-image]")).toHaveAttribute(
      "sizes",
      "112px",
    );

    const { container: c3 } = render(
      <PostImage
        url="https://example.com/x.jpg"
        title="Owls"
        ratio="1 / 1"
        imgWidth={224}
        imgHeight={224}
      />,
    );
    expect(c3.querySelector("img")).toHaveAttribute("width", "224");
  });
});
