import dynamic from "next/dynamic";
import React from "react";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box } from "@mui/material";
import theme from "../../assets/theme";

const NavBarPlaceholder = () => <Box sx={{ height: "64px", width: "100%", bgcolor: "primary.main" }} />;
const FooterPlaceholder = () => <Box sx={{ height: "200px", width: "100%", bgcolor: "primary.main", mt: 4 }} />;

const PublicProfileComponent = dynamic(
  () => import("../../components/Profile/PublicProfile"),
  {
    ssr: false,
    loading: () => (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh", p: 3 }}>
        <div>Loading profile...</div>
      </Box>
    ),
  }
);

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://ohack.dev";
const FALLBACK_OG_IMAGE = "https://cdn.ohack.dev/ohack.dev/2024_hackathon_2.webp";

function buildDescription(profile) {
  if (!profile) return "View this Opportunity Hack community member's profile.";
  const name = profile.name || "Community member";
  const role = profile.role;
  const company = profile.company;
  const why = profile.why;
  if (why) {
    return why.length > 160 ? `${why.slice(0, 157)}...` : why;
  }
  if (role && company) return `${name} — ${role} at ${company}. Opportunity Hack community member.`;
  if (role) return `${name} — ${role}. Opportunity Hack community member.`;
  if (company) return `${name} from ${company}. Opportunity Hack community member.`;
  return `${name}'s public profile on the Opportunity Hack community board.`;
}

export default function PublicProfilePage() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline>
        <Box className="page-layout" sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <NavBarPlaceholder />
          <Box sx={{ flex: 1, p: { xs: 1, sm: 2 } }}>
            <PublicProfileComponent />
          </Box>
          <FooterPlaceholder />
        </Box>
      </CssBaseline>
    </ThemeProvider>
  );
}

export async function getServerSideProps({ params, res }) {
  const userid = params?.userid || "";
  let profile = null;

  try {
    const apiBase = process.env.NEXT_PUBLIC_API_SERVER_URL;
    if (apiBase) {
      const apiRes = await fetch(`${apiBase}/api/users/${encodeURIComponent(userid)}/profile/public`, {
        headers: { "Content-Type": "application/json" },
      });
      if (apiRes.ok) {
        profile = await apiRes.json();
      }
    }
  } catch (err) {
    profile = null;
  }

  if (res) {
    res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  }

  const displayName = profile?.name || "Profile";
  const title = `${displayName} — Opportunity Hack Developer Portal`;
  const description = buildDescription(profile);
  const image = profile?.profile_image || FALLBACK_OG_IMAGE;
  const url = `${SITE_URL}/profile/${userid}`;

  // Match the openGraphData shape that _app.js renders into <Head>
  const openGraphData = [
    { name: "description", content: description, key: "desc" },
    { property: "og:type", content: "profile", key: "ogtype" },
    { property: "og:title", content: title, key: "ogtitle" },
    { property: "og:description", content: description, key: "ogdesc" },
    { property: "og:image", content: image, key: "ogimage" },
    { property: "og:url", content: url, key: "ogurl" },
    { property: "og:site_name", content: "Opportunity Hack Developer Portal", key: "ogsitename" },
    { name: "twitter:card", content: "summary_large_image", key: "twcard" },
    { name: "twitter:title", content: title, key: "twtitle" },
    { name: "twitter:description", content: description, key: "twdesc" },
    { name: "twitter:image", content: image, key: "twimage" },
    { name: "twitter:domain", content: "ohack.dev", key: "twdomain" },
  ];

  return {
    props: {
      userid,
      profile,
      title,
      canonical: url,
      openGraphData,
    },
  };
}
