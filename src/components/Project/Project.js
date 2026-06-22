import React from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useAuthInfo } from "@propelauth/react";
import Head from "next/head";
import Link from "next/link";
import useProblemstatements from "../../hooks/use-problem-statements";

import { RefinedRoot, RefinedFonts } from "../design/refined";

const ProblemStatement = dynamic(
  () => import("../ProblemStatement/ProblemStatement"),
  { ssr: false }
);
const LoginOrRegister = dynamic(
  () => import("../LoginOrRegister/LoginOrRegister2"),
  { ssr: false }
);

export default function Project() {
  const { user } = useAuthInfo();
  const router = useRouter();
  const { project_id } = router.query;
  const { problem_statement } = useProblemstatements(project_id);

  if (
    problem_statement == null ||
    problem_statement.title === "" ||
    problem_statement.description === ""
  ) {
    return (
      <RefinedRoot>
        <Head>
          <RefinedFonts />
        </Head>
        <div
          style={{
            paddingTop: "clamp(88px, 12vw, 120px)",
            paddingBottom: 64,
          }}
        >
          <div className="ohx-wrap">
            <p className="ohx-muted">Loading project…</p>
          </div>
        </div>
      </RefinedRoot>
    );
  }

  const metaDescription =
    problem_statement.status + ": " + problem_statement.description + " ";
  const title = "Project: " + problem_statement.title;

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: problem_statement.title,
    description: metaDescription,
    offers: {
      "@type": "Offer",
      category:
        "Nonprofit problem statement you solve to learn how to code",
      price: "0",
      priceCurrency: "USD",
    },
    courseCode: problem_statement.id,
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: "PT22H",
      instructor: {
        "@type": "VirtualLocation",
        name: "Opportunity Hack",
      },
    },
    instuctor: [
      {
        "@type": "Person",
        name: "Opportunity Hack",
        sameAs: "https://www.ohack.dev/about",
      },
    ],
    provider: {
      "@type": "Organization",
      name: "Opportunity Hack",
      sameAs: "https://www.ohack.dev",
    },
  };

  return (
    <RefinedRoot>
      <Head>
        <RefinedFonts />
        <title>{title}</title>
        <link
          rel="canonical"
          href={`https://www.ohack.dev/project/${project_id}`}
        />
        <script
          key="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </Head>

      <div
        style={{
          paddingTop: "clamp(88px, 12vw, 120px)",
          paddingBottom: 64,
        }}
      >
        <div className="ohx-wrap">
          {/* Auth gate */}
          {!user && (
            <div
              className="ohx-card"
              style={{
                padding: "20px 24px",
                marginBottom: 24,
                background: "var(--surface-2)",
              }}
            >
              <LoginOrRegister
                introText={
                  "Sign in or create an account to contribute to this project."
                }
                previousPage={`/project/${project_id}`}
              />
            </div>
          )}

          {/* Soft breadcrumb */}
          <div style={{ marginBottom: 20 }}>
            <Link
              href="/nonprofits"
              className="ohx-link"
              style={{ fontSize: "0.9rem" }}
            >
              ← All nonprofit projects
            </Link>
          </div>

          <ProblemStatement
            key={problem_statement.id}
            problem_statement_id={problem_statement.id}
            user={user}
            headingLevel="h1"
          />
        </div>
      </div>
    </RefinedRoot>
  );
}
