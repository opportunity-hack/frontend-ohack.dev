import React from "react";
import { useAuthInfo } from "@propelauth/react";
import { Box, Alert } from "@mui/material";
import { VolunteerWorkbench } from "../../volunteer/VolunteerWorkbench";
import SectionContainer from "../SectionContainer";

const VolunteerSection = ({ admin, onSnack }) => {
  const { userClass } = useAuthInfo();
  const eventId = admin.hackathon?.event_id;

  if (!eventId) {
    return (
      <SectionContainer title="Applications">
        <Alert severity="warning">
          Save the event ID under Overview before managing applications.
        </Alert>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer disableGutters>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <VolunteerWorkbench
          userClass={userClass}
          embedded
          externalEventId={eventId}
          onSnack={onSnack}
        />
      </Box>
    </SectionContainer>
  );
};

export default VolunteerSection;
