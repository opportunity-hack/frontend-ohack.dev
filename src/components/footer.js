import React from "react";
import { FooterHyperlink } from "./footer-hyperlink";
import GitHubIcon from '@mui/icons-material/GitHub';

export const Footer = () => {
  const resourceList = [
    {
      path: "https://www.ohack.org",
      label: "What's Opportunity Hack?",
    },
    {
      path: "https://www.ohack.org/projects",
      label: "Projects",
    },
    {
      path: "https://github.com/opportunity-hack/",
      label: "GitHub",
    },
    {
      path: "https://www.ohack.org/about/faq",
      label: "FAQ",
    },
    {
      path: "https://www.ohack.org/about/history",
      label: "Our history",
    },
    {
      path: "https://github.com/opportunity-hack/frontend-ohack.dev",
      label: <span><GitHubIcon /> Fork this on GitHub</span>,
    },
    
  ];

  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="footer-grid__info">
          <div className="footer-info__message">            
            <p className="footer-message__description">
              <FooterHyperlink path="https://www.ohack.org">
                <span>
                  We exist to create simple technical solutions for nonprofit organizations.  
                  We utilize volunteers, who are industry professionals or local students to the area in order 
                  to provide them valuable experience as they create these solutions for nonprofit organizations.  
                  We also look to create durable bonds between volunteers, mentors, and their local communities as 
                  they work together to create&nbsp;
                </span>
                <u>meaningful change to society.</u>
              </FooterHyperlink>
            </p>
          </div>
          
          <div className="footer-info__resource-list">
            {resourceList.map((resource) => (
              <div
                key={resource.path}
                className="footer-info__resource-list-item"
              >
                <FooterHyperlink path={resource.path}>
                  {resource.label}
                </FooterHyperlink>
              </div>
            ))}
          </div>
        </div>
        <div className="footer-grid__brand">
          <div className="footer-brand">
            <img
              className="footer-brand__logo"
              src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/emoji_objects/default/48px.svg"
              alt="Opportunity Hack black logo"
              width="20"
              height="22.22"
            />
            <img
              className="footer-brand__logo"
              src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/laptop_mac/default/48px.svg"
              alt="Opportunity Hack black logo"
              width="20"
              height="22.22"
            />
            <img
              className="footer-brand__logo"
              src="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/favorite/default/48px.svg"
              alt="Opportunity Hack black logo"
              width="20"
              height="22.22"
            />
            
            <FooterHyperlink path="https://www.ohack.org">
              Opportunity Hack Inc. EIN: 84-5113049
            </FooterHyperlink>
          </div>
        </div>
      </div>
    </footer>
  );
};
