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
    Divider
} from '@mui/material';

// --- Helper function for Vector Similarity ---
function cosineSimilarity(vecA, vecB) {
    let dotProduct = 0.0;
    let normA = 0.0;
    let normB = 0.0;
    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        normA += vecA[i] * vecA[i];
        normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) {
        return 0;
    }
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

function NonProfitApplyList({ userClass }) {
    const { accessToken } = useAuthInfo();
    const [applications, setApplications] = useState([]);
    const [problemStatements, setProblemStatements] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedAppId, setExpandedAppId] = useState(null);
    
    // State for AI Features
    const [summary, setSummary] = useState('');
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [similarProjects, setSimilarProjects] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    
    // New state for handling approve/reject loading
    const [isUpdating, setIsUpdating] = useState(null);

    // Function to fetch summary from OpenAI
    const fetchSummary = async (application) => {
        setIsSummarizing(true);
        setSummary('');

        if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
            setSummary("Configuration Error: OpenAI API Key is missing.");
            setIsSummarizing(false);
            return;
        }

        const problemText = application.technicalProblem || application.idea || '';
        const solutionText = application.solutionBenefits || '';
        const inputText = `Problem: ${problemText}\n\nProposed Solution & Benefits: ${solutionText}`;

        const prompt = `Summarize the following nonprofit project application in a structured format. 
        Identify the core problem, the proposed solution, 
        and the key impact or benefit. 
        Provide the summary in markdown format, 
        using bold headers like 
        **Problem:**, **Solution:**, and **Impact:**.
        ---
        ${inputText}
        ---`;

        try {
            // NOTE: Using the standard Chat Completions API endpoint
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.5,
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error.message || 'Failed to fetch summary from OpenAI');
            }

            const data = await response.json();
            setSummary(data.choices[0].message.content);

        } catch (e) {
            console.error("Error fetching summary:", e);
            setSummary(`Error: ${e.message}`);
        } finally {
            setIsSummarizing(false);
        }
    };

    // --- Function to generate reasoning for a SINGLE project ---
    const fetchReasoningForSimilarity = async (application, projectToUpdate) => {
        if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
            setSimilarProjects(prev => prev.map(p => 
                p.id === projectToUpdate.id ? { ...p, reasoning: "API Key not configured.", isReasoning: false } : p
            ));
            return;
        }

        // Mark this specific project as loading its reason
        setSimilarProjects(prev => prev.map(p => 
            p.id === projectToUpdate.id ? { ...p, isReasoning: true } : p
        ));

        const appText = `Problem: ${application.technicalProblem || application.idea || ''}. Solution: ${application.solutionBenefits || ''}`;

        const prompt = `
            A new nonprofit application is being reviewed. It seems similar to an existing project.
            Provide a single, concise sentence explaining *why* the existing project is similar to the new application. Focus on the core shared goal or problem.

            New Application:
            ---
            ${appText}
            ---
            
            Existing Project:
            ---
            Title: ${projectToUpdate.title}
            Description: ${projectToUpdate.description}
            ---
        `;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}` },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    messages: [{ role: 'user', content: prompt }],
                    temperature: 0.3,
                })
            });
            if (!response.ok) throw new Error('Failed to fetch reasoning');

            const data = await response.json();
            const reason = data.choices[0].message.content;

            // Update the specific project with the fetched reason
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

    // --- Updated function for Semantic Search ---
    const findSimilarProjects = async (application) => {
        setIsSearching(true);
        setSimilarProjects([]);

        if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
            // We'll use the similarProjects state to hold the error message for its section.
            setSimilarProjects([{ id: 'error', title: 'Configuration Error: OpenAI API Key is missing.' }]);
            setIsSearching(false);
            return;
        }

        try {
            const appText = `Problem: ${application.technicalProblem || application.idea || ''}. Solution: ${application.solutionBenefits || ''}`;
            const textsToEmbed = [appText, ...problemStatements.map(p => `Title: ${p.title}. Description: ${p.description}`)];

            const response = await fetch('https://api.openai.com/v1/embeddings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'text-embedding-3-small',
                    input: textsToEmbed
                })
            });
            if (!response.ok) throw new Error('Failed to fetch embeddings');
            
            const data = await response.json();
            const embeddings = data.data.map(item => item.embedding);
            const newAppEmbedding = embeddings[0];
            const existingProjectsEmbeddings = embeddings.slice(1);

            const scoredProjects = problemStatements.map((project, index) => ({
                ...project,
                similarity: cosineSimilarity(newAppEmbedding, existingProjectsEmbeddings[index])
            }));

            scoredProjects.sort((a, b) => b.similarity - a.similarity);
            setSimilarProjects(scoredProjects.slice(0, 3));
            
        } catch (e) {
            console.error("Error finding similar projects:", e);
        } finally {
            setIsSearching(false);
        }
    };

    const handleReviewClick = (app) => {
        const appId = app.id;
        if (expandedAppId === appId) {
            setExpandedAppId(null);
        } else {
            setExpandedAppId(appId);
            fetchSummary(app);
            findSimilarProjects(app);
        }
    };

    // --- Function to handle application status updates ---
    const handleUpdateStatus = async (appId, status) => {
        setIsUpdating(appId); // Set loading state for this specific application
        
        const org = userClass.getOrgByName("Opportunity Hack Org");
        const orgId = org ? org.orgId : null;

        try {
            // This endpoint is hypothetical but follows the API's likely structure.
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

            // On success, remove the application from the list in the UI
            setApplications(prevApplications => prevApplications.filter(app => app.id !== appId));
            setExpandedAppId(null); // Close the expanded view

        } catch (e) {
            console.error("Error updating application status:", e);
            // Optionally, show an error message to the user (e.g., using a snackbar)
            setError(e.message);
        } finally {
            setIsUpdating(null); // Reset loading state
        }
    };

    useEffect(() => {
        if (!userClass || !accessToken) { setIsLoading(false); return; }
        const org = userClass.getOrgByName("Opportunity Hack Org");
        const isAdmin = org && org.hasPermission("volunteer.admin");
        const orgId = org ? org.orgId : null;
        if (!isAdmin || !orgId) { setError("You do not have permission to view this data."); setIsLoading(false); return; }
        const fetchAllData = async () => {
            try {
                const [appsResponse, psResponse] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/npo/applications`, { headers: { 'Authorization': `Bearer ${accessToken}`, 'X-Org-Id': orgId } }),
                    fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`)
                ]);
                if (!appsResponse.ok) throw new Error(`Failed to fetch applications: ${appsResponse.status}`);
                if (!psResponse.ok) throw new Error(`Failed to fetch problem statements: ${psResponse.status}`);
                const appsData = await appsResponse.json();
                const psData = await psResponse.json();
                
                setApplications(appsData.applications.sort((a, b) => new Date(b.timestamp || b.timeStamp) - new Date(a.timestamp || a.timeStamp)));
                setProblemStatements(psData.problem_statements);

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
                <Typography variant="h4" component="h1" gutterBottom>
                    Nonprofit Application List Workbench
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                    Review pending applications to create new projects.
                </Typography>
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
                                                        <Grid item xs={12} md={5} sx={{ p: 2 }}>
                                                            <Typography variant="h6" gutterBottom>Application Details</Typography>
                                                            <Typography variant="body2" mt={1}><strong>Contact Email:</strong> {app.email || 'Not Provided'}</Typography>
                                                            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Problem Statement</Typography>
                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', p:1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>{app.technicalProblem || app.idea || 'Not Provided'}</Typography>
                                                            <Typography variant="subtitle2" sx={{ mt: 2, fontWeight: 'bold' }}>Proposed Solution / Benefits</Typography>
                                                            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto', p:1, border: '1px solid', borderColor: 'grey.300', borderRadius: 1 }}>{app.solutionBenefits || 'Not Provided'}</Typography>
                                                        </Grid>
                                                        <Grid item xs={12} md={4} sx={{ p: 2 }}>
                                                            <Typography variant="h6" gutterBottom>AI-Generated Summary</Typography>
                                                            {isSummarizing ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2 }}><CircularProgress size={24} /><Typography>Generating summary...</Typography></Box>
                                                            ) : (
                                                                <Paper 
                                                                    variant="outlined" 
                                                                    sx={{ 
                                                                        p: 2, 
                                                                        backgroundColor: 'white',
                                                                        overflowWrap: 'break-word', // Add this to break long words
                                                                        wordWrap: 'break-word'      // For older browser compatibility
                                                                    }}
                                                                >
                                                                    <ReactMarkdown>{summary}</ReactMarkdown>
                                                                </Paper>
                                                            )}
                                                        </Grid>
                                                        <Grid item xs={12} md={3} sx={{ p: 2 }}>
                                                            <Typography variant="h6" gutterBottom>Similar Projects</Typography>
                                                            {isSearching ? (
                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={24} /><Typography>Searching...</Typography></Box>
                                                            ) : (
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
                                                                </List>
                                                            )}
                                                        </Grid>
                                                    </Grid>
                                                    <Divider sx={{ my: 2 }} />
                                                    <CardActions sx={{ justifyContent: 'flex-end', p: 0 }}>
                                                        <Button 
                                                            size="medium" 
                                                            color="error" 
                                                            variant="outlined"
                                                            onClick={() => handleUpdateStatus(app.id, 'rejected')}
                                                            disabled={isUpdating === app.id}
                                                        >
                                                            {isUpdating === app.id ? <CircularProgress size={24} /> : 'Reject'}
                                                        </Button>
                                                        <Button 
                                                            size="medium" 
                                                            variant="contained" 
                                                            color="primary"
                                                            onClick={() => handleUpdateStatus(app.id, 'approved')}
                                                            disabled={isUpdating === app.id}
                                                        >
                                                            {isUpdating === app.id ? <CircularProgress size={24} /> : 'Approve'}
                                                        </Button>
                                                    </CardActions>
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