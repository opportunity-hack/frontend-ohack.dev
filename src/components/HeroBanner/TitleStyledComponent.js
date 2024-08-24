import React from "react";
import { TitleStyled, SpanText } from "./styles";

const TitleStyledComponent = () => {
  return (
    <TitleStyled>
      <h1 className="headline">
        The place where{" "}
        <SpanText aria-label="Nonprofits, Hackers, Mentors, Volunteers">
          <span className="visually-hidden">Nonprofits, </span>
          <span>Nonprofits</span>
          <span className="visually-hidden">, </span>
          <span>Hackers</span>
          <span className="visually-hidden">, </span>
          <span>Mentors</span>
          <span className="visually-hidden">, </span>
          <span>Volunteers</span>
        </SpanText>{" "}
        unite
      </h1>
    </TitleStyled>
  );
};

export default React.memo(TitleStyledComponent);
