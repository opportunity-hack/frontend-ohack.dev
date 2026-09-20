import React from "react";
import PeerVoteCTA from "../PeerVote/PeerVoteCTA";

/**
 * Thin wrapper — `PeerVoteCTA` (WS-0) owns the whole visibility/window gate,
 * so this just renders it in the dashboard's "variant=dashboard" flavor.
 */
export default function HackersChoiceCard({ eventId, deadlines, constraints }) {
  return (
    <PeerVoteCTA
      eventId={eventId}
      deadlines={deadlines}
      constraints={constraints}
      variant="dashboard"
    />
  );
}
