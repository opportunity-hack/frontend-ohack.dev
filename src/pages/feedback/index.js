import dynamic from 'next/dynamic';

const Feedback = dynamic(() => import("../../components/Feedback/Feedback"), {
    ssr: false
});

export default function FeedbackPage(){ 
    
 
    /*
    This page should show the detailed feedback for a logged-in user

    */

    return (
        <Feedback />
    );
};
