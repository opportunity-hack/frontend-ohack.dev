import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";
import { initFacebookPixel } from "../../lib/ga";
import { serializeJsonLd } from "../../lib/jsonLd";
import {
  RefinedPage,
  BackLink,
  PageMasthead,
  CtaBand,
} from "../design/RefinedPage";
import { Eyebrow } from "../design/refined";

const SITE = "https://www.ohack.dev";

const cardStyle = { padding: "22px 24px" };

const ItemList = ({ items }) => (
  <ul
    style={{
      margin: "10px 0 0",
      paddingLeft: 20,
      fontSize: 15.5,
      lineHeight: 1.6,
    }}
  >
    {items.map((item) => (
      <li key={item} style={{ marginBottom: 6 }}>
        {item}
      </li>
    ))}
  </ul>
);

/**
 * One layout for every case-study page under /about/success-stories/<slug>.
 * `story` is plain data (see the four page files); this component owns the
 * SEO head (canonical + Article/Breadcrumb JSON-LD) and the refined chrome.
 */
export default function SuccessStoryLayout({ story }) {
  const {
    slug,
    nonprofit,
    headline,
    lead,
    meta,
    video,
    facts = [],
    challenge,
    solution,
    resources = [],
    impact,
    years,
  } = story;
  const pageUrl = `${SITE}/about/success-stories/${slug}`;

  useEffect(() => {
    initFacebookPixel();
  }, []);

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: headline,
      description: meta.description,
      image: meta.image,
      url: pageUrl,
      mainEntityOfPage: pageUrl,
      author: { "@type": "Organization", name: "Opportunity Hack", url: SITE },
      publisher: {
        "@type": "Organization",
        name: "Opportunity Hack",
        url: SITE,
      },
      about: { "@type": "Organization", name: nonprofit },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        {
          "@type": "ListItem",
          position: 2,
          name: "Success stories",
          item: `${SITE}/about/success-stories`,
        },
        { "@type": "ListItem", position: 3, name: headline, item: pageUrl },
      ],
    },
  ];

  return (
    <>
      <Head>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        {meta.keywords && <meta name="keywords" content={meta.keywords} />}
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content={meta.ogTitle || meta.title} />
        <meta
          property="og:description"
          content={meta.ogDescription || meta.description}
        />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:image" content={meta.image} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={meta.ogTitle || meta.title} />
        <meta
          name="twitter:description"
          content={meta.ogDescription || meta.description}
        />
        <meta name="twitter:image" content={meta.image} />
        {jsonLd.map((sd, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: serializeJsonLd(sd) }}
          />
        ))}
      </Head>

      <RefinedPage as="article">
        <BackLink href="/about/success-stories">Success stories</BackLink>
        <PageMasthead
          eyebrow={`Success story · ${nonprofit}${years ? ` · ${years}` : ""}`}
          title={headline}
          lead={lead}
        />

        {video && (
          <section
            className="ohx-card"
            style={{ padding: 12, marginTop: 32 }}
            aria-labelledby="demo-heading"
          >
            <p
              id="demo-heading"
              className="ohx-eyebrow"
              style={{ padding: "6px 10px 10px" }}
            >
              {video.label}
            </p>
            {/* Fixed 16:9 box (CWV): the iframe never shifts the page. */}
            <div
              style={{
                position: "relative",
                paddingBottom: "56.25%",
                height: 0,
                overflow: "hidden",
                borderRadius: 6,
              }}
            >
              <iframe
                src={video.src}
                title={video.title}
                loading="lazy"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                }}
              />
            </div>
          </section>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 20,
            marginTop: 32,
          }}
        >
          <div className="ohx-card" style={cardStyle}>
            <Eyebrow>Project overview</Eyebrow>
            <dl
              style={{
                margin: "12px 0 0",
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "10px 16px",
                fontSize: 15,
              }}
            >
              {facts.map((f) => (
                <React.Fragment key={f.label}>
                  <dt
                    style={{
                      color: "var(--muted)",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {f.label}
                  </dt>
                  <dd style={{ margin: 0, lineHeight: 1.5 }}>{f.value}</dd>
                </React.Fragment>
              ))}
            </dl>
          </div>

          {challenge && (
            <div className="ohx-card" style={cardStyle}>
              <Eyebrow>The challenge</Eyebrow>
              <h2
                className="ohx-display"
                style={{ fontSize: 22, marginTop: 8 }}
              >
                {challenge.title || "What the nonprofit was up against"}
              </h2>
              {challenge.intro && (
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: 15.5,
                    lineHeight: 1.6,
                    color: "var(--muted)",
                  }}
                >
                  {challenge.intro}
                </p>
              )}
              {challenge.items && <ItemList items={challenge.items} />}
            </div>
          )}
        </section>

        {solution && (
          <section
            className="ohx-card"
            style={{ ...cardStyle, marginTop: 20 }}
            aria-labelledby="solution-heading"
          >
            <Eyebrow>The solution</Eyebrow>
            <h2
              id="solution-heading"
              className="ohx-display"
              style={{ fontSize: 24, marginTop: 8 }}
            >
              {solution.title || "What the volunteers built"}
            </h2>
            {solution.intro && (
              <p
                style={{
                  margin: "8px 0 0",
                  fontSize: 15.5,
                  lineHeight: 1.6,
                  color: "var(--muted)",
                }}
              >
                {solution.intro}
              </p>
            )}
            {solution.items && <ItemList items={solution.items} />}
          </section>
        )}

        {(resources.length > 0 || impact) && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 20,
              marginTop: 20,
            }}
          >
            {resources.length > 0 && (
              <div className="ohx-card" style={cardStyle}>
                <Eyebrow>Project resources</Eyebrow>
                <ul
                  style={{ listStyle: "none", margin: "6px 0 0", padding: 0 }}
                >
                  {resources.map((r) => (
                    <li
                      key={r.href}
                      style={{
                        borderTop: "1px solid var(--line)",
                        padding: "12px 0",
                      }}
                    >
                      <a
                        className="ohx-link"
                        href={r.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: 15 }}
                      >
                        {r.label} ↗
                      </a>
                      {r.note && (
                        <p
                          style={{
                            margin: "4px 0 0",
                            fontSize: 13.5,
                            color: "var(--muted)",
                          }}
                        >
                          {r.note}
                        </p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {impact && (
              <div
                className="ohx-card"
                style={{ ...cardStyle, background: "var(--surface-2)" }}
              >
                <Eyebrow>Impact</Eyebrow>
                <h2
                  className="ohx-display"
                  style={{ fontSize: 22, marginTop: 8 }}
                >
                  {impact.title || "What changed"}
                </h2>
                {impact.text && (
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: 15.5,
                      lineHeight: 1.6,
                    }}
                  >
                    {impact.text}
                  </p>
                )}
                {impact.items && <ItemList items={impact.items} />}
              </div>
            )}
          </section>
        )}

        <CtaBand
          eyebrow="Next"
          title="Bring us your challenge, or your skills."
          body="Nonprofits submit a problem; volunteers build the solution at the next hackathon; sponsors make it possible."
          primary={{
            href: "/nonprofits/apply",
            label: "Nonprofits: submit your challenge",
          }}
          secondary={{ href: "/hack", label: "Volunteers: find a hackathon" }}
        />
        <p style={{ marginTop: 14, fontSize: 14, color: "var(--muted)" }}>
          Companies:{" "}
          <Link href="/sponsor" className="ohx-link">
            sponsor an event
          </Link>
          .
        </p>
      </RefinedPage>
    </>
  );
}
