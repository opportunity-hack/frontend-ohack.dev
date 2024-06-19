import React from 'react';
import { Container, Grid } from '@mui/material';
import ProfileHeader from './ProfileHeader';
import ProfileDetails from './ProfileDetails';
import ProjectList from './ProjectList';
import WeeklyStats from './WeeklyProjectList';
import { CenteredContent, EditButton, ProfileContainer, StyledPaper } from './styles';


const ProfilePage = () => {
    const handleEditProfile = () => {
        // Implement logic to navigate to the edit profile page or show an edit profile modal
        console.log('Editing profile...');
    };

    const user = {
        name: "John Doe",
        bio: "Software Developer from San Francisco",
        avatarUrl: "https://via.placeholder.com/150",
        details: {
            email: "john.doe@example.com",
            phone: "123-456-7890",
            address: "123 Main St, San Francisco, CA"
        },
        projects: [
            {
                name: "Project A",
                months: [1, 3, 5] // January, March, May
            },
            {
                name: "Project B",
                months: [2, 6, 9, 11] // February, June, September, November
            },
            {
                name: "Project C",
                months: [4, 7, 10] // April, July, October
            }
        ],
        weeklyStats: [
            {
                days: [1, 2, 3, 4, 5] // Monday to Friday
            },
            {
                days: [3, 4, 5, 6, 7] // Wednesday to Sunday
            },
        ]
    };

    return (
        <ProfileContainer>
            <Container maxWidth="lg">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <StyledPaper elevation={3}>
                            <ProfileHeader name={user.name} bio={user.bio} avatarUrl={user.avatarUrl} />
                            <CenteredContent>
                                <EditButton variant="contained" onClick={handleEditProfile}>Edit Profile</EditButton>
                            </CenteredContent>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <StyledPaper elevation={3}>
                            <ProfileDetails details={user.details} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <StyledPaper elevation={3}>
                            <ProjectList projects={user.projects} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <StyledPaper elevation={3}>
                            <WeeklyStats stats={user.weeklyStats} /> {/* Render the WeeklyStats component */}
                        </StyledPaper>
                    </Grid>
                </Grid>
            </Container>
        </ProfileContainer>
    );
};

export default ProfilePage;
