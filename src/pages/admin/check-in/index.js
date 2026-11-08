// Legacy route — check-in now lives at
// /admin/hackathons/[event_id]?section=checkin. See VolunteerRedirect for the
// rationale; same redirect pattern.

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useAuthInfo } from "@propelauth/react";
import { Box, CircularProgress } from "@mui/material";
import { orgIsFullAdmin } from "../../../lib/adminPermissions";

const AdminCheckInRedirect = () => {
  const router = useRouter();
  const { userClass } = useAuthInfo();

  useEffect(() => {
    if (!router.isReady) return;
    const { event_id, ...rest } = router.query;
    if (event_id) {
      router.replace({
        pathname: `/admin/hackathons/${event_id}`,
        query: { ...rest, section: "checkin" },
      });
    } else {
      // No event: full admins pick one from the list; a checkin.admin-only
      // helper can't open that list, so send them to the (one-card) /admin.
      const org = userClass?.getOrgByName?.("Opportunity Hack Org");
      router.replace({
        pathname: orgIsFullAdmin(org) ? "/admin/hackathons" : "/admin",
        query: rest,
      });
    }
  }, [router.isReady]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
};

export default AdminCheckInRedirect;
