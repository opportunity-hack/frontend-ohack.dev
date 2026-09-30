import React from "react";
import { render } from "@testing-library/react";

jest.mock("next/head", () => ({ __esModule: true, default: ({ children }) => children }));
jest.mock("next/link", () => ({ __esModule: true, default: ({ children }) => children }));

import Breadcrumbs from "../Breadcrumbs";

test("emits parseable BreadcrumbList JSON-LD whose leaf has no item", () => {
  const { container } = render(
    <Breadcrumbs items={[{ name: 'About "us"', href: "/about" }]} currentPage="Judges" />
  );
  const script = container.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  const data = JSON.parse(script.innerHTML);
  expect(data["@type"]).toBe("BreadcrumbList");
  const list = data.itemListElement;
  expect(list).toHaveLength(3);
  expect(list[1]).toMatchObject({ name: 'About "us"', item: "https://www.ohack.dev/about" });
  expect(list[2]).toEqual({ "@type": "ListItem", position: 3, name: "Judges" });
});
