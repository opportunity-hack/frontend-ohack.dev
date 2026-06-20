import React from "react";
import Head from "next/head";
import NextLink from "next/link";

// Refined-scoped breadcrumb trail for the team page family. Styled with the
// <RefinedRoot> CSS-var tokens (navy --brand links, Hanken Grotesk) so it sits
// inside the refined surface without the off-brand global-MUI look of the
// shared src/components/Breadcrumbs/Breadcrumbs.js. Emits BreadcrumbList
// structured data (Home is always first; the current page is the unlinked leaf).

const SITE = "https://www.ohack.dev";

export default function TeamBreadcrumbs({ items = [], current }) {
  const trail = [{ name: "Home", href: "/" }, ...items];

  const breadcrumbStructuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      ...trail.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${SITE}${item.href}`,
      })),
      ...(current
        ? [
            {
              "@type": "ListItem",
              position: trail.length + 1,
              name: current,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify(breadcrumbStructuredData)}
        </script>
      </Head>
      <nav aria-label="Breadcrumb" style={{ marginBottom: 22 }}>
        <ol
          style={{
            listStyle: "none",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: "0.5em",
            margin: 0,
            padding: 0,
            fontFamily: "var(--body)",
            fontSize: "0.85rem",
          }}
        >
          {trail.map((item, index) => (
            <li
              key={item.href}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5em" }}
            >
              <NextLink href={item.href} className="ohx-link">
                {item.name}
              </NextLink>
              {(index < trail.length - 1 || current) && (
                <span aria-hidden="true" style={{ color: "var(--faint)" }}>
                  ›
                </span>
              )}
            </li>
          ))}
          {current && (
            <li aria-current="page" style={{ color: "var(--muted)", fontWeight: 600 }}>
              {current}
            </li>
          )}
        </ol>
      </nav>
    </>
  );
}
