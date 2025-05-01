import React from "react";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Box,
  Skeleton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";
import Image from "next/image";
import AddIcon from "@mui/icons-material/Add";

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

const TeamChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const EmptyStateContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: theme.spacing(4),
  textAlign: "center",
}));

const NonprofitList = ({ nonprofits, teams, eventId }) => {
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

  // TODO: Logic is complex and we're not showing teams right now anyway
  const getTeamsForNonprofit = (problem_statements) => {
    return teams?.filter((team) => team.problem_statements.includes(problem_statements)  ) || [];
  };

  return (
    <ListContainer elevation={2}>
      <Typography 
        variant="h2" 
        component="h2" 
        gutterBottom 
        id="nonprofit-section-heading"
        sx={{ 
          fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
          fontWeight: 600,
          letterSpacing: '-0.015em',
          marginBottom: 2
        }}
      >
        Participating Nonprofits
      </Typography>
      <Grid container spacing={3}>
        {nonprofits.map((nonprofit) => (
          <Grid item xs={12} sm={6} md={4} key={nonprofit.id}>
            <NonprofitCard>
              <ImageContainer>
                {nonprofit.image ? (
                  <Image
                    src={nonprofit.image || "/npo_placeholder.png"}
                    alt={`${nonprofit.name} logo or image`}
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                    style={{ 
                      objectFit: 'cover',
                    }}
                    priority={false}
                    loading="lazy"
                  />
                ) : (
                  <Image
                    src="/npo_placeholder.png"
                    alt="Nonprofit placeholder image"
                    fill
                    sizes="(max-width: 600px) 100vw, (max-width: 960px) 50vw, 33vw"
                    style={{ 
                      objectFit: 'cover',
                    }}
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
                    fontSize: { xs: '1.25rem', sm: '1.35rem' },
                    fontWeight: 600,
                    lineHeight: 1.3,
                    marginBottom: 1
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
                aria-label={`Learn more about ${nonprofit.name}`}
              >
                Learn More
              </Button>
            </NonprofitCard>
          </Grid>
        ))}
      </Grid>
    </ListContainer>
  );
};

export default NonprofitList;
