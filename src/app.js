import { useAuth0 } from "@auth0/auth0-react";
import React from "react";
import { Route, Switch } from "react-router-dom";
import { Footer } from "./components/footer";
import { Loader } from "./components/loader";
import { NavBar } from "./components/nav-bar";
import { ProtectedRoute } from "./components/protected-route";

import { ExternalApi } from "./pages/external-api";
import { Home } from "./pages/home";
import { NotFound } from "./pages/not-found";
import { Profile } from "./pages/profile";
import { PublicProfile } from "./pages/public-profile";
import { Feedback } from "./pages/feedback";
import {GiveFeedback } from "./pages/give-feedback"
import { NonProfitList } from "./pages/nonprofit-list";
import { NonProfitProfile } from "./pages/nonprofit-profile"

export const App = () => {
  let { isLoading } = useAuth0();

  // Originally added this so I could test without an internet connection (e.g. airplane)
  const isDev = false;

  if( isDev )
  {
    isLoading = false;
  }

  if (isLoading) {
    return (
      <div className="page-layout">
        <Loader />
      </div>
    );
  }

  return (
    <div className="page-layout">
      <NavBar />
      <div className="page-layout__content">
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/feedback/:giving_feedback_to_userid" component={GiveFeedback} /> 
          <Route path="/feedback" component={Feedback} /> 

          <Route path="/profile/:userid/feedback" component={PublicProfile} />            
          <Route path="/profile/:userid" component={PublicProfile} />            
          <Route path="/profile" component={Profile}/>          
          
          <Route path="/nonprofit/:nonprofit_id" component={NonProfitProfile} /> 
          <Route path="/nonprofits" component={NonProfitList} /> 


          {
            // We'll get rid of this at some point, but it's nice to show how the role-based access works for now
          }
          <ProtectedRoute path="/external-api" component={ExternalApi} />


          <Route path="*" component={NotFound} />
        </Switch>
      </div>
      <Footer />
    </div>
  );
};
