import React, { useMemo } from "react";
import {
  Typography,
  Box,
  Link,
  Button,
  useTheme,
  useMediaQuery,
  LinearProgress,
  Chip,
  Paper,
  Grid,
  Divider,
} from "@mui/material";
import {
  FaHeart,
  FaInfoCircle,
  FaCheck,
  FaTrophy,
  FaStar,
  FaGift,
} from "react-icons/fa";

const rewards = [
  { hearts: 2, reward: "Certificate", tier: "Bronze", color: "#CD7F32" },
  { hearts: 4, reward: "IG/FB Shoutout", tier: "Bronze", color: "#CD7F32" },
  {
    hearts: 5,
    reward: "LinkedIn Recommendation",
    tier: "Silver",
    color: "#C0C0C0",
  },
  {
    hearts: 6,
    reward: "Interview prep & resume review",
    tier: "Silver",
    color: "#C0C0C0",
  },
  {
    hearts: 10,
    reward: "Reference for job application",
    tier: "Gold",
    color: "#FFD700",
  },
  {
    hearts: 24,
    reward: "Opportunity Hack swag",
    tier: "Platinum",
    color: "#E5E4E2",
  },
  {
    hearts: 48,
    reward: "Sponsor-provided tech award",
    tier: "Diamond",
    color: "#B9F2FF",
  },
];

const countHearts = (h) => {
  var total = 0;
  if (!h || !h.how || !h.what) {
    console.log("countHearts", "null history");
    return total;
  }

  for (const [key, value] of Object.entries(h.how)) {
    console.log("countHearts", key, value);
    total += value;
  }
  for (const [key, value] of Object.entries(h.what)) {
    total += value;
  }
  return total;
};

const MilestoneProgress = ({ history }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const hearts = useMemo(() => countHearts(history), [history]);

  // Find current tier and progress
  const achievedRewards = rewards.filter((r) => r.hearts <= hearts);
  const nextRewards = rewards.filter((r) => r.hearts > hearts);
  const currentTier =
    achievedRewards.length > 0
      ? achievedRewards[achievedRewards.length - 1]
      : null;
  const nextMilestone = nextRewards.length > 0 ? nextRewards[0] : null;

  // Calculate progress to next milestone
  const progressToNext = nextMilestone
    ? ((hearts - (currentTier?.hearts || 0)) /
        (nextMilestone.hearts - (currentTier?.hearts || 0))) *
      100
    : 100;

  // Group rewards by tier for better organization
  const tierGroups = rewards.reduce((acc, reward) => {
    if (!acc[reward.tier]) {
      acc[reward.tier] = [];
    }
    acc[reward.tier].push(reward);
    return acc;
  }, {});

  const tierOrder = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];

  return (
    <Paper
      elevation={2}
      sx={{
        p: 3,
        borderRadius: 2,
        background: `linear-gradient(135deg, ${theme.palette.primary.light}15 0%, ${theme.palette.secondary.light}15 100%)`,
        border: `1px solid ${theme.palette.divider}`,
        width: "100%",
        maxWidth: "600px",
      }}
    >
      {/* Header with current hearts */}
      <Box sx={{ textAlign: "center", mb: 3 }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{ fontWeight: 600, color: theme.palette.primary.main }}
        >
          <FaHeart color="red" style={{ marginRight: "8px" }} />
          Heart Progress
        </Typography>
        <Typography
          variant="h2"
          sx={{ fontWeight: 700, color: theme.palette.text.primary }}
        >
          {hearts}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Total Hearts Earned
        </Typography>
      </Box>

      {/* Current Status */}
      <Box sx={{ mb: 3 }}>
        {currentTier ? (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Chip
              icon={<FaTrophy />}
              label={`${currentTier.tier} Member`}
              sx={{
                backgroundColor: currentTier.color + "30",
                color: theme.palette.text.primary,
                fontWeight: "bold",
                fontSize: "1rem",
                px: 2,
                py: 1,
              }}
            />
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              Latest Achievement: {currentTier.reward}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", mb: 2 }}>
            <Typography variant="h6" color="text.secondary">
              Start your journey to earn your first milestone!
            </Typography>
          </Box>
        )}

        {/* Progress to next milestone */}
        {nextMilestone && (
          <Box sx={{ mb: 2 }}>
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
            >
              <Typography variant="body2" fontWeight="medium">
                Progress to {nextMilestone.tier}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {hearts} / {nextMilestone.hearts} hearts
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(progressToNext, 100)}
              sx={{
                height: 8,
                borderRadius: 1,
                backgroundColor: theme.palette.grey[200],
                "& .MuiLinearProgress-bar": {
                  background: `linear-gradient(90deg, ${nextMilestone.color}80, ${nextMilestone.color})`,
                },
              }}
            />
            <Typography
              variant="body2"
              sx={{ mt: 1, textAlign: "center", color: "text.secondary" }}
            >
              Next reward: {nextMilestone.reward}
            </Typography>
          </Box>
        )}
      </Box>

      <Divider sx={{ my: 2 }} />

      {/* Milestone Timeline */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 500, mb: 2 }}>
          Milestone Journey
        </Typography>

        <Grid container spacing={1}>
          {tierOrder.map((tier) => {
            const tierRewards = tierGroups[tier] || [];
            const tierColor = tierRewards[0]?.color || theme.palette.grey[400];
            const isAchieved = tierRewards.some((r) => r.hearts <= hearts);
            const isCurrentTier = currentTier?.tier === tier;

            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={tier}>
                <Box
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    border: `2px solid ${isCurrentTier ? tierColor : theme.palette.grey[300]}`,
                    backgroundColor: isAchieved
                      ? `${tierColor}20`
                      : theme.palette.grey[50],
                    position: "relative",
                    opacity: isAchieved || isCurrentTier ? 1 : 0.7,
                    transition: "all 0.3s ease",
                  }}
                >
                  {isAchieved && (
                    <FaCheck
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        color: tierColor,
                        fontSize: "16px",
                      }}
                    />
                  )}

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: "bold",
                      color: isAchieved
                        ? tierColor
                        : theme.palette.text.secondary,
                      mb: 1,
                    }}
                  >
                    {tier}
                  </Typography>

                  {tierRewards.map((reward, index) => (
                    <Box key={reward.hearts} sx={{ mb: 0.5 }}>
                      <Typography
                        variant="caption"
                        sx={{
                          display: "block",
                          color:
                            reward.hearts <= hearts
                              ? theme.palette.text.primary
                              : theme.palette.text.secondary,
                          textDecoration:
                            reward.hearts <= hearts ? "none" : "none",
                          fontWeight:
                            reward.hearts <= hearts ? "medium" : "normal",
                        }}
                      >
                        {reward.hearts} ♥ {reward.reward}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Call to Action */}
      <Box sx={{ textAlign: "center" }}>
        {/* Show claim reward button if user has achieved any milestone */}
        {achievedRewards.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              startIcon={<FaGift />}
              href={`/contact?type=claim_reward&hearts=${hearts}`}
              sx={{
                fontWeight: "bold",
                px: 4,
                py: 1.5,
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1.1rem",
                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                "&:hover": {
                  background: `linear-gradient(135deg, ${theme.palette.primary.dark}, ${theme.palette.secondary.dark})`,
                },
              }}
            >
              Claim Your Rewards
            </Button>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              You've earned {achievedRewards.length} milestone
              {achievedRewards.length !== 1 ? "s" : ""}!
            </Typography>
          </Box>
        )}

        <Typography variant="body2" sx={{ mb: 2, color: "text.secondary" }}>
          Keep contributing to earn more hearts and unlock exclusive rewards!
        </Typography>
        <Link
          href="https://www.ohack.dev/about/hearts"
          target="_blank"
          rel="noopener noreferrer"
          sx={{
            display: "inline-flex",
            alignItems: "center",
            color: "primary.main",
            textDecoration: "none",
            "&:hover": { textDecoration: "underline" },
          }}
        >
          <FaInfoCircle style={{ marginRight: "5px" }} />
          Learn more about hearts and rewards
        </Link>
      </Box>
    </Paper>
  );
};

export default MilestoneProgress;
