import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import GroupIcon from "@mui/icons-material/Group";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PeopleIcon from "@mui/icons-material/People";

const ConstraintsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
}));

const EventConstraints = ({ constraints }) => {
  if (!constraints || Object.keys(constraints).length === 0) {
    return null;
  }

  const constraintItems = [
    {
      key: "max_teams_per_problem",
      label: "Maximum teams per problem",
      icon: <AssignmentIcon />,
    },
    {
      key: "min_people_per_team",
      label: "Minimum people per team",
      icon: <GroupIcon />,
    },
    {
      key: "max_people_per_team",
      label: "Maximum people per team",
      icon: <PeopleIcon />,
    },
  ];

  return (
    <ConstraintsContainer elevation={2}>
      <Typography variant="h6" gutterBottom>
        Event Constraints
      </Typography>
      <List>
        {constraintItems.map(
          (item) =>
            constraints[item.key] != null && (
              <ListItem key={item.key}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.label}
                  secondary={constraints[item.key]}
                />
              </ListItem>
            )
        )}
      </List>
    </ConstraintsContainer>
  );
};

export default EventConstraints;
