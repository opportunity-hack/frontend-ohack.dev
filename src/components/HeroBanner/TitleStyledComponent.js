import React from "react";
import { TitleStyled } from "./styles";

const TitleStyledComponent = () => {
  return (
    <TitleStyled component="h2" variant="h2">
      The place where{" "}
      <span className="highlight">
        Nonprofits, Hackers, Mentors, Volunteers
      </span>{" "}
      unite
    </TitleStyled>
  );
};

export default TitleStyledComponent;
