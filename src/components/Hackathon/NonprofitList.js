import React, { useState, useEffect, useMemo } from "react";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";
import BusinessIcon from "@mui/icons-material/Business";
import AssignmentIcon from "@mui/icons-material/Assignment";
import axios from "axios";
import { normalizeImageUrl } from "../../lib/imageUtils";

const ListContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const NonprofitCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.15s ease-in-out",
  "&:hover": { transform: "scale3d(1.02, 1.02, 1)" },
}));

const ImageContainer = styled(Box)({
  position: "relative",
  width: "100%",
  paddingTop: "56.25%", // 16:9 aspect ratio
  overflow: "hidden",
});

const NonprofitContent = styled(CardContent)({
  flexGrow: 1,
});

const ProjectCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.15s ease-in-out",
  "&:hover": { transform: "scale3d(1.02, 1.02, 1)" },
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  textAlign: "center",
}));

const STATUS_COLORS = {
  production: "success",
  "post-hackathon": "info",
  hackathon: "warning",
  concept: "default",
  maintenance: "secondary",
};

const NonprofitList = ({ nonprofits, teams, eventId, visibleProblemStatements }) => {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("ohack_hackathon_view") || "nonprofits";
    }
    return "nonprofits";
  });
  const [projects, setProjects] = useState([]);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Collect all problem statement IDs from nonprofits, with nonprofit context
  const projectIdMap = useMemo(() => {
    const map = {};
    if (!nonprofits) return map;
    nonprofits.forEach((npo) => {
      (npo.problem_statements || []).forEach((psId) => {
        // If visibleProblemStatements is set, filter by it
        if (!visibleProblemStatements || visibleProblemStatements.includes(psId)) {
          map[psId] = { nonprofitId: npo.id, nonprofitName: npo.name };
        }
      });
    });
    return map;
  }, [nonprofits, visibleProblemStatements]);

  // Fetch project details when switching to projects view
  useEffect(() => {
    const projectIds = Object.keys(projectIdMap);
    if (viewMode !== "projects" || projectIds.length === 0) return;

    // Don't refetch if we already have data
    if (projects.length > 0) return;

    let cancelled = false;
    const fetchProjects = async () => {
      setProjectsLoading(true);
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/messages/problem_statements`
        );
        if (!cancelled && response.data?.problem_statements) {
          const relevant = response.data.problem_statements.filter(
            (ps) => projectIds.includes(ps.id)
          );
          setProjects(relevant);
        }
      } catch (err) {
        console.error("Error fetching projects for hackathon view:", err);
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    };
    fetchProjects();
    return () => { cancelled = true; };
  }, [viewMode, projectIdMap, projects.length]);

  const handleViewChange = (_, newView) => {
    if (newView) {
      setViewMode(newView);
      if (typeof window !== "undefined") {
        localStorage.setItem("ohack_hackathon_view", newView);
      }
    }
  };

  if (!nonprofits || nonprofits.length === 0) {
    return (
      <ListContainer elevation={2}>
        <EmptyStateContainer>
          <Typography variant="h2" component="h2" gutterBottom>
            No Nonprofits Yet
          </Typography>
          <Typography variant="body1" paragraph>
            Be the first nonprofit to participate in this event!
          </Typography>
          <Button
            component={Link}
            href="/nonprofits/apply"
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            aria-label="Apply as a nonprofit organization"
          >
            Apply as a Nonprofit
          </Button>
        </EmptyStateContainer>
      </ListContainer>
    );
  }

  const renderNonprofitsView = () => (
    <Grid container spacing={3}>
      {nonprofits.map((nonprofit) => (
        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={nonprofit.id}>
          <NonprofitCard>
            <ImageContainer>
              {nonprofit.image ? (
                <Image
                  src={normalizeImageUrl(nonprofit.image) || "/npo_placeholder.png"}
                  alt={`${nonprofit.name} logo or image`}
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  priority={false}
                  loading="lazy"
                />
              ) : (
                <Image
                  src="/npo_placeholder.png"
                  alt="Nonprofit placeholder image"
                  fill
                  sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                  priority={false}
                  loading="lazy"
                />
              )}
            </ImageContainer>
            <NonprofitContent>
              <Typography
                gutterBottom
                variant="h3"
                component="h3"
                sx={{
                  fontSize: { xs: "1.25rem", sm: "1.35rem" },
                  fontWeight: 600,
                  lineHeight: 1.3,
                  marginBottom: 1,
                }}
              >
                {nonprofit.name}
              </Typography>
              <Typography variant="body1" color="textSecondary" component="p">
                {nonprofit.description?.length > 100
                  ? `${nonprofit.description.substring(0, 100)}...`
                  : nonprofit.description}
              </Typography>
            </NonprofitContent>
            <Button
              component={Link}
              href={`/nonprofit/${nonprofit.id}`}
              variant="contained"
              color="primary"
              fullWidth
              aria-label={`View ${nonprofit.name} projects and ways to help`}
            >
              View Projects & Ways to Help
            </Button>
          </NonprofitCard>
        </Grid>
      ))}
    </Grid>
  );

  const renderProjectsView = () => {
    if (projectsLoading) {
      return (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }

    if (projects.length === 0) {
      return (
        <Typography variant="body1" color="textSecondary" sx={{ p: 2 }}>
          No projects found for this hackathon.
        </Typography>
      );
    }

    return (
      <Grid container spacing={3}>
        {projects.map((project) => {
          const npoInfo = projectIdMap[project.id];
          return (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={project.id}>
              <ProjectCard>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={project.status || "unknown"}
                      size="small"
                      color={STATUS_COLORS[project.status] || "default"}
                    />
                    {npoInfo?.nonprofitName && (
                      <Chip
                        component={Link}
                        href={`/nonprofit/${npoInfo.nonprofitId}`}
                        label={npoInfo.nonprofitName}
                        size="small"
                        variant="outlined"
                        clickable
                      />
                    )}
                  </Box>
                  <Typography
                    gutterBottom
                    variant="h3"
                    component="h3"
                    sx={{
                      fontSize: { xs: "1.25rem", sm: "1.35rem" },
                      fontWeight: 600,
                      lineHeight: 1.3,
                      marginBottom: 1,
                    }}
                  >
                    {project.title}
                  </Typography>
                  <Typography variant="body1" color="textSecondary" component="p">
                    {project.description?.length > 150
                      ? `${project.description.substring(0, 150)}...`
                      : project.description}
                  </Typography>
                </CardContent>
                <Button
                  component={Link}
                  href={`/project/${project.id}`}
                  variant="contained"
                  color="primary"
                  fullWidth
                  aria-label={`View project: ${project.title}`}
                >
                  View Project Details
                </Button>
              </ProjectCard>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  return (
    <ListContainer elevation={2}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 1 }}>
        <Typography
          variant="h5"
          id="nonprofit-section-heading"
          fontWeight="bold"
        >
          Step 2. Choose your hackathon project
        </Typography>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewChange}
          size="small"
          aria-label="Switch between nonprofits and projects view"
        >
          <ToggleButton value="nonprofits" aria-label="View by nonprofit">
            <BusinessIcon sx={{ mr: 0.5 }} fontSize="small" />
            Nonprofits
          </ToggleButton>
          <ToggleButton value="projects" aria-label="View by project">
            <AssignmentIcon sx={{ mr: 0.5 }} fontSize="small" />
            Projects
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Typography variant="body2" color="textSecondary" paragraph>
        {viewMode === "nonprofits" ? (
          <strong>Browse by nonprofit organization. Click one to see their specific projects.</strong>
        ) : (
          <strong>Browse all projects directly. Each project shows which nonprofit it belongs to.</strong>
        )}
      </Typography>
      {viewMode === "nonprofits" ? renderNonprofitsView() : renderProjectsView()}
    </ListContainer>
  );
};

export default NonprofitList;
