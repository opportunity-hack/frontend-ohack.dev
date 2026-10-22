import React from "react";
import Head from "next/head";
import {
  RefinedPage,
  PageMasthead,
  Prose,
  LinkRow,
} from "../../../components/design/RefinedPage";

const TERMS = [
  "You grant Opportunity Hack and its affiliates the right and permission to use photographs, videos, and other media containing your image or likeness.",
  "This media will be used responsibly and ethically to promote our mission of coding for social good. This includes publicity, illustration, advertising, and web content related to Opportunity Hack and its events.",
  "We commit to selecting and using only the best and most appropriate images that reflect positively on our participants and our mission.",
  "You waive any right to inspect or approve the finished product, including written copy, wherein your likeness appears.",
  "You release Opportunity Hack and its affiliates from any claims arising from the use of your image or likeness, including claims of invasion of privacy, right of publicity, and copyright infringement.",
  "As a nonprofit, we do not use these images for commercial purposes, and you are not entitled to compensation for the use of your image or likeness.",
  "If you are under 18 years of age, you confirm that you have obtained the consent of a parent or legal guardian to agree to this release.",
];

const noteCardStyle = {
  padding: "18px 20px",
  background: "var(--surface-2)",
  marginTop: 16,
};

const PhotoRelease = () => (
  <>
    <Head>
      <title>Photo Release - Opportunity Hack</title>
      <meta
        name="description"
        content="Photo release agreement for Opportunity Hack hackathon participants. We are a nonprofit organization committed to coding for social good."
      />
      <meta
        name="keywords"
        content="Opportunity Hack, nonprofit, hackathon, photo release, media consent, image rights, coding for social good"
      />
      <link rel="canonical" href="https://www.ohack.dev/hack/photo-release" />
    </Head>
    <RefinedPage narrow>
      <PageMasthead
        eyebrow="Legal · Hackathon participants"
        title="Photo release agreement"
        lead="Opportunity Hack is a nonprofit organization dedicated to leveraging technology for social good. By participating in the Opportunity Hack hackathon, you agree to the following photo release terms."
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
            Opportunity Hack reserves the right to modify this photo release
            agreement at any time without prior notice. Continued participation
            in the hackathon following any such changes shall constitute your
            acceptance of the revised agreement.
          </strong>
        </p>
        <p>
          If you have any concerns about the use of your image, please contact
          the Opportunity Hack organizers immediately.
        </p>
      </Prose>

      <div className="ohx-card" style={noteCardStyle}>
        <p className="ohx-eyebrow">Our commitment</p>
        <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.6 }}>
          As a nonprofit dedicated to coding for social good, we pledge to use
          your images responsibly. Our goal is to inspire others, showcase the
          positive impact of technology on society, and encourage more people to
          join our mission of using coding skills to make the world a better
          place.
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          Remember: your participation helps us demonstrate the power of
          technology in creating positive change.
        </p>
      </div>

      <div className="ohx-card" style={noteCardStyle}>
        <p className="ohx-eyebrow">Coder's note</p>
        <p style={{ margin: "8px 0 0", fontSize: 15.5, lineHeight: 1.6 }}>
          By signing this agreement, you also consent to having your "eureka
          moment" captured when you finally solve that complex algorithm for a
          nonprofit's project. Don't worry, we promise to showcase your
          brilliance, not your caffeine-induced coding frenzy!
        </p>
        <p
          style={{
            margin: "8px 0 0",
            fontSize: 14,
            color: "var(--muted)",
            fontStyle: "italic",
          }}
        >
          Remember: in the world of coding for good, every snapshot tells a
          story of positive change.
        </p>
      </div>

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

export default PhotoRelease;
