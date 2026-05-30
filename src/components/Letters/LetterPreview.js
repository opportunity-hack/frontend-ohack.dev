import React from "react";
import { Box, Typography } from "@mui/material";
import { format, parseISO } from "date-fns";
import { ORG, LETTER_TYPES } from "./letterConfig";

const FONT = '"Arial", "Helvetica", sans-serif';

// Renders a typed value, or a muted bracket placeholder so OHack can fill by hand.
function V({ value, placeholder }) {
  if (value && String(value).trim()) return <>{value}</>;
  return (
    <span style={{ color: "#9aa0a6", fontStyle: "italic" }}>
      {placeholder}
    </span>
  );
}

function prettyDate(raw, fallback = "[Date]") {
  if (!raw) return fallback;
  // letterDate / startDate come from <input type="date"> as yyyy-mm-dd.
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return format(parseISO(raw), "MMMM d, yyyy");
    }
  } catch {
    /* fall through to raw */
  }
  return raw;
}

const headingSx = { fontFamily: FONT, fontWeight: 700, fontSize: "11pt", mt: 2, mb: 0.5 };
const bodySx = { fontFamily: FONT, fontSize: "11pt", lineHeight: 1.45, mb: 1.25, color: "#000" };

function Letterhead() {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={{ fontFamily: FONT, fontWeight: 700, fontSize: "15pt", color: "#000" }}>
        {ORG.name}
      </Typography>
      <Box sx={{ borderBottom: "1px solid #000", my: 0.5 }} />
      <Typography sx={{ fontFamily: FONT, fontSize: "9.5pt", color: "#000" }}>
        A {ORG.taxStatus} | EIN {ORG.ein} | {ORG.website}
      </Typography>
    </Box>
  );
}

function RecipientBlock({ f }) {
  return (
    <Box sx={{ mb: 2 }}>
      <Typography sx={bodySx} component="div">
        {prettyDate(f.letterDate)}
      </Typography>
      <Typography sx={{ ...bodySx, mb: 0 }} component="div">
        <V value={f.recipientName} placeholder="[Volunteer Full Name]" />
      </Typography>
      <Typography sx={{ ...bodySx, mb: 0, whiteSpace: "pre-line" }} component="div">
        <V value={f.recipientAddress} placeholder={"[Street Address]\n[City, State ZIP]"} />
      </Typography>
    </Box>
  );
}

function SignatureBlock({ s }) {
  return (
    <Box sx={{ mt: 3 }}>
      <Typography sx={{ ...bodySx, mb: 3 }}>Sincerely,</Typography>
      <Typography sx={{ ...bodySx, mb: 0 }}>
        <V value={s.signerName} placeholder="[Name]" />
      </Typography>
      <Typography sx={{ ...bodySx, mb: 0 }}>
        <V value={s.signerTitle} placeholder="[Title]" />, {ORG.name}
      </Typography>
      <Typography sx={{ ...bodySx, mb: 0 }}>
        <V value={s.signerEmail} placeholder="[email]" /> |{" "}
        <V value={s.signerPhone} placeholder="[phone]" />
      </Typography>
    </Box>
  );
}

function Bullet({ children }) {
  return (
    <Box component="li" sx={{ ...bodySx, mb: 0.75 }}>
      {children}
    </Box>
  );
}

function GuardrailBullets({ name }) {
  const n = name && name.trim() ? name : "The volunteer";
  return (
    <Box component="ul" sx={{ pl: 3, my: 1 }}>
      <Bullet>
        This was a volunteer role; {n} is not an employee of {ORG.shortName}.
      </Bullet>
      <Bullet>
        No compensation of any kind was provided — no wages, stipend, prize money,
        meals, travel, lodging, or benefits.
      </Bullet>
      <Bullet>No visa sponsorship was offered or implied.</Bullet>
      <Bullet>
        {ORG.shortName} does not provide legal or immigration advice and does not
        certify immigration status.
      </Bullet>
      <Bullet>
        This is an event-based service confirmation, not an OPT-employment letter.
      </Bullet>
    </Box>
  );
}

function EngagementTable({ f }) {
  const rows = [
    ["Organization", ORG.name],
    ["Tax status", ORG.taxStatus],
    ["EIN", ORG.ein],
    ["Organization address", <V key="a" value={f.orgAddress || ORG.address} placeholder="[Organization mailing address]" />],
    ["Volunteer role", "Volunteer Software Engineer"],
    ["Engagement type", "Unpaid volunteer (no employer-employee relationship)"],
    ["Start date", <V key="s" value={prettyDate(f.startDate, "")} placeholder="[Start date]" />],
    ["End date", <V key="e" value={f.endDate} placeholder='[End date, or "ongoing"]' />],
    ["Hours per week", <><V value={f.hoursPerWeek} placeholder="at least 20" /> hours per week</>],
    ["Hours record", `Self-logged by volunteer at ${ORG.trackUrl}, verified by supervisor`],
    ["Work location", <V key="w" value={f.workLocation} placeholder="Remote / [Phoenix, AZ]" />],
    [
      "Supervisor",
      <>
        <V value={f.supervisorName} placeholder="[Supervisor name]" />,{" "}
        <V value={f.supervisorTitle} placeholder="[title]" />
      </>,
    ],
    [
      "Supervisor contact",
      <>
        <V value={f.supervisorEmail} placeholder="[email]" /> |{" "}
        <V value={f.supervisorPhone} placeholder="[phone]" />
      </>,
    ],
  ];
  return (
    <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", my: 1.5 }}>
      <Box component="tbody">
        {rows.map(([label, value], i) => (
          <Box component="tr" key={i}>
            <Box
              component="td"
              sx={{
                border: "1px solid #888",
                p: "4px 8px",
                fontFamily: FONT,
                fontSize: "10pt",
                fontWeight: 700,
                width: "34%",
                verticalAlign: "top",
                color: "#000",
              }}
            >
              {label}
            </Box>
            <Box
              component="td"
              sx={{
                border: "1px solid #888",
                p: "4px 8px",
                fontFamily: FONT,
                fontSize: "10pt",
                verticalAlign: "top",
                color: "#000",
              }}
            >
              {value}
            </Box>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ---- Letter bodies -------------------------------------------------------

function GeneralLetter({ f, s }) {
  return (
    <>
      <RecipientBlock f={f} />
      <Typography sx={{ ...bodySx, fontWeight: 700 }}>
        Subject: Volunteer Role Confirmation and Responsibilities at {ORG.shortName}
      </Typography>
      <Typography sx={bodySx}>
        Dear <V value={f.recipientName} placeholder="[Volunteer Name]" />,
      </Typography>
      <Typography sx={bodySx}>
        Thank you for your interest in volunteering with {ORG.name} (“{ORG.shortName}”),
        a {ORG.taxStatus} registered with the IRS and the State of Arizona. We are excited
        about your eagerness to contribute to our mission of helping nonprofits and
        developing individuals in software engineering and related fields. This letter
        outlines your volunteer role and responsibilities.
      </Typography>
      <Typography sx={bodySx}>
        <strong>Volunteer role:</strong> Volunteer Software Engineer
      </Typography>
      <Typography sx={headingSx}>Responsibilities</Typography>
      <Box component="ul" sx={{ pl: 3, my: 1 }}>
        <Bullet>
          <strong>Project selection and contribution:</strong> You may select projects from
          our pool of initiatives, primarily improving our platform ({ORG.website}) or
          assisting other nonprofits with their software needs.
        </Bullet>
        <Bullet>
          <strong>Communication:</strong> We use asynchronous communication via Slack
          ({ORG.slack}). You are encouraged to ask questions and share comments. When async
          is not enough, we offer bi-weekly Office Half-Hours for real-time support.
        </Bullet>
        <Bullet>
          <strong>Mentorship and guidance:</strong> Engage in mentoring sessions and ad hoc
          workshops to build your skills in software engineering, program management,
          product management, and user experience design.
        </Bullet>
        <Bullet>
          <strong>Documentation:</strong> Log your volunteer time at {ORG.trackUrl} and keep
          records of your contributions and progress.
        </Bullet>
      </Box>
      <Typography sx={bodySx}>
        <strong>Duration and commitment:</strong> You may choose the duration and level of
        commitment that suits your schedule. For this general volunteer role there is no
        minimum or maximum time requirement.
      </Typography>
      <Typography sx={headingSx}>Legal considerations</Typography>
      <Typography sx={bodySx}>
        As a volunteer, you are not an employee of {ORG.shortName}. This role offers no
        financial compensation, benefits, prize money, or visa sponsorship. Your
        contributions are made on a voluntary basis. {ORG.shortName} does not provide legal
        or immigration advice and does not certify your immigration status. If you hold a
        visa or other status that may require work authorization even for unpaid work (for
        example, F-1 students), please confirm with your Designated School Official or a
        licensed immigration attorney before treating this as informal volunteering. If you
        need this engagement to count toward post-completion OPT, ask us for our OPT
        volunteer engagement confirmation letter instead, which documents specific hours and
        a supervisor.
      </Typography>
      <Typography sx={headingSx}>Recognition and support</Typography>
      <Typography sx={bodySx}>
        Upon successful completion of your volunteer activities, and consistent with our
        recognition guidelines ({ORG.heartsUrl}), we will provide a letter of recommendation
        highlighting your contributions and milestones. We may also offer LinkedIn
        endorsements and serve as a professional reference for future opportunities,
        consistent with those guidelines.
      </Typography>
      <Typography sx={bodySx}>
        We look forward to your contributions and are here to support you throughout your
        volunteer journey with {ORG.shortName}. Please reach out with any questions.
      </Typography>
      <SignatureBlock s={s} />
    </>
  );
}

function OptLetter({ f, s }) {
  return (
    <>
      <RecipientBlock f={f} />
      <Typography sx={{ ...bodySx, fontWeight: 700 }}>
        Re: Confirmation of Volunteer Engagement — Volunteer Software Engineer
      </Typography>
      <Typography sx={bodySx}>
        Dear <V value={f.recipientName} placeholder="[Volunteer Name]" />,
      </Typography>
      <Typography sx={bodySx}>
        Thank you for volunteering with {ORG.name} (“{ORG.shortName}”), a {ORG.taxStatus}{" "}
        organization registered with the IRS and the State of Arizona. We are glad to have
        you contributing to our mission of helping nonprofits through technology and
        developing volunteers in software engineering and related fields. At your request,
        this letter confirms the details of your volunteer engagement so that you may report
        it accurately to your Designated School Official (DSO).
      </Typography>
      <Typography sx={headingSx}>Engagement details</Typography>
      <EngagementTable f={f} />
      <Typography sx={headingSx}>Role and responsibilities</Typography>
      <Typography sx={bodySx}>
        In this volunteer role you will perform software engineering work directly related
        to your field of study, including:
      </Typography>
      <Box component="ul" sx={{ pl: 3, my: 1 }}>
        <Bullet>
          <strong>Software development:</strong> designing, developing, testing, and
          reviewing software for {ORG.shortName} platforms (including {ORG.website}) and
          partner nonprofit projects;
        </Bullet>
        <Bullet>
          <strong>Technical collaboration:</strong> participating in technical design
          discussions, code reviews, and documentation;
        </Bullet>
        <Bullet>
          <strong>Communication and mentorship:</strong> coordinating asynchronously through
          Slack ({ORG.slack}) and bi-weekly Office Half-Hours, with mentorship in software
          engineering, product management, and UX as relevant.
        </Bullet>
      </Box>
      <Typography sx={headingSx}>Compensation</Typography>
      <Typography sx={bodySx}>
        This is an unpaid volunteer engagement. {ORG.shortName} does not and will not provide
        wages, salary, stipends, prize money, meals, transportation, lodging, equity,
        benefits, or any other form of compensation for this role. There is no promise or
        expectation of future paid employment, and no visa sponsorship is offered or implied.
      </Typography>
      <Typography sx={headingSx}>Hours, reporting, and legal note</Typography>
      <Typography sx={bodySx}>
        You are responsible for logging your volunteer hours at {ORG.trackUrl}. This
        self-logged time record, which your supervisor can confirm, is the basis for
        verifying the hours you report. We understand you intend to report this volunteer
        engagement as part of your post-completion Optional Practical Training (OPT). The
        information above is provided to support that reporting and your records. We will, on
        request, verify your role, dates, and logged hours for your DSO or for U.S.
        Citizenship and Immigration Services. {ORG.shortName} does not provide legal or
        immigration advice and does not certify your immigration status or compliance.
        Whether this engagement and the reported hours satisfy your specific OPT
        requirements (including the requirement that qualifying employment relate to your
        degree and average a sufficient number of hours per week) is a determination for
        you, your DSO, and, if needed, a licensed immigration attorney. Please confirm these
        details with your DSO before relying on this engagement for status purposes.
      </Typography>
      <Typography sx={headingSx}>Recognition</Typography>
      <Typography sx={bodySx}>
        Upon completion of your volunteer activities, and consistent with our recognition
        guidelines ({ORG.heartsUrl}), we are glad to provide a letter of recommendation
        summarizing your contributions and milestones, and we may serve as a professional
        reference or provide a LinkedIn endorsement.
      </Typography>
      <Typography sx={bodySx}>
        We are grateful for your contributions and look forward to working with you. Please
        reach out with any questions.
      </Typography>
      <SignatureBlock s={s} />
    </>
  );
}

function ServiceLetter({ f, s, role }) {
  const isMentor = role === "mentor";
  const roleWord = isMentor ? "mentor" : "judge";
  return (
    <>
      <RecipientBlock f={f} />
      <Typography sx={{ ...bodySx, fontWeight: 700 }}>
        Re: Confirmation of Volunteer Service — {isMentor ? "Mentor" : "Judge"}
      </Typography>
      <Typography sx={bodySx}>
        Dear <V value={f.recipientName} placeholder="[Volunteer Name]" />,
      </Typography>
      <Typography sx={bodySx}>
        Thank you for volunteering with {ORG.name} (“{ORG.shortName}”), a {ORG.taxStatus}{" "}
        registered with the IRS and the State of Arizona. This letter confirms your volunteer
        service at the event below.
      </Typography>
      <Typography sx={bodySx}>
        This confirms that{" "}
        <V value={f.recipientName} placeholder="[Volunteer Name]" /> served as a volunteer{" "}
        {roleWord} at <V value={f.eventName} placeholder="[Event name]" /> on{" "}
        <V value={f.eventDates} placeholder="[Event dates]" />
        {f.eventLocation ? (
          <> at {f.eventLocation}</>
        ) : null}
        ,{" "}
        {isMentor
          ? "providing technical and career mentorship to participating teams."
          : "evaluating team submissions against the event's judging criteria and giving feedback to participating teams."}
        {f.roleNote ? <> {f.roleNote}</> : null}
      </Typography>
      <Typography sx={bodySx}>
        <strong>Hours contributed:</strong>{" "}
        <V value={f.hoursContributed} placeholder="[hours]" /> during the event.
      </Typography>
      <GuardrailBullets name={f.recipientName} />
      <Typography sx={bodySx}>
        We are grateful for this contribution and are glad to serve as a professional
        reference consistent with our recognition guidelines ({ORG.heartsUrl}). Please reach
        out with any questions.
      </Typography>
      <SignatureBlock s={s} />
    </>
  );
}

export default function LetterPreview({ letterType, fields = {}, signer = {}, id = "letter-print-root" }) {
  const inner = () => {
    switch (letterType) {
      case LETTER_TYPES.GENERAL:
        return <GeneralLetter f={fields} s={signer} />;
      case LETTER_TYPES.OPT:
        return <OptLetter f={fields} s={signer} />;
      case LETTER_TYPES.MENTOR:
        return <ServiceLetter f={fields} s={signer} role="mentor" />;
      case LETTER_TYPES.JUDGE:
        return <ServiceLetter f={fields} s={signer} role="judge" />;
      default:
        return (
          <Typography sx={{ ...bodySx, color: "#666" }}>
            Answer the questions on the left to generate your letter preview.
          </Typography>
        );
    }
  };

  return (
    <Box
      id={id}
      sx={{
        backgroundColor: "#fff",
        color: "#000",
        p: { xs: 2, md: 5 },
        maxWidth: "8.5in",
        mx: "auto",
        boxShadow: { xs: 0, md: "0 0 8px rgba(0,0,0,0.12)" },
        "@media print": {
          boxShadow: "none",
          p: 0,
          maxWidth: "none",
          WebkitPrintColorAdjust: "exact",
          colorAdjust: "exact",
        },
      }}
    >
      <Letterhead />
      {inner()}
    </Box>
  );
}
