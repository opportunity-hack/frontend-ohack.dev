import React, { useState, useEffect, useCallback, lazy, Suspense } from "react";
import useNonprofit from "../../hooks/use-nonprofit";
import Head from "next/head";
import { useAuthInfo } from "@propelauth/react";

// Icons
import LanguageIcon from "@mui/icons-material/Language";
import TagIcon from "@mui/icons-material/Tag";

// Analytics
import { trackEvent, initFacebookPixel } from "../../lib/ga";

// Refined design system
import { RefinedRoot, RefinedFonts } from "../design/refined";

// Lazy loaded components
const ProblemStatement = lazy(() =>
  import("../ProblemStatement/ProblemStatement")
);
const LoginOrRegister = lazy(() => import("../LoginOrRegister/LoginOrRegister"));

const LoadingPlaceholder = () => (
  <p className="ohx-muted" style={{ padding: "20px 0", margin: 0 }}>
    Loading…
  </p>
);

const NonProfit = React.memo(function NonProfit(props) {
  const nonprofit_cta_text =
    "Hey there, it looks like there are no active projects with this organization.";
  const { nonprofit_id } = props;
  const { user } = useAuthInfo();

  const [checked, setChecked] = useState([]);
  const [message, setMessage] = useState("");
  const [isPixelInitialized, setIsPixelInitialized] = useState(false);

  const { handle_npo_problem_statement_edit, nonprofit } =
    useNonprofit(nonprofit_id);

  useEffect(() => {
    if (!isPixelInitialized) {
      initFacebookPixel();
      setIsPixelInitialized(true);
    }
  }, [isPixelInitialized]);

  const gaButton = useCallback(async (action, actionName) => {
    trackEvent({
      action: action,
      params: { action_name: actionName },
    });
  }, []);

  const onComplete = useCallback((amessage) => {
    setMessage(amessage);
  }, []);

  const handleSubmit = useCallback(async () => {
    handle_npo_problem_statement_edit(nonprofit_id, checked, onComplete);
  }, [nonprofit_id, checked, handle_npo_problem_statement_edit, onComplete]);

  const nonProfitPageName = "from_nonprofit_page_" + nonprofit.id;
  const description = nonprofit.description ?? "";
  const projectCount = nonprofit.problem_statements?.length || 0;

  const renderProblemStatements = () => {
    if (nonprofit.id === null) {
      return <LoadingPlaceholder />;
    }

    if (
      !nonprofit.problem_statements ||
      nonprofit.problem_statements.length === 0
    ) {
      return (
        <div
          className="ohx-card"
          style={{
            padding: "28px 32px",
            background: "var(--surface-2)",
          }}
        >
          <p
            style={{
              fontSize: "0.95rem",
              color: "var(--muted)",
              marginBottom: 20,
            }}
          >
            {nonprofit_cta_text}
          </p>
          <a
            href="/nonprofits/apply"
            className="ohx-btn ohx-btn--primary"
            onClick={() => gaButton("click_apply", nonProfitPageName)}
          >
            Submit your project ideas
          </a>
        </div>
      );
    }

    return nonprofit.problem_statements.map((ps) => (
      <Suspense key={ps.id || ps} fallback={<LoadingPlaceholder />}>
        <ProblemStatement
          problem_statement_id={ps}
          user={user}
          npo_id={nonprofit_id}
          headingLevel="h2"
        />
      </Suspense>
    ));
  };

  return (
    <RefinedRoot>
      <Head>
        <RefinedFonts />
        <title>{nonprofit.name} | Opportunity Hack</title>
        <link
          rel="canonical"
          href={`https://www.ohack.dev/nonprofit/${nonprofit_id}`}
        />
        <meta
          name="description"
          content={`${nonprofit.name} — ${projectCount} project${
            projectCount !== 1 ? "s" : ""
          } for social good.`}
        />
        <meta
          property="og:title"
          content={`${nonprofit.name} | Opportunity Hack`}
        />
        <meta
          property="og:description"
          content={`${nonprofit.name} — ${projectCount} project${
            projectCount !== 1 ? "s" : ""
          } for social good.`}
        />
        <meta
          property="og:url"
          content={`https://www.ohack.dev/nonprofit/${nonprofit_id}`}
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_Logo_Light_Blue_Banner.png"
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="ohack.dev" />
        <meta
          property="twitter:url"
          content={`https://www.ohack.dev/nonprofit/${nonprofit_id}`}
        />
        <meta
          name="twitter:title"
          content={`${nonprofit.name} | Opportunity Hack`}
        />
        <meta
          name="twitter:description"
          content={`${nonprofit.name} — ${projectCount} project${
            projectCount !== 1 ? "s" : ""
          } for social good.`}
        />
        <meta name="twitter:creator" content="@opportunityhack" />
      </Head>

      {/* Masthead */}
      <div
        style={{
          paddingTop: "clamp(88px, 12vw, 120px)",
          paddingBottom: 40,
        }}
      >
        <div className="ohx-wrap">
          <p className="ohx-eyebrow" style={{ marginBottom: 12 }}>
            Nonprofit Partner
          </p>

          {nonprofit.id ? (
            <>
              <h1
                className="ohx-display rise"
                style={{ animationDelay: "0ms", marginBottom: 14 }}
              >
                {nonprofit.name}
              </h1>

              {description && (
                <p
                  className="ohx-lead rise"
                  style={{ animationDelay: "60ms", marginBottom: 20 }}
                >
                  {description}
                </p>
              )}

              {/* Meta row */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 10,
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                {projectCount > 0 && (
                  <span className="ohx-tag">
                    {projectCount} project{projectCount !== 1 ? "s" : ""}
                  </span>
                )}
                {nonprofit.website && (
                  <a
                    href={nonprofit.website}
                    target="_blank"
                    rel="noreferrer"
                    className="ohx-link"
                    style={{ fontSize: "0.9rem" }}
                    onClick={() => gaButton("click_website", nonProfitPageName)}
                  >
                    <LanguageIcon
                      sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.3 }}
                    />
                    Website →
                  </a>
                )}
                {nonprofit.slack_channel &&
                  nonprofit.slack_channel !== "" && (
                    <a
                      href={`https://opportunity-hack.slack.com/app_redirect?channel=${nonprofit.slack_channel}`}
                      target="_blank"
                      rel="noreferrer"
                      className="ohx-link"
                      style={{ fontSize: "0.9rem" }}
                    >
                      <TagIcon
                        sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.3 }}
                      />
                      #{nonprofit.slack_channel}
                    </a>
                  )}
              </div>

              {/* Point of contact */}
              {nonprofit.contact_people &&
                nonprofit.contact_people.length > 0 && (
                  <p
                    className="ohx-muted"
                    style={{ fontSize: "0.9rem", margin: 0 }}
                  >
                    Point of contact:{" "}
                    {nonprofit.contact_people.map((person, i) => (
                      <a
                        key={person}
                        href={
                          nonprofit.slack_channel
                            ? `https://opportunity-hack.slack.com/app_redirect?channel=${nonprofit.slack_channel}`
                            : "#"
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="ohx-link"
                        style={{ fontSize: "0.9rem" }}
                      >
                        {person}
                        {i < nonprofit.contact_people.length - 1 ? ", " : ""}
                      </a>
                    ))}
                  </p>
                )}
            </>
          ) : (
            <div
              style={{
                minHeight: 120,
                display: "flex",
                alignItems: "center",
              }}
            >
              <LoadingPlaceholder />
            </div>
          )}
        </div>
      </div>

      <hr
        className="ohx-rule"
        style={{ margin: 0, position: "relative", zIndex: 1 }}
      />

      {/* Projects section */}
      <div
        style={{
          paddingTop: 48,
          paddingBottom: 64,
          background: "var(--paper)",
        }}
      >
        <div className="ohx-wrap">
          {/* Auth gate */}
          {!user && (
            <div
              className="ohx-card"
              style={{
                padding: "20px 24px",
                marginBottom: 32,
                background: "var(--surface-2)",
              }}
            >
              <Suspense fallback={<LoadingPlaceholder />}>
                <LoginOrRegister
                  introText={
                    "Sign in or create an account to contribute to this project."
                  }
                  previousPage={"/nonprofit/" + nonprofit_id}
                />
              </Suspense>
            </div>
          )}

          <p className="ohx-eyebrow" style={{ marginBottom: 10 }}>
            Projects
          </p>
          <h2
            className="ohx-display"
            style={{
              fontSize: "clamp(1.5rem, 2.8vw, 2rem)",
              marginBottom: 32,
            }}
          >
            {projectCount > 0
              ? `${projectCount} active project${projectCount !== 1 ? "s" : ""}`
              : "Projects"}
          </h2>

          <div
            style={{ display: "flex", flexDirection: "column", gap: 0 }}
          >
            {renderProblemStatements()}
          </div>
        </div>
      </div>
    </RefinedRoot>
  );
});

export default NonProfit;
