import React from 'react';
import { ProfileHeaderContainer, ProfileAvatar, SectionTitle } from './styles';
import { Typography } from '@mui/material';

const ProfileHeader = ({ name, bio, avatarUrl }) => {
    return (
        <ProfileHeaderContainer>
            <ProfileAvatar alt={name} src={avatarUrl} />
            <SectionTitle variant="h4" sx={{ mt: 2 }}>{name}</SectionTitle>
            <Typography variant="body1" color="textSecondary">{bio}</Typography>
        </ProfileHeaderContainer>
    );
};

export default ProfileHeader;
