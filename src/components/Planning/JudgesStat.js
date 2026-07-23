import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Link, Tooltip } from "@mui/material";
import NextLink from "next/link";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

export default function JudgesStat({ eventId, targetCount }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    fetch(`${API}/api/messages/volunteer/${eventId}?type=judge`)
      .then((r) => r.ok ? r.json() : null)
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [eventId]);

  if (loading) return <CircularProgress size={14} />;
  if (!data) return null;

  const applied = Array.isArray(data) ? data.length : (data.count ?? 0);
  const selected = Array.isArray(data) ? data.filter((v) => v.checked_in || v.accepted).length : 0;
  const goal = targetCount ?? 15;
  const pct = goal > 0 ? applied / goal : 1;
  const color = pct >= 1 ? "success" : pct >= 0.8 ? "warning" : "error";

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
      <Chip label={`Applied: ${applied}`} size="small" color={color} />
      {selected > 0 && <Chip label={`Selected: ${selected}`} size="small" />}
      <Chip label={`Goal: ${goal}`} size="small" variant="outlined" />
      <Link component={NextLink} href={`/admin/volunteer?type=judge`} fontSize="small">
        Open in admin ↗
      </Link>
    </Box>
  );
}
