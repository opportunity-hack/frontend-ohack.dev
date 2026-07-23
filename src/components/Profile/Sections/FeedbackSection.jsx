import React, { memo } from "react";
import PropTypes from "prop-types";
import { Box, Typography, Rating, Button, Stack } from "@mui/material";
import { styled } from "@mui/material/styles";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FeedbackIcon from "@mui/icons-material/Feedback";
import Link from "next/link";

const HEART_COLOR = "#ff6d75";
const MAX_HEARTS = 10;

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconFilled": { color: HEART_COLOR },
  [theme.breakpoints.down("sm")]: {
    "& .MuiRating-icon": { fontSize: "1.2rem" },
  },
}));

const WHAT_ITEMS = [
  ["productionalized_projects", "Productionalized projects", "Projects that have been operationalized."],
  ["requirements_gathering", "Requirements gathering", "Worked with nonprofits to capture what they need."],
  ["documentation", "Documentation", "Wrote docs for developers and nonprofits."],
  ["design_architecture", "Design architecture", "Diagrams: sequence, deployment, ERD, etc."],
  ["code_quality", "Code quality"],
  ["unit_test_writing", "Unit test writing"],
  ["unit_test_coverage", "Unit test coverage"],
  ["observability", "Observability", "Added monitoring (USE, RED) to software."],
  ["judge", "Judging", "Judged other people's work."],
  ["mentor", "Mentoring", "Mentored other people."],
];

const HOW_ITEMS = [
  ["standups_completed", "Standups completed", "Provided updates and communicated to the team."],
  ["code_reliability", "Code reliability", "Code doesn't crash and stays available."],
  [
    "customer_driven_innovation_and_design_thinking",
    "Customer-driven innovation",
    "Conversations with customers to drive product decisions.",
  ],
  ["iterations_of_code_pushed_to_production", "Production iterations", "Iterated on the final product."],
];

function RatingItem({ label, description, value }) {
  return (
    <Box
      sx={{
        py: 1.5,
        "&:not(:last-child)": {
          borderBottom: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, wordBreak: "break-word" }}>
            {label}
          </Typography>
          {description && (
            <Typography variant="caption" color="text.secondary">
              {description}
            </Typography>
          )}
        </Box>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 700,
            color: value > 0 ? HEART_COLOR : "text.disabled",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          {value}/{MAX_HEARTS}
        </Typography>
      </Box>
      <Box sx={{ mt: 0.5 }}>
        <StyledRating
          readOnly
          value={value}
          precision={0.5}
          max={MAX_HEARTS}
          icon={<FavoriteIcon fontSize="inherit" />}
          emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
        />
      </Box>
    </Box>
  );
}

RatingItem.propTypes = {
  label: PropTypes.string.isRequired,
  description: PropTypes.string,
  value: PropTypes.number.isRequired,
};

function RatingGroup({ title, subtitle, items, source }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          {subtitle}
        </Typography>
      )}
      <Box sx={{ px: { xs: 0, sm: 2 } }}>
        {items.map(([key, label, description]) => (
          <RatingItem
            key={key}
            label={label}
            description={description}
            value={Number(source?.[key]) || 0}
          />
        ))}
      </Box>
    </Box>
  );
}

RatingGroup.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  items: PropTypes.array.isRequired,
  source: PropTypes.object,
};

function FeedbackSection({
  history,
  feedbackUrl,
  userName,
  showWhat = true,
  showHow = true,
  showCta = true,
  ctaLabel,
}) {
  const what = history?.what || {};
  const how = history?.how || {};

  if (!showWhat && !showHow) return null;

  return (
    <Stack spacing={3}>
      {showWhat && (
        <RatingGroup
          title="What"
          subtitle={
            userName
              ? `What ${userName} has completed for nonprofits.`
              : "What you've completed for nonprofits."
          }
          items={WHAT_ITEMS}
          source={what}
        />
      )}
      {showHow && (
        <RatingGroup
          title="How"
          subtitle={userName ? `How ${userName} went about it.` : "How you went about it."}
          items={HOW_ITEMS}
          source={how}
        />
      )}
      {showCta && feedbackUrl && (
        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Button
            variant="contained"
            startIcon={<FeedbackIcon />}
            component={Link}
            href={feedbackUrl}
          >
            {ctaLabel || (userName ? `Send feedback to ${userName}` : "Send feedback")}
          </Button>
        </Box>
      )}
    </Stack>
  );
}

FeedbackSection.propTypes = {
  history: PropTypes.object,
  feedbackUrl: PropTypes.string,
  userName: PropTypes.string,
  showWhat: PropTypes.bool,
  showHow: PropTypes.bool,
  showCta: PropTypes.bool,
  ctaLabel: PropTypes.string,
};

export default memo(FeedbackSection);
