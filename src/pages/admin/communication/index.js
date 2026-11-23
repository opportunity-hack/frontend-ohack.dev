import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { Typography, Tabs, Tab, Box } from "@mui/material";
import {
  Email as EmailIcon,
  Send as SendIcon,
  Share as ShareIcon,
  Tag as SlackIcon,
} from "@mui/icons-material";
import { useAuthInfo, withRequiredAuthInfo } from "@propelauth/react";

import AdminPage from "../../../components/admin/AdminPage";
import EmailTemplateManager from "../../../components/admin/EmailTemplateManager";
import EmailCommunication from "../../../components/admin/EmailCommunication";
import SocialMediaManagement from "../../../components/admin/SocialMediaManagement";
import SlackMessageComposer from "../../../components/admin/SlackMessageComposer";

// Order here is the tab order. Tabs are matched by SLUG, so reordering or
// adding one never breaks a ?tab= deep link. With no ?tab= the first tab
// (Slack) opens.
const TABS = [
  { slug: "slack", label: "Slack message", icon: <SlackIcon /> },
  { slug: "email", label: "Email", icon: <SendIcon /> },
  { slug: "templates", label: "Email templates", icon: <EmailIcon /> },
  { slug: "social", label: "Social media", icon: <ShareIcon /> },
];
const TAB_SLUGS = TABS.map((tab) => tab.slug);

const CommunicationAdminPage = withRequiredAuthInfo(({ userClass }) => {
  const { accessToken } = useAuthInfo();
  const router = useRouter();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [activeTab, setActiveTab] = useState(0);

  // NOTE: all hooks run before the permission early-return below — the old
  // /admin/social-media page called useCallback after a conditional return,
  // which violates the Rules of Hooks.
  const handleSnackbar = useCallback((message, severity) => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const handleSnackbarClose = useCallback(() => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  }, []);

  // Hydrate tab from ?tab= once the router is ready (deep links + the
  // /admin/social-media redirect stub land here with ?tab=social).
  useEffect(() => {
    if (!router.isReady) return;
    const idx = TAB_SLUGS.indexOf(router.query.tab);
    if (idx >= 0) setActiveTab(idx);
  }, [router.isReady, router.query.tab]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, tab: TAB_SLUGS[newValue] },
      },
      undefined,
      { shallow: true, scroll: false },
    );
  };

  const activeSlug = TAB_SLUGS[activeTab] || TAB_SLUGS[0];
  const org = userClass.getOrgByName("Opportunity Hack Org");
  const orgId = org?.orgId;
  const isAdmin = org?.hasPermission("volunteer.admin");

  if (!isAdmin) {
    return (
      <AdminPage title="Communication" isAdmin={false}>
        <Typography>You do not have permission to view this page.</Typography>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Communication"
      isAdmin={isAdmin}
      snackbar={snackbar}
      onSnackbarClose={handleSnackbarClose}
    >
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}
      >
        {TABS.map((tab) => (
          <Tab
            key={tab.slug}
            icon={tab.icon}
            iconPosition="start"
            label={tab.label}
            sx={{ textTransform: "none", minHeight: 48 }}
          />
        ))}
      </Tabs>

      {activeSlug === "slack" && (
        <SlackMessageComposer
          accessToken={accessToken}
          orgId={orgId}
          onSnack={handleSnackbar}
        />
      )}
      {activeSlug === "email" && (
        <EmailCommunication
          accessToken={accessToken}
          orgId={orgId}
          onSnack={handleSnackbar}
        />
      )}
      {activeSlug === "templates" && (
        <EmailTemplateManager
          accessToken={accessToken}
          orgId={orgId}
          onSnack={handleSnackbar}
        />
      )}
      {activeSlug === "social" && (
        <Box>
          <SocialMediaManagement
            onSnackbar={handleSnackbar}
            onOpenSlack={() => handleTabChange(null, TAB_SLUGS.indexOf("slack"))}
          />
        </Box>
      )}
    </AdminPage>
  );
});

export default CommunicationAdminPage;
