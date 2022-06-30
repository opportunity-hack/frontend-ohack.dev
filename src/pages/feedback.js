import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import '../styles/profile.styles.css'

import { AuthenticationButton } from "../components/buttons/authentication-button";


export const Feedback = () => { 
    const { user } = useAuth0();  

    if (!user) {
        return (
            <div className="content-layout">
                <h1 className="content__title">Please login</h1>
                <div className="content__body">
                    <AuthenticationButton />
                </div>
            </div>
        );
    }
 
    /*
    This page should show the detailed feedback for a logged-in user

    */

    return (
        <div className="content-layout">
            <h1 className="content__title">Public Profile</h1>
            <div className="content__body">
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
