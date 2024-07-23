import dynamic from 'next/dynamic'
import React, { Fragment } from "react";
import Head from "next/head";
import { GrowthBook } from "@growthbook/growthbook-react";
import { useEffect } from "react";
import { GrowthBookProvider } from "@growthbook/growthbook-react";
import { useAuthInfo } from '@propelauth/react'

// Import ga
import * as ga from '../lib/ga';

const HeroBanner = dynamic(() => import('../components/HeroBanner/HeroBanner'), {
  ssr: false,
});

const HackathonList = dynamic(() => import('../components/HackathonList/HackathonList'), {
  ssr: false
});


const growthbook = new GrowthBook({
  apiHost: "https://cdn.growthbook.io",
  clientKey: "sdk-09TvTBUc2phrLe",
  enableDevMode: true,
  trackingCallback: (experiment, result) => {
    // TODO: Use your real analytics tracking system
    console.log("Viewed Experiment", {
      experimentId: experiment.key,
      variationId: result.key      
    });

    ga.event({
        action: "experiment_viewed",
        params: {
          experiment_id: experiment.key,
          variation_id: result.key          
        }
    });   
  }
});

export default function Home() {  
  const { user } = useAuthInfo();

  var experimentUserId = Math.random().toString(36).substring(7);
  if (user && user.userId) {
    // Pick a random user ID if the user is not logged in
    experimentUserId = user.userId;
  }
  console.log(experimentUserId);

  growthbook.setAttributes({
    "id":  experimentUserId
  });


  useEffect(() => {
    // Load features asynchronously when the app renders
  growthbook.init({ streaming: true });
  }, []);

  return (      
    <Fragment>
      <Head>
        <title>Opportunity Hack: Tech Hackathons for Social Good, Empowering Nonprofits, Learn how to code, Solve end-to-end problems</title>
      </Head>      
       <GrowthBookProvider growthbook={growthbook}>
      <HeroBanner />
      </GrowthBookProvider>
      <HackathonList />
    </Fragment>
    
  );
}
export const getStaticProps = async ({ params = {} } = {}) => {
  
  var title = "Opportunity Hack: Tech Hackathons for Social Good, Empowering Nonprofits, Learn how to code, Solve end-to-end problems";
  var metaDescription = 'Empowering volunteers to create tech solutions for nonprofits, fostering community bonds. Join us at Opportunity Hack to use your skills for good, boost your resume, and find purpose in work.';

  // Helpful Docs:
  // https://medium.com/slack-developer-blog/everything-you-ever-wanted-to-know-about-unfurling-but-were-afraid-to-ask-or-how-to-make-your-e64b4bb9254
  // https://progressivewebninja.com/how-to-setup-nextjs-meta-tags-dynamically-using-next-head/#3-nextjs-dynamic-meta-tags
  // https://github.com/vercel/next.js/issues/35172#issuecomment-1169362010
  return {
    props: {
      title: title,
      openGraphData: [
        {
          name: 'title',
          content: title,
          key: 'title',
        },
        {
          property: 'og:title',
          content: title,
          key: 'ogtitle',
        },
        {
          name: 'description',
          content: metaDescription,
          key: 'desc',
        },
        {
          property: 'og:description',
          content: metaDescription,
          key: 'ogdesc',
        },
        {
          property: 'og:type',
          content: 'website',
          key: 'website',
        },
        {
          property: 'og:image',
          content: 'https://i.imgur.com/xYrA32J.png',
          key: 'ogimage',
        },
        {
          property: 'twitter:image',
          content: 'https://i.imgur.com/xYrA32J.png',
          key: 'twitterimage',
        },
        {
          property: 'og:site_name',
          content: 'Opportunity Hack Developer Portal',
          key: 'ogsitename',
        },
        {
          property: 'twitter:card',
          content: 'summary_large_image',
          key: 'twittercard',
        },
        {
          property: 'twitter:domain',
          content: 'ohack.dev',
          key: 'twitterdomain',
        }        
      ],
    },
  };
};