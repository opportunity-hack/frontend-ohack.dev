import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import '../styles/profile.styles.css';

import { AuthenticationButton } from "./buttons/authentication-button";
import { NonProfitListTile } from "../components/nonprofit-list-tile";
import { useNonprofit } from "../hooks/use-nonprofit";

export const EditNonProfit = () => {
    const { user } = useAuth0();
    const { nonprofits } = useNonprofit();

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
        This page allows a logged-in user to provide feedback for another person
    */

    return (
        <div className="content-layout">
            <h1 className="content__title">Edit Nonprofits</h1>
            <div className="content__body">
                                   
                <div className="ohack-features">
                    <div className="ohack-features__grid">
                        {
                            nonprofits.map(npo => {
                                return <NonProfitListTile
                                    admin={true}
                                    key={npo.id}
                                    title={npo.name}
                                    description={npo.description}
                                    count_problem_statements={npo.problem_statements.length}
                                    slack_channel={npo.slack_channel}
                                    resourceUrl={`/nonprofit/${npo.id}`}
                                    icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
                                />;
                            })
                        }
                    </div>
                </div>
                
            </div>
        </div>
    );
};
