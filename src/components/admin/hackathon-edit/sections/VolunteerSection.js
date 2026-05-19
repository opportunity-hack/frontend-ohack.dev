import React from "react";
import { useAuthInfo } from "@propelauth/react";
import { Box, Alert } from "@mui/material";
import { VolunteerWorkbench } from "../../volunteer/VolunteerWorkbench";

const VolunteerSection = ({ admin, onSnack }) => {
  const { userClass } = useAuthInfo();
  const eventId = admin.hackathon?.event_id;

  if (!eventId) {
    return (
      <Alert severity="warning">
        Save the event ID under Overview before managing applications.
      </Alert>
    );
  }

  return (
    <Box>
      <VolunteerWorkbench
        userClass={userClass}
        embedded
        externalEventId={eventId}
        onSnack={onSnack}
      />
    </Box>
  );
};

export default VolunteerSection;
