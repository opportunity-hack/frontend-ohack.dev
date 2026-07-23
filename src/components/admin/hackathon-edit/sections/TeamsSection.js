import React, { useState, useEffect } from "react";
import { Alert, Box, Tab, Tabs } from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SectionContainer from "../SectionContainer";

// Heavy admin sub-pages — lazy-loaded so the section bundle stays small.
const TeamManagement = dynamic(
  () => import("../../TeamManagement"),
  { ssr: false }
);
const TeamAssignments = dynamic(
  () => import("../../TeamAssignments"),
  { ssr: false }
);

const TAB_NAMES = ["management", "assignments", "stats"];

const TeamsSection = ({ admin, orgId }) => {
  const router = useRouter();
  // TeamManagement / TeamAssignments key everything off the Firestore doc id
  // (their fetchTeams hits `/api/team/${docId}`). The URL path's [event_id] is
  // the slug, so we pass `admin.hackathon.id` (the doc id) — passing the slug
  // here breaks the team fetch with a 404.
  const hackathonDocId = admin.hackathon?.id;
  const eventId = admin.hackathon?.event_id;

  // Sub-tab persisted via ?subtab= so the URL stays shareable.
  const subtabFromUrl = typeof router.query.subtab === "string" ? router.query.subtab : null;
  const initialTab = Math.max(0, TAB_NAMES.indexOf(subtabFromUrl));
  const [activeTab, setActiveTab] = useState(initialTab >= 0 ? initialTab : 0);

  useEffect(() => {
    if (!subtabFromUrl) return;
    const idx = TAB_NAMES.indexOf(subtabFromUrl);
    if (idx >= 0 && idx !== activeTab) setActiveTab(idx);
  }, [subtabFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabChange = (_e, newValue) => {
    setActiveTab(newValue);
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, subtab: TAB_NAMES[newValue] },
      },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  if (!eventId || !hackathonDocId) {
    return (
      <SectionContainer title="Teams">
        <Alert severity="warning">
          Save the event under Overview before managing teams for this hackathon.
        </Alert>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer disableGutters>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 2, md: 3 } }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Team management tabs">
          <Tab label="Team Management" />
          <Tab label="Team Assignments" />
          <Tab label="Team Statistics" />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {activeTab === 0 && <TeamManagement orgId={orgId} embeddedHackathonId={hackathonDocId} />}
        {activeTab === 1 && <TeamAssignments orgId={orgId} embeddedHackathonId={hackathonDocId} />}
        {activeTab === 2 && (
          <Alert severity="info">
            Team statistics dashboard is coming soon. This will include insights on team
            performance, engagement metrics, and project progress tracking.
          </Alert>
        )}
      </Box>
    </SectionContainer>
  );
};

export default TeamsSection;
