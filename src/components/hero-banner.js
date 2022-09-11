import React from "react";
import Link from 'next/link'
import Head from 'next/head';

export default function HeroBanner(){
  const logo = "https://i.imgur.com/Ih0mbYx.png";
  
  const JOIN_SLACK_LINK = "https://join.slack.com/t/opportunity-hack/shared_invite/zt-1db1ehglc-2tR6zpmszc5898MhiSxHig";
  const openCodeSample = () => {
    window.open(
      JOIN_SLACK_LINK,
      "_blank",
      "noopener noreferrer"
    );
  };

  return (    
    <div className="hero-banner">
      <Head>
        <meta charSet="utf-8" />
        <meta property="og:site_name" content="Opportunity Hack Portal" />
        <meta name="description" content="TEST TEST" />
        <meta property="description" content="A TEST TEST" />
      </Head>  
      <img className="hero-banner__logo" src={logo} alt="Opportunity Hack logo" />
      <h1 className="hero-banner__headline">Hey there, it's a pleasure to meet you.</h1>
      <p className="hero-banner__description">
        Welcome to the place where Nonprofits, Hackers, Mentors, and Volunteers unite!
      </p>

      <Link href="/nonprofits">
        <button className="button button--primary">
          Step 1: Find a problem to work on →
        </button>
      </Link>
      <br/>
      <button onClick={openCodeSample} className="button button--primary">
       Step 2: Join us on Slack to get involved →
      </button>
    </div>
  );
};
