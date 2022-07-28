import React from "react";

import { AddNonProfit } from "../../components/admin/nonprofit-add";
import { AddProblemStatement } from "../../components/admin/problemstatement-add";
import { AddHackathon } from "../../components/admin/hackathon-add";

import { useAdmin } from '../../hooks/use-admin-check'
import { useNonprofit } from "../../hooks/use-nonprofit";
import { useTeams } from "../../hooks/use-teams";
import { useProblemstatements } from "../../hooks/use-problem-statements";


export const Admin = ({ admin }) => {    
    const { isAdmin } = useAdmin();
    const { nonprofits } = useNonprofit();
    const { teams } = useTeams();
    const { problem_statements } = useProblemstatements();

    if (!isAdmin)
    {
        return(<span></span>);
    } 

    return(
        <div>
            <AddProblemStatement />            
            <AddHackathon nonprofits={nonprofits} teams={teams} />             
            <AddNonProfit problem_statements={problem_statements} />            
        </div>
        );
};
