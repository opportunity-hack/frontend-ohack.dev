import React, { useState, useEffect } from "react";
import { Box, Typography, keyframes } from "@mui/material";
import { styled } from "@mui/system";

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const TimerContainer = styled(Box)(({ theme }) => ({
  position: "relative",
  width: "200px",
  height: "200px",
  margin: "20px auto",
  animation: `${pulse} 2s infinite ease-in-out`,
}));

const CircularProgress = styled("div")(({ theme, percentage }) => ({
  position: "absolute",
  height: "100%",
  width: "100%",
  borderRadius: "50%",
  background: `conic-gradient(
    ${theme.palette.primary.main} ${percentage}%,
    ${theme.palette.grey[300]} ${percentage}%
  )`,
  transition: "all 0.5s ease",
}));

const InnerCircle = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "10%",
  left: "10%",
  right: "10%",
  bottom: "10%",
  borderRadius: "50%",
  background: theme.palette.background.paper,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexDirection: "column",
}));

const FunVolunteerTimer = ({ timeLeft, totalTime }) => {
  const [percentage, setPercentage] = useState(100);

  useEffect(() => {
    setPercentage((timeLeft / totalTime) * 100);
  }, [timeLeft, totalTime]);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <TimerContainer>
      <CircularProgress percentage={percentage} />
      <InnerCircle>
        <Typography variant="h4" color="primary" fontWeight="bold">
          {formatTime(timeLeft)}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Time Left
        </Typography>
      </InnerCircle>
    </TimerContainer>
  );
};

export default FunVolunteerTimer;
