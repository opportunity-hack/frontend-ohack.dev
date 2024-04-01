import React from "react";
import { useAuthInfo } from "@propelauth/react";

import LoginOrRegister from "../LoginOrRegister/LoginOrRegister";

import Head from 'next/head';
export default function Feedback(){ 
    const { user } = useAuthInfo();  

    if (!user) {
        return (
            <div className="content-layout">                            
                    <LoginOrRegister />            
            </div>
        );
    }
 
    /*
    This page should show the detailed feedback for a logged-in user

    */

    return (
        <div className="content-layout">
        <Head>
            <title>Feedback - Opportunity Hack Developer Portal</title>
        </Head>
            <h1 className="content__title">Your Feedback</h1>
            
            <div className="content__body">
                <p>
                    If you are a new graduate, or currently in school:
                    <ul>
                        <li>Think of this as a an addendum to your resume.</li>
                        <li>Something that you can use, alongside your experience with Opportunity Hack to already be able to speak to industry experience you have.</li>
                    </ul>
                    If you are currently working in a tech role in industry (as a software engineer, technical product manager, program manager, UX designer, etc.)
                    <ul>
                        <li>Think of this as a an addendum to your work experience that you aren't able to get from the opportunities currently available to you.  You likely are using Opportunity Hack to fill in experience gaps at your work.</li>
                        <li>You can use what you learned or led here to justify your next assignment, and/or add this mentorship to your performance review</li>
                    </ul>
                    If you currently aren't working in a tech role, but are looking to gain experience to move roles at work
                    <ul>
                        <li>Think of this as a an addendum to your work experience that you aren't able to get from the opportunities currently available to you.  You likely are using Opportunity Hack to fill in experience gaps at your work.</li>
                        <li>You can use what you learned or led here to justify your move to a tech role (e.g. Business Analyst to Software Engineer), and/or add this mentorship to your performance review</li>
                    </ul>
                </p>
                <div className="profile-grid">
                    <div className="profile__header">
                        <img src={user.picture} alt="Profile" className="profile__avatar" />

                        <div className="profile__headline">
                            <h2 className="profile__title"><span className="material-symbols-outlined">verified_user</span>
                                {user.name} - here's your feedback breakdown</h2>                                                                                    
                        </div>
                    </div>

                    <div className="profile__details">
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
                </div>
            </div>
        </div>
    );
};
