import React from "react";
import { OHackFeature } from "./ohack-feature";


export const OHackFeatures = () => (
  <div className="ohack-features">
    <h2 className="ohack-features__title">Benefits of an ohack.dev Account</h2>
    <div className="ohack-features__grid">
      <OHackFeature
        title="Make an impact"
        description="Build things that change your community for the better.  
        Nonprofits lack software engineering teams to help them reduce their time wasted on overhead, 
        at a minimum you will allow them to scale their reach by the code you write."
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
      />

      <OHackFeature
        title="Keep track of your volunteerism"
        description="Build a portfolio of the things you have worked on and the people you have helped.
        Be able to visually see your impact and how much time you have dedicated to a cause."
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/menu_book/default/48px.svg"
      />
      
      <OHackFeature
        title="Get industry experience"
        description="Work in a traditional software development lifecycle, have standups, do peer reviews, get feedback. 
        You can decide to share this with potential employers which has a lot more weight than a resume and an interview."
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/receipt_long/default/48px.svg"
      />
      <OHackFeature
        title="Build a community"
        description="We're all taking time out of our lives to make the world a better place, you'll be with many similiar-minded people."
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/forum/default/48px.svg"
      />
    </div>
  </div>
);
