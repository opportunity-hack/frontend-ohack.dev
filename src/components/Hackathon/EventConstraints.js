import React from "react";
import {
  Paper,
  Typography,
  Grid,
  Box,
  Tooltip,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

const ConstraintsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const ConstraintItem = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginRight: theme.spacing(3),
}));

const ConstraintIcon = styled(Box)(({ theme }) => ({
  marginRight: theme.spacing(1),
  color: theme.palette.text.secondary,
}));

const EventConstraints = ({ constraints }) => {
  if (!constraints || Object.keys(constraints).length === 0) {
    return null;
  }

  const maxTeamsExplanation = `
    This limits the number of teams that can initially help a given nonprofit. 
    We ensure each nonprofit has at least one team before allowing additional teams to join. 
    Signups are first-come, first-served. Once every nonprofit has at least 1 team, 
    we allow more teams to help the same nonprofit. Teams should consider their top three 
    nonprofit choices as they review problem statements to facilitate this process.
  `;

  const constraintItems = [
    {
      key: "max_teams_per_problem",
      label: "Max teams per problem",
      icon: <AssignmentIcon />,
      explanation: maxTeamsExplanation,
    },
    {
      key: "min_people_per_team",
      label: "Min people per team",
      icon: <GroupIcon />,
    },
    {
      key: "max_people_per_team",
      label: "Max people per team",
      icon: <PeopleIcon />,
    },
  ];

  return (
    <ConstraintsContainer elevation={2}>
      <Typography variant="subtitle1" gutterBottom>
        Team Guidelines
      </Typography>
      <Grid container spacing={2}>
        {constraintItems.map(
          (item) =>
            constraints[item.key] != null && (
              <Grid item key={item.key} xs={12} sm={4}>
                <ConstraintItem>
                  <ConstraintIcon>{item.icon}</ConstraintIcon>
                  <Typography variant="body1">
                    {item.label}:{" "}
                    <strong>{constraints[item.key]}</strong>
                  </Typography>
                  {item.explanation && (
                    <Tooltip
                      title=<span style={{
                        fontSize: "14px",
                        maxWidth: "300px",
                      }}>{item.explanation}</span>
                      placement="top"
                    >
                      <IconButton size="small" color="primary">
                        <InfoOutlinedIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </ConstraintItem>
              </Grid>
            )
        )}
      </Grid>
    </ConstraintsContainer>
  );
};

export default EventConstraints;
