// Legacy route — the volunteer admin UI now lives at
// /admin/hackathons/[event_id]?section=volunteer. We redirect here so old
// bookmarks, deep links, and references throughout the app keep working.
//
// Query params we honor:
//   - event_id  → forwarded into the section URL
//   - everything else (tab, filter, volunteer_id, volunteer_type, …) is
//     forwarded too; the section components read what they need.
//
// When event_id is missing we land on the hackathon list so the admin can
// pick a hackathon, which then takes them into the section UI.

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";

const AdminVolunteerRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    const { event_id, ...rest } = router.query;
    if (event_id) {
      router.replace({
        pathname: `/admin/hackathons/${event_id}`,
        query: { ...rest, section: "volunteer" },
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

export default AdminVolunteerRedirect;
