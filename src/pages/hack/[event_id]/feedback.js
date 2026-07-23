import dynamic from "next/dynamic";
import ReCaptchaProvider from "../../../components/ReCaptchaProvider";

// Alias of /hack/[event_id]/survey — same form, different URL (both are advertised).
const EventSurvey = dynamic(
  () => import("../../../components/Survey/EventSurvey"),
  { ssr: false },
);

export default function HackEventFeedbackPage() {
  return (
    <ReCaptchaProvider>
      <EventSurvey source="feedback" />
    </ReCaptchaProvider>
  );
}
