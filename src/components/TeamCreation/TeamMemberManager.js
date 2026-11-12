import React, { memo, useState } from "react";
import { Autocomplete, Box, IconButton, TextField } from "@mui/material";
import { FaSlack, FaTimes } from "react-icons/fa";
import JoinTeamSteps, { teammateJoinSteps } from "../Teams/JoinTeamSteps";
import {
  channelLabel,
  splitTeammates,
  teammateName,
} from "../../lib/teamInvite";

const panelSx = {
  border: "1px solid var(--line, #E7E1D4)",
  borderRadius: 2,
  p: { xs: 2, sm: 2.5 },
  mb: 2,
  background: "var(--paper, #fff)",
};

const headingStyle = {
  fontWeight: 600,
  fontSize: "1.02rem",
  margin: "0 0 4px",
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const leadStyle = {
  color: "var(--muted)",
  fontSize: "0.92rem",
  lineHeight: 1.55,
  margin: "0 0 14px",
  maxWidth: "42em",
};

function MemberRow({ label, tag, onRemove }) {
  return (
    <Box
      component="li"
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        minHeight: 44,
        borderBottom: "1px solid var(--line, #E7E1D4)",
        "&:last-of-type": { borderBottom: 0 },
      }}
    >
      <span style={{ fontWeight: 600 }}>{label}</span>
      {tag && <span className="ohx-tag">{tag}</span>}
      <IconButton
        type="button"
        size="small"
        aria-label={`Remove ${label}`}
        onClick={onRemove}
        sx={{ ml: "auto" }}
      >
        <FaTimes />
      </IconButton>
    </Box>
  );
}

/**
 * Teammates for a new team, in two explicit groups:
 * - Already on Slack → picked from the Slack directory, added to the team at
 *   creation and invited to its channel (backend queue_team).
 * - Not on Slack yet → a typed name is only a reminder; they join later from
 *   the team page (lib/teamInvite.js). Two separate inputs, so nobody believes
 *   a typed name was added to the team (the old freeSolo picker mixed both).
 * `teamMembers` stays the mixed object/string array the backend expects.
 */
const TeamMemberManager = memo(
  ({
    teamMembers,
    onAddMember,
    onRemoveMember,
    slackUsers,
    slackUsersStatus,
    slackChannel,
    eventId,
  }) => {
    const [pickerInput, setPickerInput] = useState("");
    const [laterName, setLaterName] = useState("");
    const [error, setError] = useState({ slack: "", later: "" });

    const { onSlack, joinLater } = splitTeammates(teamMembers);
    const channel = channelLabel(slackChannel);

    const addSlack = (user) => {
      if (!user || typeof user !== "object") return;
      const message = onAddMember(user);
      setError((e) => ({ ...e, slack: message || "" }));
      setPickerInput("");
    };

    const addLater = () => {
      const name = laterName.trim();
      if (!name) return;
      const message = onAddMember(name);
      setError((e) => ({ ...e, later: message || "" }));
      if (!message) setLaterName("");
    };

    const slackLoading = slackUsersStatus === "loading";
    const slackFailed = slackUsersStatus === "error";

    return (
      <Box>
        {/* Path 1 — already on Slack */}
        <Box sx={panelSx}>
          <h3 style={headingStyle}>
            <FaSlack aria-hidden /> Already on Slack
          </h3>
          <p style={leadStyle}>
            Search the Opportunity Hack Slack and add them. They&apos;re on the
            team as soon as you create it, and invited to {channel}. You&apos;re
            added automatically.
          </p>
          <Autocomplete
            options={slackUsers || []}
            loading={slackLoading}
            value={null}
            inputValue={pickerInput}
            onInputChange={(_, v, reason) => {
              if (reason !== "reset") setPickerInput(v);
            }}
            onChange={(_, user) => addSlack(user)}
            getOptionLabel={(o) => teammateName(o)}
            isOptionEqualToValue={(a, b) => a?.id === b?.id}
            blurOnSelect
            noOptionsText={
              pickerInput
                ? "No one on Slack by that name — add them under “Not on Slack yet?”"
                : "Start typing a name"
            }
            renderOption={(props, option) => {
              // MUI passes `key` inside props; React wants it set directly.
              const rest = { ...props };
              delete rest.key;
              return (
                <li key={option.id} {...rest}>
                  <span>
                    {teammateName(option)}
                    {option.name && option.real_name && (
                      <span style={{ color: "var(--muted)", marginLeft: 6 }}>
                        @{option.name}
                      </span>
                    )}
                  </span>
                </li>
              );
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Slack by name"
                size="small"
                error={Boolean(error.slack)}
                helperText={
                  error.slack ||
                  (slackFailed
                    ? "We couldn't load the Slack directory. Add their names under “Not on Slack yet?” — they'll join from your team page."
                    : "")
                }
              />
            )}
          />
          {onSlack.length > 0 && (
            <Box
              component="ul"
              aria-label="Added to the team now"
              sx={{ listStyle: "none", p: 0, m: "12px 0 0" }}
            >
              {onSlack.map((m) => (
                <MemberRow
                  key={`slack:${m.id}`}
                  label={teammateName(m)}
                  tag={`Added now · ${channel}`}
                  onRemove={() => onRemoveMember(teamMembers.indexOf(m))}
                />
              ))}
            </Box>
          )}
        </Box>

        {/* Path 2 — not on Slack yet */}
        <Box sx={panelSx}>
          <h3 style={headingStyle}>Not on Slack yet?</h3>
          <p style={leadStyle}>
            That&apos;s okay — create your team now. Add their names so you
            remember who to invite. They aren&apos;t on the team until they join
            from your team page; once it&apos;s created, you&apos;ll get an
            invite message to send them.
          </p>
          <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
            <TextField
              label="Teammate's name"
              size="small"
              fullWidth
              value={laterName}
              onChange={(e) => setLaterName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addLater();
                }
              }}
              error={Boolean(error.later)}
              helperText={error.later || ""}
            />
            <button
              type="button"
              className="ohx-btn ohx-btn--ghost"
              onClick={addLater}
              disabled={!laterName.trim()}
              style={{ whiteSpace: "nowrap" }}
            >
              Add to invite list
            </button>
          </Box>
          {joinLater.length > 0 && (
            <Box
              component="ul"
              aria-label="Joining later from the team page"
              sx={{ listStyle: "none", p: 0, m: "12px 0 0" }}
            >
              {joinLater.map((name) => (
                <MemberRow
                  key={`later:${name}`}
                  label={name}
                  tag="Joins later"
                  onRemove={() => onRemoveMember(teamMembers.indexOf(name))}
                />
              ))}
            </Box>
          )}
          <details style={{ marginTop: 16 }}>
            <summary
              className="ohx-link"
              style={{ cursor: "pointer", fontWeight: 600 }}
            >
              What they&apos;ll do to join
            </summary>
            <Box sx={{ mt: 2 }}>
              <JoinTeamSteps
                items={teammateJoinSteps({ slackChannel, eventId })}
                ariaLabel="How a teammate joins"
              />
            </Box>
          </details>
        </Box>
      </Box>
    );
  },
);

TeamMemberManager.displayName = "TeamMemberManager";

export default TeamMemberManager;
