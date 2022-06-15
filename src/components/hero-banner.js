import React from "react";

export const HeroBanner = () => {
  const logo = "https://i.imgur.com/Ih0mbYx.png";

  const openCodeSample = () => {
    window.open(
      "https://www.ohack.org",
      "_blank",
      "noopener noreferrer"
    );
  };

  return (
    <div className="hero-banner">
      <img className="hero-banner__logo" src={logo} alt="Opportunity Hack logo" />
      <h1 className="hero-banner__headline">Hey there, it's a pleasure to meet you.</h1>
      <p className="hero-banner__description">
        Welcome to the place where Nonprofits, Hackers, Mentors, and Volunteers unite!
      </p>

      <button onClick={openCodeSample} className="button button--secondary">
        Some call to action →
      </button>
    </div>
  );
};
