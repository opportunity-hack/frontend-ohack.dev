import React, { useEffect, useState, useMemo } from "react";
import {
  Box,
  Typography,
  Avatar,
  TextField,
  InputAdornment,
  Chip,
  useMediaQuery,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import Link from "next/link";
import Image from "next/image";
import Head from "next/head";
import { useEnv } from "../../context/env.context";
import { TIERS, getTierForHearts } from "../../lib/heartTiers";

export default function CommunityChampions() {
  const { apiServerUrl } = useEnv();
  const [leaders, setLeaders] = useState([]);
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState("all");
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiServerUrl}/api/hearts/leaderboard?limit=50`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setLeaders(data.leaderboard || []))
      .catch(() => {});
    return () => controller.abort();
  }, [apiServerUrl]);

  const filtered = useMemo(() => {
    let result = leaders;
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((entry) =>
        (entry.name || "").toLowerCase().includes(q)
      );
    }
    if (tierFilter !== "all") {
      result = result.filter((entry) => {
        const tier = getTierForHearts(entry.totalHearts);
        return tier && tier.name === tierFilter;
      });
    }
    return result;
  }, [leaders, search, tierFilter]);

  // Count champions per tier for the filter chips
  const tierCounts = useMemo(() => {
    const counts = {};
    leaders.forEach((entry) => {
      const tier = getTierForHearts(entry.totalHearts);
      const name = tier ? tier.name : "Newcomer";
      counts[name] = (counts[name] || 0) + 1;
    });
    return counts;
  }, [leaders]);

  const structuredData = useMemo(() => {
    if (!leaders.length) return null;
    return {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Opportunity Hack Community Champions",
      description:
        "Top volunteers, mentors, and hackers who have earned the most hearts through their contributions to Opportunity Hack.",
      numberOfItems: leaders.length,
      itemListElement: leaders.map((entry, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        item: {
          "@type": "Person",
          name: entry.name,
          url: `https://ohack.dev/profile/${entry.userId}`,
          ...(entry.profileImage && { image: entry.profileImage }),
        },
      })),
    };
  }, [leaders]);

  return (
    <>
      {structuredData && (
        <Head>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        </Head>
      )}

      {/* Hero image — outside content container to avoid scrollbar reflow */}
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
          src="https://cdn.ohack.dev/ohack.dev/2023_hackathon_4.webp"
          fill
          sizes="100vw"
          alt="Opportunity Hack volunteers collaborating at a hackathon for nonprofits"
          style={{ objectFit: "cover" }}
          priority
        />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)",
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
          <EmojiEventsIcon sx={{ fontSize: 40, color: "#FFD700", mb: 0.5 }} />
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
            Community Champions
          </Typography>
        </Box>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", px: { xs: 2, md: 3 }, pb: { xs: 3, md: 5 } }}>
        <Box sx={{ textAlign: "center", mb: { xs: 3, md: 4 } }}>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              maxWidth: 680,
              mx: "auto",
              lineHeight: 1.7,
              fontSize: { xs: "0.95rem", md: "1.05rem" },
            }}
          >
            These volunteers power Opportunity Hack's mission to connect
            technology with nonprofits. Through mentoring, judging, hacking, and
            contributing code, they earn{" "}
            <Link href="/about/hearts" passHref legacyBehavior>
              <Box
                component="a"
                sx={{
                  color: "#e53935",
                  fontWeight: 600,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                hearts
              </Box>
            </Link>{" "}
            — our way of recognizing the people who make tech-for-good happen.
          </Typography>
        </Box>

        {/* Tier Legend */}
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1.5,
            mb: 3,
          }}
        >
          {TIERS.map((tier) => (
            <Box
              key={tier.name}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
              }}
            >
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  backgroundColor: tier.color,
                  border: tier.name === "Diamond" ? "1px solid #90caf9" : "none",
                }}
              />
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                {tier.name} ({tier.minHearts}+ hearts)
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Search + Tier Filter */}
        <Box sx={{ mb: { xs: 3, md: 4 }, maxWidth: 580, mx: "auto" }}>
          <TextField
            fullWidth
            placeholder="Search champions by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            aria-label="Search community champions"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.disabled" }} />
                </InputAdornment>
              ),
              sx: { borderRadius: 3, backgroundColor: "#fafafa" },
            }}
          />
          <Box
            sx={{
              mt: 1.5,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ToggleButtonGroup
              value={tierFilter}
              exclusive
              onChange={(_, val) => val && setTierFilter(val)}
              size="small"
              aria-label="Filter by tier"
              sx={{
                flexWrap: "wrap",
                justifyContent: "center",
                "& .MuiToggleButton-root": {
                  textTransform: "none",
                  px: { xs: 1, sm: 1.5 },
                  py: 0.5,
                  fontSize: { xs: "0.75rem", sm: "0.8rem" },
                },
              }}
            >
              <ToggleButton value="all">
                All ({leaders.length})
              </ToggleButton>
              {[...TIERS].reverse().map((tier) => (
                <ToggleButton key={tier.name} value={tier.name}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      backgroundColor: tier.color,
                      mr: 0.5,
                      border: tier.name === "Diamond" ? "1px solid #90caf9" : "none",
                    }}
                  />
                  {tier.name} ({tierCounts[tier.name] || 0})
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>
          {(search || tierFilter !== "all") && (
            <Typography
              variant="caption"
              sx={{ mt: 0.5, display: "block", textAlign: "center", color: "text.secondary" }}
            >
              {filtered.length} champion{filtered.length !== 1 ? "s" : ""} found
            </Typography>
          )}
        </Box>

        {/* Champions Grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "repeat(2, 1fr)",
              sm: "repeat(3, 1fr)",
              md: "repeat(4, 1fr)",
            },
            gap: { xs: 1.5, md: 2.5 },
          }}
        >
          {filtered.map((entry) => {
            const tier = getTierForHearts(entry.totalHearts);
            const tierColor = tier ? tier.color : "#ccc";
            const tierName = tier ? tier.name : "Newcomer";
            const hasTier = !!tier;

            return (
              <Link
                key={entry.userId}
                href={`/profile/${entry.userId}`}
                passHref
                legacyBehavior
              >
                <Box
                  component="a"
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textDecoration: "none",
                    color: "inherit",
                    p: { xs: 2, md: 2.5 },
                    borderRadius: 3,
                    backgroundColor: hasTier ? `${tierColor}08` : "#fafafa",
                    border: hasTier
                      ? `1.5px solid ${tierColor}40`
                      : "1px solid rgba(0,0,0,0.06)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: "0 6px 20px rgba(0,0,0,0.08)",
                    },
                  }}
                >
                  {/* Tier badge */}
                  <Chip
                    label={tierName}
                    size="small"
                    sx={{
                      mb: 1,
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      height: 22,
                      backgroundColor: hasTier ? tierColor : "#e0e0e0",
                      color:
                        tierName === "Gold" || tierName === "Platinum" || tierName === "Diamond"
                          ? "#333"
                          : "#fff",
                      border: tierName === "Diamond" ? "1px solid #90caf9" : "none",
                    }}
                  />

                  {/* Avatar */}
                  <Box sx={{ position: "relative", mb: 1 }}>
                    <Avatar
                      src={entry.profileImage}
                      alt={`${entry.name} - Opportunity Hack ${tierName} community champion`}
                      sx={{
                        width: { xs: 64, md: 80 },
                        height: { xs: 64, md: 80 },
                        border: `3px solid ${tierColor}`,
                        fontSize: { xs: 20, md: 26 },
                      }}
                    />
                  </Box>

                  {/* Name */}
                  <Typography
                    variant="subtitle2"
                    component="h2"
                    sx={{
                      fontWeight: 700,
                      textAlign: "center",
                      lineHeight: 1.2,
                      mb: 0.5,
                      fontSize: { xs: "0.85rem", md: "0.95rem" },
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "100%",
                    }}
                  >
                    {entry.name}
                  </Typography>

                  {/* Hearts */}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 0.5,
                    }}
                  >
                    <FavoriteIcon sx={{ fontSize: 16, color: "#e53935" }} />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 600, color: "#666" }}
                    >
                      {entry.totalHearts} heart{entry.totalHearts !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                </Box>
              </Link>
            );
          })}
        </Box>

        {filtered.length === 0 && (search || tierFilter !== "all") && (
          <Typography
            sx={{ textAlign: "center", color: "text.secondary", mt: 4 }}
          >
            No champions found. Try adjusting your search or filter.
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
            Join Our Champions
          </Typography>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", maxWidth: 560, mx: "auto", mb: 2 }}
          >
            Earn hearts by volunteering as a mentor, judge, or hacker at
            Opportunity Hack events. Start at Bronze and work your way up to
            Diamond — every contribution moves us closer to a world where every
            nonprofit has the technology it needs.
          </Typography>
          <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/about/hearts" passHref legacyBehavior>
              <Chip
                component="a"
                label="How Hearts Work"
                clickable
                sx={{ fontWeight: 600, px: 1 }}
              />
            </Link>
            <Link href="/about/mentors" passHref legacyBehavior>
              <Chip
                component="a"
                label="Become a Mentor"
                clickable
                sx={{ fontWeight: 600, px: 1 }}
              />
            </Link>
            <Link href="/about/judges" passHref legacyBehavior>
              <Chip
                component="a"
                label="Become a Judge"
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
