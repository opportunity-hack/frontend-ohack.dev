// Legacy route — social media posting now lives at
// /admin/communication?tab=social. Forwarding to keep old bookmarks working.

import { useEffect } from "react";
import { useRouter } from "next/router";
import { Box, CircularProgress } from "@mui/material";

const SocialMediaRedirect = () => {
  const router = useRouter();

  useEffect(() => {
    if (!router.isReady) return;
    router.replace({
      pathname: "/admin/communication",
      query: { ...router.query, tab: "social" },
    });
  }, [router.isReady]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
      <CircularProgress />
    </Box>
  );
};

export default SocialMediaRedirect;
