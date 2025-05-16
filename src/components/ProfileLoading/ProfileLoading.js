import React from 'react';
import { Box, Typography, Skeleton } from '@mui/material';
import { Puff } from 'react-loading-icons';
import { styled } from '@mui/material/styles';

const LoadingContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(3),
  minHeight: '120px',
}));

// Component for animated Puff loader with message
const PuffLoader = ({ message = 'Loading...', size = 60, color = '#1976d2' }) => (
  <LoadingContainer>
    <Puff stroke={color} width={size} height={size} />
    <Typography variant="body1" sx={{ mt: 2, fontWeight: 'medium' }}>
      {message}
    </Typography>
  </LoadingContainer>
);

// Component for skeleton text loading
const SkeletonText = ({ 
  lines = 3, 
  widths = ['80%', '70%', '90%'], 
  height = 24,
  titleWidth = 200,
  titleHeight = 32,
  showTitle = true
}) => (
  <Box sx={{ width: '100%' }}>
    {showTitle && <Skeleton variant="text" width={titleWidth} height={titleHeight} sx={{ mb: 1 }} />}
    {Array(lines).fill(0).map((_, index) => (
      <Skeleton 
        key={index} 
        variant="text" 
        width={widths[index % widths.length]} 
        height={height} 
        sx={{ my: 0.5 }} 
      />
    ))}
  </Box>
);

// Component for rectangular content loading
const SkeletonContent = ({ height = 200, width = '100%' }) => (
  <Skeleton variant="rectangular" width={width} height={height} sx={{ borderRadius: 1 }} />
);

// Component for avatar/profile picture loading
const SkeletonAvatar = ({ size = 150 }) => (
  <Skeleton variant="circular" width={size} height={size} />
);

// Component that combines multiple skeleton elements for a card
const SkeletonCard = ({ 
  headerHeight = 60, 
  contentHeight = 120,
  showAvatar = false,
  avatarSize = 80,
  spacing = 2
}) => (
  <Box sx={{ width: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', mb: spacing }}>
      {showAvatar && (
        <SkeletonAvatar size={avatarSize} />
      )}
      <Box sx={{ ml: showAvatar ? 2 : 0, flex: 1 }}>
        <Skeleton variant="text" width="70%" height={28} />
        <Skeleton variant="text" width="40%" height={20} />
      </Box>
    </Box>
    <Skeleton variant="rectangular" height={contentHeight} sx={{ borderRadius: 1 }} />
  </Box>
);

const ProfileLoading = {
  PuffLoader,
  SkeletonText,
  SkeletonContent,
  SkeletonAvatar,
  SkeletonCard
};

export { 
  PuffLoader,
  SkeletonText,
  SkeletonContent,
  SkeletonAvatar,
  SkeletonCard
};

export default ProfileLoading;