import React from 'react';
import { Box, Button, Paper, Typography, Divider, useTheme, useMediaQuery } from '@mui/material';
import Link from 'next/link';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import BusinessIcon from '@mui/icons-material/Business';
import GavelIcon from '@mui/icons-material/Gavel';

const ApplicationNav = ({ eventId, currentType }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const navItems = [
    { 
      id: 'event',
      label: 'Event Page', 
      href: `/hack/${eventId}`, 
      icon: <HomeIcon fontSize="small" />
    },
    { 
      id: 'mentor',
      label: 'Mentor', 
      href: `/hack/${eventId}/mentor-application`, 
      icon: <SchoolIcon fontSize="small" />
    },
    { 
      id: 'judge',
      label: 'Judge', 
      href: `/hack/${eventId}/judge-application`, 
      icon: <GavelIcon fontSize="small" />
    },
    { 
      id: 'sponsor',
      label: 'Sponsor', 
      href: `/hack/${eventId}/sponsor-application`, 
      icon: <BusinessIcon fontSize="small" />
    },
  ];
  
  return (
    <Paper 
      elevation={1} 
      sx={{ 
        mb: 4, 
        p: 2, 
        backgroundColor: theme.palette.background.default,
        borderRadius: 2
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1.5, fontWeight: 'bold' }}>
        Applications & Navigation
      </Typography>
      
      <Divider sx={{ mb: 2 }} />
      
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1.5,
          '& a': { textDecoration: 'none' }
        }}
      >
        {navItems.map((item) => (
          <Link href={item.href} key={item.id} passHref>
            <Button
              variant={currentType === item.id ? "contained" : "outlined"}
              startIcon={item.icon}
              fullWidth={isMobile}
              size="small"
              color={currentType === item.id ? "primary" : "inherit"}
              sx={{ 
                borderRadius: 2,
                fontWeight: currentType === item.id ? 'bold' : 'normal',
              }}
            >
              {item.label}
            </Button>
          </Link>
        ))}
      </Box>
    </Paper>
  );
};

export default ApplicationNav;
