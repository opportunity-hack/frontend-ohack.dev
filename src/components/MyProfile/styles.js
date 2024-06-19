import { styled } from '@mui/system';
import { Button, Box, Paper, Avatar, Typography, Grid } from '@mui/material';

export const ProfileContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    background: '#e0e0eb', // Linear gradient background color with opacity
    minHeight: '100vh',
    margin: '150px',
    height: 'auto' // Set height to auto to fit content
}));


export const EditButton = styled(Button)({
    backgroundColor: '#b3b3cc', // Orange background color
    color: '#000000', // White text color
    borderRadius: '8px', // Rounded corners
    padding: '10px 20px', // Padding
    marginTop: '20px', // Margin from the top
    justifyContent: 'center',
    '&:hover': {
        backgroundColor: '#73738c', // Darker orange background color on hover
    },
});

export const CenteredContent = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    marginTop: '20px', // Adjust as needed
});

export const ProfileGridContainer = styled(Grid)(({ theme }) => ({
    flexGrow: 1,
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
}));

export const StyledPaper = styled(Paper)(({ theme }) => ({
    width: '100%',
    marginBottom: '20px',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#fff', // White background color
}));

export const ProfileHeaderContainer = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    marginBottom: '20px',
}));

export const ProfileAvatar = styled(Avatar)(({ theme }) => ({
    width: '150px',
    height: '150px',
    margin: '0 auto',
    borderRadius: '50%',
    border: '4px solid #3f51b5', // Border color
}));

export const SectionTitle = styled(Typography)(({ theme }) => ({
    marginBottom: '10px',
    color: '#3f51b5', // Text color
    fontSize: '1.5em', // Larger font size
    fontWeight: 'bold', // Bold font weight
    textDecoration: 'underline', // Underline text
}));
