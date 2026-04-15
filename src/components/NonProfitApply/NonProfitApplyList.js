import React, { useState, useEffect, Fragment } from 'react';
import { useAuthInfo, withRequiredAuthInfo } from '@propelauth/react';
import ReactMarkdown from 'react-markdown';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Alert,
    Button,
    Collapse,
    Card,
    CardContent,
    CardActions,
    Grid,
    List,
    ListItem,
    ListItemText,
    Container,
    Divider,
    TextField,
    FormControl,
    RadioGroup,
    FormControlLabel,
    Radio,
    Autocomplete
} from '@mui/material';


function NonProfitApplyList({ userClass }) {
    const { accessToken } = useAuthInfo();
    const [applications, setApplications] = useState([]);
    const [problemStatements, setProblemStatements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedAppId, setExpandedAppId] = useState(null);
    
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isRefreshingSummary, setIsRefreshingSummary] = useState(false);
    const [similarProjects, setSimilarProjects] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [reasoning, setReasoning] = useState({});
    
    const [approvalStep, setApprovalStep] = useState('initial'); 
    const [isUpdating, setIsUpdating] = useState(null);

    const [nonprofits, setNonprofits] = useState([]);
    const [matchingNonprofits, setMatchingNonprofits] = useState([]);
    const [npoSelection, setNpoSelection] = useState('create');
    const [selectedNpo, setSelectedNpo] = useState(null);


    // State for the new "Refresh All Embeddings" feature
    const [isRefreshingAll, setIsRefreshingAll] = useState(false);
    const [refreshAllStatus, setRefreshAllStatus] = useState(null);

    // --- NEW STATE FOR DEBUG PANEL ---
    const [isDebugPanelOpen, setIsDebugPanelOpen] = useState(false);

    // --- NEW STATE FOR SINGLE EMBEDDING REFRESH ---
    const [isRefreshingEmbedding, setIsRefreshingEmbedding] = useState(false);
  
    const org = userClass.getOrgByName("Opportunity Hack Org");
    const orgId = org ? org.orgId : null;
    const isAdmin = org.hasPermission("volunteer.admin");

    const handleRefreshAllEmbeddings = async () => {
        setIsRefreshingAll(true);
        setRefreshAllStatus(null); // Clear previous status message

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/llm/embedding-map/populate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                     'X-Org-Id': orgId
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to start embedding refresh process.');
            }

            setRefreshAllStatus({ type: 'success', message: data.message || 'Successfully started refresh process.' });

        } catch (e) {
            console.error("Error refreshing all embeddings:", e);
            setRefreshAllStatus({ type: 'error', message: e.message });
        } finally {
            setIsRefreshingAll(false);
        }
    };

    const handleRefreshEmbedding = async (application) => {
        setIsRefreshingEmbedding(true);
        setIsSearching(true); 
        setSimilarProjects([]);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/llm/embedding/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Org-Id': orgId
                },
                // Send the entire application object
                body: JSON.stringify(application)
            });

            if (!response.ok) {
                if (response.status === 401 || response.status === 403) {
                    throw new Error("Access denied for user");
                }
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to refresh embedding.');
            }
            
            // The response now contains the new list of similar projects
            const result = await response.json();
            const projectsWithUIState = result.similar_projects.map(p => ({ ...p, isReasoning: false }));
            setSimilarProjects(projectsWithUIState.slice(0, 3));

        } catch (error) {
            console.error("Error refreshing embedding:", error);
            setSimilarProjects([{ id: 'error', title: error.message || 'Error refreshing projects.' }]);
        } finally {
            setIsRefreshingEmbedding(false);
            setIsSearching(false); // Reset loading state
        }
    };

    const fetchSummary = async (application) => {
        // --- DEBUG: Log the application object being sent to the backend ---
        console.log('--- fetchSummary: Sending to backend ---', { application });

        setIsSummarizing(true);
        setSummary('');

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/llm/summary`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Org-Id': orgId
                },
                body: JSON.stringify(application)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to fetch summary from backend');
            }

            const data = await response.json();
            setSummary(data.summary);

        } catch (e) {
            console.error("Error fetching summary:", e);
            setSummary(`Error: ${e.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    const handleRefreshSummary = async (application) => {
        setIsRefreshingSummary(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/llm/summary/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Org-Id': orgId
                },
                body: JSON.stringify(application)
            });

            if (!response.ok) {
                throw new Error('Failed to refresh summary.');
            }

            const data = await response.json();
            setSummary(data.summary);
        } catch (error) {
            console.error("Error refreshing summary:", error);
            setSummary("Error: Could not refresh the summary.");
        } finally {
            setIsRefreshingSummary(false);
        }
    };

    const fetchReasoningForSimilarity = async (application, projectToUpdate) => {
        setSimilarProjects(prev => prev.map(p => 
            p.id === projectToUpdate.id ? { ...p, isReasoning: true } : p
        ));

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/llm/similarity-reasoning`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Org-Id': orgId
                },
                body: JSON.stringify({
                    application: application,
                    project: projectToUpdate
                })
            });
            if (!response.ok) throw new Error('Failed to fetch reasoning');

            const data = await response.json();
            const reason = data.reasoning;

            setSimilarProjects(prev => prev.map(p => 
                p.id === projectToUpdate.id ? { ...p, reasoning: reason, isReasoning: false } : p
            ));

        } catch (e) {
            console.error("Error fetching reasoning:", e);
            setSimilarProjects(prev => prev.map(p => 
                p.id === projectToUpdate.id ? { ...p, reasoning: "Error fetching reason.", isReasoning: false } : p
            ));
        }
    };

    const findSimilarProjects = async (application) => {
        // --- DEBUG: Log the application object being sent to the backend ---
        console.log('--- findSimilarProjects: Sending to backend ---', { application });

        setIsSearching(true);
        setSimilarProjects([]);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/llm/similar-projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Org-Id': orgId
                },
                body: JSON.stringify(application)
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to find similar projects');
            }
            
            const data = await response.json();
            const projectsWithUIState = data.similar_projects.map(p => ({ ...p, isReasoning: false }));
            setSimilarProjects(projectsWithUIState.slice(0, 3));
            
        } catch (e) {
            console.error("Error finding similar projects:", e);
            setSimilarProjects([{ id: 'error', title: e.message || 'Error searching for projects.' }]);
        } finally {
            setIsSearching(false);
        }
    };

    // --- THIS IS THE FIX ---
    // The logic is updated to be more flexible. It no longer disables the "link" option.
    // Instead, it tries to find a good default but allows the admin to choose any NPO.
    const handleApprovalStepChange = (step, app) => {
        setApprovalStep(step);
        if (step === 'manage_npo') {
            const appOrgName = (app.organization || app.charityName || '').toLowerCase();
            
            // Always make all nonprofits available for linking.
            setMatchingNonprofits(nonprofits); 

            if (appOrgName) {
                // Try to find a good default selection.
                const bestMatch = nonprofits.find(npo => {
                    const npoName = npo.name.toLowerCase();
                    return npoName.includes(appOrgName) || appOrgName.includes(npoName);
                });
                                
                if (bestMatch) {
                    // If a likely match is found, pre-select it and default to the 'link' option.
                    setNpoSelection('link');
                    setSelectedNpo(bestMatch);
                } else {
                    // If no good match is found, default to the 'create' option.
                    setNpoSelection('create');
                    setSelectedNpo(null);
                }
            } else {
                // If the app has no organization name, default to 'create'.
                setNpoSelection('create');
                setSelectedNpo(null);
            }
        }
    };

    const handleReviewClick = (app) => {
        // --- DEBUG: Log the application object when "Review" is clicked ---
        console.log('--- handleReviewClick ---', { app });

        const appId = app.id;
        if (expandedAppId === appId) {
            setExpandedAppId(null);
        } else {
            setExpandedAppId(appId);
            setApprovalStep('initial'); 
            fetchSummary(app);
            findSimilarProjects(app);
        }
    };

    const handleUpdateStatus = async (appId, status) => {
        setIsUpdating(appId);                 
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/applications/${appId}/status`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`,
                    'X-Org-Id': orgId
                },
                body: JSON.stringify({ status: status }) // e.g., 'approved' or 'rejected'
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Failed to ${status} application`);
            }

            setApplications(prevApplications => prevApplications.filter(app => app.id !== appId));
            setExpandedAppId(null); // Close the expanded view

        } catch (e) {
            console.error("Error updating application status:", e);
            setError(e.message);
        } finally {
            setIsUpdating(null); // Reset loading state
        }
    };

    useEffect(() => {
        if (!userClass || !accessToken) { setIsLoading(false); return; }        
        
        const fetchAllData = async () => {
            try {
                // Fetch nonprofits along with other data
                const [appsResponse, psResponse, npoResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/applications`, { headers: { 'Authorization': `Bearer ${accessToken}`, 'X-Org-Id': orgId } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`),
                    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npos`) // Assumes an endpoint to get all nonprofits
                ]);

                if (!appsResponse.ok) throw new Error(`Failed to fetch applications: ${appsResponse.status}`);
                if (!psResponse.ok) throw new Error(`Failed to fetch problem statements: ${psResponse.status}`);
                if (!npoResponse.ok) throw new Error(`Failed to fetch nonprofits: ${npoResponse.status}`);

                const appsData = await appsResponse.json();
                const psData = await psResponse.json();
                const npoData = await npoResponse.json();
                
                setApplications(appsData.applications.sort((a, b) => new Date(b.timestamp || b.timeStamp) - new Date(a.timestamp || a.timeStamp)));
                setProblemStatements(psData.problem_statements);
                setNonprofits(npoData.nonprofits || []); // Store all nonprofits

            } catch (e) {
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, [accessToken, userClass]);

    if (isLoading) { return <Container sx={{ mt: 12, textAlign: 'center' }}><CircularProgress /></Container>; }
    if (error) { return <Container sx={{ mt: 12 }}><Alert severity="error" onClose={() => setError(null)}>{error}</Alert></Container>; }

    return (
        <Container maxWidth="xl" sx={{ mt: 12, mb: 4 }}>
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Box>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Nonprofit Application List Workbench
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            Review pending applications to create new projects.
                        </Typography>
                    </Box>
                    {/* --- NEW DEBUG TOGGLE BUTTON --- */}
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() => setIsDebugPanelOpen(!isDebugPanelOpen)}
                    >
                        {isDebugPanelOpen ? 'Hide Debug Tools' : 'Show Debug Tools'}
                    </Button>
                </Box>
                
                {/* --- NEW COLLAPSIBLE DEBUG PANEL --- */}
                <Collapse in={isDebugPanelOpen}>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ p: 2, border: '1px dashed', borderColor: 'grey.400', borderRadius: 1 }}>
                        <Typography variant="h6" color="text.secondary" gutterBottom>
                            Admin Debug Panel
                        </Typography>
                        <Button
                            variant="outlined"
                            color="error"
                            onClick={handleRefreshAllEmbeddings}
                            disabled={isRefreshingAll}
                            startIcon={isRefreshingAll ? <CircularProgress size={20} /> : null}
                        >
                            {isRefreshingAll ? 'Refreshing...' : 'Force Refresh All Embeddings'}
                        </Button>
                        {refreshAllStatus && (
                            <Alert severity={refreshAllStatus.type} sx={{ mt: 2 }} onClose={() => setRefreshAllStatus(null)}>
                                {refreshAllStatus.message}
                            </Alert>
                        )}
                    </Box>
                </Collapse>
            </Paper>

            {applications.length === 0 && !isLoading ? (
                <Alert severity="success">There are no pending applications to review.</Alert>
            ) : (
                <TableContainer component={Paper} elevation={2}>
                    <Table sx={{ minWidth: 650 }}>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'grey.100' }}>
                                <TableCell sx={{ fontWeight: 'bold' }}>Organization / Charity</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Submitted On</TableCell>
                                <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {applications.map((app) => (
                                <Fragment key={app.id}>
                                    <TableRow sx={{ '&:hover': { backgroundColor: 'grey.50' } }}>
                                        <TableCell>{app.organization || app.charityName || 'N/A'}</TableCell>
                                        <TableCell>{app.name || app.contactName || 'N/A'}</TableCell>
                                        <TableCell>{new Date(app.timestamp || app.timeStamp).toLocaleDateString()}</TableCell>
                                        <TableCell><Typography variant="body2" sx={{ color: 'warning.main', fontWeight: 'medium' }}>Pending Review</Typography></TableCell>
                                        <TableCell align="right">
                                            <Button variant="contained" size="small" onClick={() => handleReviewClick(app)}>
                                                {expandedAppId === app.id ? 'Close' : 'Review'}
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell style={{ padding: 0 }} colSpan={5}>
                                            <Collapse in={expandedAppId === app.id} timeout="auto" unmountOnExit>
                                                <Box sx={{ p: 2, backgroundColor: 'grey.50', borderTop: '1px solid', borderColor: 'divider' }}>
                                                    <Grid container spacing={2} divider={<Divider orientation="vertical" flexItem />}>
                                                        <Grid size={{ xs: 12, md: 5 }} sx={{ p: 2 }}>
                                                            <Typography variant="h6" gutterBottom>Application Details</Typography>
                                                            <Typography variant="body2" mt={1}><strong>Contact Email:</strong> {app.email || 'Not Provided'}</Typography>
                                                            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Problem Statement</Typography>
                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', p:1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>{app.technicalProblem || app.idea || 'Not Provided'}</Typography>
                                                            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Proposed Solution / Benefits</Typography>
                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', p:1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>{app.solutionBenefits || 'Not Provided'}</Typography>
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 4 }} sx={{ p: 2 }}>
                                                            <Typography variant="h6" gutterBottom>AI-Generated Summary</Typography>
                                                            
                                                            {isSummarizing ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}>
                                                                    <CircularProgress size={24} />
                                                                    <Typography>Generating summary...</Typography>
                                                                </Box>
                                                            ) : (
                                                                <>
                                                                    <Paper 
                                                                        variant="outlined" 
                                                                        sx={{ 
                                                                            p: 2, 
                                                                            backgroundColor: 'white',
                                                                            overflowWrap: 'break-word',
                                                                            wordWrap: 'break-word',
                                                                            minHeight: '120px',
                                                                            mb: 1
                                                                        }}
                                                                    >
                                                                        <ReactMarkdown>{summary}</ReactMarkdown>
                                                                    </Paper>
                                                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            color="primary"
                                                                            onClick={() => handleRefreshSummary(app)}
                                                                            disabled={isSummarizing || isRefreshingSummary}
                                                                            startIcon={isRefreshingSummary ? <CircularProgress size={16} /> : null}
                                                                            sx={{ 
                                                                                textTransform: 'none',
                                                                                fontSize: '0.875rem'
                                                                            }}
                                                                        >
                                                                            {isRefreshingSummary ? 'Refreshing...' : 'Refresh Summary'}
                                                                        </Button>
                                                                    </Box>
                                                                </>
                                                            )}
                                                        </Grid>
                                                        <Grid size={{ xs: 12, md: 3 }} sx={{ p: 2 }}>
                                                            <Typography variant="h6" gutterBottom>Similar Projects</Typography>
                                                            {isSearching ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={24} /><Typography>Searching...</Typography></Box>
                                                            ) : (
                                                                <>
                                                                    <List dense>
                                                                        {similarProjects.map(p => (
                                                                            p.id === 'error' ? (
                                                                                <Alert severity="error" key={p.id}>{p.title}</Alert>
                                                                            ) : (
                                                                                <ListItem key={p.id} sx={{ alignItems: 'flex-start', flexDirection: 'column', mb: 1, p:1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>
                                                                                    <ListItemText primary={p.title} secondary={p.similarity ? `Similarity: ${(p.similarity * 100).toFixed(1)}%` : ''} />
                                                                                    {p.reasoning ? (
                                                                                        <Typography variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary' }}>{p.reasoning}</Typography>
                                                                                    ) : p.isReasoning ? (
                                                                                        <CircularProgress size={16} />
                                                                                    ) : (
                                                                                        <Button size="small" sx={{ p: 0, mt: 0.5 }} onClick={() => fetchReasoningForSimilarity(app, p)}>Get Reason</Button>
                                                                                    )}
                                                                                </ListItem>
                                                                            )
                                                                        ))}

                                                                        {/* --- NEW REFRESH EMBEDDING BUTTON --- */}
                                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                                                            <Button
                                                                                size="small"
                                                                                variant="outlined"
                                                                                color="primary"
                                                                                onClick={() => handleRefreshEmbedding(app)}
                                                                                disabled={isSearching || isRefreshingEmbedding}
                                                                                startIcon={isRefreshingEmbedding ? <CircularProgress size={16} /> : null}
                                                                                sx={{ 
                                                                                    textTransform: 'none',
                                                                                    fontSize: '0.875rem'
                                                                                }}
                                                                            >
                                                                                {isRefreshingEmbedding ? 'Refreshing...' : 'Refresh Embedding & Similar Projects'}
                                                                            </Button>
                                                                        </Box>
                                                                    </List>
                                                                </>
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                    <Divider sx={{ my: 2 }} />

                                                    {/* --- PHASE 3: Admin Action Form --- */}
                                                    <Box sx={{ p: 2 }}>
                                                        <Typography variant="h6" gutterBottom>Admin Action</Typography>
                                                        

                                                        {/* Step 1: Initial Decision */}
                                                        {approvalStep === 'initial' && (
                                                            <CardActions sx={{ justifyContent: 'flex-start', p: 0 }}>
                                                                <Button size="medium" variant="contained" color="primary" onClick={() => handleApprovalStepChange('manage_npo', app)}>
                                                                    Approve Application
                                                                </Button>
                                                                <Button size="medium" color="error" variant="outlined" onClick={() => setApprovalStep('confirm_reject')}>
                                                                    Reject
                                                                </Button>
                                                            </CardActions>
                                                        )}

                                                        {/* Step 1.1: Confirm Rejection */}
                                                        {approvalStep === 'confirm_reject' && (
                                                            <Paper variant="outlined" sx={{ p: 2, borderColor: 'error.main' }}>
                                                                <Typography>Are you sure you want to reject this application? This action cannot be undone.</Typography>
                                                                <CardActions sx={{ justifyContent: 'flex-start', p: 0, pt: 2 }}>
                                                                    <Button size="medium" color="error" variant="contained" onClick={() => handleUpdateStatus(app.id, 'rejected')} disabled={isUpdating === app.id}>
                                                                        {isUpdating === app.id ? <CircularProgress size={24} /> : 'Confirm Reject'}
                                                                    </Button>
                                                                    <Button size="medium" variant="outlined" onClick={() => setApprovalStep('initial')}>
                                                                        Cancel
                                                                    </Button>
                                                                </CardActions>
                                                            </Paper>
                                                        )}

                                                        {/* --- Step 1: Manage Nonprofit Profile --- */}
                                                        {approvalStep === 'manage_npo' && (
                                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                                <Typography variant="h6" gutterBottom>Step 1: Manage Nonprofit Profile</Typography>
                                                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                                                    Link this application to an existing nonprofit or create a new one.
                                                                </Typography>

                                                                <FormControl component="fieldset">
                                                                    <RadioGroup row value={npoSelection} onChange={(e) => { setNpoSelection(e.target.value); setSelectedNpo(null); }}>
                                                                        <FormControlLabel value="link" control={<Radio />} label="Link to existing nonprofit" disabled={matchingNonprofits.length === 0} />
                                                                        <FormControlLabel value="create" control={<Radio />} label="Create new nonprofit" />
                                                                    </RadioGroup>
                                                                </FormControl>

                                                                {npoSelection === 'link' && (
                                                                    <Autocomplete
                                                                        options={matchingNonprofits}
                                                                        getOptionLabel={(option) => option.name}
                                                                        value={selectedNpo}
                                                                        onChange={(event, newValue) => setSelectedNpo(newValue)}
                                                                        isOptionEqualToValue={(option, value) => option.id === value.id}
                                                                        renderInput={(params) => <TextField {...params} label="Select Nonprofit" margin="normal" fullWidth />}
                                                                    />
                                                                )}

                                                                {npoSelection === 'create' && (
                                                                    <TextField label="New Nonprofit Name" value={app.organization || app.charityName || ''} disabled fullWidth margin="normal" />
                                                                )}

                                                                <CardActions sx={{ justifyContent: 'flex-start', p: 0, pt: 2 }}>
                                                                    <Button size="medium" variant="outlined" onClick={() => setApprovalStep('initial')}>Back</Button>
                                                                    <Button size="medium" variant="contained" onClick={() => handleApprovalStepChange('create_ps', app)} disabled={npoSelection === 'link' && !selectedNpo}>
                                                                        Continue to Create Project
                                                                    </Button>
                                                                </CardActions>
                                                            </Paper>
                                                        )}

                                                        {/* Placeholder for Step 2 */}
                                                        {approvalStep === 'create_ps' && (
                                                            <Paper variant="outlined" sx={{ p: 2 }}>
                                                                <Typography variant="h6" gutterBottom>Step 2: Create Public Problem Statement</Typography>
                                                                <Typography color="text.secondary">This form will be implemented next.</Typography>
                                                                <Button sx={{mt: 1}} size="small" variant="outlined" onClick={() => handleApprovalStepChange('manage_npo', app)}>Back</Button>
                                                            </Paper>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Collapse>
                                        </TableCell>
                                    </TableRow>
                                </Fragment>
                            ))}

                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Container>
    );
}

// Export the component wrapped in withRequiredAuthInfo, just like the working admin page
export default withRequiredAuthInfo(NonProfitApplyList);