import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import Link from "next/link";
import { useEnv } from "../../context/env.context";

const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"];

const HeartsLeaderboard = () => {
  const { apiServerUrl } = useEnv();
  const [leaders, setLeaders] = useState([]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiServerUrl}/api/hearts/leaderboard?limit=10`, {
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => setLeaders(data.leaderboard || []))
      .catch(() => {});
    return () => controller.abort();
  }, [apiServerUrl]);

  if (!leaders.length) return null;

  const avatarSize = isMobile ? 36 : 48;
  const badgeSize = isMobile ? 16 : 20;

  return (
    <Box
      sx={{
        py: { xs: 1.5, md: 2 },
        px: { xs: 0.5, md: 2 },
        mb: { xs: 1.5, md: 2 },
        backgroundColor: "rgba(255,255,255,0.65)",
        borderRadius: 3,
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      <Link href="/community-champions" passHref legacyBehavior>
        <Typography
          component="a"
          variant="subtitle2"
          sx={{
            textAlign: "center",
            fontWeight: 700,
            mb: { xs: 1, md: 1.5 },
            color: "#333",
            fontSize: { xs: "0.85rem", md: "1rem" },
            display: "block",
            textDecoration: "none",
            "&:hover": { color: "#1976d2", textDecoration: "underline" },
          }}
        >
          Community Champions
        </Typography>
      </Link>

      <Box
        sx={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          gap: { xs: 0, md: 1 },
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
        }}
      >
        {leaders.map((entry, idx) => {
          const firstName = (entry.name || "").split(" ")[0];
          const borderColor = idx < 3 ? rankColors[idx] : "transparent";

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
                  flex: "0 0 auto",
                  width: { xs: 54, sm: 64, md: 80 },
                  py: 0.5,
                  borderRadius: 2,
                  transition: "transform 0.15s, background-color 0.15s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    backgroundColor: "rgba(0,0,0,0.02)",
                  },
                }}
              >
                <Box sx={{ position: "relative", mb: 0.25 }}>
                  <Avatar
                    src={entry.profileImage}
                    alt={firstName}
                    sx={{
                      width: avatarSize,
                      height: avatarSize,
                      border: `2.5px solid ${borderColor}`,
                      fontSize: isMobile ? 14 : 18,
                    }}
                  />
                  {idx < 3 && (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -3,
                        right: -3,
                        width: badgeSize,
                        height: badgeSize,
                        borderRadius: "50%",
                        backgroundColor: rankColors[idx],
                        color: idx === 0 ? "#333" : "#fff",
                        fontSize: isMobile ? 9 : 11,
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                      }}
                    >
                      {idx + 1}
                    </Box>
                  )}
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: 10, md: 12 },
                    textAlign: "center",
                    lineHeight: 1.1,
                    maxWidth: "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {firstName}
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                  }}
                >
                  <FavoriteIcon
                    sx={{ fontSize: { xs: 10, md: 12 }, color: "#e53935" }}
                  />
                  <Typography
                    variant="caption"
                    sx={{ fontSize: { xs: 9, md: 11 }, color: "#666" }}
                  >
                    {entry.totalHearts}
                  </Typography>
                </Box>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Box>
  );
};

export default HeartsLeaderboard;
