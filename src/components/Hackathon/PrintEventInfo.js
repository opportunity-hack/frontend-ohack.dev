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

// Print-specific styling for minimal, print-optimized layout
const PrintContainer = styled(Box)(({ theme }) => ({
  '@media print': {
    '& *': {
      visibility: 'visible !important',
    },
    fontSize: '11px',
    lineHeight: '1.2',
    color: '#000 !important',
    backgroundColor: '#fff !important',
    fontFamily: 'Arial, sans-serif',
  },
}));

const PrintHeader = styled(Box)(({ theme }) => ({
  '@media print': {
    textAlign: 'center',
    marginBottom: '15px',
    borderBottom: '2px solid #000',
    paddingBottom: '8px',
  },
}));

const PrintSection = styled(Box)(({ theme }) => ({
  '@media print': {
    marginBottom: '20px',
    pageBreakInside: 'avoid',
  },
}));

const ParticipantRow = styled(Box)(({ theme }) => ({
  '@media print': {
    display: 'flex',
    alignItems: 'center',
    borderBottom: '1px solid #ddd',
    padding: '6px 0',
    pageBreakInside: 'avoid',
    fontSize: '10px',
  },
}));

const ParticipantPhoto = styled('img')({
  '@media print': {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    marginRight: '8px',
    objectFit: 'cover',
    border: '1px solid #ccc',
  },
});

const ParticipantInfo = styled(Box)({
  '@media print': {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});

const QRSection = styled(Box)({
  '@media print': {
    textAlign: 'center',
    marginTop: '20px',
    pageBreakInside: 'avoid',
    borderTop: '1px solid #ddd',
    paddingTop: '15px',
  },
});

const SectionHeader = styled(Box)({
  '@media print': {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '8px',
    fontSize: '12px',
    fontWeight: 'bold',
    borderBottom: '1px solid #999',
    paddingBottom: '3px',
  },
});

const TwoColumnLayout = styled(Box)({
  '@media print': {
    display: 'flex',
    gap: '15px',
  },
});

const Column = styled(Box)({
  '@media print': {
    flex: 1,
  },
});;

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

  const renderParticipantList = (participants, title, sectionKey) => {
    if (!selectedSections[sectionKey] || participants.length === 0) {
      return null;
    }

    return (
      <PrintSection key={title}>
        <SectionHeader>
          <span style={{ marginRight: '8px' }}>
            {sectionKey === 'volunteers' && '🙋‍♀️'}
            {sectionKey === 'mentors' && '👨‍🏫'}
            {sectionKey === 'judges' && '⚖️'}
            {sectionKey === 'hackers' && '💻'}
          </span>
          {title} ({participants.length})
        </SectionHeader>
        
        {participants.map((participant, index) => (
          <ParticipantRow key={index}>
            <ParticipantPhoto
              src={participant.slack_user_profile_photo || participant.profile_photo || '/default-avatar.png'}
              alt={participant.name || participant.firstName || 'Participant'}
              onError={(e) => {
                e.target.src = '/default-avatar.png';
              }}
            />
            <ParticipantInfo>
              <Box>
                <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                  {participant.name || participant.firstName || 'Name not provided'}
                </div>
                <div style={{ fontSize: '9px', color: '#666' }}>
                  {participant.company || participant.schoolOrganization || ''}
                </div>
              </Box>
              <Box style={{ textAlign: 'right', fontSize: '9px', color: '#666' }}>
                {participant.skills && (
                  <div style={{ maxWidth: '120px' }}>
                    {typeof participant.skills === 'string' 
                      ? participant.skills.substring(0, 30) + (participant.skills.length > 30 ? '...' : '')
                      : Array.isArray(participant.skills) 
                        ? participant.skills.slice(0, 2).join(', ') + (participant.skills.length > 2 ? '...' : '')
                        : ''
                    }
                  </div>
                )}
              </Box>
            </ParticipantInfo>
          </ParticipantRow>
        ))}
      </PrintSection>
    );
  };

  const renderEventCountdown = () => {
    if (!selectedSections.countdown || !eventData) return null;

    return (
      <PrintSection>
        <SectionHeader>
          <span style={{ marginRight: '8px' }}>📅</span>
          Event Information
        </SectionHeader>
        
        <TwoColumnLayout>
          <Column>
            <div style={{ marginBottom: '6px' }}>
              <strong>Event:</strong> {eventData.title}
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong>Start:</strong> {eventData.start_date ? new Date(eventData.start_date).toLocaleDateString() : 'TBA'}
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong>End:</strong> {eventData.end_date ? new Date(eventData.end_date).toLocaleDateString() : 'TBA'}
            </div>
            <div style={{ marginBottom: '6px' }}>
              <strong>Location:</strong> {eventData.location || 'TBA'}
            </div>
          </Column>
          
          {eventData.countdowns && eventData.countdowns.length > 0 && (
            <Column>
              <div style={{ fontWeight: 'bold', marginBottom: '4px', fontSize: '10px' }}>
                Important Dates:
              </div>
              {eventData.countdowns.slice(0, 4).map((countdown, index) => (
                <div key={index} style={{ fontSize: '9px', marginBottom: '3px', color: '#666' }}>
                  {countdown.name}: {countdown.date ? new Date(countdown.date).toLocaleDateString() : 'TBA'}
                </div>
              ))}
            </Column>
          )}
        </TwoColumnLayout>
      </PrintSection>
    );
  };

  const renderQRCode = () => {
    if (!selectedSections.qrCode) return null;

    const eventUrl = `https://ohack.dev/hack/${eventId}`;
    
    return (
      <QRSection>
        <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
          📱 Event Information
        </div>
        <QRCode 
          value={eventUrl}
          size={80}
          style={{ height: 'auto', maxWidth: '100%', width: '100%' }}
        />
        <div style={{ fontSize: '8px', marginTop: '5px', color: '#666' }}>
          Scan to visit: {eventUrl}
        </div>
      </QRSection>
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

      {/* Hidden print content - minimal layout optimized for print */}
      <Box sx={{ display: 'none', '@media print': { display: 'block' } }} className="print-content">
        <PrintContainer ref={printRef}>
          <PrintHeader>
            <div style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
              {eventData?.title || 'Hackathon Event'}
            </div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              Participant Guide • Generated {new Date().toLocaleDateString()}
            </div>
          </PrintHeader>

          {renderEventCountdown()}
          
          <TwoColumnLayout>
            <Column>
              {renderParticipantList(
                participantData.volunteers,
                'Volunteers',
                'volunteers'
              )}
              
              {renderParticipantList(
                participantData.judges,
                'Judges',
                'judges'
              )}
            </Column>
            
            <Column>
              {renderParticipantList(
                participantData.mentors,
                'Mentors',
                'mentors'
              )}
              
              {renderParticipantList(
                participantData.hackers,
                'Hackers',
                'hackers'
              )}
            </Column>
          </TwoColumnLayout>
          
          {renderQRCode()}
        </PrintContainer>
      </Box>
    </>
  );
};

export default PrintEventInfo;