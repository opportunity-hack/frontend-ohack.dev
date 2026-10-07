/**
 * ErrorBoundary must catch render errors from its subtree and show the
 * calm on-brand fallback instead of blanking the whole app. `resetKey`
 * (the router path in _app.js) lets a client-side navigation recover from
 * a caught error without a full reload.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "../ErrorBoundary";

function Bomb() {
  throw new Error("boom");
}

function Happy() {
  return <div>All good</div>;
}

describe("ErrorBoundary", () => {
  it("renders children normally when there is no error", () => {
    render(
      <ErrorBoundary resetKey="/">
        <Happy />
      </ErrorBoundary>
    );
    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong on this page.")
    ).not.toBeInTheDocument();
  });

  it("renders the fallback when a child throws during render", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    render(
      <ErrorBoundary resetKey="/">
        <Bomb />
      </ErrorBoundary>
    );

    expect(
      screen.getByText("Something went wrong on this page.")
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /reload this page/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/go to the homepage/i)).toBeInTheDocument();

    spy.mockRestore();
  });

  it("clears the error and re-renders children once resetKey changes", () => {
    const spy = jest.spyOn(console, "error").mockImplementation(() => {});
    const { rerender } = render(
      <ErrorBoundary resetKey="/a">
        <Bomb />
      </ErrorBoundary>
    );
    expect(
      screen.getByText("Something went wrong on this page.")
    ).toBeInTheDocument();

    rerender(
      <ErrorBoundary resetKey="/b">
        <Happy />
      </ErrorBoundary>
    );

    expect(screen.getByText("All good")).toBeInTheDocument();
    expect(
      screen.queryByText("Something went wrong on this page.")
    ).not.toBeInTheDocument();

    spy.mockRestore();
  });
});
