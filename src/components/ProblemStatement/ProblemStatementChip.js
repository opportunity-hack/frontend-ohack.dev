import React from "react";
import Chip from "@mui/material/Chip";
import useProblemstatements from "../../hooks/use-problem-statements";
import LabelImportantIcon from '@mui/icons-material/LabelImportant';
import { Puff } from "react-loading-icons";

export default function ProblemStatementChip({ problem_statement_id }) {
    console.log("problem_statement_id", problem_statement_id);    
    const { problem_statement } = useProblemstatements(problem_statement_id);
    console.log("problem_statement", problem_statement);    
    
    // Handle if problem_statement is null
    if (!problem_statement) {
        return <Puff stroke="#0000FF" strokeOpacity={0.5} />;
    }


    return (
        <Chip
        style={{margin: '0px', padding: '0px', height: 'auto', width: 'auto'}}
        label={problem_statement.title}
        variant="outlined"
        icon={<LabelImportantIcon />}
        />
    );


}
