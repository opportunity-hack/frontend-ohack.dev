// List all nonprofits that have applied
// =============================================================
import React, { useState, useEffect } from "react";
import useNonprofit from "../../hooks/use-nonprofit";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';



export default function NonProfitApplyList() {
    let { handle_get_nonprofit_applications, nonprofitApplications } = useNonprofit();

    useEffect(() => {        
        handle_get_nonprofit_applications();
    }, []);

    // Use an array of keys to map the object properties to table cells
    const keys = [
            'charityName', 'charityLocation', 'areasOfFocus', 'familiarWithSlack', 'joiningInPerson',
            'keyStaffAvailability', 'servedPopulations', 'solutionBenefits', 'technicalProblem', 'understandProjectUncertainty',
            'timeStamp'];

            const columns = [
                { field: 'id', headerName: 'ID', width: 70 },
                { field: 'charityName', headerName: 'Name', width: 100 },
                { field: 'charityLocation', headerName: 'Location', width: 130 },

                // Add color: tomato;
                    // white-space: normal !important;
                    // word-wrap: break-word !important;
                { field: 'technicalProblem', headerName: 'Technical Problem', width: 600, 
                    renderCell: (params) => (
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {params.value}
                        </div>
                    )
                },


                { field: 'solutionBenefits', headerName: 'Benefits', width: 830,
                    renderCell: (params) => (
                        <div style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                        {params.value}
                        </div>
                    )                            
            },

                { field: 'areasOfFocus', headerName: 'Focus Areas', width: 130 },
                { field: 'familiarWithSlack', headerName: 'Slack?', width: 130 },
                { field: 'joiningInPerson', headerName: 'In Person?', width: 130 },
                { field: 'keyStaffAvailability', headerName: 'Key staff avail?', width: 130 },
                { field: 'servedPopulations', headerName: 'Served Pop?', width: 130 },
                
                { field: 'understandProjectUncertainty', headerName: 'Uncertainty?', width: 130 },
                { field: 'timeStamp', headerName: 'Timestamp', width: 130,
                    renderCell: (params) => (
                        
                        new Date(params.value._seconds *1000).toLocaleDateString("en-US")
                        
                    )
                 },                            
            ];


    return( 
        <div className="container">
            <div className="row">
                <div className="col-12">
                    <h1>Nonprofit Applications</h1>
                    <p>Below is a list of all nonprofits that have applied to Opportunity Hack 2023.</p>                
                </div>              

                <div className="col-10" style={{fontSize: '15px', width: '90%'}}>
                    <p>There are {nonprofitApplications.length} nonprofits that have applied.</p>
                    <p>Here are them in a bulleted list view</p>
                    <ul>
                        {
                            nonprofitApplications.map((nonprofitApplication, index) => (
                            <div>
                            <h3>{nonprofitApplication.charityName} - {nonprofitApplication.charityLocation} - {new Date(nonprofitApplication.timeStamp._seconds *1000).toLocaleDateString("en-US")}</h3>                                                                                                                           
                            <ul key={`other_details_${index}`}>
                                <li><b>Technical Problem:</b> {nonprofitApplication.technicalProblem}</li>
                                <li><b>Solution Benefits:</b> {nonprofitApplication.solutionBenefits}</li>
                                <li><b>Joining in person?</b> {nonprofitApplication.joiningInPerson ? "Yes" : "No"}</li>

                                <li><b>Understand project uncertainty?</b> {nonprofitApplication.understandProjectUncertainty ? "Yes" : "No"}</li>      
                                <li><b>Served Populations:</b> {nonprofitApplication.servedPopulations.map((servedPopulation, index) => (
                                    <ul key={`served_population_${index}`}>
                                        <li>{servedPopulation}</li>
                                    </ul>
                                ))}</li>

                                <li><b>Areas of Focus:</b> {nonprofitApplication.areasOfFocus.map((areaOfFocus, index) => (
                                    <ul key={`area_of_focus_${index}`}>
                                        <li>{areaOfFocus}</li>                                    
                                    </ul>
                                    
                                ))}</li>

                                <li><b>Familiar with Slack?</b> {nonprofitApplication.familiarWithSlack ? "Yes" : "No"}</li>                                
                                <li><b>Key staff availability:</b> {nonprofitApplication.keyStaffAvailability.map((keyStaffAvailability, index) => (
                                    <ul key={`key_staff_availability_${index}`}>
                                        <li>{keyStaffAvailability}</li>
                                    </ul>
                                ))}</li>
                                                                                                                        
                            </ul>                                                                                                                
                            </div>
                        ))
                    }
                    </ul>

                    </div>
                    

            </div>
        </div>                    
    )
}


