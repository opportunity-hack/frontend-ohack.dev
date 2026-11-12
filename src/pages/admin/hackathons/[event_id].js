import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import AdminPage from "../../../components/admin/AdminPage";
import HackathonAdminLayout from "../../../components/admin/hackathon-edit/HackathonAdminLayout";
import {
  SECTIONS,
  defaultSectionForOrg,
  isValidSection,
  sectionsForOrg,
} from "../../../components/admin/hackathon-edit/sectionsManifest";
import { useHackathonAdmin } from "../../../components/admin/hackathon-edit/useHackathonAdmin";
import { orgCanCheckIn, orgIsFullAdmin } from "../../../lib/adminPermissions";

// Dynamic-load section bodies so a single-section view doesn't pull in every
// editor's bundle (especially the heavy Meals/Schedule editors and react-markdown).
const sectionLoaders = {
  overview: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/OverviewSection"
      ),
    { ssr: false },
  ),
  schedule: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/ScheduleSection"
      ),
    { ssr: false },
  ),
  deadlines: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/DeadlinesSection"
      ),
    { ssr: false },
  ),
  meals: dynamic(
    () =>
      import("../../../components/admin/hackathon-edit/sections/MealsSection"),
    { ssr: false },
  ),
  participants: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/ParticipantsSection"
      ),
    { ssr: false },
  ),
  judges: dynamic(
    () =>
      import("../../../components/admin/hackathon-edit/sections/JudgesSection"),
    { ssr: false },
  ),
  nonprofits: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/NonprofitsSection"
      ),
    { ssr: false },
  ),
  media: dynamic(
    () =>
      import("../../../components/admin/hackathon-edit/sections/MediaSection"),
    { ssr: false },
  ),
  planning: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/PlanningSection"
      ),
    { ssr: false },
  ),
  donations: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/DonationsSection"
      ),
    { ssr: false },
  ),
  links: dynamic(
    () =>
      import("../../../components/admin/hackathon-edit/sections/LinksSection"),
    { ssr: false },
  ),
  volunteer: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/VolunteerSection"
      ),
    { ssr: false },
  ),
  teams: dynamic(
    () =>
      import("../../../components/admin/hackathon-edit/sections/TeamsSection"),
    { ssr: false },
  ),
  judging: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/JudgingSection"
      ),
    { ssr: false },
  ),
  checkin: dynamic(
    () =>
      import(
        "../../../components/admin/hackathon-edit/sections/CheckInSection"
      ),
    { ssr: false },
  ),
};

const AdminHackathonEditPage = () => {
  const router = useRouter();
  const { accessToken, userClass } = useAuthInfo();
  const org = userClass?.getOrgByName("Opportunity Hack Org");
  // Full admins open every section; `checkin.admin` desk helpers open ONLY
  // Check-in (sidebar filtered, no back-to-list, writes disabled).
  const isAdmin = orgIsFullAdmin(org);
  const canView = orgCanCheckIn(org);
  const orgId = org?.orgId;
  const allowedSections = useMemo(() => sectionsForOrg(org), [org]);

  const { event_id: eventIdRaw, section: sectionRaw } = router.query;
  const eventId = Array.isArray(eventIdRaw) ? eventIdRaw[0] : eventIdRaw;
  const sectionFromUrl = Array.isArray(sectionRaw) ? sectionRaw[0] : sectionRaw;
  const activeSection = isValidSection(sectionFromUrl, org)
    ? sectionFromUrl
    : defaultSectionForOrg(org);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const showSnack = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const admin = useHackathonAdmin({
    eventId,
    accessToken,
    orgId,
    isAdmin: canView,
    readOnly: !isAdmin,
  });

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
      { shallow: true },
    );
  };

  if (!canView) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin
            postLoginRedirectUrl={
              typeof window !== "undefined" ? window.location.href : ""
            }
          />
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
        <RedirectToLogin
          postLoginRedirectUrl={
            typeof window !== "undefined" ? window.location.href : ""
          }
        />
      }
    >
      <AdminPage
        title={
          admin.hackathon?.title
            ? `${isAdmin ? "Edit" : "Check-in"} · ${admin.hackathon.title}`
            : isAdmin
              ? "Edit Hackathon"
              : "Check-in"
        }
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        isAdmin={isAdmin}
      >
        {/* Blocking spinner only before first load — a background refetch
            must not unmount the layout (and the embedded workbenches). */}
        {admin.loading && !admin.hackathon ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : admin.loadError ? (
          <Alert severity="error" sx={{ my: 2 }}>
            {admin.loadError}
          </Alert>
        ) : (
          <HackathonAdminLayout
            hackathon={admin.hackathon}
            activeSection={activeSection}
            onSelectSection={navigateToSection}
            saveState={admin.saveState}
            dirtySections={admin.dirtySections}
            sections={allowedSections}
            onBack={isAdmin ? () => router.push("/admin/hackathons") : null}
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
