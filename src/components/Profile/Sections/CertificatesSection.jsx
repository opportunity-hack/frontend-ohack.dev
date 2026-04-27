import React, { memo } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
} from "@mui/material";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import Link from "next/link";

/**
 * Lists certificates issued to the user. We treat each entry as
 * `{ id, title, hackathon_title?, issued_date?, certificate_url? }` so it works
 * both with the per-hackathon certificate URLs surfaced today and a future
 * dedicated certificates endpoint.
 */
function CertificatesSection({ certificates = [], mode = "public" }) {
  if (!certificates || certificates.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        {mode === "private"
          ? "Your certificates will appear here after a project is recognized — usually a few weeks after a hackathon."
          : "No certificates yet."}
      </Typography>
    );
  }

  return (
    <Stack spacing={2}>
      {certificates.map((cert) => {
        const href = cert.id
          ? `/cert/${cert.id}`
          : cert.certificate_url || "#";
        return (
          <Paper
            key={cert.id || cert.certificate_url}
            variant="outlined"
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
              flexWrap: "wrap",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <EmojiEventsIcon color="primary" />
              <Box>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {cert.title || cert.hackathon_title || "Certificate"}
                </Typography>
                {cert.issued_date && (
                  <Typography variant="caption" color="text.secondary">
                    Issued {cert.issued_date}
                  </Typography>
                )}
              </Box>
            </Box>
            <Button
              component={Link}
              href={href}
              variant="outlined"
              size="small"
              endIcon={<OpenInNewIcon fontSize="small" />}
            >
              View certificate
            </Button>
          </Paper>
        );
      })}
    </Stack>
  );
}

CertificatesSection.propTypes = {
  certificates: PropTypes.array,
  mode: PropTypes.oneOf(["public", "private"]),
};

export default memo(CertificatesSection);
