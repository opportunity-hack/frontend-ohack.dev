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



export const NonProfitProfile = () => {
    
    const { isAdmin } = useAdmin();
    const [checked, setChecked] = useState([]);
    const { problem_statements } = useProblemstatements();
    const [message, setMessage] = useState("");

    let { nonprofit_id } = useParams();    
    const { handle_npo_problem_statement_edit, nonprofit } = useNonprofit(nonprofit_id);

    const onComplete = (amessage) => {
        setMessage(amessage);
    }

    const handleSubmit = async () => {        
        handle_npo_problem_statement_edit(nonprofit_id, checked, onComplete);
    };
    
    const problemStatements = () => {
        if( nonprofit.problem_statements == null )
        {
            return <div>Loading</div>;
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
                    return <ProblemStatement
                        key={ps.title}
                        title={ps.title}
                        description={ps.description}
                        status={ps.status}
                        github={ps.github}
                        references={ps.references}
                        first_thought_of={ps.first_thought_of}
                    />;
                });                
                
            }
        }        
    };

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

    return (
        <div className="content-layout">            
            <h1 className="content__title">{nonprofit.name}</h1>
            <p className="ohack-feature__callout">{nonprofit.description}</p>            
            <p className="ohack-feature__callout_mono"><Tooltip title="This is their dedicated channel in Slack">
                <IconButton>
                    <TagIcon />
                </IconButton>
            </Tooltip>{nonprofit.slack_channel}</p>      
            <div className="content__body">
                {renderAdminProblemStatements()}

                <h3>Problem Statements</h3>
                <div className="ohack-features__grid">                
                    {problemStatements()}                                    
                </div>
            </div>
        </div>
    );
};
    