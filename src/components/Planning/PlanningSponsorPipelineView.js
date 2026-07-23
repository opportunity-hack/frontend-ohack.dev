import { Box, Chip, Paper, Stack, Typography } from "@mui/material";

const STATUSES = ["prospect", "contacted", "in-discussion", "committed", "declined", "no-response"];
const STATUS_COLORS = {
  prospect: "default",
  contacted: "primary",
  "in-discussion": "warning",
  committed: "success",
  declined: "error",
  "no-response": "default",
};

function fmt(cents) {
  return cents > 0 ? `$${(cents / 100).toLocaleString()}` : null;
}

export default function PlanningSponsorPipelineView({ cards = [], onCardClick }) {
  const sponsorCards = cards.filter((c) => c.kind === "sponsor_prospect" && !c.archived);

  function byStatus(status) {
    return sponsorCards.filter((c) => c.sponsor?.outreach_status === status);
  }

  return (
    <Box sx={{ display: "flex", gap: 2, overflowX: "auto", pb: 2 }}>
      {STATUSES.map((status) => {
        const group = byStatus(status);
        const totalPledge = group.reduce(
          (sum, c) => sum + (c.sponsor?.pledge_amount_cents || 0),
          0
        );
        return (
          <Paper
            key={status}
            elevation={0}
            sx={{ bgcolor: "grey.100", borderRadius: 2, p: 1, minWidth: 200 }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              {status.charAt(0).toUpperCase() + status.slice(1).replace("-", " ")}
              <Typography component="span" variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                ({group.length})
              </Typography>
            </Typography>
            {totalPledge > 0 && (
              <Typography variant="caption" color="success.main">
                {fmt(totalPledge)} pledged
              </Typography>
            )}
            <Stack spacing={1} sx={{ mt: 1 }}>
              {group.map((card) => (
                <Paper
                  key={card.id}
                  variant="outlined"
                  sx={{ p: 1, cursor: "pointer", "&:hover": { boxShadow: 1 } }}
                  onClick={() => onCardClick && onCardClick(card)}
                >
                  <Typography variant="body2" fontWeight={500}>
                    {card.sponsor?.company || card.title}
                  </Typography>
                  {card.sponsor?.tier && (
                    <Chip
                      label={card.sponsor.tier}
                      size="small"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                  {card.sponsor?.pledge_amount_cents > 0 && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      {fmt(card.sponsor.pledge_amount_cents)}
                    </Typography>
                  )}
                  {card.sponsor?.next_action && (
                    <Typography variant="caption" color="text.secondary" display="block">
                      → {card.sponsor.next_action}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          </Paper>
        );
      })}
    </Box>
  );
}
