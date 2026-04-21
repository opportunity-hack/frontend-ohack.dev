import React, { useEffect } from "react";
import {
  Typography,
  Grid,
  Button,
  Paper,
  Box,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Container,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Head from "next/head";
import Image from "next/image";
import { InstagramEmbed } from "react-social-media-embed";
import LoginOrRegister from "../../LoginOrRegister/LoginOrRegister";
import RewardStructure from "./RewardStructure";
import Link from "next/link";
import {
  FaGavel,
  FaChalkboardTeacher,
  FaHeart,
  FaTrophy,
  FaCode,
  FaClipboardList,
  FaFileAlt,
  FaDraftingCompass,
  FaCheckCircle,
  FaEye,
  FaUsers,
  FaBolt,
  FaRocket,
  FaStar,
  FaArrowRight,
} from "react-icons/fa";
import { initFacebookPixel, trackEvent } from "../../../lib/ga";
import { TIERS } from "../../../lib/heartTiers";

const track = (label) => trackEvent("click_hearts", label);

// ─── How-it-works steps ───────────────────────────────────────────────
const steps = [
  {
    icon: <FaClipboardList />,
    title: "Choose a project",
    text: "Browse open-source projects for nonprofits and pick one that matches your skills.",
  },
  {
    icon: <FaCode />,
    title: "Contribute",
    text: "Write code, design interfaces, gather requirements, or manage tasks — every role counts.",
  },
  {
    icon: <FaHeart />,
    title: "Earn hearts",
    text: "The more impactful your contribution, the more hearts you earn per category.",
  },
  {
    icon: <FaTrophy />,
    title: "Level up",
    text: "Advance from Bronze to Diamond, unlocking rewards and recognition along the way.",
  },
];

// ─── Contribution categories ──────────────────────────────────────────
const contributions = {
  what: [
    { icon: <FaRocket size={18} />, label: "Productionalized projects" },
    { icon: <FaUsers size={18} />, label: "Requirements gathering" },
    { icon: <FaFileAlt size={18} />, label: "Documentation" },
    { icon: <FaDraftingCompass size={18} />, label: "Design architecture" },
    { icon: <FaCheckCircle size={18} />, label: "Code quality" },
    { icon: <FaCode size={18} />, label: "Unit tests" },
    { icon: <FaEye size={18} />, label: "Observability" },
  ],
  how: [
    { icon: <FaClipboardList size={18} />, label: "Standups completed" },
    { icon: <FaBolt size={18} />, label: "Code reliability" },
    { icon: <FaUsers size={18} />, label: "Customer-driven innovation & design thinking" },
    { icon: <FaRocket size={18} />, label: "Iterations pushed to production" },
  ],
};

// ─── Scoring guide (accordions) ───────────────────────────────────────
const scoringLevels = [
  {
    hearts: "0.5",
    title: "Partially met goal",
    what: "Partial completion of tasks — code complete but not in production, partial docs, <50% architecture coverage, lint warnings or outstanding PRs, some unit tests, <50% observability.",
    how: "At least 1 standup, code has errors or is slow, spoke to customer once, pushed code once.",
  },
  {
    hearts: "1",
    title: "Met goal",
    what: "More than 90% completion across all categories.",
    how: "3+ standups, reliable error-free code, 3+ customer interactions with documentation, 3+ production pushes.",
  },
  {
    hearts: "1.5",
    title: "Exceeded goal",
    what: "100%+ completion, delivered 25% faster than expected.",
    how: "8 standups, fault-tolerant reliable code over 1 week, 8 customer interactions, 8 production pushes.",
  },
  {
    hearts: "2",
    title: "Greatly exceeded goal",
    what: "100%+ completion, delivered 50% faster than expected.",
    how: "15+ standups, outstanding reliability over 2 weeks, 15+ customer interactions, 15+ production pushes.",
  },
];

// ─── Section wrapper ──────────────────────────────────────────────────
const Section = ({ children, sx, ...props }) => (
  <Box sx={{ mb: { xs: 5, md: 7 }, ...sx }} {...props}>
    {children}
  </Box>
);

const SectionTitle = ({ children, subtitle }) => (
  <Box sx={{ mb: 3 }}>
    <Typography
      variant="h4"
      component="h2"
      sx={{ fontWeight: 700, fontSize: { xs: "1.6rem", md: "2.15rem" }, mb: subtitle ? 1.5 : 0 }}
    >
      {children}
    </Typography>
    {subtitle && (
      <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 720, fontSize: { xs: "1rem", md: "1.1rem" }, lineHeight: 1.7 }}>
        {subtitle}
      </Typography>
    )}
  </Box>
);

// ═════════════════════════════════════════════════════════════════════════
const Hearts = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    initFacebookPixel();
  }, []);

  return (
    <Box sx={{ pt: { xs: 10, md: 12 }, pb: 8, backgroundColor: "#fff" }}>
      <Head>
        <title>Earn Hearts, Make Impact: The Opportunity Hack Rewards System</title>
        <meta
          name="description"
          content="Join Opportunity Hack and earn hearts by contributing to open source projects for nonprofits around the world."
        />
      </Head>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #fce4ec 0%, #fff3e0 50%, #e8f5e9 100%)",
          py: { xs: 5, md: 8 },
          px: 2,
          textAlign: "center",
          mb: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="md">
          <FaHeart size={40} color="#e53935" />
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "2rem", md: "3rem" },
              mt: 2,
              mb: 2,
            }}
          >
            The Hearts System
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{
              color: "text.secondary",
              fontWeight: 400,
              maxWidth: 640,
              mx: "auto",
              lineHeight: 1.7,
              mb: 3,
            }}
          >
            Contribute your skills to open-source projects for nonprofits, earn
            hearts, and advance through five tiers of recognition — from Bronze to
            Diamond.
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/community-champions" passHref>
              <Button
                variant="contained"
                size="large"
                startIcon={<FaTrophy />}
                onClick={() => track("community_champions")}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
              >
                See Community Champions
              </Button>
            </Link>
            <Link href="/about/completion" passHref>
              <Button
                variant="outlined"
                size="large"
                onClick={() => track("project_completion")}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
              >
                Project Completion Guide
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* ── How it works ──────────────────────────────────────── */}
        <Section>
          <SectionTitle subtitle="Four steps from newcomer to community champion.">
            How the Hearts System Works
          </SectionTitle>

          <Grid container spacing={2.5}>
            {steps.map((step, i) => (
              <Grid size={{ xs: 6, md: 3 }} key={i}>
                <Paper
                  elevation={0}
                  sx={{
                    p: { xs: 2, md: 3 },
                    height: "100%",
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    textAlign: "center",
                    transition: "box-shadow 0.2s",
                    "&:hover": { boxShadow: "0 4px 20px rgba(0,0,0,0.06)" },
                  }}
                >
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: "50%",
                      background: `linear-gradient(135deg, ${theme.palette.primary.light}30, ${theme.palette.secondary.light}30)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 1.5,
                      fontSize: 20,
                      color: theme.palette.primary.main,
                    }}
                  >
                    {step.icon}
                  </Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5, fontSize: { xs: "0.95rem", md: "1.05rem" } }}>
                    {i + 1}. {step.title}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", fontSize: { xs: "0.9rem", md: "0.95rem" } }}>
                    {step.text}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* ── Earn hearts as Judge / Mentor ──────────────────────── */}
        <Section>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, md: 4 },
              borderRadius: 3,
              background: "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
              border: "1px solid #e1bee7",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, fontSize: { xs: "1.3rem", md: "1.5rem" } }}>
              Earn Hearts as a Judge or Mentor
            </Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mb: 3, fontSize: { xs: "1rem", md: "1.1rem" } }}>
              Beyond hacking, you can earn 1 heart per 3-hour block by judging
              or mentoring at an event.
            </Typography>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <FaGavel size={22} color={theme.palette.primary.main} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Judging
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                      1 heart per 3-hour block
                    </Typography>
                  </Box>
                </Box>
                <Link href="/about/judges" passHref>
                  <Button
                    variant="contained"
                    startIcon={<FaArrowRight />}
                    onClick={() => track("judges")}
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                  >
                    Learn About Judging
                  </Button>
                </Link>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: "rgba(255,255,255,0.7)",
                  }}
                >
                  <FaChalkboardTeacher size={22} color={theme.palette.secondary.main} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      Mentoring
                    </Typography>
                    <Typography variant="body1" sx={{ color: "text.secondary" }}>
                      1 heart per 3-hour block
                    </Typography>
                  </Box>
                </Box>
                <Link href="/about/mentors" passHref>
                  <Button
                    variant="contained"
                    color="secondary"
                    startIcon={<FaArrowRight />}
                    onClick={() => track("mentors")}
                    sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
                  >
                    Learn About Mentoring
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </Paper>
        </Section>

        {/* ── Contribution categories ───────────────────────────── */}
        <Section>
          <SectionTitle subtitle="Hearts are awarded across two dimensions — what you build and how you build it.">
            Types of Contributions
          </SectionTitle>

          <Grid container spacing={3}>
            {[
              { key: "what", label: "What You Build", color: theme.palette.primary.main },
              { key: "how", label: "How You Build It", color: theme.palette.secondary.main },
            ].map(({ key, label, color }) => (
              <Grid size={{ xs: 12, md: 6 }} key={key}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    height: "100%",
                  }}
                >
                  <Chip
                    label={label}
                    size="small"
                    sx={{
                      mb: 2,
                      fontWeight: 700,
                      backgroundColor: `${color}15`,
                      color: color,
                    }}
                  />
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                    {contributions[key].map((item) => (
                      <Box
                        key={item.label}
                        sx={{ display: "flex", alignItems: "center", gap: 1.5 }}
                      >
                        <Box sx={{ color: color, flexShrink: 0 }}>{item.icon}</Box>
                        <Typography variant="body1" sx={{ fontSize: { xs: "0.95rem", md: "1rem" } }}>{item.label}</Typography>
                      </Box>
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* ── Tier & reward structure ───────────────────────────── */}
        <Section>
          <SectionTitle subtitle="Advance through five tiers as you accumulate hearts — each unlocking new rewards and community recognition.">
            Tier &amp; Reward Structure
          </SectionTitle>

          {/* Tier journey — visual timeline */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              gap: { xs: 2, md: 0 },
              mb: 4,
              position: "relative",
            }}
          >
            {/* Desktop connecting line */}
            <Box
              sx={{
                display: { xs: "none", md: "block" },
                position: "absolute",
                top: 32,
                left: "5%",
                right: "5%",
                height: 3,
                background: `linear-gradient(90deg, ${TIERS[0].color}, ${TIERS[1].color}, ${TIERS[2].color}, ${TIERS[3].color}, ${TIERS[4].color})`,
                borderRadius: 2,
                zIndex: 0,
              }}
            />
            {TIERS.map((tier, i) => (
              <Box
                key={tier.name}
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                  zIndex: 1,
                }}
              >
                {/* Tier circle */}
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: tier.color,
                    border: tier.name === "Diamond" ? "2px solid #90caf9" : "3px solid #fff",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mb: 1.5,
                  }}
                >
                  <FaTrophy
                    size={24}
                    color={
                      tier.name === "Gold" || tier.name === "Platinum" || tier.name === "Diamond"
                        ? "#333"
                        : "#fff"
                    }
                  />
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.25, fontSize: { xs: "1rem", md: "1.1rem" } }}>
                  {tier.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, fontSize: { xs: "0.85rem", md: "0.9rem" } }}>
                  {tier.minHearts}+ hearts
                </Typography>
                {/* Rewards under each tier */}
                <Box sx={{ textAlign: "center" }}>
                  {tier.rewards.map((r) => (
                    <Typography
                      key={r.hearts}
                      variant="body2"
                      sx={{
                        display: "block",
                        color: "text.secondary",
                        lineHeight: 1.6,
                        fontSize: { xs: "0.85rem", md: "0.9rem" },
                      }}
                    >
                      {r.reward}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>

          <Box sx={{ textAlign: "center" }}>
            <Link href="/community-champions" passHref>
              <Button
                variant="outlined"
                startIcon={<FaStar />}
                onClick={() => track("community_champions_tier")}
                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 2 }}
              >
                See Our Community Champions
              </Button>
            </Link>
          </Box>
        </Section>

        {/* ── Scoring guide ─────────────────────────────────────── */}
        <Section>
          <SectionTitle subtitle="Each contribution is scored on a 0.5–2 heart scale per category. Here's what each level looks like.">
            Scoring Guide
          </SectionTitle>

          <Grid container spacing={2}>
            {scoringLevels.map((level) => (
              <Grid size={{ xs: 12, sm: 6 }} key={level.hearts}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "grey.200",
                    height: "100%",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
                    <Chip
                      icon={<FaHeart size={12} />}
                      label={`${level.hearts} heart${level.hearts !== "1" ? "s" : ""}`}
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        backgroundColor: "#fce4ec",
                        color: "#c62828",
                        "& .MuiChip-icon": { color: "#e53935" },
                      }}
                    />
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, fontSize: { xs: "1rem", md: "1.05rem" } }}>
                      {level.title}
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 1, fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}>
                    <strong>What:</strong> {level.what}
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.secondary", fontSize: { xs: "0.95rem", md: "1rem" }, lineHeight: 1.6 }}>
                    <strong>How:</strong> {level.how}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Section>

        {/* ── Detailed reward structure ──────────────────────────── */}
        <Section>
          <RewardStructure />
        </Section>

        <Divider sx={{ mb: 6 }} />

        {/* ── Certificate + Social proof ─────────────────────────── */}
        <Section>
          <SectionTitle>Recognition in Action</SectionTitle>
          <Grid container spacing={4} alignItems="stretch">
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "grey.200",
                  textAlign: "center",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Image
                  src="https://cdn.ohack.dev//certificates/certificate_4186886b2aca11a005b826c8e878e904e1e8224857771c21c12e05d83bbbe9e5.png"
                  width={400}
                  height={300}
                  alt="Opportunity Hack Hearts Certificate Example"
                  style={{ maxWidth: "100%", height: "auto", borderRadius: 8 }}
                />
                <Typography variant="body2" sx={{ display: "block", mt: 1.5, color: "text.secondary" }}>
                  Example Hearts Certificate — earned at the Bronze tier
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  border: "1px solid",
                  borderColor: "grey.200",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ position: "relative", flex: 1, minHeight: 280 }}>
                  <Image
                    src="https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp"
                    fill
                    alt="Volunteers collaborating at Opportunity Hack 2024 hackathon"
                    style={{ objectFit: "cover" }}
                  />
                </Box>
                <Typography variant="body2" sx={{ p: 2, color: "text.secondary", textAlign: "center" }}>
                  Volunteers earning hearts at Opportunity Hack 2024
                </Typography>
              </Paper>
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <Box sx={{ minHeight: 480, maxWidth: 400, mx: "auto" }}>
                <InstagramEmbed
                  url="https://www.instagram.com/p/CoupvGxuiLX/"
                  maxWidth={400}
                  height={480}
                />
              </Box>
            </Grid>
          </Grid>
        </Section>

        {/* ── Reference links ───────────────────────────────────── */}
        <Section>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", justifyContent: "center" }}>
            <Button
              variant="text"
              size="small"
              href="https://docs.google.com/document/d/1J-1o5YOpdt4slyd_PxitNN0gZe7UcI1GjyTbhTem2qU/edit?usp=sharing"
              target="_blank"
              onClick={() => track("original_rfc")}
              sx={{ textTransform: "none" }}
            >
              Original RFC
            </Button>
            <Button
              variant="text"
              size="small"
              href="https://github.com/opportunity-hack/frontend-ohack.dev/issues/8"
              target="_blank"
              onClick={() => track("github_issue_8")}
              sx={{ textTransform: "none" }}
            >
              GitHub Issue #8
            </Button>
            <Button
              variant="text"
              size="small"
              href="https://github.com/opportunity-hack/frontend-ohack.dev/issues/7"
              target="_blank"
              onClick={() => track("github_issue_7")}
              sx={{ textTransform: "none" }}
            >
              GitHub Issue #7
            </Button>
          </Box>
        </Section>

        {/* ── CTA ───────────────────────────────────────────────── */}
        <Box
          sx={{
            textAlign: "center",
            p: { xs: 4, md: 6 },
            borderRadius: 4,
            background: "linear-gradient(135deg, #e8f5e9 0%, #e3f2fd 100%)",
          }}
        >
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, fontSize: { xs: "1.6rem", md: "2.15rem" } }}>
            Ready to Start Earning Hearts?
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 520, mx: "auto", mb: 3, fontSize: { xs: "1rem", md: "1.1rem" } }}
          >
            Join Opportunity Hack and contribute your skills to meaningful
            projects that help nonprofits around the world.
          </Typography>
          <LoginOrRegister introText="Ready to join us?" previousPage="/about/hearts" />
        </Box>
      </Container>
    </Box>
  );
};

export default Hearts;
