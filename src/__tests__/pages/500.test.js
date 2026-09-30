/**
 * pages/500.js must stay a static, self-contained page (no data, no auth,
 * no router) so it can never fail itself, and must be noindex. NOTE: this test
 * lives outside src/pages on purpose — Next builds every file under pages/ as
 * a route (the first Vercel build failed on /__tests__/500.test).
 */
import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("next/head", () => ({
  __esModule: true,
  default: ({ children }) => <>{children}</>,
}));

import Custom500 from "../../pages/500";

describe("500 page", () => {
  it("renders the heading, both actions and a noindex robots meta", () => {
    const { container } = render(<Custom500 />);
    expect(screen.getByRole("heading", { level: 1, name: /something went wrong/i })).toBeInTheDocument();
    expect(screen.getByText(/reload this page/i)).toBeInTheDocument();
    // next/link is globally mocked in jest.setup.js (no <a> wrapper) — assert the text only.
    expect(screen.getByText(/go to the homepage/i)).toBeInTheDocument();
    const robots = container.querySelector('meta[name="robots"]');
    expect(robots).not.toBeNull();
    expect(robots.getAttribute("content")).toMatch(/noindex/);
  });
});
