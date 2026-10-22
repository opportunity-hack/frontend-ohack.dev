import { useRouter } from "next/router";
import dynamic from "next/dynamic";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { memo } from "react";

import { whyPages } from "../../../data/why-content";
import {
  generateOpenGraphData,
  generateStructuredData,
} from "../../../data/why-pages";
import { serializeJsonLd } from "../../../lib/jsonLd";
import {
  RefinedPage,
  BackLink,
  Prose,
} from "../../../components/design/RefinedPage";
import { Eyebrow } from "../../../components/design/refined";

const LoginOrRegister = dynamic(
  () => import("../../../components/LoginOrRegister/LoginOrRegister2"),
  { ssr: false, loading: () => <div style={{ minHeight: 120 }} /> },
);

const OptimizedImage = memo(({ src, alt }) => (
  <div
    className="ohx-card"
    style={{
      position: "relative",
      width: "100%",
      maxWidth: 300,
      aspectRatio: "1 / 1",
      overflow: "hidden",
      flexShrink: 0,
    }}
  >
    <Image
      src={src}
      alt={alt}
      fill
      style={{ objectFit: "cover" }}
      priority
      sizes="(max-width: 768px) 100vw, 300px"
    />
  </div>
));
OptimizedImage.displayName = "OptimizedImage";

const LoadingState = () => (
  <RefinedPage>
    <div
      aria-busy="true"
      style={{ display: "flex", gap: 32, flexWrap: "wrap" }}
    >
      <div className="ohx-card" style={{ width: 300, height: 300 }} />
      <div style={{ flex: "1 1 320px" }}>
        <div
          style={{
            height: 40,
            width: "70%",
            background: "var(--surface-2)",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            height: 16,
            width: "90%",
            background: "var(--surface-2)",
            borderRadius: 4,
            marginTop: 16,
          }}
        />
        <div
          style={{
            height: 16,
            width: "80%",
            background: "var(--surface-2)",
            borderRadius: 4,
            marginTop: 8,
          }}
        />
      </div>
    </div>
  </RefinedPage>
);

const RelatedLinks = ({ links }) => (
  <section style={{ marginTop: 40 }} aria-labelledby="related-heading">
    <Eyebrow>Related topics</Eyebrow>
    <h2
      id="related-heading"
      className="ohx-display"
      style={{ fontSize: 22, marginTop: 8 }}
    >
      Keep reading
    </h2>
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {links.map(({ slug, title }) => (
        <Link
          key={slug}
          href={`/about/why/${slug}`}
          prefetch={false}
          className="ohx-btn ohx-btn--ghost"
        >
          {title}
        </Link>
      ))}
    </div>
  </section>
);

const Highlights = ({ items }) => (
  <div
    className="ohx-card"
    style={{
      padding: "18px 22px",
      background: "var(--surface-2)",
      marginTop: 28,
    }}
  >
    <p className="ohx-eyebrow">Key highlights</p>
    <ul
      style={{
        margin: "10px 0 0",
        paddingLeft: 20,
        fontSize: 15.5,
        lineHeight: 1.6,
      }}
    >
      {items.map((highlight) => (
        <li key={highlight} style={{ marginBottom: 4 }}>
          {highlight}
        </li>
      ))}
    </ul>
  </div>
);

const WhyPage = () => {
  const router = useRouter();
  const { title } = router.query;

  if (router.isFallback || !title) {
    return <LoadingState />;
  }

  const pageData = whyPages[title];

  if (!pageData) {
    router.push("/404");
    return null;
  }

  const { Content, highlights, relatedLinks } = pageData;

  return (
    <>
      <Head>
        <title>{`${pageData.title} | Opportunity Hack`}</title>
        {pageData.metaTags?.map((tag, index) => (
          <meta {...tag} key={`meta-${index}-${tag.name}`} />
        ))}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(pageData.structuredData),
          }}
        />
        <link
          rel="canonical"
          href={`https://www.ohack.dev/about/why/${title}`}
        />
      </Head>

      <RefinedPage>
        <BackLink href="/about/why">Why Opportunity Hack</BackLink>
        <header
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 32,
            marginTop: 18,
          }}
        >
          <OptimizedImage src={pageData.image} alt={pageData.title} />
          <div style={{ flex: "1 1 320px", minWidth: 0 }}>
            <Eyebrow>Why Opportunity Hack</Eyebrow>
            <h1 className="ohx-display" style={{ marginTop: 8 }}>
              {pageData.title}
            </h1>
            {pageData.subtitle && (
              <p
                style={{
                  margin: "10px 0 0",
                  fontSize: 18,
                  color: "var(--ink)",
                  fontWeight: 500,
                }}
              >
                {pageData.subtitle}
              </p>
            )}
            {pageData.description && (
              <p className="ohx-lead" style={{ marginTop: 10 }}>
                {pageData.description}
              </p>
            )}
          </div>
        </header>

        {highlights && <Highlights items={highlights} />}

        <Prose style={{ marginTop: 36 }}>{Content && <Content />}</Prose>

        {relatedLinks && <RelatedLinks links={relatedLinks} />}

        <div style={{ marginTop: 48, maxWidth: 720 }}>
          <LoginOrRegister
            introText="Ready to start building your portfolio?"
            previousPage={`/about/why/${title}`}
          />
        </div>
      </RefinedPage>
    </>
  );
};

export async function getStaticPaths() {
  const paths = Object.keys(whyPages).map((slug) => ({
    params: { title: slug },
  }));
  return { paths, fallback: true };
}

export async function getStaticProps({ params = {} } = {}) {
  const pageData = whyPages[params.title];
  const keywords = pageData?.keywords || [];
  const structuredData = generateStructuredData(pageData);
  const openGraphData = generateOpenGraphData(pageData, keywords);

  if (!pageData) {
    return { notFound: true };
  }

  return {
    props: {
      title: pageData.title,
      openGraphData,
      structuredData,
    },
  };
}

export default WhyPage;
