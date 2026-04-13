import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Chip,
  useMediaQuery,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  CircularProgress,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CodeIcon from "@mui/icons-material/Code";
import GitHubIcon from "@mui/icons-material/GitHub";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import { useEnv } from "../../context/env.context";

function formatDate(isoDate) {
  if (!isoDate) return "";
  try {
    return new Date(isoDate).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return isoDate;
  }
}

function getRepoName(url) {
  if (!url) return "Unknown";
  return url.replace(/\/$/, "").split("/").pop();
}

export default function CertPage() {
  const { apiServerUrl } = useEnv();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [repoFilter, setRepoFilter] = useState("all");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiServerUrl}/api/certificates/recent`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setCerts(data.certs || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [apiServerUrl]);

  const repos = useMemo(() => {
    const repoMap = {};
    certs.forEach((cert) => {
      const name = getRepoName(cert.repository_url);
      repoMap[name] = (repoMap[name] || 0) + 1;
    });
    return Object.entries(repoMap).sort((a, b) => b[1] - a[1]);
  }, [certs]);

  const filtered = useMemo(() => {
    let result = certs;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (cert) =>
          (cert.author_name || "").toLowerCase().includes(q) ||
          (cert.repository_url || "").toLowerCase().includes(q)
      );
    }
    if (repoFilter !== "all") {
      result = result.filter(
        (cert) => getRepoName(cert.repository_url) === repoFilter
      );
    }
    result.sort((a, b) => (b.stats?.commits || 0) - (a.stats?.commits || 0));
    return result;
  }, [certs, search, repoFilter]);

  return (
    <>
      <Head>
        <title>GitHub Certificates | Opportunity Hack</title>
        <meta
          name="description"
          content="View GitHub contribution certificates earned by Opportunity Hack volunteers who donated their coding skills to help nonprofits."
        />
      </Head>

      {/* Hero */}
      <Box
        sx={{
          position: "relative",
          height: { xs: 180, sm: 240, md: 300 },
          width: "100%",
          overflow: "hidden",
          mb: { xs: 3, md: 4 },
        }}
      >
        <Image
          src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp"
          fill
          sizes="100vw"
          alt="Opportunity Hack volunteers coding together at a hackathon for nonprofits"
          style={{ objectFit: "cover" }}
          priority
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.65) 100%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            p: { xs: 2.5, md: 4 },
            textAlign: "center",
          }}
        >
          <GitHubIcon sx={{ fontSize: 40, color: "#fff", mb: 0.5 }} />
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: "1.75rem", md: "2.5rem" },
              color: "#fff",
              textShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          >
            GitHub Certificates
          </Typography>
        </Box>
      </Box>

      <Box
        sx={{
          maxWidth: 1100,
          mx: "auto",
          px: { xs: 2, md: 3 },
          pb: { xs: 3, md: 5 },
        }}
      >
        {/* Intro */}
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 700,
              mx: "auto",
              lineHeight: 1.7,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
          >
            Every line of code counts. These certificates recognize the GitHub
            contributions of volunteers who donated their skills to build
            technology solutions for nonprofits through Opportunity Hack.
          </Typography>
        </Box>

        {/* Search + Repo Filter */}
        <Box sx={{ mb: { xs: 3, md: 4 }, maxWidth: 640, mx: "auto" }}>
          <TextField
            fullWidth
            placeholder="Search by contributor or repository..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            aria-label="Search certificates"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, backgroundColor: "#fafafa" },
            }}
          />
          {repos.length > 1 && (
            <Box sx={{ mt: 1.5, display: "flex", justifyContent: "center" }}>
              <ToggleButtonGroup
                value={repoFilter}
                exclusive
                onChange={(_, val) => val && setRepoFilter(val)}
                size="small"
                aria-label="Filter by repository"
                sx={{
                  flexWrap: "wrap",
                  justifyContent: "center",
                  "& .MuiToggleButton-root": {
                    textTransform: "none",
                    px: { xs: 1, sm: 1.5 },
                    py: 0.5,
                    fontSize: { xs: "0.7rem", sm: "0.8rem" },
                  },
                }}
              >
                <ToggleButton value="all">All ({certs.length})</ToggleButton>
                {repos.map(([name, count]) => (
                  <ToggleButton key={name} value={name}>
                    {name} ({count})
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}
          {(search || repoFilter !== "all") && (
            <Typography
              variant="caption"
              sx={{
                mt: 0.5,
                display: "block",
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              {filtered.length} certificate{filtered.length !== 1 ? "s" : ""}{" "}
              found
            </Typography>
          )}
        </Box>

        {/* Loading */}
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress />
          </Box>
        )}

        {/* Certificate Grid */}
        {!loading && (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: { xs: 2, md: 3 },
            }}
          >
            {filtered.map((cert) => {
              const repoName = getRepoName(cert.repository_url);
              const stats = cert.stats || {};
              return (
                <Box
                  key={cert.file_id}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: 3,
                    overflow: "hidden",
                    border: "1px solid rgba(0,0,0,0.08)",
                    backgroundColor: "#fff",
                    transition:
                      "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  {/* Certificate image */}
                  <Link href={`/cert/${cert.file_id}`} passHref legacyBehavior>
                    <Box
                      component="a"
                      sx={{
                        position: "relative",
                        width: "100%",
                        aspectRatio: "1 / 1",
                        display: "block",
                        backgroundColor: "#1a1a2e",
                      }}
                    >
                      <Image
                        src={cert.certificate_url}
                        fill
                        sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                        alt={`GitHub certificate for ${cert.author_name}`}
                        style={{ objectFit: "cover" }}
                      />
                    </Box>
                  </Link>

                  {/* Card body */}
                  <Box sx={{ p: 2 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 700,
                        lineHeight: 1.3,
                        mb: 0.5,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {cert.author_name}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary", display: "block", mb: 1 }}
                    >
                      {formatDate(cert.date)}
                    </Typography>

                    {/* Repo chip */}
                    <Chip
                      icon={<GitHubIcon sx={{ fontSize: 14 }} />}
                      label={repoName}
                      size="small"
                      component="a"
                      href={cert.repository_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      clickable
                      variant="outlined"
                      sx={{
                        mb: 1.5,
                        maxWidth: "100%",
                        fontSize: "0.75rem",
                        height: 26,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />

                    {/* Stats row */}
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        flexWrap: "wrap",
                        color: "text.secondary",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <CodeIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {stats.commits || 0}
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <AccessTimeIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {stats.hours || 0}h
                        </Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                        <InsertDriveFileIcon sx={{ fontSize: 14 }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {(stats.lines_of_code || 0).toLocaleString()} LOC
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </Box>
        )}

        {!loading && filtered.length === 0 && (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}
          >
            {certs.length === 0
              ? "No certificates have been generated yet."
              : "No certificates match your search. Try adjusting your filters."}
          </Typography>
        )}

        {/* CTA Section */}
        <Box
          sx={{
            mt: { xs: 5, md: 6 },
            p: { xs: 3, md: 4 },
            borderRadius: 3,
            backgroundColor: "#f5f5f5",
            textAlign: "center",
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{ fontWeight: 700, mb: 1.5 }}
          >
            Want to Earn a Certificate?
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 560,
              mx: "auto",
              mb: 2,
            }}
          >
            Contribute code to a nonprofit project at an Opportunity Hack event
            and earn a personalized GitHub certificate recognizing your impact.
          </Typography>
          <Box
            sx={{
              display: "flex",
              gap: 2,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <Link href="/about/hearts" passHref legacyBehavior>
              <Chip
                component="a"
                label="How Hearts Work"
                clickable
                sx={{ fontWeight: 600, px: 1 }}
              />
            </Link>
            <Link href="/hack" passHref legacyBehavior>
              <Chip
                component="a"
                label="Join a Hackathon"
                clickable
                color="primary"
                sx={{ fontWeight: 600, px: 1 }}
              />
            </Link>
            <Link href="/community-champions" passHref legacyBehavior>
              <Chip
                component="a"
                label="Community Champions"
                clickable
                sx={{ fontWeight: 600, px: 1 }}
              />
            </Link>
          </Box>
        </Box>
      </Box>
    </>
  );
}

export const getStaticProps = async () => {
  const title =
    "GitHub Certificates - Recognizing Open Source Contributors | Opportunity Hack";
  const description =
    "View GitHub contribution certificates earned by Opportunity Hack volunteers who donated their coding skills to build technology solutions for nonprofits.";

  return {
    props: {
      title,
      description,
      openGraphData: [
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        {
          property: "og:image",
          content: "https://cdn.ohack.dev/ohack.dev/2023_hackathon_3.webp",
        },
      ],
    },
  };
};
