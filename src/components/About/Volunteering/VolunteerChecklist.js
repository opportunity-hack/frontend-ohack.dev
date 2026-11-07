import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { trackEvent } from "../../../lib/ga";

// The event-volunteer checklist shown on /about/volunteers. Refined (.ohx-*)
// so it must only ever render inside a RefinedRoot. Ticks persist per browser
// in localStorage so a volunteer can come back to it over the weekend; nothing
// is sent to the server. Every piece is module-scope (SectionBlock lesson).

export const STORAGE_KEY = "ohack.volunteerChecklist.v1";

export const VOLUNTEER_CHECKLIST = [
  {
    id: "before",
    title: "Before the event",
    lead: "The week before — ten minutes that make the morning painless.",
    items: [
      {
        id: "before-shifts",
        title: "Confirm your shifts",
        details:
          "Open the calendar invites from your confirmation email and make sure the blocks you picked still work. Tell the organizers early if something changed.",
      },
      {
        id: "before-slack",
        title: "Join Slack and say hello in #introductions",
        details:
          "An ohack.dev login doesn't create a Slack account — join from ohack.dev/signup. Organizers coordinate volunteers there during the weekend.",
        href: "/signup",
        hrefLabel: "Join Slack",
      },
      {
        id: "before-access",
        title: "Check-in shift? Confirm you can open the check-in tool",
        details:
          "The scanner lives inside the event's admin pages, so an organizer has to grant you access. Open it on your phone before the event and make sure the camera permission prompt appears.",
      },
      {
        id: "before-contact",
        title: "Save an organizer's phone number",
        details:
          "Ask the organizer who approved you. On the day, that number is faster than Slack.",
      },
      {
        id: "before-logistics",
        title: "Read the event page for parking, venue, and schedule",
        details:
          "Every event page lists the venue, parking, transit, and the day's timeline — plus the links hackers will ask you about.",
        href: "/hack",
        hrefLabel: "Find the event page",
      },
    ],
  },
  {
    id: "arrive",
    title: "When you arrive",
    lead: "Your first fifteen minutes on site.",
    items: [
      {
        id: "arrive-early",
        title: "Arrive 30 minutes before your shift starts",
        details:
          "Registration volunteers: that means 30 minutes before doors open. Find the organizer on duty and get a quick briefing.",
      },
      {
        id: "arrive-checkin",
        title: "Check yourself in",
        details:
          "You have a QR code on your own volunteer application page. Have the person at the desk scan it — it's how your hours and certificate get tracked.",
      },
      {
        id: "arrive-layout",
        title: "Learn the layout",
        details:
          "Where are the bathrooms, the kickoff room, the food, the quiet rooms, and the nearest exit? You'll be asked all five in the first hour.",
      },
      {
        id: "arrive-track",
        title: "Start tracking your volunteer time",
        details:
          "Log your hours on the volunteer time tracker so they count toward Hearts and your volunteer letter.",
        href: "/volunteer/track",
        hrefLabel: "Open the time tracker",
      },
    ],
  },
  {
    id: "during",
    title: "During your shift",
    lead: "The habits that make a hackathon feel effortless.",
    items: [
      {
        id: "during-welcome",
        title: "Greet everyone like they're the first to arrive",
        details:
          "Many hackers are at their first event and nervous. A warm hello and 'breakfast is that way' sets the tone for the whole weekend.",
      },
      {
        id: "during-escalate",
        title: "Escalate, don't improvise",
        details:
          "Not on the roster, a medical question, a venue problem, an unhappy sponsor — get an organizer. You're never expected to decide those alone.",
      },
      {
        id: "during-space",
        title: "Walk the room once an hour",
        details:
          "Clear trash, restock snacks and water, and notice teams that look stuck — point them to #ask-a-mentor or a mentor in the room.",
      },
      {
        id: "during-photos",
        title: "Capture a few moments",
        details:
          "Even if photography isn't your shift, a couple of candid shots sent to the organizers help the recap.",
      },
      {
        id: "during-breaks",
        title: "Take breaks and eat",
        details:
          "Meals are for volunteers too. Hand off to another volunteer or an organizer before you step away.",
      },
    ],
  },
  {
    id: "wrap",
    title: "Wrapping up",
    lead: "The last hours decide whether the venue invites us back.",
    items: [
      {
        id: "wrap-judging",
        title: "Help the judging and awards run on time",
        details:
          "Guide judges to tables, keep demo rotations moving, and get teams into the awards room when called.",
      },
      {
        id: "wrap-cleanup",
        title: "Final cleanup",
        details:
          "Tables wiped, trash out, cables coiled, lost-and-found collected. Ask the organizer for the venue's checklist.",
      },
      {
        id: "wrap-handoff",
        title: "Hand off photos, notes, and anything you noticed",
        details:
          "Tell the organizers what worked and what didn't while it's fresh — it goes straight into next year's plan.",
      },
    ],
  },
  {
    id: "after",
    title: "After the event",
    lead: "Get credit for the weekend.",
    items: [
      {
        id: "after-hours",
        title: "Finish logging your hours",
        details: "Close out your sessions on the time tracker.",
        href: "/volunteer/track",
        hrefLabel: "Time tracker",
      },
      {
        id: "after-letter",
        title: "Request your volunteer letter if you need one",
        details:
          "Each event has a letters page that generates a General Volunteer letter for an organizer to review and sign.",
      },
      {
        id: "after-share",
        title: "Share your volunteer card",
        details:
          "Your application page has a share card for LinkedIn and Instagram — tell your network what you did.",
      },
      {
        id: "after-feedback",
        title: "Fill in the event survey",
        details:
          "The feedback form is linked from the event page once the event has started. Two minutes, and organizers read every answer.",
      },
    ],
  },
];

export const CHECKLIST_TOTAL = VOLUNTEER_CHECKLIST.reduce(
  (n, phase) => n + phase.items.length,
  0,
);

const readStored = () => {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
};

const writeStored = (checked) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(checked));
  } catch {
    /* private mode / quota — the checklist still works for this visit */
  }
};

const ChecklistItem = ({ item, checked, onToggle }) => {
  const inputId = `vol-check-${item.id}`;
  return (
    <li
      style={{
        display: "grid",
        gridTemplateColumns: "22px 1fr",
        gap: 14,
        padding: "14px 0",
        borderTop: "1px solid var(--line)",
      }}
    >
      <input
        id={inputId}
        type="checkbox"
        checked={checked}
        onChange={() => onToggle(item.id)}
        style={{
          width: 20,
          height: 20,
          marginTop: 2,
          accentColor: "var(--brand)",
          cursor: "pointer",
        }}
      />
      <div>
        <label
          htmlFor={inputId}
          style={{
            display: "block",
            fontWeight: 600,
            cursor: "pointer",
            color: checked ? "var(--muted)" : "var(--ink)",
            textDecoration: checked ? "line-through" : "none",
            textDecorationColor: "var(--faint)",
          }}
        >
          {item.title}
        </label>
        <p
          className="ohx-muted"
          style={{ margin: "4px 0 0", fontSize: "0.93rem", lineHeight: 1.55 }}
        >
          {item.details}
          {item.href && (
            <>
              {" "}
              <Link href={item.href} className="ohx-link" style={{ fontSize: "0.9rem" }}>
                {item.hrefLabel}
              </Link>
            </>
          )}
        </p>
      </div>
    </li>
  );
};

const PhaseBlock = ({ phase, checked, onToggle }) => {
  const done = phase.items.filter((i) => checked[i.id]).length;
  return (
    <details open className="ohx-card" style={{ padding: 0, overflow: "hidden" }}>
      <summary
        style={{
          listStyle: "none",
          cursor: "pointer",
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 12,
        }}
      >
        <span>
          <span
            className="ohx-display"
            style={{ fontSize: "1.15rem", fontWeight: 500, display: "block" }}
          >
            {phase.title}
          </span>
          <span className="ohx-muted" style={{ fontSize: "0.9rem" }}>
            {phase.lead}
          </span>
        </span>
        <span className="ohx-tag" style={{ flexShrink: 0 }}>
          {done}/{phase.items.length}
        </span>
      </summary>
      <ul style={{ listStyle: "none", margin: 0, padding: "0 22px 8px" }}>
        {phase.items.map((item) => (
          <ChecklistItem
            key={item.id}
            item={item}
            checked={Boolean(checked[item.id])}
            onToggle={onToggle}
          />
        ))}
      </ul>
    </details>
  );
};

export default function VolunteerChecklist() {
  // Start empty so SSR and the first client render match; hydrate from
  // storage after mount.
  const [checked, setChecked] = useState({});

  useEffect(() => {
    setChecked(readStored());
  }, []);

  const onToggle = useCallback((id) => {
    setChecked((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (!next[id]) delete next[id];
      writeStored(next);
      return next;
    });
    trackEvent({
      action: "click_volunteers",
      params: { button: "checklist_toggle", item: id },
    });
  }, []);

  const reset = useCallback(() => {
    setChecked({});
    writeStored({});
    trackEvent({
      action: "click_volunteers",
      params: { button: "checklist_reset" },
    });
  }, []);

  const doneCount = useMemo(
    () => Object.keys(checked).filter((k) => checked[k]).length,
    [checked],
  );
  const pct = CHECKLIST_TOTAL ? Math.round((doneCount / CHECKLIST_TOTAL) * 100) : 0;

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <p className="ohx-muted" style={{ margin: 0, fontSize: "0.93rem" }}>
          <span style={{ color: "var(--ink)", fontWeight: 600 }}>
            {doneCount} of {CHECKLIST_TOTAL} done
          </span>{" "}
          · saved in this browser
        </p>
        {doneCount > 0 && (
          <button
            type="button"
            onClick={reset}
            className="ohx-link"
            style={{
              background: "none",
              border: 0,
              padding: 0,
              font: "inherit",
              fontSize: "0.88rem",
              cursor: "pointer",
            }}
          >
            Reset checklist
          </button>
        )}
      </div>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={pct}
        aria-label="Checklist progress"
        style={{
          height: 6,
          borderRadius: 3,
          background: "var(--surface-2)",
          border: "1px solid var(--line)",
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: "var(--brand)",
            transition: "width .25s ease",
          }}
        />
      </div>
      <div style={{ display: "grid", gap: 14 }}>
        {VOLUNTEER_CHECKLIST.map((phase) => (
          <PhaseBlock
            key={phase.id}
            phase={phase}
            checked={checked}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}
