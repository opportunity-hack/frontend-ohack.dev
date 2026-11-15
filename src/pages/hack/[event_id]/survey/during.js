import dynamic from "next/dynamic";
import ReCaptchaProvider from "../../../../components/ReCaptchaProvider";

// Always the during-the-event ("live check-in") form, even after the event ends.
const EventSurvey = dynamic(
  () => import("../../../../components/Survey/EventSurvey"),
  { ssr: false },
);

export default function HackEventSurveyDuringPage() {
  return (
    <ReCaptchaProvider>
      <EventSurvey source="survey_during" forceMode="live" />
    </ReCaptchaProvider>
  );
}
