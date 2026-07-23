import React, { useState, useEffect, useMemo } from "react";
import { Alert, Box, Tab, Tabs } from "@mui/material";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import SectionContainer from "../SectionContainer";

const JudgingRound1 = dynamic(() => import("../../JudgingRound1"), { ssr: false });
const JudgingRound2 = dynamic(() => import("../../JudgingRound2"), { ssr: false });
const JudgingResults = dynamic(() => import("../../JudgingResults"), { ssr: false });

const TAB_NAMES = ["round1", "round2", "results"];

const JudgingSection = ({ admin, orgId }) => {
  const router = useRouter();
  const eventId = admin.hackathon?.event_id;

  const subtabFromUrl = typeof router.query.subtab === "string" ? router.query.subtab : null;
  const initial = TAB_NAMES.indexOf(subtabFromUrl);
  const [activeTab, setActiveTab] = useState(initial >= 0 ? initial : 0);

  useEffect(() => {
    if (!subtabFromUrl) return;
    const idx = TAB_NAMES.indexOf(subtabFromUrl);
    if (idx >= 0 && idx !== activeTab) setActiveTab(idx);
  }, [subtabFromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Children expect a hackathons[] array + a selected event_id. The event is
  // already pinned by the URL here, so the single-item array is sufficient and
  // setSelectedHackathon becomes a no-op.
  const hackathons = useMemo(
    () => (admin.hackathon ? [admin.hackathon] : []),
    [admin.hackathon]
  );
  const noopSetSelected = () => {};

  const handleTabChange = (_e, newValue) => {
    setActiveTab(newValue);
    router.replace(
      { pathname: router.pathname, query: { ...router.query, subtab: TAB_NAMES[newValue] } },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  if (!eventId) {
    return (
      <SectionContainer title="Judging">
        <Alert severity="warning">
          Save the event ID under Overview before managing judging.
        </Alert>
      </SectionContainer>
    );
  }

  const shared = {
    orgId,
    hackathons,
    selectedHackathon: eventId,
    setSelectedHackathon: noopSetSelected,
  };

  return (
    <SectionContainer disableGutters>
      <Box sx={{ borderBottom: 1, borderColor: "divider", px: { xs: 2, md: 3 } }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="Judging tabs">
          <Tab label="Round 1 - Initial Judging" />
          <Tab label="Round 2 - Final Judging" />
          <Tab label="Final Results" />
        </Tabs>
      </Box>

      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {activeTab === 0 && <JudgingRound1 {...shared} />}
        {activeTab === 1 && <JudgingRound2 {...shared} />}
        {activeTab === 2 && <JudgingResults {...shared} />}
      </Box>
    </SectionContainer>
  );
};

export default JudgingSection;
