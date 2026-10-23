import React from "react";
import Head from "next/head";
import Link from "next/link";
import {
  RefinedPage,
  PageMasthead,
  Prose,
  LinkRow,
} from "../../../components/design/RefinedPage";

// Date the policy TEXT last changed (contact email → /contact page, Oct 8
// 2026). Bump it only with a wording change — the previous page printed
// today's date, which read as a daily revision.
const LAST_UPDATED = "October 8, 2026";

const PrivacyPolicy = () => (
  <>
    <Head>
      <title>Privacy Policy - Opportunity Hack</title>
      <meta
        name="description"
        content="Privacy policy for Opportunity Hack, a nonprofit organization dedicated to coding for social good. Includes information on GDPR compliance and cookie usage."
      />
      <meta
        name="keywords"
        content="Opportunity Hack, privacy policy, data protection, nonprofit, open source, hackathon, GDPR, cookies"
      />
      <link rel="canonical" href="https://www.ohack.dev/about/privacy-policy" />
    </Head>
    <RefinedPage narrow>
      <PageMasthead
        eyebrow="Legal"
        title="Privacy policy"
        lead="At Opportunity Hack, we are committed to protecting your privacy and ensuring the security of your personal information. This policy outlines our practices concerning the collection, use, and protection of your data."
        style={{ marginTop: 0 }}
      />
      <Prose style={{ marginTop: 32 }}>
        <h2>1. About Opportunity Hack</h2>
        <p>
          Opportunity Hack is a nonprofit organization dedicated to leveraging
          technology for social good. Our mission is to connect skilled
          volunteers with nonprofits to create innovative solutions that make a
          positive impact on society.
        </p>

        <h2>2. Information we collect</h2>
        <p>
          We collect information that you provide directly to us, such as when
          you register for an event, sign up for our newsletter, or participate
          in our hackathons. This may include:
        </p>
        <ul>
          <li>Name and contact information</li>
          <li>Skills and areas of expertise</li>
          <li>Demographic information</li>
          <li>Participation history in our events</li>
        </ul>

        <h2>3. How we use your information</h2>
        <p>We use the information we collect to:</p>
        <ul>
          <li>Organize and manage our hackathons and events</li>
          <li>Communicate with you about upcoming opportunities</li>
          <li>Improve our programs and services</li>
          <li>Analyze the impact of our initiatives</li>
        </ul>

        <h2>4. Information sharing and disclosure</h2>
        <p>
          As a nonprofit organization committed to transparency and trust, we
          want to assure you that we will not share any information about our
          participants without their explicit agreement. Your privacy is
          paramount to us, and we treat your personal information with the
          utmost respect and confidentiality.
        </p>

        <h2>5. Data security</h2>
        <p>
          We implement a variety of security measures to maintain the safety of
          your personal information. However, no method of transmission over the
          Internet or electronic storage is 100% secure. While we strive to use
          commercially acceptable means to protect your personal information, we
          cannot guarantee its absolute security.
        </p>

        <h2>6. Open source commitment</h2>
        <p>
          At Opportunity Hack, we believe in the power of open source and
          transparency. We invite you to review our open-source GitHub code to
          help improve our security and privacy measures. As this is a public
          good, we welcome contributions from the community to enhance the
          protection of user data and the overall security of our platform.
        </p>
        <p>
          You can find our GitHub repository at{" "}
          <a
            href="https://github.com/opportunity-hack"
            target="_blank"
            rel="noopener noreferrer"
          >
            github.com/opportunity-hack
          </a>
          .
        </p>

        <h2>7. Cookies and website analysis</h2>
        <p>
          We use cookies and similar tracking technologies to analyze the
          quality and impact of our website. These tools help us understand how
          visitors use our site, which pages are most popular, and how we can
          improve the user experience. The data collected is aggregated and
          anonymized, and we do not use it to identify individual users.
        </p>
        <p>
          By using our website, you consent to the use of cookies for these
          purposes. You can control and/or delete cookies as you wish through
          your browser settings. Removing or blocking cookies may impact your
          user experience on our site.
        </p>

        <h2>8. GDPR compliance</h2>
        <p>
          Opportunity Hack is committed to complying with the General Data
          Protection Regulation (GDPR). If you are a resident of the European
          Economic Area (EEA), you have certain data protection rights,
          including:
        </p>
        <ul>
          <li>
            The right to access, update, or delete your personal information
          </li>
          <li>The right to data portability</li>
          <li>
            The right to restrict or object to our processing of your personal
            data
          </li>
          <li>
            The right to withdraw consent at any time for data processing based
            on consent
          </li>
        </ul>
        <p>
          To exercise these rights, please contact us through our{" "}
          <Link href="/contact">contact page</Link>. We will respond to your
          request within 30 days.
        </p>

        <h2>9. Your rights</h2>
        <p>
          Regardless of your location, you have the right to access, correct, or
          delete your personal information at any time. If you would like to
          exercise these rights or have any questions about our privacy
          practices, please contact us through our{" "}
          <Link href="/contact">contact page</Link>.
        </p>

        <h2>10. Changes to this policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify
          you of any changes by posting the new Privacy Policy on this page and
          updating the "Last updated" date below.
        </p>

        <hr className="ohx-rule" style={{ margin: "32px 0 16px" }} />
        <p style={{ fontSize: 14, color: "var(--muted)" }}>
          Last updated: {LAST_UPDATED}
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

export default PrivacyPolicy;
