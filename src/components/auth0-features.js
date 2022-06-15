import React from "react";
import { Auth0Feature } from "./auth0-feature";
import { AccessControlLevel, useExternalApi } from "../hooks/use-external-api";


export const Auth0Features = () => (
  <div className="auth0-features">
    <h2 className="auth0-features__title">Benefits of an ohack.dev Account</h2>
    <div className="auth0-features__grid">
      <Auth0Feature
        title="Make an impact"
        description="Build things that change your community for the better"
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/volunteer_activism/default/48px.svg"
      />

      <Auth0Feature
        title="Keep track of your volunteerism"
        description="Build a portfolio of the things you have worked on and the people you have helped"
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/menu_book/default/48px.svg"
      />
      
      <Auth0Feature
        title="Get industry experience"
        description="Work in a traditional software development lifecycle, have standups, do peer reviews, get feedback"
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/receipt_long/default/48px.svg"
      />
      <Auth0Feature
        title="Build a community"
        description="We're all taking time out of our lives to make the world a better place, you'll be with many similiar-minded people"
        resourceUrl="#"
        icon="https://fonts.gstatic.com/s/i/short-term/release/materialsymbolsoutlined/forum/default/48px.svg"
      />
    </div>
  </div>
);
