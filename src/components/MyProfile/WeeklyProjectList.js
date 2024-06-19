import React from 'react';
import { Box, Typography } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import { SectionTitle } from './styles';

const daysOfWeek = [
    "Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"
];

const WeeklyStats = ({ stats }) => {
    return (
        <Box>
            <SectionTitle variant="h6">Weekly Contribution Statistics</SectionTitle>
            {stats.map((week, index) => (
                <Box key={index} sx={{ marginBottom: '20px' }}>
                    <Typography variant="body1"><strong>Week {index + 1}</strong></Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap' }}>
                        {daysOfWeek.map((day, idx) => (
                            <Box key={idx} sx={{ display: 'flex', alignItems: 'center', marginRight: '10px' }}>
                                <Typography variant="body2">{day}</Typography>
                                {week.days.includes(idx + 1) && <StarIcon color="primary" sx={{ marginLeft: '5px' }} />}
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );
};

export default WeeklyStats;
