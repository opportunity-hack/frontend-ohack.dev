import React from "react";
import OHackFeature from "./ohack-feature";


import Head from 'next/head';



export default function OHackFeatures(){
  const details = [
    {
      "title": "Make an impact",
      "description": "Build things that change your community for the better. Nonprofits lack software engineering teams to help them reduce their time wasted on overhead, at a minimum you will allow them to scale their reach by the code you write.",
      "icon":"https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
    },
    {
      "title": "Keep track of your volunteerism",
      "description": "Build a portfolio of the things you have worked on and the people you have helped. Be able to visually see your impact and how much time you have dedicated to a cause.  As a company, leverage us to manage and report social good effort from your employees as mentors and hackers.",
      "icon":"https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/menu_book/default/48px.svg"

    },
    {
      "title": "Build your experience",
      "description": "Work in a traditional software development lifecycle, have standups, do peer reviews, get feedback. Not a software engineer? No problem! Build on your experience in: Product Management (PM), Program Management (PgM), and User Experience (UX). You can decide to share this with your current employer or potential employers which has a lot more weight than a resume and an interview.",
      "icon":"https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/receipt_long/default/48px.svg"
    },
    {
      "title": "Engage with a community",
      "description": "We're all taking time out of our lives to make the world a better place, you'll be with many similiar-minded people. Help your company with their Environmental, Social, and Governance (ESG) commiitment by donating a percentage of its profits to the local community and encourage employees to perform volunteer work. Validate a focus on diversity, inclusion, community-focus, and social justice.",
      "icon":"https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/forum/default/48px.svg"
    }
  ]

  const features = details.map((item) => (
    <OHackFeature
      key={item.title}
      title={item.title}
      description={item.description}
      icon={item.icon}
    />
  ));

  const meta = details.map((item) => (
    item.title + ": " + item.description     
  ))

  return(    
  <div className="ohack-features">
      <Head>
        <meta property="description" content={meta} />
      </Head>
    <h2 className="ohack-features__title">What do we do here?</h2>
    <div className="ohack-features__grid">
      {features}      
    </div>
  </div>
  );
}
