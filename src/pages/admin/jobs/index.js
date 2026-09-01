import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  useAuthInfo,
  RequiredAuthProvider,
  RedirectToLogin,
} from "@propelauth/react";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import AdminPage from "../../../components/admin/AdminPage";
import * as ga from "../../../lib/ga";

// Volunteer job board admin: listings CRUD + application review.
// Two tabs shallow-synced to ?tab=listings|applications (communication-page
// pattern). Only the active tab mounts (lazy fetch).

const ListingsTab = dynamic(() => import("../../../components/admin/jobs/ListingsTab"), {
  ssr: false,
});
const ApplicationsTab = dynamic(
  () => import("../../../components/admin/jobs/ApplicationsTab"),
  { ssr: false },
);

const TAB_SLUGS = ["listings", "applications"];

const AdminJobsPage = () => {
  const router = useRouter();
  const { accessToken, userClass } = useAuthInfo();
  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = !!org?.hasPermission("volunteer.admin");
  const orgId = org?.orgId;

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const onSnack = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const tabFromQuery = TAB_SLUGS.indexOf(router.query.tab);
  const activeTab = tabFromQuery === -1 ? 0 : tabFromQuery;

  const handleTabChange = (_e, value) => {
    router.replace(
      { pathname: router.pathname, query: { ...router.query, tab: TAB_SLUGS[value] } },
      undefined,
      { shallow: true, scroll: false },
    );
  };

  useEffect(() => {
    if (isAdmin) {
      ga.trackStructuredEvent(ga.EventCategory.ADMIN, "admin_jobs_view", TAB_SLUGS[activeTab]);
    }
  }, [isAdmin, activeTab]);

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
        <AdminPage title="Jobs" isAdmin={false}>
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
      <Head>
        <title>Jobs Admin — Opportunity Hack</title>
        <meta name="robots" content="noindex" />
      </Head>
      <AdminPage
        title="Volunteer Jobs"
        isAdmin={isAdmin}
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      >
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Listings" />
            <Tab label="Applications" />
          </Tabs>
        </Box>
        {activeTab === 0 ? (
          <ListingsTab
            accessToken={accessToken}
            orgId={orgId}
            isAdmin={isAdmin}
            onSnack={onSnack}
          />
        ) : (
          <ApplicationsTab
            accessToken={accessToken}
            orgId={orgId}
            isAdmin={isAdmin}
            onSnack={onSnack}
          />
        )}
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminJobsPage;
