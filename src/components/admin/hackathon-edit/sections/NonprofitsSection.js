import React from "react";
import dynamic from "next/dynamic";
import SectionContainer from "../SectionContainer";

const NonprofitManagement = dynamic(() => import("../../NonprofitManagement"), { ssr: false });

const NonprofitsSection = ({ admin, accessToken, orgId, onSnack }) => {
  const { hackathon, refetch } = admin;
  return (
    <SectionContainer
      title="Nonprofits"
      description="Assign and manage the nonprofit organizations participating in this hackathon."
    >
      <NonprofitManagement
        hackathon={hackathon}
        accessToken={accessToken}
        orgId={orgId}
        onUpdate={() => {
          onSnack?.("Nonprofit settings updated", "success");
          refetch();
        }}
        onError={(msg) => onSnack?.(msg || "Failed to update nonprofits", "error")}
      />
    </SectionContainer>
  );
};

export default NonprofitsSection;
