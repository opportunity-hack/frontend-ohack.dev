import React from "react";

export const FooterHyperlink = ({ children, path }) => {
  return (
    <a
      className="footer__hyperlink"
      href={path}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};
