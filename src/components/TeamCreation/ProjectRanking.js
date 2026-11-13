import React, { memo } from "react";
import { Box } from "@mui/material";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { MdDragHandle } from "react-icons/md";

/**
 * The team's ranked project list ("#1 {project} · {nonprofit}").
 * Reorder by drag OR the ↑/↓ buttons (keyboard + screen-reader path);
 * remove with ×. Renders inside RefinedRoot, so `.ohx-*` classes are safe.
 */

const iconButtonStyle = {
  width: 32,
  height: 32,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--line)",
  borderRadius: 6,
  background: "var(--paper, #FBFAF6)",
  color: "var(--ink)",
  cursor: "pointer",
  fontSize: 15,
  lineHeight: 1,
  padding: 0,
};

const RankRow = ({ entry, index, count, onMove, onRemove, provided }) => {
  const isFirst = index === 0;
  const isLast = index === count - 1;
  return (
    <li
      ref={provided?.innerRef}
      {...(provided?.draggableProps || {})}
      style={{
        listStyle: "none",
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "10px 12px",
        marginBottom: 8,
        border: `1px solid ${isFirst ? "var(--brand)" : "var(--line)"}`,
        borderRadius: 8,
        background: "var(--paper, #FBFAF6)",
        ...(provided?.draggableProps?.style || {}),
      }}
    >
      <span
        {...(provided?.dragHandleProps || {})}
        aria-hidden="true"
        style={{ color: "var(--faint)", display: "inline-flex" }}
      >
        <MdDragHandle />
      </span>
      <span
        style={{
          fontFamily: "var(--display)",
          fontWeight: 600,
          color: "var(--brand)",
          minWidth: 28,
        }}
      >
        #{index + 1}
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: 600, color: "var(--ink)" }}>
          {entry.title}
        </span>
        <span style={{ color: "var(--muted)" }}> · {entry.nonprofitName}</span>
        {isFirst && (
          <span className="ohx-tag ohx-tag--accent" style={{ marginLeft: 8 }}>
            Top choice
          </span>
        )}
      </span>
      <span style={{ display: "inline-flex", gap: 6, flexShrink: 0 }}>
        <button
          type="button"
          style={{ ...iconButtonStyle, opacity: isFirst ? 0.4 : 1 }}
          disabled={isFirst}
          aria-label={`Move ${entry.title} up`}
          onClick={() => onMove(index, index - 1)}
        >
          ↑
        </button>
        <button
          type="button"
          style={{ ...iconButtonStyle, opacity: isLast ? 0.4 : 1 }}
          disabled={isLast}
          aria-label={`Move ${entry.title} down`}
          onClick={() => onMove(index, index + 1)}
        >
          ↓
        </button>
        <button
          type="button"
          style={iconButtonStyle}
          aria-label={`Remove ${entry.title} from your ranking`}
          onClick={() => onRemove(entry)}
        >
          ×
        </button>
      </span>
    </li>
  );
};

const ProjectRanking = memo(({ ranked, limits, onMove, onRemove }) => {
  const count = ranked.length;
  const rangeLabel =
    limits.min === limits.max ? `${limits.max}` : `${limits.min}–${limits.max}`;

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    onMove(result.source.index, result.destination.index);
  };

  return (
    <Box
      className="ohx-card"
      component="section"
      aria-labelledby="project-ranking-heading"
      sx={{ p: { xs: 2, md: 2.5 }, mb: 3 }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 2,
          flexWrap: "wrap",
          mb: 1,
        }}
      >
        <h3
          id="project-ranking-heading"
          style={{
            fontFamily: "var(--display)",
            fontWeight: 600,
            fontSize: "1.15rem",
            margin: 0,
          }}
        >
          Your ranking
        </h3>
        <span
          aria-live="polite"
          style={{ color: count >= limits.min ? "var(--ink)" : "var(--muted)" }}
        >
          {count} of {rangeLabel} ranked
        </span>
      </Box>
      <p style={{ color: "var(--muted)", margin: "0 0 12px" }}>
        #1 is the project you most want to build. Drag rows or use the arrows to
        reorder. Organizers use your order when they match teams to projects.
      </p>

      {count === 0 ? (
        <p
          style={{
            color: "var(--faint)",
            fontStyle: "italic",
            margin: 0,
            padding: "12px 0",
          }}
        >
          Nothing ranked yet — add projects from the list below.
        </p>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="ranked-projects">
            {(dropProvided) => (
              <ol
                ref={dropProvided.innerRef}
                {...dropProvided.droppableProps}
                aria-label="Ranked projects"
                style={{ margin: 0, padding: 0 }}
              >
                {ranked.map((entry, index) => (
                  <Draggable
                    key={entry.projectId}
                    draggableId={String(entry.projectId)}
                    index={index}
                  >
                    {(provided) => (
                      <RankRow
                        entry={entry}
                        index={index}
                        count={count}
                        onMove={onMove}
                        onRemove={onRemove}
                        provided={provided}
                      />
                    )}
                  </Draggable>
                ))}
                {dropProvided.placeholder}
              </ol>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </Box>
  );
});

ProjectRanking.displayName = "ProjectRanking";

export default ProjectRanking;
