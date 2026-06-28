import dynamic from "next/dynamic";
import ReCaptchaProvider from "../../../components/ReCaptchaProvider";

// Client-only: reads PropelAuth state + reCAPTCHA, renders personalized content.
const EventSurvey = dynamic(
  () => import("../../../components/Survey/EventSurvey"),
  { ssr: false },
);

export default function HackEventSurveyPage() {
  return (
    <ReCaptchaProvider>
      <EventSurvey source="survey" />
    </ReCaptchaProvider>
  );
}
