import { GrowthBook } from "@growthbook/growthbook-react";

export function initGrowthBook(userId) {
  return new GrowthBook({
    apiHost: "https://cdn.growthbook.io",
    clientKey: "sdk-09TvTBUc2phrLe",
    enableDevMode: process.env.NODE_ENV !== "production",
    trackingCallback: (experiment, result) => {
      console.log("Viewed Experiment", {
        experimentId: experiment.key,
        variationId: result.key,
      });

      import("../lib/ga").then((ga) => {
        ga.event({
          action: "experiment_viewed",
          params: {
            experiment_id: experiment.key,
            variation_id: result.key,
          },
        });
      });
    },
    attributes: {
      id: userId || Math.random().toString(36).substring(7),
    },
  });
}
