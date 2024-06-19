import React from 'react';
import { Box, Typography } from '@mui/material';
import { SectionTitle } from './styles';

const ProfileDetails = ({ details }) => {
    return (
        <Box>
            <SectionTitle variant="h6">Contact Information</SectionTitle>
            <Typography variant="body1"><strong>Email:</strong> {details.email}</Typography>
            <Typography variant="body1"><strong>Phone:</strong> {details.phone}</Typography>
            <Typography variant="body1"><strong>Address:</strong> {details.address}</Typography>
        </Box>
    );
};

export default ProfileDetails;
