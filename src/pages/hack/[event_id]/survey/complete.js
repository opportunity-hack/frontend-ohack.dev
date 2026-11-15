import dynamic from "next/dynamic";
import ReCaptchaProvider from "../../../../components/ReCaptchaProvider";

// Always the end-of-hackathon form, even while the event is still running.
const EventSurvey = dynamic(
  () => import("../../../../components/Survey/EventSurvey"),
  { ssr: false },
);

export default function HackEventSurveyCompletePage() {
  return (
    <ReCaptchaProvider>
      <EventSurvey source="survey_complete" forceMode="post" />
    </ReCaptchaProvider>
  );
}
