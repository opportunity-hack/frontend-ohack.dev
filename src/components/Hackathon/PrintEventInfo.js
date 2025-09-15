import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Grid,
  Card,
  CardContent,
  Divider,
  Alert,
  Paper,
  CircularProgress,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import PrintIcon from '@mui/icons-material/Print';
import QRCode from 'react-qr-code';
import PersonIcon from '@mui/icons-material/Person';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import GavelIcon from '@mui/icons-material/Gavel';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import '../../styles/print.css';

// Print-specific styling
const PrintContainer = styled(Box)(({ theme }) => ({
  '@media print': {
    '& *': {
      visibility: 'visible !important',
    },
    fontSize: '12px',
    lineHeight: '1.4',
    color: '#000 !important',
    backgroundColor: '#fff !important',
    pageBreakInside: 'avoid',
  },
}));

const PrintSection = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(2),
  '@media print': {
    boxShadow: 'none',
    border: '1px solid #ddd',
    pageBreakInside: 'avoid',
    backgroundColor: '#fff !important',
    padding: '10px',
    marginBottom: '15px',
  },
}));

const PrintHeader = styled(Box)(({ theme }) => ({
  textAlign: 'center',
  marginBottom: theme.spacing(3),
  '@media print': {
    marginBottom: '20px',
    borderBottom: '2px solid #333',
    paddingBottom: '10px',
  },
}));

const ParticipantCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  '@media print': {
    boxShadow: 'none',
    border: '1px solid #eee',
    marginBottom: '8px',
    backgroundColor: '#fff !important',
    pageBreakInside: 'avoid',
    padding: '6px',
    fontSize: '10pt',
  },
}));

const QRCodeContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: theme.spacing(2),
  '@media print': {
    pageBreakInside: 'avoid',
    textAlign: 'center',
    margin: '20px 0',
  },
}));

const PrintParticipantsGrid = styled(Grid)(({ theme }) => ({
  '@media print': {
    columnCount: 2,
    columnGap: '20px',
    columnFill: 'balance',
    display: 'block !important',
  },
}));;

const PrintEventInfo = ({ open, onClose, eventData, eventId }) => {
  const [selectedSections, setSelectedSections] = useState({
    volunteers: true,
    mentors: true,
    hackers: true,
    judges: true,
    countdown: true,
    qrCode: true,
  });
  
  const [participantData, setParticipantData] = useState({
    volunteers: [],
    mentors: [],
    hackers: [],
    judges: [],
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const printRef = useRef();

  // Fetch participant data when dialog opens
  useEffect(() => {
    if (open && eventId) {
      fetchParticipantData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventId]);

  const fetchParticipantData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const participantTypes = ['volunteer', 'mentor', 'hacker', 'judge'];
      const dataPromises = participantTypes.map(async (type) => {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/hackathon/${eventId}/${type}`
          );
          if (response.ok) {
            const data = await response.json();
            return { type, data: data.data || [] };
          } else {
            console.warn(`Failed to fetch ${type} data`);
            return { type, data: [] };
          }
        } catch (error) {
          console.error(`Error fetching ${type} data:`, error);
          return { type, data: [] };
        }
      });

      const results = await Promise.all(dataPromises);
      const newParticipantData = {};
      
      results.forEach(({ type, data }) => {
        const pluralType = type === 'hacker' ? 'hackers' : `${type}s`;
        newParticipantData[pluralType] = data;
      });
      
      setParticipantData(newParticipantData);
    } catch (error) {
      console.error('Error fetching participant data:', error);
      setError('Failed to load participant data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSectionChange = (section) => (event) => {
    setSelectedSections(prev => ({
      ...prev,
      [section]: event.target.checked
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const renderParticipantList = (participants, title, icon) => {
    if (!selectedSections[title.toLowerCase()] || participants.length === 0) {
      return null;
    }

    const IconComponent = icon;
    
    return (
      <PrintSection key={title}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <IconComponent sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            {title} ({participants.length})
          </Typography>
        </Box>
        
        <PrintParticipantsGrid container spacing={1} className="print-participants-grid">
          {participants.map((participant, index) => (
            <Grid item xs={12} sm={6} md={4} key={index} className="print-grid-item">
              <ParticipantCard variant="outlined" className="print-participant-card">
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Typography variant="subtitle2" gutterBottom>
                    {participant.name || participant.firstName || 'Name not provided'}
                  </Typography>
                  
                  {(participant.company || participant.schoolOrganization) && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {participant.company || participant.schoolOrganization}
                    </Typography>
                  )}
                  
                  {participant.skills && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Skills: {typeof participant.skills === 'string' 
                        ? participant.skills 
                        : participant.skills.join(', ')
                      }
                    </Typography>
                  )}
                  
                  {participant.location && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      Location: {participant.location}
                    </Typography>
                  )}
                </CardContent>
              </ParticipantCard>
            </Grid>
          ))}
        </PrintParticipantsGrid>
      </PrintSection>
    );
  };

  const renderEventCountdown = () => {
    if (!selectedSections.countdown || !eventData) return null;

    return (
      <PrintSection>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <AccessTimeIcon sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Event Timeline
          </Typography>
        </Box>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" gutterBottom>
              <strong>Event:</strong> {eventData.title}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Start Date:</strong> {eventData.start_date ? new Date(eventData.start_date).toLocaleDateString() : 'TBA'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>End Date:</strong> {eventData.end_date ? new Date(eventData.end_date).toLocaleDateString() : 'TBA'}
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Location:</strong> {eventData.location || 'TBA'}
            </Typography>
          </Grid>
          
          {eventData.countdowns && eventData.countdowns.length > 0 && (
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" gutterBottom>
                Important Dates:
              </Typography>
              {eventData.countdowns.slice(0, 5).map((countdown, index) => (
                <Typography key={index} variant="caption" display="block" color="text.secondary">
                  {countdown.name}: {countdown.date ? new Date(countdown.date).toLocaleDateString() : 'TBA'}
                </Typography>
              ))}
            </Grid>
          )}
        </Grid>
      </PrintSection>
    );
  };

  const renderQRCode = () => {
    if (!selectedSections.qrCode) return null;

    const eventUrl = `https://ohack.dev/hack/${eventId}`;
    
    return (
      <PrintSection className="print-section no-page-break">
        <Typography variant="h6" component="h3" gutterBottom align="center">
          Event Information
        </Typography>
        
        <QRCodeContainer className="print-qr-container">
          <Box sx={{ textAlign: 'center' }}>
            <QRCode 
              value={eventUrl}
              size={150}
              style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Scan to visit: {eventUrl}
            </Typography>
          </Box>
        </QRCodeContainer>
      </PrintSection>
    );
  };

  const getTotalSelected = () => {
    return Object.values(selectedSections).filter(Boolean).length;
  };

  const getTotalParticipants = () => {
    return Object.entries(participantData).reduce((total, [key, participants]) => {
      if (selectedSections[key]) {
        return total + participants.length;
      }
      return total;
    }, 0);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PrintIcon sx={{ mr: 1 }} />
            Print Event Information
          </Box>
        </DialogTitle>
        
        <DialogContent>
          <Alert severity="info" sx={{ mb: 3 }}>
            Select the information you want to include in your printable event guide. 
            This will generate a welcome document for hackathon participants.
          </Alert>

          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading participant data...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && (
            <>
              <Typography variant="h6" gutterBottom>
                Select Content to Print:
              </Typography>
              
              <FormGroup>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedSections.volunteers}
                          onChange={handleSectionChange('volunteers')}
                        />
                      }
                      label={`Volunteers (${participantData.volunteers?.length || 0})`}
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedSections.mentors}
                          onChange={handleSectionChange('mentors')}
                        />
                      }
                      label={`Mentors (${participantData.mentors?.length || 0})`}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedSections.hackers}
                          onChange={handleSectionChange('hackers')}
                        />
                      }
                      label={`Hackers (${participantData.hackers?.length || 0})`}
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedSections.judges}
                          onChange={handleSectionChange('judges')}
                        />
                      }
                      label={`Judges (${participantData.judges?.length || 0})`}
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedSections.countdown}
                          onChange={handleSectionChange('countdown')}
                        />
                      }
                      label="Event Timeline & Important Dates"
                    />
                    
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={selectedSections.qrCode}
                          onChange={handleSectionChange('qrCode')}
                        />
                      }
                      label="QR Code for Event Page"
                    />
                  </Grid>
                </Grid>
              </FormGroup>

              {getTotalSelected() > 0 && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Ready to print {getTotalSelected()} section(s) with {getTotalParticipants()} total participants.
                </Alert>
              )}
            </>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handlePrint} 
            startIcon={<PrintIcon />}
            disabled={loading || getTotalSelected() === 0}
          >
            Print Selected Content
          </Button>
        </DialogActions>
      </Dialog>

      {/* Hidden print content */}
      <Box sx={{ display: 'none', '@media print': { display: 'block' } }} className="print-content">
        <PrintContainer ref={printRef}>
          <PrintHeader className="print-header">
            <Typography variant="h4" component="h1" gutterBottom>
              {eventData?.title || 'Hackathon Event'}
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Participant Guide
            </Typography>
            <Divider sx={{ my: 2 }} />
          </PrintHeader>

          {renderEventCountdown()}
          
          {renderParticipantList(
            participantData.volunteers,
            'Volunteers',
            VolunteerActivismIcon
          )}
          
          {renderParticipantList(
            participantData.mentors,
            'Mentors',
            PersonIcon
          )}
          
          {renderParticipantList(
            participantData.hackers,
            'Hackers',
            EmojiEventsIcon
          )}
          
          {renderParticipantList(
            participantData.judges,
            'Judges',
            GavelIcon
          )}
          
          {renderQRCode()}
        </PrintContainer>
      </Box>
    </>
  );
};

export default PrintEventInfo;