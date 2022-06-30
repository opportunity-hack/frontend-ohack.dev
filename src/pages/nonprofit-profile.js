import React from "react";


import '../styles/profile.styles.css'
import { useParams } from "react-router-dom";


export const NonProfitProfile = () => {
    let { nonprofit_id } = useParams();
    

    return (
        <div className="content-layout">
            <h1 className="content__title">Nonprofits</h1>
            <div className="content__body">
                <div className="profile-grid">
                    <div className="profile__header">
                        <div className="profile__headline">
                            <h2 className="profile__title">Specific Nonprofit Profile for: {nonprofit_id}</h2>
                        </div>
                    </div>

                    
                </div>
            </div>
        </div>
    );
};
