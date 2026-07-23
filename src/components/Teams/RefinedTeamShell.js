import React from "react";
import Head from "next/head";
import { Box } from "@mui/material";
import { RefinedFonts, RefinedRoot } from "../design/refined";

// Lightweight refined shell used by the team sub-pages for loading / error /
// content states. Mirrors the inline Shell on the team overview page so the
// chrome (warm paper, fonts, wrap, top padding clearing the fixed navbar) is
// identical across the family.
export function Shell({ children, maxWidth = 1120 }) {
  return (
    <RefinedRoot>
      <Head>
        <RefinedFonts />
      </Head>
      <Box
        className="ohx-wrap"
        sx={{ maxWidth, pt: "clamp(96px, 12vh, 150px)", pb: { xs: 8, md: 12 } }}
      >
        {children}
      </Box>
    </RefinedRoot>
  );
}

export default Shell;
