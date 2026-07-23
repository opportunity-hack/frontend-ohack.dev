// Legacy route — teams admin now lives at
// /admin/hackathons/[event_id]?section=teams. Forwarding to keep old
// bookmarks (TeamAssignments row links, planning board, etc.) working.

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";

const AdminTeamsRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { event_id, ...rest } = router.query;
    if (event_id) {
      router.replace({
        pathname: `/admin/hackathons/${event_id}`,
        query: { ...rest, section: "teams" },
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

export default AdminTeamsRedirect;
