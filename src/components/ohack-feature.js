import React from "react";

export const OHackFeature = ({ title, description, resourceUrl, icon }) => (
  <a
    href={resourceUrl}
    className="ohack-feature"
    target="_blank"
    rel="noopener noreferrer"
  >
    <h3 className="ohack-feature__headline">
      <img
        className="ohack-feature__icon"
        src={icon}
        alt="external link icon"
      />
      {title}
    </h3>
    <p className="ohack-feature__description">{description}</p>
  </a>
);
