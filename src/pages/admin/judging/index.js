// Legacy route — judging admin now lives at
// /admin/hackathons/[event_id]?section=judging. Forwarding for the same
// reasons as the volunteer redirect.

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";

const AdminJudgingRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { event_id, ...rest } = router.query;
    if (event_id) {
      router.replace({
        pathname: `/admin/hackathons/${event_id}`,
        query: { ...rest, section: "judging" },
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

export default AdminJudgingRedirect;
