import { useEffect, useState } from "react";
import { Box, Chip, CircularProgress, Link } from "@mui/material";
import NextLink from "next/link";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

export default function TeamsStat({ eventId }) {
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

  const count = data?.teams?.length ?? 0;

  return (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
      <Chip label={`Teams formed: ${count}`} size="small" color={count > 0 ? "success" : "default"} />
      <Link component={NextLink} href="/admin/hackathons" fontSize="small">
        Open in admin ↗
      </Link>
    </Box>
  );
}
