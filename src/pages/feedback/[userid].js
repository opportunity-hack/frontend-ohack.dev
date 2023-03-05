import dynamic from "next/dynamic";

const GiveFeedback = dynamic(() => import("../../components/Feedback/GiveFeedback"), {
    ssr: false
});

export default function GiveFeedbackPage() {
    /*
        This page allows a logged-in user to provide feedback for another person
    */

    return (
        <GiveFeedback />
    );
};
