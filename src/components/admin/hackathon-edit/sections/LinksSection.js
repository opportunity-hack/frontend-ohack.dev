import React from "react";
import LinkManagement from "../../LinkManagement";
import SectionContainer from "../SectionContainer";
import ExportCsvButton from "../../ExportCsvButton";

const LINK_CSV_COLUMNS = [
  { key: "name", label: "Label" },
  { key: "link", label: "URL" },
  { key: "color", label: "Color" },
  { key: "variant", label: "Variant" },
  { key: "size", label: "Size" },
  { key: "open_new", label: "Opens new tab", get: (l) => String(l?.open_new).toLowerCase() === "true" },
];

const LinksSection = ({ admin }) => {
  const { hackathon, setField } = admin;
  return (
    <SectionContainer
      title="Public Links"
      description="Buttons rendered on the public event page. Drag to reorder. Edits autosave."
      actions={
        <ExportCsvButton
          rows={hackathon.links || []}
          columns={LINK_CSV_COLUMNS}
          filenameParts={[hackathon.event_id, "links"]}
          table="links"
          eventId={hackathon.event_id}
          label="Download CSV"
        />
      }
    >
      <LinkManagement
        links={hackathon.links || []}
        onChange={(newLinks) => setField("links", newLinks)}
      />
    </SectionContainer>
  );
};

export default LinksSection;
