import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Link } from "@mui/material";
import NextLink from "next/link";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

export default function NonprofitsStat({ eventId, targetCount }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    fetch(`${API}/api/messages/hackathon/${eventId}`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  if (loading) return <CircularProgress size={14} />;

  const confirmed = data?.nonprofits?.length ?? 0;
  const goal = targetCount ?? 8;
  const over = confirmed > goal;
  const color = confirmed >= goal ? "success" : confirmed >= goal * 0.8 ? "warning" : "error";

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
      <Chip label={`Confirmed: ${confirmed}${over ? " (over goal!)" : ""}`} size="small" color={color} />
      <Chip label={`Goal: ${goal}`} size="small" variant="outlined" />
      <Link component={NextLink} href="/admin/nonprofit" fontSize="small">
        Open in admin ↗
      </Link>
    </Box>
  );
}
