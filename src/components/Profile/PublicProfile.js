import React from "react";

import { useRouter } from 'next/router'
import Head from 'next/head';
import HelpUsBuildOHack from "../HelpUsBuildOHack/HelpUsBuildOHack";

export default function PublicProfile(){
    const router = useRouter()
    const { userid } = router.query
        
    // const { getPublicUserInfo } = useProfileApi();


    return (
        
        <div className="content-layout">
        <Head>
        <title>Profile for {userid} - Opportunity Hack Developer Portal</title>
        </Head>
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
                        <HelpUsBuildOHack github_link="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8" github_name="Issue #8" />
                    </div>

                    <div className="profile__details">
                        <h2 className="profile__title">Badges</h2>                                        
                    </div>
                </div>
            </div>
        </div>
    );
};