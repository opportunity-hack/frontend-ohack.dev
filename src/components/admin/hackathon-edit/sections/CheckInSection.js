import React from "react";
import { useAuthInfo } from "@propelauth/react";
import { Alert, Box } from "@mui/material";
import { CheckInWorkbench } from "../../checkin/CheckInWorkbench";

const CheckInSection = ({ admin, onSnack }) => {
  const { userClass } = useAuthInfo();
  const eventId = admin.hackathon?.event_id;

  if (!eventId) {
    return (
      <Alert severity="warning">
        Save the event ID under Overview before running check-in.
      </Alert>
    );
  }

  return (
    <Box>
      <CheckInWorkbench
        userClass={userClass}
        embedded
        externalEventId={eventId}
        onSnack={onSnack}
      />
    </Box>
  );
};

export default CheckInSection;
