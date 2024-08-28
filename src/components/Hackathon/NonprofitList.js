import React from "react";
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Button,
  Chip,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Link from "next/link";

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
  "&:hover": { transform: "scale3d(1.05, 1.05, 1)" },
}));

const NonprofitMedia = styled(CardMedia)({
  paddingTop: "56.25%", // 16:9 aspect ratio
});

const NonprofitContent = styled(CardContent)({
  flexGrow: 1,
});

const TeamChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

const NonprofitList = ({ nonprofits, teams, eventId }) => {
  if (!nonprofits || nonprofits.length === 0) {
    return null;
  }

  const getTeamsForNonprofit = (nonprofitId) => {
    return teams?.filter((team) => team.nonprofit_id === nonprofitId) || [];
  };

  return (
    <ListContainer elevation={2}>
      <Typography variant="h5" gutterBottom>
        Participating Nonprofits
      </Typography>
      <Grid container spacing={3}>
        {nonprofits.map((nonprofit) => (
          <Grid item xs={12} sm={6} md={4} key={nonprofit.id}>
            <NonprofitCard>
              <NonprofitMedia
                image={
                  nonprofit.logo_url ||
                  "https://via.placeholder.com/300x200?text=No+Image"
                }
                title={nonprofit.name}
              />
              <NonprofitContent>
                <Typography gutterBottom variant="h6" component="h2">
                  {nonprofit.name}
                </Typography>
                <Typography variant="body2" color="textSecondary" component="p">
                  {nonprofit.description?.length > 100
                    ? `${nonprofit.description.substring(0, 100)}...`
                    : nonprofit.description}
                </Typography>
                <Typography variant="subtitle2" style={{ marginTop: "10px" }}>
                  Teams:
                </Typography>
                {getTeamsForNonprofit(nonprofit.id).map((team) => (
                  <TeamChip key={team.id} label={team.name} size="small" />
                ))}
              </NonprofitContent>
              <Button
                component={Link}
                href={`/hack/${eventId}/nonprofit/${nonprofit.id}`}
                variant="contained"
                color="primary"
                fullWidth
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
