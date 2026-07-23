import React from "react";
import LinkManagement from "../../LinkManagement";
import SectionContainer from "../SectionContainer";

const LinksSection = ({ admin }) => {
  const { hackathon, setField } = admin;
  return (
    <SectionContainer
      title="Public Links"
      description="Buttons rendered on the public event page. Drag to reorder. Edits autosave."
    >
      <LinkManagement
        links={hackathon.links || []}
        onChange={(newLinks) => setField("links", newLinks)}
      />
    </SectionContainer>
  );
};

export default LinksSection;
