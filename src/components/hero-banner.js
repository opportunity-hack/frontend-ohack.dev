import React from "react";

export const HeroBanner = () => {
  const logo = "https://i.imgur.com/Ih0mbYx.png";

  const openCodeSample = () => {
    window.open(
      "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig",
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

      <button onClick={openCodeSample} className="button button--primary">
       Join us on Slack to get involved →
      </button>
    </div>
  );
};
