import { Box, LinearProgress, Stack, Tooltip, Typography } from "@mui/material";

const BUCKETS = ["food", "prize", "swag"];
const BUCKET_LABELS = { food: "Food", prize: "Prize", swag: "Swag" };

function BucketBar({ bucket, goal, raised, earmarked, spent }) {
  const max = Math.max(goal, earmarked, 1);
  const raisedPct = Math.min((raised / max) * 100, 100);
  const earmarkedPct = Math.min((earmarked / max) * 100, 100);
  const spentPct = Math.min((spent / max) * 100, 100);

  const overCommitted = earmarked > goal;
  const color = raised >= earmarked ? "success" : overCommitted ? "error" : "warning";

  const fmt = (cents) => `$${(cents / 100).toLocaleString()}`;

  return (
    <Box sx={{ mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
        <Typography variant="body2" fontWeight={600}>
          {BUCKET_LABELS[bucket]}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Raised {fmt(raised)} · Plan {fmt(earmarked)} · Spent {fmt(spent)} · Goal {fmt(goal)}
        </Typography>
      </Stack>

      <Tooltip title={`Raised: ${fmt(raised)} of ${fmt(goal)} goal`}>
        <LinearProgress
          variant="determinate"
          value={raisedPct}
          color={color}
          sx={{ height: 8, borderRadius: 1, mb: 0.5 }}
        />
      </Tooltip>
      <Tooltip title={`Earmarked (planned spend): ${fmt(earmarked)}`}>
        <LinearProgress
          variant="determinate"
          value={earmarkedPct}
          color="info"
          sx={{ height: 5, borderRadius: 1, mb: 0.5, opacity: 0.7 }}
        />
      </Tooltip>
      <Tooltip title={`Spent (paid): ${fmt(spent)}`}>
        <LinearProgress
          variant="determinate"
          value={spentPct}
          color="secondary"
          sx={{ height: 5, borderRadius: 1, opacity: 0.5 }}
        />
      </Tooltip>
    </Box>
  );
}

/**
 * PlanningBudgetWidget — shows Goal/Raised/Earmarked/Spent per bucket.
 *
 * Props:
 *   cards: all planning cards (used to compute earmarked/spent sums)
 *   donationGoals: hackathon.donation_goals (keyed by bucket)
 *   donationCurrent: hackathon.donation_current (keyed by bucket)
 */
export default function PlanningBudgetWidget({ cards = [], donationGoals = {}, donationCurrent = {} }) {
  function getGoalCents(bucket) {
    const val = donationGoals[bucket];
    if (!val) return 0;
    // donation_goals values may be strings like "$5000" or numbers
    return typeof val === "number" ? val * 100 : parseInt(String(val).replace(/\D/g, "")) * 100 || 0;
  }

  function getRaisedCents(bucket) {
    const val = donationCurrent[bucket];
    if (!val) return 0;
    return typeof val === "number" ? val * 100 : parseInt(String(val).replace(/\D/g, "")) * 100 || 0;
  }

  function sumBudget(bucket, states = null) {
    return cards
      .filter((c) => {
        const b = c.budget;
        if (!b || b.bucket !== bucket) return false;
        if (states && !states.includes(b.state)) return false;
        return true;
      })
      .reduce((sum, c) => sum + (c.budget.amount_cents || 0), 0);
  }

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
        Budget overview
      </Typography>
      {BUCKETS.map((bucket) => (
        <BucketBar
          key={bucket}
          bucket={bucket}
          goal={getGoalCents(bucket)}
          raised={getRaisedCents(bucket)}
          earmarked={sumBudget(bucket)}
          spent={sumBudget(bucket, ["paid"])}
        />
      ))}
      <Stack direction="row" spacing={2}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 8, borderRadius: 1, bgcolor: "success.main" }} />
          <Typography variant="caption">Raised</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 8, borderRadius: 1, bgcolor: "info.main", opacity: 0.7 }} />
          <Typography variant="caption">Earmarked (plan)</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Box sx={{ width: 12, height: 8, borderRadius: 1, bgcolor: "secondary.main", opacity: 0.5 }} />
          <Typography variant="caption">Spent</Typography>
        </Box>
      </Stack>
    </Box>
  );
}
