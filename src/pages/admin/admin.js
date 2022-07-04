import React from "react";


import { EditNonProfit } from "../../components/nonprofit-edit";
import { AddNonProfit } from "../../components/nonprofit-add";
import { AddProblemStatement } from "../../components/problemstatement-add";


import { useAdmin } from '../../hooks/use-admin-check'
import { useProblemstatements } from "../../hooks/use-problem-statements";


export const Admin = ({ admin }) => {    
    const { isAdmin } = useAdmin();
    const { problem_statements } = useProblemstatements();

    if (!isAdmin)
    {
        return(<span></span>);
    } 

    return(
        <div>
            <AddNonProfit problem_statements={problem_statements}/>
            <EditNonProfit/>
            <AddProblemStatement/>

        </div>
        );
};
