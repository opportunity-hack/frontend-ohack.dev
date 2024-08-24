import React from "react";
import { TitleStyled } from "./styles";

const TitleStyledComponent = () => {
  return (
    <TitleStyled component="h1" variant="h1">
      The place where{" "}
      <span className="highlight">
        Nonprofits, Hackers, Mentors, Volunteers
      </span>{" "}
      unite
    </TitleStyled>
  );
};

export default TitleStyledComponent;
