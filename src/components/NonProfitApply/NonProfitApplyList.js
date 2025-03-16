// List all nonprofits that have applied
// =============================================================
import React, { useState, useEffect } from "react";
import useNonprofit from "../../hooks/use-nonprofit";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';

// Import MUI dropdown that allows to select the nonprofit
import { Select, MenuItem } from '@mui/material';
// Import MUI Button that allows to save the selected nonprofit
import { Button } from '@mui/material';
import { useAuthInfo } from '@propelauth/react';

// Import MUI TextField that allows to enter a summary of the project
import { TextField } from '@mui/material';

// Import MUI Modal dialog
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

// Import Next Link
import Link from 'next/link';



export default function NonProfitApplyList() {
    let { handle_get_nonprofit_applications, nonprofitApplications } = useNonprofit();
    const { isLoggedIn, user, accessToken } = useAuthInfo();

    useEffect(() => {
        if( isLoggedIn ) {
            handle_get_nonprofit_applications();
        }   
        
    }, [user, isLoggedIn]);

    const nonprofitApplicationStatusOptions = [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
    ];

    const mockNonprofitNameList = [
        { value: '1', label: 'Nonprofit 1' },
        { value: '2', label: 'Nonprofit 2' },
        { value: '3', label: 'Nonprofit 3' },
        { value: '4', label: 'Nonprofit 4' },
        { value: '5', label: 'Nonprofit 5' },
        { value: '6', label: 'Nonprofit 6' },
        { value: '7', label: 'Nonprofit 7' },
        { value: '8', label: 'Nonprofit 8' },
        { value: '9', label: 'Nonprofit 9' },
        { value: '10', label: 'Nonprofit 10' },
    ]

    const [selectedNonprofit, setSelectedNonprofit] = useState(null);

    const handleNonprofitChange = (event) => {
        console.log("Selected Nonprofit: ", event.target.value);
    }
    
    const handleSaveNonprofit = (index) => {
        console.log("Save Nonprofit: ", index);
    }

    // Use alert dialog when launch announcement is clicked
    const [open, setOpen] = useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };






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
        <Dialog open={open} onClose={handleClose}>
                                <DialogTitle>Launch Announcement</DialogTitle>
                                <DialogContent>
                                    <DialogContentText>
                                        Are you sure you want to send the launch announcement?
                                    </DialogContentText>

                                    <h4>Other Details</h4>
                                    <ul>
                                        <li><b>Launch Summary:</b> Fill in from text box</li>
                                        <li><b>Image:</b> TODO</li>
                                        <li><b>Link:</b> TODO - should link to the project like <Link style={{ color: "blue" }} href="http://localhost:3000/project/991a8796476b11eda895827f9c97b805">this</Link></li>
                                    </ul>

                           
                                </DialogContent>
                                <DialogActions>
                                    <Button onClick={handleClose}>Cancel</Button>
                                    <Button onClick={handleClose}>Send</Button>
                                </DialogActions>
                            </Dialog>

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
                            <div
                            key={`nonprofit_application_${index}`}
                            >
                            <h3>{nonprofitApplication.charityName} - {nonprofitApplication.charityLocation} - {new Date(nonprofitApplication.timeStamp._seconds *1000).toLocaleDateString("en-US")}</h3>
                            {
                                // Add nonprofit selection dropdown 
                            }
                            <Typography variant="h6">Select Nonprofit TODO - the idea is that you'd select a nonprofit we already have in our system, or you'd create a new one.  We should be able to match the nonprofit name submitted versus all nonprofits we currently have in our database.</Typography>
                            <Select
                                label="Select Nonprofit"
                                value={selectedNonprofit}
                                onChange={handleNonprofitChange}
                                style={{ width: '200px' }} 
                            >
                                {
                                    mockNonprofitNameList.map((nonprofit, index) => (
                                        <MenuItem key={`nonprofit_${index}`} value={nonprofit.value}>{nonprofit.label}</MenuItem>
                                    ))
                                }
                            </Select>

                            {
                                // Add status dropdown
                            }
                            <Typography variant="h6">Status - TODO - the idea here is that you'd be able to select the current state of the application</Typography>
                            <Select
                                label="Status"
                                value={nonprofitApplication.status}
                                onChange={handleNonprofitChange}
                                style={{ width: '200px' }}
                            >
                                {
                                    nonprofitApplicationStatusOptions.map((status, index) => (
                                        <MenuItem key={`status_${index}`} value={status.value}>{status.label}</MenuItem>
                                    ))
                                }
                            </Select>

                            { 
                                // Add save button
                            }
                            <Button variant="contained" onClick={handleSaveNonprofit(index)}>Save</Button>

                            {
                                // Add text field for summary of project
                            }
                            <Typography variant="h6">Summary of Project - ideally this is using an LLM/GPT to summarize the detail from the form in a way that will be easily digestable when published</Typography>
                            <TextField
                                id="summary"
                                label="Summary"
                                multiline
                                rows={4}
                                defaultValue={nonprofitApplication.summary}
                                style={{ width: '400px' }}
                            />
                            

                            {
                                // Select dropdown if launch announcement should go to Slack, email distribution list, instagram post, or all
                            }
                            <Typography variant="h6">Launch Announcement - TODO - select the method of sending the announcement</Typography>
                            <Select
                                label="Launch Announcement"
                                value={nonprofitApplication.launchAnnouncement}
                                onChange={handleNonprofitChange}
                                style={{ width: '200px' }}
                            >
                                <MenuItem value="slack">Slack</MenuItem>
                                <MenuItem value="email">Email</MenuItem>
                                <MenuItem value="instagram">Instagram</MenuItem>
                                <MenuItem value="all">All</MenuItem>                                
                            </Select>


                            {
                                // Add button for launch announcement
                            }
                            <Button variant="contained" onClick={ handleClickOpen } >Send Announcement</Button>
                            
                            
                         
                            

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


