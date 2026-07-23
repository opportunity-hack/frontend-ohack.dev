// Legacy route — check-in now lives at
// /admin/hackathons/[event_id]?section=checkin. See VolunteerRedirect for the
// rationale; same redirect pattern.

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";

const AdminCheckInRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { event_id, ...rest } = router.query;
    if (event_id) {
      router.replace({
        pathname: `/admin/hackathons/${event_id}`,
        query: { ...rest, section: "checkin" },
      });
    } else {
      router.replace({
        pathname: "/admin/hackathons",
        query: rest,
      });
    }
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
};

export default AdminCheckInRedirect;
