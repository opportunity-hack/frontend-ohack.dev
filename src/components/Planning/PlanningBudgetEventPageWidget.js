/**
 * Wrapper that mounts on /hack/[event_id] when the admin enabled both
 * planning and the budget_widget_on_event_page toggle. Fetches the board
 * client-side (planning is public-read) so the static event page doesn't
 * need to know about planning data at build time.
 *
 * Renders nothing until the gate is satisfied — safe to mount unconditionally.
 */
import { useEffect, useState } from "react";
import { Alert, Box, Paper, Skeleton, Typography } from "@mui/material";
import NextLink from "next/link";
import PlanningBudgetWidget from "./PlanningBudgetWidget";

const API = process.env.NEXT_PUBLIC_API_SERVER_URL;

export default function PlanningBudgetEventPageWidget({ eventId, donationGoals = {}, donationCurrent = {} }) {
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    let cancelled = false;
    fetch(`${API}/api/planning/${eventId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => !cancelled && setBoard(data))
      .catch(() => !cancelled && setBoard(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  // Gates: planning must be enabled AND the toggle on.
  const planning = board?.planning || {};
  if (loading) {
    return (
      <Box sx={{ minHeight: 200, mb: 2 }}>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
      </Box>
    );
  }
  if (!planning.enabled || !planning.budget_widget_on_event_page) return null;

  const cards = board?.cards || [];

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 2, md: 3 },
        mb: 3,
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          mb: 1.5,
        }}
      >
        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, m: 0 }}>
          Where the money goes
        </Typography>
        <Typography
          component={NextLink}
          href={`/hack/${eventId}/plan`}
          variant="body2"
          sx={{ color: "primary.main", textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
        >
          See the full planning board →
        </Typography>
      </Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Donations support specific line items in our public plan. Earmarked = what we&apos;re
        already committed to spending.
      </Typography>
      <PlanningBudgetWidget
        cards={cards}
        donationGoals={donationGoals}
        donationCurrent={donationCurrent}
      />
    </Paper>
  );
}
