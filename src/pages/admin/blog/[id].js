import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuthInfo, RequiredAuthProvider, RedirectToLogin } from "@propelauth/react";
import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import AdminPage from "../../../components/admin/AdminPage";
import BlogAdminLayout from "../../../components/admin/blog-edit/BlogAdminLayout";
import {
  SECTIONS,
  DEFAULT_SECTION,
  isValidSection,
} from "../../../components/admin/blog-edit/sectionsManifest";
import { useBlogAdmin } from "../../../components/admin/blog-edit/useBlogAdmin";

// Lazy-load section bodies so we don't pull MDEditor on metadata/SEO views.
const sectionLoaders = {
  content: dynamic(() => import("../../../components/admin/blog-edit/sections/ContentSection"), { ssr: false }),
  seo: dynamic(() => import("../../../components/admin/blog-edit/sections/SeoSection"), { ssr: false }),
  metadata: dynamic(() => import("../../../components/admin/blog-edit/sections/MetadataSection"), { ssr: false }),
};

const AdminBlogEditPage = () => {
  const router = useRouter();
  const { accessToken, userClass } = useAuthInfo();
  const org = userClass?.getOrgByName("Opportunity Hack Org");
  const isAdmin = !!org?.hasPermission("volunteer.admin");
  const orgId = org?.orgId;

  const { id: idRaw, section: sectionRaw } = router.query;
  const postId = Array.isArray(idRaw) ? idRaw[0] : idRaw;
  const sectionFromUrl = Array.isArray(sectionRaw) ? sectionRaw[0] : sectionRaw;
  const activeSection = isValidSection(sectionFromUrl) ? sectionFromUrl : DEFAULT_SECTION;

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnack = useCallback((message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  }, []);

  const admin = useBlogAdmin({ postId, accessToken, orgId, isAdmin });

  useEffect(() => {
    if (admin.saveState.status === "error" && admin.saveState.error) {
      showSnack(`Autosave failed: ${admin.saveState.error}`, "error");
    }
  }, [admin.saveState.status, admin.saveState.error, showSnack]);

  const navigateToSection = (slug) => {
    router.replace(
      { pathname: router.pathname, query: { ...router.query, section: slug } },
      undefined,
      { shallow: true, scroll: false }
    );
  };

  if (!isAdmin) {
    return (
      <RequiredAuthProvider
        authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
        displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""} />}
      >
        <AdminPage title="Blog" isAdmin={false}>
          <Typography>You do not have permission to view this page.</Typography>
        </AdminPage>
      </RequiredAuthProvider>
    );
  }

  const SectionComponent = sectionLoaders[activeSection];

  return (
    <RequiredAuthProvider
      authUrl={process.env.NEXT_PUBLIC_REACT_APP_AUTH_URL}
      displayIfLoggedOut={<RedirectToLogin postLoginRedirectUrl={typeof window !== "undefined" ? window.location.href : ""} />}
    >
      <AdminPage
        title="Blog"
        isAdmin={isAdmin}
        snackbar={snackbar}
        onSnackbarClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        {admin.loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}
        {admin.loadError && !admin.loading && (
          <Alert severity="error" sx={{ mb: 2 }}>{admin.loadError}</Alert>
        )}
        {!admin.loading && admin.post && (
          <BlogAdminLayout
            post={admin.post}
            activeSection={activeSection}
            onSelectSection={navigateToSection}
            saveState={admin.saveState}
            dirtySections={admin.dirtySections}
            onBack={() => router.push("/admin/blog")}
          >
            {SectionComponent && (
              <SectionComponent
                admin={admin}
                accessToken={accessToken}
                orgId={orgId}
                onSnack={showSnack}
              />
            )}
          </BlogAdminLayout>
        )}
      </AdminPage>
    </RequiredAuthProvider>
  );
};

export default AdminBlogEditPage;
