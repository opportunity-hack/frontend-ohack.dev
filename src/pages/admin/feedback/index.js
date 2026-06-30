import React, { useState } from "react";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import {
  Poll as SurveyIcon,
  RateReview as PeerIcon,
  School as OnboardingIcon,
} from "@mui/icons-material";
import AdminPage from "../../../components/admin/AdminPage";
import EventSurveysPanel from "../../../components/admin/feedback/EventSurveysPanel";
import PeerFeedbackPanel from "../../../components/admin/feedback/PeerFeedbackPanel";
import OnboardingPanel from "../../../components/admin/feedback/OnboardingPanel";

const TABS = [
  { label: "Event Surveys", icon: <SurveyIcon /> },
  { label: "Peer Feedback", icon: <PeerIcon /> },
  { label: "Onboarding", icon: <OnboardingIcon /> },
];

const AdminFeedbackPage = () => {
  const { accessToken, userClass } = useAuthInfo();
  const [tab, setTab] = useState(0);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = org?.hasPermission("volunteer.admin");
  const orgId = org?.orgId;

  const notify = (message, severity = "error") =>
    setSnackbar({ open: true, message, severity });

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={
          <RedirectToLogin
            postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""}
          />
        }
      >
        <AdminPage title="Feedback" isAdmin={false}>
          <Typography>You do not have permission to view this page.</Typography>
        </AdminPage>
      </RequiredAuthProvider>
    );
  }

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={
        <RedirectToLogin
          postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""}
        />
      }
    >
      <AdminPage
        title="Feedback"
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        isAdmin={isAdmin}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Review event surveys, peer-to-peer feedback, and onboarding feedback in one place.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            variant="scrollable"
            scrollButtons="auto"
            allowScrollButtonsMobile
          >
            {TABS.map((t, i) => (
              <Tab key={t.label} icon={t.icon} iconPosition="start" label={t.label} id={`feedback-tab-${i}`} />
            ))}
          </Tabs>
        </Box>

        {/* Mount only the active tab so each source fetches lazily on demand. */}
        {tab === 0 && <EventSurveysPanel accessToken={accessToken} orgId={orgId} onError={notify} />}
        {tab === 1 && <PeerFeedbackPanel accessToken={accessToken} orgId={orgId} onError={notify} />}
        {tab === 2 && <OnboardingPanel accessToken={accessToken} orgId={orgId} onError={notify} />}
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminFeedbackPage;
