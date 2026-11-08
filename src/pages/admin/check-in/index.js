// Legacy route — check-in now lives at
// /admin/hackathons/[event_id]?section=checkin. See VolunteerRedirect for the
// rationale; same redirect pattern.
//
// Without `?event_id=` we resolve the newest CURRENT event ourselves and go
// straight to its Check-in section (works for full admins AND checkin.admin
// desk helpers). Only when there is no current event do the roles diverge:
// full admins → the hackathon list, helpers → /admin.
//
// Gotcha (Nov 2026): `useAuthInfo().userClass` is undefined on the first
// render while PropelAuth loads. Deciding the redirect then classified every
// admin as a helper and bounced them to /admin, which looked like the page
// refreshing. Wait for `loading` (auth) and the events fetch before deciding.

import { useEffect, useRef } from "react";
import { useRouter } from "next/router";
import { useAuthInfo } from "@propelauth/react";
import { Box, CircularProgress } from "@mui/material";
import useHackathonEvents from "../../../hooks/use-hackathon-events";
import { orgIsFullAdmin } from "../../../lib/adminPermissions";
import { newestEventId } from "../../../lib/newestEvent";

const AdminCheckInRedirect = () => {
  const router = useRouter();
  const { userClass, loading: authLoading } = useAuthInfo();
  const { hackathons = [], loading: eventsLoading } =
    useHackathonEvents("current") || {};
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (!router.isReady || redirectedRef.current) return;
    const { event_id, ...rest } = router.query;
    if (event_id) {
      redirectedRef.current = true;
      router.replace({
        pathname: `/admin/hackathons/${event_id}`,
        query: { ...rest, section: "checkin" },
      });
      return;
    }
    if (authLoading || eventsLoading) return;
    redirectedRef.current = true;
    const currentId = newestEventId(hackathons);
    if (currentId) {
      router.replace({
        pathname: `/admin/hackathons/${currentId}`,
        query: { ...rest, section: "checkin" },
      });
      return;
    }
    const org = userClass?.getOrgByName?.("Opportunity Hack Org");
    router.replace({
      pathname: orgIsFullAdmin(org) ? "/admin/hackathons" : "/admin",
      query: rest,
    });
  }, [router, authLoading, eventsLoading, hackathons, userClass]);

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
};

export default AdminCheckInRedirect;
