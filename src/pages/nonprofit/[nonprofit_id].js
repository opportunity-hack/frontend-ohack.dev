import React from "react";
import { useState } from "react";

import useNonprofit from "../../hooks/use-nonprofit";
import useAdmin from '../../hooks/use-admin-check'
import useProblemstatements from "../../hooks/use-problem-statements";

import ProblemStatement from "../../components/problem-statement";
import AdminProblemStatementList from "../../components/admin/problemstatement-list";


import TagIcon from '@mui/icons-material/Tag';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';

import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';



import Button from '@mui/material/Button';
import SaveIcon from '@mui/icons-material/Save';

import { useRouter } from 'next/router'
import { useAuth0 } from "@auth0/auth0-react";
import { Puff } from 'react-loading-icons'

export default function NonProfitProfile(){
    const { user } = useAuth0();    
    const router = useRouter();
    const { nonprofit_id } = router.query;
    
    const { isAdmin } = useAdmin();
    const [checked, setChecked] = useState([]);
    const { problem_statements } = useProblemstatements();
    const [message, setMessage] = useState("");

    const [expanded, setExpanded] = useState(false);
    const handleChange = (panel) => (event, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    
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
        slack_details = <span className="ohack-feature__callout_mono"><Tooltip title="This is their dedicated channel in Slack">
            <IconButton><TagIcon /></IconButton>
        </Tooltip>{nonprofit.slack_channel}</span>;
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

    function getWordStr(str) {
        return str.split(/\s+/).slice(0, 50).join(" ");
    }

    if( nonprofit.description != null )
    {
        description = nonprofit.description                                                    
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
           
            <h1 className="content__title">{nonprofit.name}</h1>
            
            <div className="ohack-feature__callout">
                <Accordion sx={{ backgroundColor:"rgb(187, 220, 252)"}}  expanded={expanded === 'panel1'} onChange={handleChange('panel1')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            About
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}> {getWordStr(nonprofit.description)}...</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                    {description}
                    </AccordionDetails>                    
                </Accordion>
            </div>   
            
            
             
            <Accordion sx={{ backgroundColor: "rgb(187, 220, 252)" }}  expanded={expanded === 'panel2'} onChange={handleChange('panel2')}>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                    >
                        <Typography sx={{ width: '33%', flexShrink: 0 }}>
                            Slack channel
                        </Typography>
                    <Typography sx={{ color: 'text.secondary' }}> {slack_details}</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        Looking to get involved? Join the {slack_details} channel on Slack to join in on the discussion!
                    </AccordionDetails>
                </Accordion>

            

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





export async function getServerSideProps({ params = {} } = {} ){    
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/${params.nonprofit_id}`);
    const data = await res.json();
    const nonprofit = data.nonprofits;

    var metaDescription = "";
    

    var countOfhelpingMentors = 0;
    var countOfhelpingHackers = 0;
    var countOfProjects = 0;
    var statusList = [];
    if (nonprofit.problem_statements != null && nonprofit.problem_statements.length > 0) {
        nonprofit.problem_statements.forEach(ps => {
            metaDescription += ps.title + " | " + ps.status + ": " + ps.description + " ";
            countOfProjects++;
            statusList.push(ps.status);

            if( ps.helping )
            {
                ps.helping.forEach(help => {
                    if( help.type === "hacker" ){
                        countOfhelpingHackers++;
                    } else if ( help.type === "mentor" ){
                        countOfhelpingMentors++;
                    }
                    else {
                        // Nada
                    }
                });
            }
        });
    }

    if (nonprofit.slack_channel != null && nonprofit.slack_channel !== "") {
        metaDescription += " [Slack Channel: #" + nonprofit.slack_channel + "] ";
    }

    // Helpful Docs:
    // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
    // https://progressivewebninja.com/how-to-setup-nextjs-meta-tags-dynamically-using-next-head/#3-nextjs-dynamic-meta-tags
    // https://github.com/vercel/next.js/issues/35172#issuecomment-1169362010
    return {
        
        props: {
            title: data.nonprofits.name,
            openGraphData: [   
                {
                    name: "title",
                    content: data.nonprofits.name,
                    key: "title",
                },                            
                {
                    property: "og:title",
                    content: data.nonprofits.name,
                    key: "ogtitle",
                },
                {
                    name: "description",
                    content: metaDescription,
                    key: "desc",
                },
                {
                    property: "og:description",
                    content: metaDescription,
                    key: "ogdesc",
                },
                {
                    property: "og:type",
                    content: "website",
                    key: "website",
                },
                {
                    property: "og:image",
                    content: "https://i.imgur.com/Ff801O6.png",
                    key: "ogimage",
                },   
                {
                    property: "twitter:image",
                    content: "https://i.imgur.com/Ff801O6.png",
                    key: "twitterimage",
                },             
                {
                    property: "og:site_name",
                    content: "Opportunity Hack Developer Portal",
                    key: "ogsitename",
                },
                {
                    property: "twitter:card",
                    content: "summary_large_image",
                    key: "twittercard",
                },
                {
                    property: "twitter:domain",
                    content: "ohack.dev",
                    key: "twitterdomain",
                },
                {
                    property: "twitter:label1",
                    value: "Projects/Status",
                    key: "twitterlabel1",
                },
                {
                    property: "twitter:data1",
                    value: countOfProjects + "/" + statusList,
                    key: "twitterdata1",
                },
                {
                    property: "twitter:label2",
                    value: "🙌 Hackers/Mentors",
                    key: "twitterlabel2",
                },
                {
                    property: "twitter:data2",
                    value: countOfhelpingHackers + "/" + countOfhelpingMentors,
                    key: "twitterdata2",
                },
            ],
        },
    };
};
    