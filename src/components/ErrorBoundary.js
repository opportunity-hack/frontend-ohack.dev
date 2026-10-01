import React from "react";
import Link from "next/link";
import { RefinedRoot } from "./design/refined";

// Global render-error safety net for _app.js. A render error anywhere in
// Component's subtree used to blank the entire app (NavBar/Footer included);
// this catches it and shows a calm, on-brand fallback instead.
//
// `resetKey` (pass the router path) lets a client-side navigation away from
// the broken page recover automatically, without a full reload.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  componentDidUpdate(prevProps) {
    if (
      this.state.hasError &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false });
    }
  }

  handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <RefinedRoot>
          <section
            className="ohx-wrap"
            style={{
              paddingTop: "clamp(64px, 12vh, 120px)",
              paddingBottom: "clamp(64px, 12vh, 120px)",
              textAlign: "center",
            }}
          >
            <h1 className="ohx-display" style={{ marginBottom: 16 }}>
              Something went wrong on this page.
            </h1>
            <p
              className="ohx-lead"
              style={{ marginInline: "auto", marginBottom: 32 }}
            >
              Please try reloading, or head back to the homepage.
            </p>
            <div
              style={{
                display: "flex",
                gap: 12,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                className="ohx-btn ohx-btn--primary"
                onClick={this.handleReload}
              >
                Reload this page
              </button>
              <Link href="/" className="ohx-btn ohx-btn--ghost">
                Go to the homepage
              </Link>
            </div>
          </section>
        </RefinedRoot>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
