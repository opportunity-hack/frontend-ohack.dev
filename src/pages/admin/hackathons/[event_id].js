import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import AdminPage from "../../../components/admin/AdminPage";
import HackathonAdminLayout from "../../../components/admin/hackathon-edit/HackathonAdminLayout";
import { SECTIONS, DEFAULT_SECTION, isValidSection } from "../../../components/admin/hackathon-edit/sectionsManifest";
import { useHackathonAdmin } from "../../../components/admin/hackathon-edit/useHackathonAdmin";

// Dynamic-load section bodies so a single-section view doesn't pull in every
// editor's bundle (especially the heavy Meals/Schedule editors and react-markdown).
const sectionLoaders = {
  overview: dynamic(() => import("../../../components/admin/hackathon-edit/sections/OverviewSection"), { ssr: false }),
  schedule: dynamic(() => import("../../../components/admin/hackathon-edit/sections/ScheduleSection"), { ssr: false }),
  meals: dynamic(() => import("../../../components/admin/hackathon-edit/sections/MealsSection"), { ssr: false }),
  participants: dynamic(() => import("../../../components/admin/hackathon-edit/sections/ParticipantsSection"), { ssr: false }),
  judges: dynamic(() => import("../../../components/admin/hackathon-edit/sections/JudgesSection"), { ssr: false }),
  nonprofits: dynamic(() => import("../../../components/admin/hackathon-edit/sections/NonprofitsSection"), { ssr: false }),
  media: dynamic(() => import("../../../components/admin/hackathon-edit/sections/MediaSection"), { ssr: false }),
  planning: dynamic(() => import("../../../components/admin/hackathon-edit/sections/PlanningSection"), { ssr: false }),
  donations: dynamic(() => import("../../../components/admin/hackathon-edit/sections/DonationsSection"), { ssr: false }),
  links: dynamic(() => import("../../../components/admin/hackathon-edit/sections/LinksSection"), { ssr: false }),
  volunteer: dynamic(() => import("../../../components/admin/hackathon-edit/sections/VolunteerSection"), { ssr: false }),
  teams: dynamic(() => import("../../../components/admin/hackathon-edit/sections/TeamsSection"), { ssr: false }),
  judging: dynamic(() => import("../../../components/admin/hackathon-edit/sections/JudgingSection"), { ssr: false }),
  checkin: dynamic(() => import("../../../components/admin/hackathon-edit/sections/CheckInSection"), { ssr: false }),
};

const AdminHackathonEditPage = () => {
  const router = useRouter();
  const { accessToken, userClass } = useAuthInfo();
  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = !!org?.hasPermission("volunteer.admin");
  const orgId = org?.orgId;

  const { event_id: eventIdRaw, section: sectionRaw } = router.query;
  const eventId = Array.isArray(eventIdRaw) ? eventIdRaw[0] : eventIdRaw;
  const sectionFromUrl = Array.isArray(sectionRaw) ? sectionRaw[0] : sectionRaw;
  const activeSection = isValidSection(sectionFromUrl) ? sectionFromUrl : DEFAULT_SECTION;

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnack = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const admin = useHackathonAdmin({ eventId, accessToken, orgId, isAdmin });

  // Surface autosave errors as toasts (debounced — we only want one per failure)
  useEffect(() => {
    if (admin.saveState.status === "error" && admin.saveState.error) {
      showSnack(`Autosave failed: ${admin.saveState.error}`, "error");
    }
  }, [admin.saveState.status, admin.saveState.error, showSnack]);

  const navigateToSection = (slug) => {
    router.replace(
      { pathname: router.pathname, query: { ...router.query, section: slug } },
      undefined,
      { shallow: true }
    );
  };

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""} />
        }
      >
        <AdminPage title="Hackathon" isAdmin={false}>
          <Typography>You do not have permission to view this page.</Typography>
        </AdminPage>
      </RequiredAuthProvider>
    );
  }

  const SectionComponent = sectionLoaders[activeSection];

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={
        <RedirectToLogin postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""} />
      }
    >
      <AdminPage
        title={admin.hackathon?.title ? `Edit · ${admin.hackathon.title}` : "Edit Hackathon"}
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        isAdmin={isAdmin}
      >
        {admin.loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : admin.loadError ? (
          <Alert severity="error" sx={{ my: 2 }}>{admin.loadError}</Alert>
        ) : (
          <HackathonAdminLayout
            hackathon={admin.hackathon}
            activeSection={activeSection}
            onSelectSection={navigateToSection}
            saveState={admin.saveState}
            dirtySections={admin.dirtySections}
            onBack={() => router.push("/admin/hackathons")}
          >
            {SectionComponent && admin.hackathon && (
              <SectionComponent
                admin={admin}
                accessToken={accessToken}
                orgId={orgId}
                onSnack={showSnack}
              />
            )}
          </HackathonAdminLayout>
        )}
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminHackathonEditPage;
