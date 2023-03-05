// TODO: consistent naming convention. This should be src/components/Admin/Admin.js
import React from "react";

import AddNonProfit from "./nonprofit-add";

import AddProblemStatement from "./problemstatement-add";
import AddHackathon from "./hackathon-add";
import AdminHackathonList from "./hackathon-list";

import useAdmin from '../../hooks/use-admin-check'
import useNonprofit from "../../hooks/use-nonprofit";
import useTeams from "../../hooks/use-teams";
import useProblemstatements from "../../hooks/use-problem-statements";
import useHackathonEvents from "../../hooks/use-hackathon-events";

import Head from 'next/head';

export default function Admin ({ admin }) {    
    const { isAdmin } = useAdmin();
    const { nonprofits } = useNonprofit();
    const { teams } = useTeams();
    const { problem_statements } = useProblemstatements();
    const { hackathons } = useHackathonEvents();

    if (!isAdmin)
    {
        return(<span></span>);
    } 

    console.log("admin.js repaint");

    return(
        <div>
        <Head>
            <title>Opportunity Hack Developer Portal</title>
        </Head>
            <AdminHackathonList hackathons={hackathons} problem_statements={problem_statements} />
            <AddProblemStatement />            
            <AddHackathon nonprofits={nonprofits} teams={teams} />             
            <AddNonProfit problem_statements={problem_statements} />            
        </div>
        );
};
