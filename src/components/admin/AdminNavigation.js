import React from "react";
import { useRouter } from "next/router";
import { Breadcrumbs, Link, Tabs, Tab, Box } from "@mui/material";
import { styled } from "@mui/system";

const StyledBreadcrumbs = styled(Breadcrumbs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const adminPages = [
  { path: "/admin/hearts", label: "Hearts" },
  { path: "/admin/nonprofit", label: "Nonprofit" },
  { path: "/admin/profile", label: "Profile" },
  { path: "/admin/volunteer", label: "Volunteer" },
];

const AdminNavigation = () => {
  const router = useRouter();
  const currentPath = router.pathname;

  const handleTabChange = (event, newValue) => {
    router.push(adminPages[newValue].path);
  };

  return (
    <Box>
      <StyledBreadcrumbs aria-label="breadcrumb">
        <Link color="inherit" href="/">
          Home
        </Link>
        <Link color="inherit" href="/admin">
          Admin
        </Link>
        <Link color="textPrimary" href={currentPath} aria-current="page">
          {adminPages.find((page) => page.path === currentPath)?.label ||
            "Current Page"}
        </Link>
      </StyledBreadcrumbs>
      <StyledTabs
        value={adminPages.findIndex((page) => page.path === currentPath)}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="scrollable"
        scrollButtons="auto"
      >
        {adminPages.map((page, index) => (
          <Tab key={page.path} label={page.label} />
        ))}
      </StyledTabs>
    </Box>
  );
};

export default AdminNavigation;
