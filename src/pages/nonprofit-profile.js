import React from "react";
import '../styles/profile.styles.css'
import { useParams } from "react-router-dom";
import { useNonprofit } from "../hooks/use-nonprofit";
import { ProblemStatement } from "../components/problem-statement";
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { AdminProblemStatementList } from "../components/admin/problemstatement-list";

import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';

import { useAdmin } from '../hooks/use-admin-check'
import { useState } from "react";
import { useProblemstatements } from "../hooks/use-problem-statements";
import { useAuth0 } from "@auth0/auth0-react";
import { Puff } from 'react-loading-icons'
import ReactTextCollapse from "react-text-collapse/dist/ReactTextCollapse";

import Helmet from 'react-helmet';

export const NonProfitProfile = () => {
    const { user } = useAuth0();    
    
    const { isAdmin } = useAdmin();
    const [checked, setChecked] = useState([]);
    const { problem_statements } = useProblemstatements();
    const [message, setMessage] = useState("");

    let { nonprofit_id } = useParams();    
    const { handle_npo_problem_statement_edit, nonprofit } = useNonprofit(nonprofit_id);


    const TEXT_COLLAPSE_OPTIONS = {
        collapse: false,
        collapseText: 'show more',
        expandText: 'show less',
        minHeight: 80,
        maxHeight: 200,
        textStyle: {
            color: 'blue',
            fontSize: '20px',
        },
    }

    var slack_details = "";

    if ( nonprofit.slack_channel !== "" )
    {
        slack_details = <p className="ohack-feature__callout_mono"><Tooltip title="This is their dedicated channel in Slack">
            <IconButton>
                <TagIcon />
            </IconButton>
        </Tooltip>{nonprofit.slack_channel}</p>;
    }
    else {
        slack_details = "";
    }

    const onComplete = (amessage) => {
        setMessage(amessage);
    }

    const handleSubmit = async () => {        
        handle_npo_problem_statement_edit(nonprofit_id, checked, onComplete);
    };
    var metaDescription = "";
    const problemStatements = () => {
        if( nonprofit.problem_statements == null )
        {
            return <div><p>Loading... <Puff stroke="#0000FF" /> <Puff stroke="#0000FF" /></p></div>;
        }
        else
        {
            if (nonprofit.problem_statements.length === 0)
            {
                return <div>Working on it!</div>;
            }
            else 
            {                
                return nonprofit.problem_statements.map(ps => {
                    metaDescription += ps.title +  " | " + ps.status + ": " + ps.description;
                                        
                    return <ProblemStatement
                        key={ps.id}
                        problem_statement={ps}
                        user={user}
                        npo_id={nonprofit_id}
                    />;
                });                
                
            }
        }        
    };

    var description = "";

    if( nonprofit.description != null )
    {
        description = <ReactTextCollapse options={TEXT_COLLAPSE_OPTIONS}>{nonprofit.description}</ReactTextCollapse>        
    }

    const renderAdminProblemStatements = () => {
        if (isAdmin && nonprofit.problem_statements != null)
        {            
            const default_selected = nonprofit.problem_statements.map(ps => {
                return ps.id
            });
            return <div><AdminProblemStatementList
                    problem_statements={problem_statements} // All problem statements to choose from
                    selected={checked}
                    onSelected={setChecked}
                    default_selected={default_selected}
                /><Button onClick={handleSubmit} variant="contained" endIcon={<SaveIcon />}>
                    Save
                </Button>
                { message }
                </div>
                ;
        }
        else {
            return "";
        }
        
    };

    // More on meta tags
    // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254

    return (
        <div className="content-layout">            
            <Helmet>
                <meta charSet="utf-8" />
                <title>{nonprofit.name}</title>
                <meta property="og:site_name" content="Opportunity Hack Portal" />
                <meta property="og:title" content={nonprofit.name} />
                <meta property="og:description" content={metaDescription} />
            </Helmet>  

            <h1 className="content__title">{nonprofit.name}</h1>
            <div className="ohack-feature__callout">
                {description}
            </div>   
            
            <div className="content__body">
            {slack_details}   
            </div>

            <div className="content__body">
                {renderAdminProblemStatements()}

                <h3>Projects</h3>
                <div className="ohack-features__grid">                
                    {problemStatements()}                                    
                </div>
            </div>
        </div>
    );
};
    