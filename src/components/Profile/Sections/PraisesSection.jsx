import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  Chip,
  Button,
  Stack,
  Alert,
  CircularProgress,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";

import PraiseCard from "../../Praise/PraiseCard";
import usePraisesForUser from "../../../hooks/use-praises-for-user";

function PraisesSection({
  userId,
  initialPraises = [],
  initialCount = 0,
  emptyMessage,
}) {
  const [expanded, setExpanded] = useState(false);
  const { praises, total, hasMore, isLoading, error, loadMore } = usePraisesForUser(
    userId,
    { enabled: expanded }
  );

  // While not expanded, render the recent preview from the public profile payload
  const visible = expanded ? praises : initialPraises;
  const totalCount = expanded ? total : initialCount;

  if (!totalCount && !visible.length) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
        {emptyMessage || "No praises yet — be the first to write one in Slack!"}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Chip
          icon={<FavoriteIcon />}
          label={`${totalCount} praise${totalCount === 1 ? "" : "s"}`}
          color="secondary"
          variant="filled"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      {error && (
        <Alert severity="warning" variant="outlined">
          Couldn't load all praises: {error}
        </Alert>
      )}

      <Stack spacing={2}>
        {visible.map((praise) => (
          <PraiseCard key={praise.id} praise={praise} />
        ))}
      </Stack>

      {!expanded && totalCount > visible.length && (
        <Button
          variant="text"
          onClick={() => setExpanded(true)}
          sx={{ alignSelf: "flex-start" }}
        >
          View all {totalCount} praises
        </Button>
      )}

      {expanded && hasMore && (
        <Button
          variant="text"
          onClick={loadMore}
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={16} /> : null}
          sx={{ alignSelf: "flex-start" }}
        >
          {isLoading ? "Loading…" : "Load more"}
        </Button>
      )}
    </Box>
  );
}

PraisesSection.propTypes = {
  userId: PropTypes.string.isRequired,
  initialPraises: PropTypes.array,
  initialCount: PropTypes.number,
  emptyMessage: PropTypes.string,
};

export default PraisesSection;
