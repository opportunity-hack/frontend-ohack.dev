import React from "react";
import '../styles/profile.styles.css'
import { useParams } from "react-router-dom";
import { useNonprofit } from "../hooks/use-nonprofit";
import { ProblemStatement } from "../components/problem-statement";
import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

export const NonProfitProfile = () => {
    let { nonprofit_id } = useParams();
    
    const { nonprofit } = useNonprofit(nonprofit_id);

    
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
            else {                
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
                <h3>Problem Statements</h3>
                <div className="ohack-features__grid">                
                    {problemStatements()}                                    
                </div>
            </div>
        </div>
    );
};
    