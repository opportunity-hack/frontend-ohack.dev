import dynamic from "next/dynamic";

const JudgesStat = dynamic(() => import("./JudgesStat"), { ssr: false });
const MentorsStat = dynamic(() => import("./MentorsStat"), { ssr: false });
const HackersStat = dynamic(() => import("./HackersStat"), { ssr: false });
const NonprofitsStat = dynamic(() => import("./NonprofitsStat"), { ssr: false });
const TeamsStat = dynamic(() => import("./TeamsStat"), { ssr: false });

export default function PlanningCardKindRenderer({ card, eventId }) {
  const { kind, target_count: targetCount } = card;
  const props = { eventId, targetCount };

  switch (kind) {
    case "judges":
      return <JudgesStat {...props} />;
    case "mentors":
      return <MentorsStat {...props} />;
    case "hackers":
      return <HackersStat {...props} />;
    case "nonprofits":
      return <NonprofitsStat {...props} />;
    case "teams":
      return <TeamsStat eventId={eventId} />;
    default:
      return null;
  }
}
