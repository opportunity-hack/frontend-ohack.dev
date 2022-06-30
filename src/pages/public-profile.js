import React from "react";

import '../styles/profile.styles.css'
import { useParams } from "react-router-dom";

export const PublicProfile = () => {
    let { userid } = useParams();
    console.log("----------PUBLIC PROFILE-----------")
    console.log(userid);    
    console.log("----------PUBLIC PROFILE-----------")
    // const { getPublicUserInfo } = useProfileApi();


    return (
        <div className="content-layout">
            <h1 className="content__title">Public Profile</h1>
            <div className="content__body">
                <div className="profile-grid">
                    <div className="profile__header">                        
                        <div className="profile__headline">
                            <h2 className="profile__title"><span className="material-symbols-outlined">verified_user</span>
                                Public User {userid}</h2>
                            <span className="profile__description">Hi</span>
                            <span className="profile__description">something@something.com</span>
                            <span className="profile__last_updated">Last Login: 12-12-2022 10:10:10</span>
                        </div>
                    </div>

                    <div className="profile__details">
                        <h2 className="profile__title">Badges</h2>                                        
                    </div>
                </div>
            </div>
        </div>
    );
};
