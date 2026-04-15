import React, { useState } from "react";
import {
  Typography,
  Paper,
  Grid,
  Box,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";
import NextLink from "next/link";
import Link from "@mui/material/Link";
import { FaHeart, FaArrowRight } from "react-icons/fa";

const rewardStructure = [
  {
    hearts: 0.5,
    title: "Partially met goal",
    what: [
      { primary: "Productionalized projects", secondary: "Code complete, but not pushed to production" },
      { primary: "Requirements gathering", secondary: "Requirements not fully collected" },
      { primary: "Documentation", secondary: "Documentation not fully completed" },
      { primary: "Design architecture", secondary: "Partial architecture — less than 50% of overall system" },
      { primary: "Code quality", secondary: "P0-level lint warnings, errors or security bugs, outstanding PR comments" },
      { primary: "Unit tests written", secondary: "Some unit tests improved" },
      { primary: "Unit test coverage", secondary: "Coverage less than 50%" },
      { primary: "Observability", secondary: "Less than 50% of the system instrumented with decent logging" },
    ],
    how: [
      { primary: "Standups completed", secondary: "Attended at least 1 standup" },
      { primary: "Code reliability", secondary: "Code not consistently reliable — errors, >10s load times, obvious bugs" },
      { primary: "Customer-driven innovation", secondary: "Spoke to customer at least once" },
      { primary: "Production pushes", secondary: "Pushed code to production at least once" },
    ],
  },
  {
    hearts: 1,
    title: "Met goal",
    what: [
      { primary: "All 0.5-heart criteria", secondary: "But with more than 90% completion" },
    ],
    how: [
      { primary: "Standups completed", secondary: "At least 3 standups" },
      { primary: "Code reliability", secondary: "Works without errors, loads under 10 seconds, no obvious bugs" },
      { primary: "Customer-driven innovation", secondary: "3+ customer interactions with documentation" },
      { primary: "Production pushes", secondary: "Pushed code at least 3 times" },
    ],
  },
  {
    hearts: 1.5,
    title: "Exceeded goal",
    what: [
      { primary: "100%+ completion", secondary: "Delivered 25% faster than expected" },
    ],
    how: [
      { primary: "Standups completed", secondary: "8 standups" },
      { primary: "Code reliability", secondary: "Fault tolerance, retries, caching — reliable over 1 week" },
      { primary: "Customer-driven innovation", secondary: "8 customer interactions" },
      { primary: "Production pushes", secondary: "8 pushes" },
    ],
  },
  {
    hearts: 2,
    title: "Greatly exceeded goal",
    what: [
      { primary: "100%+ completion", secondary: "Delivered 50% faster than expected" },
    ],
    how: [
      { primary: "Standups completed", secondary: "15+ standups" },
      { primary: "Code reliability", secondary: "Outstanding reliability over 2 weeks" },
      { primary: "Customer-driven innovation", secondary: "15+ customer interactions" },
      { primary: "Production pushes", secondary: "15+ pushes" },
    ],
  },
];

const heartColors = ["#ffcdd2", "#ef9a9a", "#ef5350", "#c62828"];

const RewardStructure = () => {
  const [activeTab, setActiveTab] = useState(0);
  const active = rewardStructure[activeTab];

  return (
    <Box>
      <Typography
        variant="h4"
        component="h2"
        sx={{ fontWeight: 700, fontSize: { xs: "1.6rem", md: "2.15rem" }, mb: 1.5 }}
      >
        Detailed Scoring Criteria
      </Typography>
      <Typography
        variant="body1"
        sx={{ color: "text.secondary", maxWidth: 720, mb: 1.5, fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.7 }}
      >
        These criteria are flexible guidelines, not rigid rules. Opportunity Hack
        retains discretion when awarding hearts — context, creativity, and
        real-world impact matter more than checking boxes.
      </Typography>
      <NextLink href="/about/completion" passHref>
        <Link
          color="primary"
          underline="hover"
          sx={{ display: "inline-flex", alignItems: "center", gap: 0.5, fontWeight: 600, fontSize: "1rem", mb: 3 }}
        >
          Read more about project completion <FaArrowRight size={12} />
        </Link>
      </NextLink>

      {/* Tab selector */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: "1px solid",
          borderColor: "grey.200",
          overflow: "hidden",
          mt: 2,
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            borderBottom: "1px solid",
            borderColor: "grey.200",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: { xs: "0.85rem", md: "1rem" },
              py: 2,
            },
          }}
        >
          {rewardStructure.map((level, i) => (
            <Tab
              key={level.hearts}
              label={
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                  <FaHeart size={12} color={heartColors[i]} />
                  {level.hearts} {level.hearts === 1 ? "heart" : "hearts"}
                </Box>
              }
            />
          ))}
        </Tabs>

        {/* Active tab content */}
        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
            <Chip
              icon={<FaHeart size={12} />}
              label={`${active.hearts} ${active.hearts === 1 ? "heart" : "hearts"} per category`}
              sx={{
                fontWeight: 700,
                fontSize: "0.9rem",
                height: 32,
                backgroundColor: heartColors[activeTab] + "30",
                color: "#b71c1c",
                "& .MuiChip-icon": { color: heartColors[activeTab] },
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: { xs: "1.1rem", md: "1.25rem" } }}>
              {active.title}
            </Typography>
          </Box>

          <Grid container spacing={3}>
            {/* What column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 2, color: "primary.main", fontSize: "1.05rem" }}
              >
                What You Build
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {active.what.map((item, idx) => (
                  <Box key={idx}>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: "0.95rem", md: "1rem" } }}>
                      {item.primary}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", fontSize: { xs: "0.9rem", md: "0.95rem" }, lineHeight: 1.6 }}>
                      {item.secondary}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>

            {/* How column */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 700, mb: 2, color: "secondary.main", fontSize: "1.05rem" }}
              >
                How You Build It
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {active.how.map((item, idx) => (
                  <Box key={idx}>
                    <Typography variant="body1" sx={{ fontWeight: 600, fontSize: { xs: "0.95rem", md: "1rem" } }}>
                      {item.primary}
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary", fontSize: { xs: "0.9rem", md: "0.95rem" }, lineHeight: 1.6 }}>
                      {item.secondary}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
};

export default RewardStructure;
