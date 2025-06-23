// components/VolunteerAutoScroll.js
import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import Image from 'next/image';

const ScrollContainer = styled(Box)({
  overflow: 'hidden',
  width: '100%',
  height: '100vh',
  position: 'relative',
});

const ScrollContent = styled(Box)(({ scrollPosition }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  justifyContent: 'center',
  transition: 'transform 0.5s',
  transform: `translateY(${scrollPosition}px)`,
}));

const VolunteerTile = styled(Box)(({ theme }) => ({
  width: '250px',
  height: '300px',
  margin: '10px',
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  overflow: 'hidden',
  boxShadow: theme.shadows[3],
}));

const VolunteerInfo = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  left: 0,
  right: 0,
  padding: theme.spacing(1),
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  color: theme.palette.common.white
}));

const VolunteerName = styled(Typography)({
  textAlign: 'center',
  marginBottom: '4px',
  color: 'white',
  fontWeight: 'bold'
});

const RoleChip = styled(Chip)(({ theme, role }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  backgroundColor: 
    role === 'mentor' ? theme.palette.primary.main :
    role === 'judge' ? theme.palette.success.main :
    theme.palette.info.main,
  color: theme.palette.common.white,
}));

const VolunteerAutoScroll = ({ event_id }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const contentRef = useRef(null);

  useEffect(() => {
    const fetchAllVolunteers = async () => {
      try {
        const types = ['mentor', 'judge', 'volunteer'];
        const allVolunteers = [];

        for (const type of types) {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${event_id}/${type}`);
          if (!res.ok) throw new Error(`Failed to fetch ${type}s`);
          const data = await res.json();
          const filteredVolunteers = data.data
            .filter(v => v.isSelected && (!v.photoUrl || !v.photoUrl.includes('drive.google.com')))
            .map(v => ({ ...v, role: type }));
          allVolunteers.push(...filteredVolunteers);
        }

        setVolunteers(allVolunteers);
      } catch (err) {
        console.error('Error fetching volunteers:', err);
      }
    };

    fetchAllVolunteers();
  }, [event_id]);

  useEffect(() => {
    const scrollSpeed = 1; // Adjust this value to change scroll speed
    const scrollInterval = 50; // Adjust this value to change scroll smoothness

    const scroll = () => {
      setScrollPosition((prevPosition) => {
        const newPosition = prevPosition - scrollSpeed;
        const contentHeight = contentRef.current ? contentRef.current.clientHeight : 0;
        const containerHeight = window.innerHeight;

        // Reset scroll position when all content has scrolled past the view
        if (-newPosition >= contentHeight - containerHeight + 20) {
          return 0;
        }

        return newPosition;
      });
    };

    const intervalId = setInterval(scroll, scrollInterval);

    return () => clearInterval(intervalId);
  }, [volunteers]);

  return (
    <ScrollContainer mt={10}>
      <ScrollContent mt={10} ref={contentRef} scrollPosition={scrollPosition}>
        {volunteers.map((volunteer) => (
          <VolunteerTile key={`${volunteer.name}-${volunteer.role}`}>
            <Image
              src={
                volunteer.photoUrl ||
                "https://cdn.ohack.dev/ohack.dev/logos/OpportunityHack_2Letter_Black.png"
              }
              alt={volunteer.name}
              layout="fill"
              objectFit="cover"
            />
            <RoleChip
              label={
                volunteer.role.charAt(0).toUpperCase() + volunteer.role.slice(1)
              }
              role={volunteer.role}
            />
            <VolunteerInfo>
              <VolunteerName variant="h6">{volunteer.name}</VolunteerName>
              <Typography variant="body1" align="center">
                {volunteer.company || volunteer.companyName || ""}
              </Typography>
            </VolunteerInfo>
          </VolunteerTile>
        ))}
      </ScrollContent>
    </ScrollContainer>
  );
};

export default VolunteerAutoScroll;