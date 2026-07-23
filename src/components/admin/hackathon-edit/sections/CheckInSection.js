import React from "react";
import { useAuthInfo } from "@propelauth/react";
import { Alert, Box } from "@mui/material";
import { CheckInWorkbench } from "../../checkin/CheckInWorkbench";
import SectionContainer from "../SectionContainer";

const CheckInSection = ({ admin, onSnack }) => {
  const { userClass } = useAuthInfo();
  const eventId = admin.hackathon?.event_id;

  if (!eventId) {
    return (
      <SectionContainer title="Check-In">
        <Alert severity="warning">
          Save the event ID under Overview before running check-in.
        </Alert>
      </SectionContainer>
    );
  }

  return (
    <SectionContainer disableGutters>
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        <CheckInWorkbench
          userClass={userClass}
          embedded
          externalEventId={eventId}
          onSnack={onSnack}
        />
      </Box>
    </SectionContainer>
  );
};

export default CheckInSection;
