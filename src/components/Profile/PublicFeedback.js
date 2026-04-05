import React from "react";
import { Box, Typography, Button, Rating } from "@mui/material";
import FeedbackIcon from "@mui/icons-material/Feedback";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { styled } from "@mui/material/styles";
import Link from "next/link";

const HEART_COLOR = "#ff6d75";
const MAX_HEARTS = 10;

const StyledRating = styled(Rating)(({ theme }) => ({
  "& .MuiRating-iconFilled": {
    color: HEART_COLOR,
  },
  [theme.breakpoints.down("sm")]: {
    "& .MuiRating-icon": {
      fontSize: "1.2rem",
    },
  },
}));

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
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography
            variant="body2"
            component="div"
            sx={{ fontWeight: "bold", wordBreak: "break-word" }}
          >
            {label}
          </Typography>
          {description && (
            <Typography
              variant="caption"
              component="div"
              color="text.secondary"
              sx={{ wordBreak: "break-word" }}
            >
              {description}
            </Typography>
          )}
        </Box>
        <Typography
          variant="body2"
          component="div"
          sx={{
            fontWeight: "bold",
            color: value > 0 ? HEART_COLOR : "text.disabled",
            whiteSpace: "nowrap",
            flexShrink: 0,
            pt: 0.25,
          }}
        >
          {value}/{MAX_HEARTS}
        </Typography>
      </Box>
      <Box sx={{ mt: 0.5 }}>
        <StyledRating
          readOnly
          value={value}
          getLabelText={(v) => `${v} Heart${v !== 1 ? "s" : ""}`}
          precision={0.5}
          max={MAX_HEARTS}
          icon={<FavoriteIcon fontSize="inherit" />}
          emptyIcon={<FavoriteBorderIcon fontSize="inherit" />}
        />
      </Box>
    </Box>
  );
}

export default function PublicFeedback({
  feedbackUrl,
  history,
  userName,
  privacySettings,
}) {
  const isPublic = (field) => privacySettings?.[field] === "public";

  const defaultWhat = {
    productionalized_projects: 0,
    requirements_gathering: 0,
    documentation: 0,
    design_architecture: 0,
    code_quality: 0,
    unit_test_writing: 0,
    unit_test_coverage: 0,
    observability: 0,
    judge: 0,
    mentor: 0,
  };

  const defaultHow = {
    standups_completed: 0,
    code_reliability: 0,
    customer_driven_innovation_and_design_thinking: 0,
    iterations_of_code_pushed_to_production: 0,
  };

  const whatData = history?.what || defaultWhat;
  const howData = history?.how || defaultHow;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* What section */}
      {isPublic("what") && (
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, fontSize: { xs: "1.1rem", sm: "1.25rem" }, mb: 0.5 }}
          >
            What
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            What they&apos;ve completed for nonprofits
          </Typography>
          <Box sx={{ px: { xs: 0, sm: 2 } }}>
            <RatingItem
              label="Productionalized Projects"
              description="The number of projects that have been operationalized."
              value={whatData.productionalized_projects}
            />
            <RatingItem
              label="Requirements Gathering"
              description="The number of projects where they gathered requirements."
              value={whatData.requirements_gathering}
            />
            <RatingItem
              label="Documentation"
              description="The number of projects with awesome documentation for developers and nonprofits."
              value={whatData.documentation}
            />
            <RatingItem
              label="Design Architecture"
              description="UML-like diagrams like: sequence, deployment, ERD, etc."
              value={whatData.design_architecture}
            />
            <RatingItem label="Code Quality" value={whatData.code_quality} />
            <RatingItem
              label="Unit Test Writing"
              value={whatData.unit_test_writing}
            />
            <RatingItem
              label="Unit Test Coverage"
              value={whatData.unit_test_coverage}
            />
            <RatingItem
              label="Observability"
              description="Added monitoring capabilities to software like USE and RED."
              value={whatData.observability}
            />
            <RatingItem
              label="Judge"
              description="Judged other people's work."
              value={whatData.judge}
            />
            <RatingItem
              label="Mentor"
              description="Mentored other people."
              value={whatData.mentor}
            />
          </Box>
        </Box>
      )}

      {/* How section */}
      {isPublic("how") && (
        <Box>
          <Typography
            variant="h6"
            component="h3"
            sx={{ fontWeight: 600, fontSize: { xs: "1.1rem", sm: "1.25rem" }, mb: 0.5 }}
          >
            How
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            How they went about it
          </Typography>
          <Box sx={{ px: { xs: 0, sm: 2 } }}>
            <RatingItem
              label="Standups Completed"
              description="Provided updates on work and communicated to their team."
              value={howData.standups_completed}
            />
            <RatingItem
              label="Code Reliability"
              description="The code doesn't crash and is available for people to use."
              value={howData.code_reliability}
            />
            <RatingItem
              label="Customer Driven Innovation (CDI) and Design Thinking"
              description="Consistent conversations with customers to get feedback on what's being built."
              value={howData.customer_driven_innovation_and_design_thinking}
            />
            <RatingItem
              label="Iterations of code pushed to production"
              description="Iterated on the final product."
              value={howData.iterations_of_code_pushed_to_production}
            />
          </Box>
        </Box>
      )}

      {/* Send feedback CTA */}
      <Box sx={{ textAlign: "center", mt: 1 }}>
        <Button
          variant="contained"
          startIcon={<FeedbackIcon />}
          component={Link}
          href={feedbackUrl}
        >
          Send Feedback to {userName || "User"}
        </Button>
      </Box>
    </Box>
  );
}
