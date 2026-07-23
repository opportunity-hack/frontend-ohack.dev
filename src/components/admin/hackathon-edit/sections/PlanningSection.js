import React from "react";
import { Alert, Box, Button, Divider, FormControlLabel, Stack, Switch } from "@mui/material";
import { Launch as LaunchIcon } from "@mui/icons-material";
import dynamic from "next/dynamic";
import SectionContainer from "../SectionContainer";

const PlanningSlackSettings = dynamic(() => import("../../../Planning/PlanningSlackSettings"), { ssr: false });
const PlanningEditorsManager = dynamic(() => import("../../../Planning/PlanningEditorsManager"), { ssr: false });

const PlanningSection = ({ admin, accessToken, orgId }) => {
  const { hackathon, setField, setPlanning } = admin;
  const planning = hackathon.planning || {};
  const eventId = hackathon.event_id;

  const handleSeed = async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/planning/${eventId}/seed-template`, {
      method: "POST",
      headers: { authorization: `Bearer ${accessToken}`, "X-Org-Id": orgId },
    });
    setPlanning({ template_seeded: true });
  };

  return (
    <SectionContainer
      title="Planning Board"
      description="Optional internal planning surface (lists + cards) at /hack/[event_id]/plan. Toggle below makes the board public."
    >
      <Stack spacing={2.5}>
        <FormControlLabel
          control={
            <Switch
              checked={!!planning.enabled}
              onChange={(e) => setPlanning({ enabled: e.target.checked })}
            />
          }
          label="Enable planning board (makes /hack/[event_id]/plan public)"
        />
        <FormControlLabel
          control={
            <Switch
              checked={!!planning.budget_widget_on_event_page}
              onChange={(e) => setPlanning({ budget_widget_on_event_page: e.target.checked })}
            />
          }
          label="Show budget widget on the public event page"
        />
        {eventId && (
          <Box>
            <Button variant="outlined" size="small" href={`/hack/${eventId}/plan`} target="_blank" startIcon={<LaunchIcon />}>
              Open planning board
            </Button>
          </Box>
        )}
        {planning.enabled && !planning.template_seeded && (
          <Alert
            severity="info"
            action={
              <Button size="small" onClick={handleSeed}>
                Apply template
              </Button>
            }
          >
            Template not yet applied. Seed the OHack default lists and cards.
          </Alert>
        )}
        <Divider />
        <PlanningSlackSettings
          planning={planning}
          onUpdateConfig={(config) => setPlanning(config)}
          onSlackNotify={async () => {
            await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/planning/${eventId}/slack/notify`, {
              method: "POST",
              headers: { authorization: `Bearer ${accessToken}`, "X-Org-Id": orgId },
            });
          }}
        />
        <Divider />
        <PlanningEditorsManager
          editors={planning.editors || []}
          onUpdateEditors={async (add, remove) => {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_SERVER_URL}/api/planning/${eventId}/editors`, {
              method: "PATCH",
              headers: { authorization: `Bearer ${accessToken}`, "content-type": "application/json", "X-Org-Id": orgId },
              body: JSON.stringify({ add, remove }),
            });
            if (res.ok) {
              const data = await res.json();
              setField("planning", { ...(hackathon.planning || {}), editors: data.editors });
              return { ok: true };
            }
            return { ok: false, error: "Failed" };
          }}
        />
      </Stack>
    </SectionContainer>
  );
};

export default PlanningSection;
