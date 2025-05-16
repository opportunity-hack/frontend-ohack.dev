import React, { useState, useEffect } from 'react';
import { Container, Grid, Box, Typography } from '@mui/material';
import ProfileHeader from './ProfileHeader';
import ProfileDetails from './ProfileDetails';
import ProjectList from './ProjectList';
import WeeklyStats from './WeeklyProjectList';
import { CenteredContent, EditButton, ProfileContainer, StyledPaper } from './styles';
import useProfileApi from '../../hooks/use-profile-api';
import { useAuthInfo } from '@propelauth/react';
import { 
  PuffLoader, 
  SkeletonText, 
  SkeletonContent, 
  SkeletonAvatar 
} from '../ProfileLoading/ProfileLoading';


const ProfilePage = () => {
    const { isLoggedIn, user: authUser } = useAuthInfo();
    const { profile, isLoading } = useProfileApi();
    const [mockData, setMockData] = useState(null);

    const handleEditProfile = () => {
        // Implement logic to navigate to the edit profile page or show an edit profile modal
        console.log('Editing profile...');
    };

    // This is mock data for demonstration purposes
    useEffect(() => {
        setMockData({
            name: authUser?.firstName ? `${authUser.firstName} ${authUser.lastName}` : "John Doe",
            bio: "Software Developer from San Francisco",
            avatarUrl: authUser?.pictureUrl || "https://via.placeholder.com/150",
            details: {
                email: authUser?.email || "john.doe@example.com",
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
        });
    }, [authUser]);

    if (isLoading || !mockData) {
        return (
            <ProfileContainer>
                <Container maxWidth="lg">
                    <Box sx={{ textAlign: 'center', my: 4 }}>
                        <PuffLoader 
                            message="Loading profile information..." 
                            size={80} 
                        />
                    </Box>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <StyledPaper elevation={3}>
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <SkeletonAvatar size={150} />
                                    <Box sx={{ mt: 2, width: '100%', textAlign: 'center' }}>
                                        <SkeletonText 
                                            lines={2} 
                                            widths={['220px', '300px']} 
                                            showTitle={false} 
                                        />
                                    </Box>
                                    <Box sx={{ mt: 2, width: '150px', height: '40px' }}>
                                        <SkeletonContent height={40} />
                                    </Box>
                                </Box>
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <StyledPaper elevation={3}>
                                <SkeletonText 
                                    lines={3} 
                                    widths={['80%', '70%', '90%']} 
                                    titleWidth={200}
                                />
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12}>
                            <StyledPaper elevation={3}>
                                <SkeletonText 
                                    lines={0} 
                                    titleWidth={250}
                                />
                                <SkeletonContent height={180} />
                            </StyledPaper>
                        </Grid>
                        <Grid item xs={12}>
                            <StyledPaper elevation={3}>
                                <SkeletonText 
                                    lines={0} 
                                    titleWidth={180}
                                />
                                <SkeletonContent height={120} />
                            </StyledPaper>
                        </Grid>
                    </Grid>
                </Container>
            </ProfileContainer>
        );
    }

    return (
        <ProfileContainer>
            <Container maxWidth="lg">
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <StyledPaper elevation={3}>
                            <ProfileHeader name={mockData.name} bio={mockData.bio} avatarUrl={mockData.avatarUrl} />
                            <CenteredContent>
                                <EditButton variant="contained" onClick={handleEditProfile}>Edit Profile</EditButton>
                            </CenteredContent>
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <StyledPaper elevation={3}>
                            <ProfileDetails details={mockData.details} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <StyledPaper elevation={3}>
                            <ProjectList projects={mockData.projects} />
                        </StyledPaper>
                    </Grid>
                    <Grid item xs={12}>
                        <StyledPaper elevation={3}>
                            <WeeklyStats stats={mockData.weeklyStats} />
                        </StyledPaper>
                    </Grid>
                </Grid>
            </Container>
        </ProfileContainer>
    );
};

export default ProfilePage;
