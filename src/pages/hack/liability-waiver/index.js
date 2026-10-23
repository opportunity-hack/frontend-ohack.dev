import React from "react";
import Head from "next/head";
import {
  RefinedPage,
  PageMasthead,
  Prose,
  LinkRow,
} from "../../../components/design/RefinedPage";

const TERMS = [
  "You acknowledge that participation in the hackathon may involve risks and you voluntarily assume all risks associated with your participation.",
  "You release Opportunity Hack, its organizers, sponsors, and affiliates from any and all liability for any loss, damage, injury, or expense that you may suffer as a result of your participation in the hackathon.",
  "You agree to indemnify and hold harmless Opportunity Hack, its organizers, sponsors, and affiliates from any and all claims, actions, suits, procedures, costs, expenses, damages, and liabilities arising out of your participation in the hackathon.",
  "You grant Opportunity Hack the right to use your name, likeness, and any content you create during the hackathon for promotional purposes without compensation.",
  "You agree to comply with all applicable laws, regulations, and hackathon rules during your participation.",
];

const LiabilityWaiver = () => (
  <>
    <Head>
      <title>Liability Waiver - Opportunity Hack</title>
      <meta
        name="description"
        content="Liability waiver for Opportunity Hack hackathon participants."
      />
      <meta
        name="keywords"
        content="Opportunity Hack, hackathon, liability waiver, legal agreement"
      />
      <link
        rel="canonical"
        href="https://www.ohack.dev/hack/liability-waiver"
      />
    </Head>
    <RefinedPage narrow>
      <PageMasthead
        eyebrow="Legal · Hackathon participants"
        title="Liability waiver"
        lead="By participating in the Opportunity Hack hackathon, you agree to the following terms and conditions."
        style={{ marginTop: 0 }}
      />
      <Prose style={{ marginTop: 32 }}>
        <ol>
          {TERMS.map((text) => (
            <li key={text}>{text}</li>
          ))}
        </ol>
        <p>
          <strong>
            Opportunity Hack reserves the right to modify this waiver at any
            time without prior notice. Continued participation in the hackathon
            following any such changes shall constitute your acceptance of the
            revised waiver.
          </strong>
        </p>
      </Prose>
      <LinkRow
        style={{ marginTop: 32 }}
        primary={{ href: "/sponsor", label: "Become a sponsor" }}
        links={[
          { href: "/about/mentors", label: "Learn about mentoring" },
          { href: "/about/judges", label: "Become a judge" },
        ]}
      />
    </RefinedPage>
  </>
);

export default LiabilityWaiver;
