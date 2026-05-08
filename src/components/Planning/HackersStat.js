import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Link } from "@mui/material";
import NextLink from "next/link";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

export default function HackersStat({ eventId, targetCount }) {
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

  const applied = data?.hacker_count ?? data?.hackers?.length ?? 0;
  const capacity = targetCount ?? 90;
  const pct = capacity > 0 ? applied / capacity : 1;
  const color = pct >= 1 ? "error" : pct >= 0.8 ? "warning" : "success";

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
      <Chip label={`Applied: ${applied}`} size="small" color={color} />
      <Chip label={`Capacity: ${capacity}`} size="small" variant="outlined" />
      <Link component={NextLink} href="/admin/hackathons" fontSize="small">
        Open in admin ↗
      </Link>
    </Box>
  );
}
