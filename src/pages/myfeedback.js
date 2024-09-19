import dynamic from "next/dynamic";

const Feedback = dynamic(() => import("../components/Feedback/Feedback"), {
  ssr: false,
});

export default function MyFeedbackPage() {
  return <Feedback />;
}
