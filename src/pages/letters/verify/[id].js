import React, { useEffect } from "react";
import Head from "next/head";
import Link from "next/link";

import { RefinedPage, PageMasthead } from "../../../components/design/RefinedPage";
import { trackEvent } from "../../../lib/ga";
import {
  LETTER_ID_RE,
  VERIFY_STATUS,
  verifyView,
} from "../../../lib/letterVerify";

const HEADLINES = {
  [VERIFY_STATUS.VALID]: { title: "Valid letter", lead: "This participation letter was issued by Opportunity Hack, Inc. and has not been revoked." },
  [VERIFY_STATUS.REVOKED]: { title: "Revoked letter", lead: "This letter was issued by Opportunity Hack, Inc. and later revoked. It is no longer valid." },
  [VERIFY_STATUS.NOT_FOUND]: { title: "Letter not found", lead: "No Opportunity Hack letter has this ID. Check the link or the letter ID printed on the letter." },
  [VERIFY_STATUS.UNAVAILABLE]: { title: "Can't check right now", lead: "We couldn't reach the verification service. Try again in a few minutes." },
};

export default function VerifyLetterPage({ letterId, view }) {
  useEffect(() => {
    trackEvent({ action: "letter_verify_view", params: { status: view.status } });
  }, [view.status]);

  const headline = HEADLINES[view.status];
  const facts = [
    ["Name", view.name],
    ["Role", view.role],
    ["Event", view.eventTitle],
    ["Date served", view.servedDate],
    ["Issued", view.issued],
    ["Letter ID", letterId],
  ].filter(([, v]) => v);

  return (
    <>
      <Head>
        <title>{`${headline.title} | Opportunity Hack`}</title>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <RefinedPage narrow>
        <PageMasthead eyebrow="Letter verification" title={headline.title} lead={headline.lead}>
          <p style={{ marginTop: 16 }}>
            <span
              className={view.status === VERIFY_STATUS.VALID ? "ohx-tag" : "ohx-tag ohx-tag--accent"}
              data-testid="verify-status"
            >
              {view.status === VERIFY_STATUS.VALID ? "Valid" : headline.title}
            </span>
          </p>
        </PageMasthead>
        {(view.status === VERIFY_STATUS.VALID || view.status === VERIFY_STATUS.REVOKED) && (
          <dl className="ohx-card" style={{ marginTop: 28, padding: 24, display: "grid", gridTemplateColumns: "max-content 1fr", gap: "10px 24px" }}>
            {facts.map(([label, value]) => (
              <React.Fragment key={label}>
                <dt className="ohx-muted" style={{ margin: 0 }}>{label}</dt>
                <dd style={{ margin: 0, fontWeight: label === "Name" ? 600 : 400 }}>{value}</dd>
              </React.Fragment>
            ))}
          </dl>
        )}
        <p className="ohx-muted" style={{ marginTop: 24, fontSize: 14 }}>
          Opportunity Hack, Inc. is a 501(c)(3) nonprofit. Questions about a letter?{" "}
          <Link href="/contact" className="ohx-link">Contact us</Link>.
        </p>
      </RefinedPage>
    </>
  );
}

export async function getServerSideProps({ params, res }) {
  const letterId = String(params?.id || "").toUpperCase();
  res?.setHeader?.("Cache-Control", "private, no-store");
  res?.setHeader?.("X-Robots-Tag", "noindex");
  if (!LETTER_ID_RE.test(letterId)) {
    return { props: { letterId, view: verifyView(null) } };
  }
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/letters/verify/${letterId}`,
    );
    if (response.status === 404) {
      return { props: { letterId, view: verifyView(null) } };
    }
    if (!response.ok) {
      return { props: { letterId, view: verifyView(null, true) } };
    }
    return { props: { letterId, view: verifyView(await response.json()) } };
  } catch {
    return { props: { letterId, view: verifyView(null, true) } };
  }
}
