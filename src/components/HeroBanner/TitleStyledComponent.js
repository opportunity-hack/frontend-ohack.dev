import React from "react";
import { TitleStyled } from "./styles";
import { Grid } from "@mui/material";



const TitleStyledComponent = () => {
  return (
    <Grid mt={1} container spacing={0.5} alignItems="center">
      <TitleStyled mt={10} component="h2" variant="h2">
        The place where{" "}
        <span className="highlight">
          Nonprofits, Hackers, Mentors, Volunteers
        </span>{" "}
        unite
      </TitleStyled>
    </Grid>
  );
};

export default TitleStyledComponent;
