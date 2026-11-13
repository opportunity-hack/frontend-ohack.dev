/**
 * The notice a hacker sees when a teammate saved the same write-up field
 * first: it names who and what, shows their version, and offers both ways
 * out. It must render nothing when there is no conflict.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ProjectConflictNotice, {
  describeConflictValue,
} from "../ProjectConflictNotice";

it("renders nothing without conflicts", () => {
  const { container } = render(
    <ProjectConflictNotice conflicts={{}} onResolve={jest.fn()} />,
  );
  expect(container).toBeEmptyDOMElement();
});

it("names the teammate and field, shows their version, and resolves either way", () => {
  const onResolve = jest.fn();
  render(
    <ProjectConflictNotice
      conflicts={{
        project_story: { value: "Jo's story", rev: 2, by: "Jo Park" },
      }}
      onResolve={onResolve}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "Jo Park saved a different story while you were editing.",
  );
  expect(screen.getByText("Jo's story")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Keep mine" }));
  expect(onResolve).toHaveBeenLastCalledWith("project_story", "mine");
  fireEvent.click(screen.getByRole("button", { name: "Use theirs" }));
  expect(onResolve).toHaveBeenLastCalledWith("project_story", "theirs");
});

it("falls back to 'A teammate' when the name is unknown", () => {
  render(
    <ProjectConflictNotice
      conflicts={{ project_tagline: { value: "T", rev: 1, by: null } }}
      onResolve={jest.fn()}
    />,
  );
  expect(screen.getByRole("status")).toHaveTextContent(
    "A teammate saved a different tagline",
  );
});

it("describes list values readably", () => {
  expect(describeConflictValue("project_built_with", ["React", "Flask"])).toBe(
    "React, Flask",
  );
  expect(
    describeConflictValue("project_links", [
      { label: "Demo", url: "https://x.dev" },
    ]),
  ).toBe("Demo — https://x.dev");
  expect(describeConflictValue("project_images", ["a"])).toBe("1 image");
  expect(describeConflictValue("project_thumbnail_url", "u")).toBeNull();
});
