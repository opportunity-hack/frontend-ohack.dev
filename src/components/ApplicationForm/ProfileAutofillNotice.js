import React from "react";
import { Alert, Link, Typography } from "@mui/material";

const ProfileAutofillNotice = ({
  show,
  message = "We've automatically filled in some fields using your existing profile information. You can edit any field as needed.",
  linkLabel = "View/edit your profile",
  linkHref = "/profile",
  sx,
}) => {
  if (!show) return null;
  return (
    <Alert severity="success" sx={{ mb: 3, ...sx }}>
      <Typography variant="body1">
        ✓ {message}{" "}
        <Link href={linkHref} sx={{ fontWeight: "bold" }}>
          {linkLabel}
        </Link>
      </Typography>
    </Alert>
  );
};

export default ProfileAutofillNotice;
