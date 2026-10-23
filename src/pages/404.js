import React, { useEffect, useState } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import * as ga from "../lib/ga";
import {
  RefinedPage,
  PageMasthead,
  LinkRow,
} from "../components/design/RefinedPage";

const sleepingImages = [
  "https://cdn.ohack.dev/ohack.dev/404/sleeping1.webp",
  "https://cdn.ohack.dev/ohack.dev/404/sleeping2.webp",
  "https://cdn.ohack.dev/ohack.dev/404/sleeping3.webp",
];

const Custom404 = () => {
  const [randomImage, setRandomImage] = useState("");
  const router = useRouter();

  useEffect(() => {
    setRandomImage(
      sleepingImages[Math.floor(Math.random() * sleepingImages.length)],
    );
    // Track the 404 error
    ga.event({ action: "404_error", params: { page_path: router.asPath } });
  }, [router.asPath]);

  const pageTitle = `404 - Page Not Found | ${router.asPath} | Opportunity Hack`;
  const pageDescription = `The page ${router.asPath} could not be found. Explore other opportunities to hack for social good with Opportunity Hack.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta name="robots" content="noindex,follow" />
      </Head>
      <RefinedPage>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
            gap: 32,
            alignItems: "center",
          }}
        >
          <div>
            <PageMasthead
              eyebrow="404 · Page not found"
              title="This page is taking"
              italic="a little nap."
              lead="It may have moved, or the link may be out of date. Everything we're actually working on is one click away."
              style={{ marginTop: 0 }}
            />
            <LinkRow
              style={{ marginTop: 26 }}
              primary={{ href: "/", label: "Go to the homepage" }}
              links={[
                { href: "/nonprofits", label: "Browse nonprofit projects" },
                { href: "/about", label: "About Opportunity Hack" },
              ]}
            />
            <p style={{ marginTop: 28, fontSize: 14, color: "var(--muted)" }}>
              Think this is our mistake?{" "}
              <Link href="/contact?type=technical" className="ohx-link">
                Let us know
              </Link>
              .
            </p>
          </div>
          {/* Reserved 4:3 box so the random image never shifts the layout. */}
          <div
            className="ohx-card"
            style={{
              aspectRatio: "4 / 3",
              overflow: "hidden",
              background: "var(--surface-2)",
              position: "relative",
            }}
          >
            {randomImage && (
              <Image
                src={randomImage}
                alt="A sleeping character"
                width={400}
                height={300}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
        </div>
      </RefinedPage>
    </>
  );
};

export default Custom404;
