import React from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { SectionTitle } from './styles';

const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const ProjectList = ({ projects }) => {
    return (
        <Box>
            <SectionTitle variant="h6">Monthly Contribution Statistics</SectionTitle>
            {projects.map((project, index) => (
                <Box key={index} sx={{ marginBottom: '20px' }}>
                    <Typography variant="body1"><strong>{project.name}</strong></Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {months.map((month, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                                <Typography variant="body2">{month}</Typography>
                                {project.months.includes(idx + 1) && <StarIcon color="primary" sx={{ marginLeft: '5px' }} />}
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default ProjectList;
