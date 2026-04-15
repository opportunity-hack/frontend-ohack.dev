import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Typography,
  Paper,
  Grid,
  Avatar,
  Chip,
  LinearProgress,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  Fade,
  Grow,
  Zoom,
} from "@mui/material";
import {
  PlayArrow,
  Pause,
  Stop,
  Celebration,
  EmojiEvents,
  Shuffle,
  Visibility,
  Close,
} from "@mui/icons-material";
import { styled, keyframes } from "@mui/system";

// Animations
const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
`;

const confetti = keyframes`
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Styled components
const EntryCard = styled(Card)(({ theme, isSelected, isShuffling }) => ({
  cursor: "pointer",
  transition: "all 0.3s ease",
  border: isSelected ? `3px solid ${theme.palette.primary.main}` : "2px solid transparent",
  animation: isShuffling ? `${shake} 0.5s infinite` : isSelected ? `${pulse} 2s infinite` : "none",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[8],
  },
}));

const WinnerCard = styled(Card)(({ theme }) => ({
  background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
  color: "white",
  position: "relative",
  overflow: "hidden",
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: "-200px",
    width: "200px",
    height: "100%",
    background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
    animation: `${shimmer} 2s infinite`,
  },
}));

const ConfettiPiece = styled("div")(({ theme, delay, color }) => ({
  position: "absolute",
  width: "10px",
  height: "10px",
  backgroundColor: color,
  animation: `${confetti} 3s linear infinite`,
  animationDelay: `${delay}s`,
}));

const StageContainer = styled(Box)(({ theme }) => ({
  minHeight: "400px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(3),
}));

const DramaticGiveawaySelector = ({
  giveaways = [],
  randomSeed,
  onWinnerSelected,
}) => {
  const [open, setOpen] = useState(false);
  const [currentStage, setCurrentStage] = useState(0);
  const [entryPool, setEntryPool] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [winner, setWinner] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const audioRef = useRef(null);

  const stages = [
    "Setup Entry Pool",
    "Randomize Selection",
    "Reveal Winner",
    "Celebrate!",
  ];

  // Create entry pool with weighted entries
  const createEntryPool = () => {
    const pool = giveaways.flatMap((giveaway) =>
      Array(giveaway.entries).fill(giveaway)
    );
    setEntryPool(pool);
    return pool;
  };

  // Start the dramatic selection process
  const startSelection = () => {
    if (!randomSeed || giveaways.length === 0) return;
    
    setOpen(true);
    setCurrentStage(0);
    setIsShuffling(false);
    setSelectedIndex(null);
    setWinner(null);
    setShowConfetti(false);
    
    // Stage 1: Create entry pool
    setTimeout(() => {
      const pool = createEntryPool();
      setCurrentStage(1);
      
      // Stage 2: Start shuffling animation
      setTimeout(() => {
        setIsShuffling(true);
        startShuffleAnimation(pool);
      }, 2000);
    }, 1000);
  };

  // Animate the shuffling process
  const startShuffleAnimation = (pool) => {
    let shuffleCount = 0;
    const maxShuffles = 20;
    
    const shuffleInterval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * pool.length);
      setSelectedIndex(randomIndex);
      shuffleCount++;
      
      if (shuffleCount >= maxShuffles) {
        clearInterval(shuffleInterval);
        
        // Start countdown
        setCountdown(3);
        const countdownInterval = setInterval(() => {
          setCountdown(prev => {
            if (prev <= 1) {
              clearInterval(countdownInterval);
              selectFinalWinner(pool);
              return null;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 150);
  };

  // Select the final winner using the provided random seed
  const selectFinalWinner = (pool) => {
    const seed = parseInt(randomSeed, 10);
    let random = seed;

    // Use Fisher-Yates shuffle with seeded random
    const shuffledPool = [...pool];
    for (let i = shuffledPool.length - 1; i > 0; i--) {
      random = (random * 1103515245 + 12345) & 0x7fffffff;
      const j = random % (i + 1);
      [shuffledPool[i], shuffledPool[j]] = [shuffledPool[j], shuffledPool[i]];
    }

    const finalWinner = shuffledPool[0];
    const winnerIndex = pool.findIndex(entry => entry === finalWinner);
    
    setIsShuffling(false);
    setSelectedIndex(winnerIndex);
    setWinner(finalWinner);
    setCurrentStage(2);
    
    // Move to celebration stage
    setTimeout(() => {
      setCurrentStage(3);
      setShowConfetti(true);
      
      // Call parent callback
      if (onWinnerSelected) {
        onWinnerSelected(finalWinner);
      }
    }, 2000);
  };

  // Generate confetti pieces
  const renderConfetti = () => {
    if (!showConfetti) return null;
    
    const colors = ["#ff6b6b", "#4ecdc4", "#45b7d1", "#96ceb4", "#feca57"];
    const pieces = [];
    
    for (let i = 0; i < 50; i++) {
      pieces.push(
        <ConfettiPiece
          key={i}
          delay={Math.random() * 3}
          color={colors[Math.floor(Math.random() * colors.length)]}
          style={{
            left: `${Math.random() * 100}%`,
            width: `${5 + Math.random() * 10}px`,
            height: `${5 + Math.random() * 10}px`,
          }}
        />
      );
    }
    
    return pieces;
  };

  const handleClose = () => {
    setOpen(false);
    setShowConfetti(false);
  };

  const canStart = randomSeed && giveaways.length > 0;
  const totalEntries = giveaways.reduce((sum, g) => sum + g.entries, 0);

  return (
    <>
      {/* Launch Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<EmojiEvents />}
          onClick={startSelection}
          disabled={!canStart}
          sx={{
            background: "linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)",
            color: "white",
            padding: "12px 30px",
            fontSize: "1.1rem",
            boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 6px 10px 4px rgba(255, 105, 135, .3)",
            },
            "&:disabled": {
              background: "rgba(0, 0, 0, 0.12)",
              color: "rgba(0, 0, 0, 0.26)",
            },
          }}
        >
          🎉 Start Dramatic Winner Selection 🎉
        </Button>
        {canStart && (
          <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
            {giveaways.length} participants • {totalEntries} total entries
          </Typography>
        )}
      </Box>

      {/* Dramatic Selection Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            minHeight: "80vh",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            position: "relative",
            overflow: "hidden",
          },
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            color: "white",
            zIndex: 10,
          }}
        >
          <Close />
        </IconButton>

        {/* Confetti */}
        {renderConfetti()}

        <DialogContent sx={{ p: 4 }}>
          {/* Stage Progress */}
          <Box sx={{ mb: 4 }}>
            <Stepper activeStep={currentStage} alternativeLabel>
              {stages.map((label, index) => (
                <Step key={label}>
                  <StepLabel
                    sx={{
                      "& .MuiStepLabel-label": { color: "white" },
                      "& .MuiStepIcon-root": {
                        color: index <= currentStage ? "#4ECDC4" : "rgba(255,255,255,0.3)",
                      },
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>

          {/* Stage Content */}
          <StageContainer>
            {currentStage === 0 && (
              <Fade in timeout={1000}>
                <Box textAlign="center">
                  <Shuffle sx={{ fontSize: 80, mb: 2, animation: `${pulse} 2s infinite` }} />
                  <Typography variant="h4" gutterBottom>
                    Preparing Entry Pool
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.8 }}>
                    Creating {totalEntries} entries from {giveaways.length} participants...
                  </Typography>
                  <LinearProgress
                    sx={{ mt: 3, height: 8, borderRadius: 4, width: "300px" }}
                  />
                </Box>
              </Fade>
            )}

            {currentStage === 1 && (
              <Box>
                <Typography variant="h4" textAlign="center" gutterBottom>
                  🎲 Randomizing Selection 🎲
                </Typography>
                <Typography variant="h6" textAlign="center" sx={{ mb: 3, opacity: 0.8 }}>
                  Using seed: {randomSeed} for transparent randomization
                </Typography>
                
                {countdown && (
                  <Box textAlign="center" sx={{ mb: 3 }}>
                    <Typography variant="h2" sx={{ fontSize: "4rem", fontWeight: "bold" }}>
                      {countdown}
                    </Typography>
                    <Typography variant="h6">Selecting winner in...</Typography>
                  </Box>
                )}

                {/* Entry Pool Visualization */}
                <Grid container spacing={1} sx={{ maxHeight: "300px", overflow: "auto" }}>
                  {entryPool.slice(0, 50).map((entry, index) => (
                    <Grid size={{ xs: 6, sm: 4, md: 3 }} key={index}>
                      <EntryCard
                        isSelected={selectedIndex === index}
                        isShuffling={isShuffling}
                      >
                        <CardContent sx={{ p: 1 }}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Avatar
                              src={entry.user.profile_image}
                              alt={entry.user.name}
                              sx={{ width: 24, height: 24 }}
                            />
                            <Typography variant="caption" noWrap>
                              {entry.user.name}
                            </Typography>
                          </Box>
                        </CardContent>
                      </EntryCard>
                    </Grid>
                  ))}
                  {entryPool.length > 50 && (
                    <Grid size={{ xs: 12 }}>
                      <Typography textAlign="center" sx={{ opacity: 0.7 }}>
                        ... and {entryPool.length - 50} more entries
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Box>
            )}

            {currentStage === 2 && winner && (
              <Grow in timeout={1000}>
                <Box textAlign="center">
                  <Typography variant="h3" gutterBottom sx={{ mb: 3 }}>
                    🏆 Winner Selected! 🏆
                  </Typography>
                  <WinnerCard sx={{ p: 4, maxWidth: 500, mx: "auto" }}>
                    <CardContent>
                      <Avatar
                        src={winner.user.profile_image}
                        alt={winner.user.name}
                        sx={{ width: 120, height: 120, mx: "auto", mb: 2 }}
                      />
                      <Typography variant="h4" gutterBottom>
                        {winner.user.name}
                      </Typography>
                      <Typography variant="h6" sx={{ opacity: 0.9 }}>
                        @{winner.user.nickname}
                      </Typography>
                      <Box sx={{ mt: 2, display: "flex", justifyContent: "center", gap: 1 }}>
                        <Chip label={`${winner.entries} entries`} variant="outlined" sx={{ color: "white", borderColor: "white" }} />
                        <Chip label={`GitHub: ${winner.user.github}`} variant="outlined" sx={{ color: "white", borderColor: "white" }} />
                      </Box>
                    </CardContent>
                  </WinnerCard>
                </Box>
              </Grow>
            )}

            {currentStage === 3 && winner && (
              <Zoom in timeout={1000}>
                <Box textAlign="center">
                  <Celebration sx={{ fontSize: 100, mb: 2, color: "#FFD700" }} />
                  <Typography variant="h2" gutterBottom sx={{ fontWeight: "bold" }}>
                    🎉 CONGRATULATIONS! 🎉
                  </Typography>
                  <Typography variant="h4" sx={{ mb: 2 }}>
                    {winner.user.name}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.8 }}>
                    You have won the giveaway!
                  </Typography>
                  <Box sx={{ mt: 4 }}>
                    <Button
                      variant="contained"
                      size="large"
                      onClick={handleClose}
                      sx={{
                        background: "rgba(255,255,255,0.2)",
                        color: "white",
                        "&:hover": {
                          background: "rgba(255,255,255,0.3)",
                        },
                      }}
                    >
                      Close Celebration
                    </Button>
                  </Box>
                </Box>
              </Zoom>
            )}
          </StageContainer>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default DramaticGiveawaySelector;