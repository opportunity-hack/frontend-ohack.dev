import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import '../styles/profile.styles.css'

export const FeedbackLite = ( { feedback_url } ) => {
    const { user } = useAuth0();


    /*
    This is meant to be embedded on other pages which is why it's called "Lite"
    The more correct term is likely Fragment
    */    
    

    return (                 
        <div className="profile__details">            
            <a href={feedback_url}><button>Share to Get Feedback</button></a>

            <h2 className="profile__title">What</h2>
            <h3 className="profile__title">Code Quality</h3>
            <ul>
                <li>Unit Tests</li>
                <li>Test Coverage</li>
                <li>Reliability</li>
                <li>...</li>
            </ul>
            <h2 className="profile__title">How</h2>
            <h3 className="profile__title">Communication</h3>
            <ul>
                <li># of Slacks per day</li>
                <li># of Standups per week</li>
                <li>...</li>
            </ul>
        </div>

    );
};
