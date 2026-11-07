// Content for the event-volunteer guide (/about/volunteers).
//
// Everything here mirrors what the volunteer application actually asks and
// what the check-in tooling actually does, so keep the three in sync:
//   - roles + shift blocks ← pages/hack/[event_id]/volunteer-application.js
//     (getVolunteerTypeOptions / timeBlocksConfig / inPersonOnlyRoles)
//   - the check-in steps ← components/admin/checkin/CheckInWorkbench.js and
//     components/VolunteerCheckInQR/VolunteerCheckInQR.js
// FAQ_ITEMS feeds BOTH the visible accordions and the FAQPage JSON-LD in the
// page's getStaticProps — edit the array, never the schema.

export const VOLUNTEER_ROLES = [
  {
    id: "checkin",
    title: "Check-in & registration",
    icon: "📋",
    when: "Day 1 morning — doors open until the nonprofit pitches start",
    summary:
      "Welcome everyone at the door, scan their check-in QR code, and point them to breakfast, Wi-Fi, and the kickoff room.",
    tips: [
      "Arrive 30 minutes before doors open so the table, signage, and scanner are ready before the first hacker.",
      "Most people have their QR code on their phone. Anyone who doesn't can be looked up by name — see the check-in walkthrough below.",
      "Don't approve applications at the desk. If someone isn't on the roster, wave an organizer over.",
    ],
  },
  {
    id: "food",
    title: "Food service",
    icon: "🍕",
    when: "Every meal: breakfast, lunch, dinner, the midnight run, and day-2 breakfast and lunch",
    summary:
      "Set out catered meals and snacks, keep the line moving, label dietary options, and reset the area afterwards.",
    tips: [
      "Dietary restrictions are collected on every application — the organizer has the counts; ask for the list before the first meal.",
      "Label vegetarian, vegan, and allergen-free trays clearly so nobody has to ask.",
      "Restock snacks and drinks between meals; a hungry team at 11pm is a slow team.",
    ],
  },
  {
    id: "cleanup",
    title: "Cleanup crew",
    icon: "🧹",
    when: "Any shift — especially after meals and at the very end of the event",
    summary:
      "Keep the hacking space, hallways, and food areas tidy so the venue welcomes us back next year.",
    tips: [
      "Walk the room once an hour with a trash bag; teams rarely notice their own pizza boxes.",
      "The final cleanup after awards is the most important shift of the weekend — the venue inspects before we leave.",
    ],
  },
  {
    id: "photo",
    title: "Photography & video",
    icon: "📸",
    when: "Daytime shifts on both days (no overnight shift)",
    summary:
      "Capture teams at work, mentors helping, nonprofit pitches, and the awards ceremony for our recap, sponsors, and social media.",
    tips: [
      "Everyone agreed to our photo release when they applied, but still ask before close-ups.",
      "Get a wide shot of every pitch and demo plus a few candid team moments — those are what sponsors and nonprofits share.",
      "Hand photos to the organizers the same day so they can go up on the event's media page.",
    ],
  },
  {
    id: "pitch",
    title: "Presentation & pitch support",
    icon: "🎤",
    when: "Day 1 nonprofit pitches and the final-day demos",
    summary:
      "Run the mic, keep the slide clicker moving, time the speakers, and help nervous presenters get set up.",
    tips: [
      "Test the projector, HDMI adapters, and microphone before the room fills.",
      "Keep a visible timer; a polite 'one minute' sign keeps the schedule honest.",
    ],
  },
  {
    id: "judging",
    title: "Judging support",
    icon: "🏆",
    when: "Final-day afternoon — the judging window and awards",
    summary:
      "Guide judges to their teams, keep the demo rotation on time, and help wrangle teams for the awards ceremony.",
    tips: [
      "Judges score in their own tool; your job is logistics, not evaluating projects.",
      "Know where every team is sitting so you can point a judge to the right table in seconds.",
    ],
  },
  {
    id: "marketing",
    title: "Marketing & communications",
    icon: "📣",
    when: "Before, during, and after the event — in person or remote",
    summary:
      "Post live updates, share team stories, and help our recap reach sponsors, nonprofits, and future volunteers.",
    tips: [
      "Tag @opportunityhack and use the event's hashtag so organizers can reshare.",
      "Short clips of teams explaining their project in one sentence perform best.",
    ],
  },
  {
    id: "virtual",
    title: "Virtual event moderator & content",
    icon: "💻",
    when: "Online events only — kickoff, pitches, expert hours, and judging",
    summary:
      "Moderate the video sessions, keep chat questions flowing to the right people, and produce content from the event.",
    tips: [
      "Have the schedule and every join link open before each session starts.",
      "Pin the nonprofit's problem statement link in chat during pitches — teams always ask for it.",
    ],
  },
];

// Shift blocks shown on the application's sign-up table. Times are the
// defaults from the form; the event page and your calendar invites win.
export const SHIFT_BLOCKS = [
  {
    day: "Day 1",
    blocks: [
      { time: "8:00am – 11:00am", label: "Doors open & registration", roles: "Check-in, breakfast setup, room setup" },
      { time: "10:00am – 12:00pm", label: "Nonprofit pitches", roles: "Pitch support, photography" },
      { time: "12:00pm – 3:00pm", label: "Lunch", roles: "Food service, cleanup" },
      { time: "2:30pm – 5:00pm", label: "Afternoon hacking", roles: "Cleanup, photography, general support" },
      { time: "4:00pm – 7:00pm", label: "Dinner & evening", roles: "Food service, cleanup" },
      { time: "7:00pm – 11:00pm", label: "Evening hacking", roles: "Cleanup, general support" },
      { time: "11:30pm – 12:30am", label: "Midnight run", roles: "Pizza setup, snack refresh, cleanup" },
    ],
  },
  {
    day: "Day 2",
    blocks: [
      { time: "8:00am – 11:00am", label: "Breakfast setup & cleanup", roles: "Food service, cleanup" },
      { time: "11:00am – 2:00pm", label: "Expert hours", roles: "General support, photography" },
      { time: "12:00pm – 3:00pm", label: "Lunch setup & cleanup", roles: "Food service, cleanup" },
      { time: "3:00pm – 6:00pm", label: "Judging & cleanup", roles: "Judging support, pitch support, final cleanup" },
    ],
  },
];

// The registration-desk playbook. Mirrors what the check-in tool really does:
// scan → PATCH checkedIn, manual lookup by name as the fallback.
export const CHECKIN_STEPS = [
  {
    id: "access",
    title: "Get check-in access before the event",
    body:
      "The check-in tool lives inside the event's admin pages, so an organizer has to add you as a check-in admin ahead of time. Ask the organizer who approved you to confirm you can open the Check-In section on your phone — do this the week before, not at the door.",
  },
  {
    id: "qr",
    title: "Everyone approved has a QR code",
    body:
      "Hackers, mentors, judges, sponsors, and fellow volunteers all see a personal check-in QR code on their application page once they're approved. It encodes the event, their record, and their role. Ask people to open their application page on their phone (the approval email links to it) and have the code ready while they're in line.",
  },
  {
    id: "scan",
    title: "Open the Check-In section and start scanning",
    body:
      "From the event's admin page choose Check-In, tap Start Scanning, and allow camera access. Point the camera at the QR code; the tool confirms 'Successfully checked in' with their name, the live counts tick up, and they appear in the checked-in list on the right. If the camera opens the wrong way, use Switch Camera.",
  },
  {
    id: "manual",
    title: "No QR code? Look them up by name",
    body:
      "Tap Manual Entry, pick the person's role (hacker, mentor, judge, volunteer, or sponsor), then search by name or email. The list shows whether they're on the roster and whether they've already been checked in. Select them and tap Check In — same result as a scan.",
  },
  {
    id: "edge",
    title: "Not on the list? Don't approve at the desk",
    body:
      "If someone applied but isn't on the roster, or never applied, flag an organizer. Approval happens in the event's Volunteer section, not at check-in, and walk-ups should apply on their phone first so their badge, meals, and certificate are tracked. Mentors may have already checked in online through the mentor check-in page — that counts, so just confirm they're in the list.",
  },
];

export const CHECKIN_SITUATIONS = [
  {
    situation: "They have the QR code on their phone",
    action: "Scan it. Confirm the name on screen matches the person, then send them to breakfast and the kickoff room.",
  },
  {
    situation: "Phone died or no QR code",
    action: "Manual Entry → pick their role → search their name or email → Check In.",
  },
  {
    situation: "They applied but aren't on the roster",
    action: "Call an organizer over. Organizers approve from the Volunteer section; you only check in people who are already approved.",
  },
  {
    situation: "They never applied (a walk-up)",
    action: "Have them apply on their phone from the event page right there, then an organizer approves them and you scan or look them up.",
  },
  {
    situation: "A mentor says they already checked in online",
    action: "That's real — remote mentor check-in sets the same flag. Find them in the checked-in list to confirm, no second scan needed.",
  },
  {
    situation: "The name on screen is wrong or misspelled",
    action: "Check them in anyway and tell an organizer; details are edited in the Volunteer section afterwards.",
  },
];

export const WHAT_TO_BRING = [
  "A fully charged phone (and a battery pack if you're on the check-in or photo shift)",
  "Comfortable shoes — you'll be on your feet",
  "A reusable water bottle; we keep refill stations stocked",
  "Layers: hacking rooms run cold overnight and warm by afternoon",
  "Your login to ohack.dev so you can open the event page, Slack, and the check-in tool",
];

// Visible FAQ ↔ FAQPage JSON-LD parity. Every answer reflects a real flow;
// don't promise things the forms or tooling don't do.
export const FAQ_ITEMS = [
  {
    id: "skills",
    question: "Do I need technical skills to volunteer at a hackathon?",
    answer:
      "No. Event volunteers keep the weekend running — check-in, meals, cleanup, photography, pitch logistics, and judging support. None of those roles involve writing code. If you'd rather build, apply as a hacker instead; if you're an experienced engineer who wants to guide teams, apply as a mentor.",
  },
  {
    id: "shifts",
    question: "How long is a shift, and how many should I pick?",
    answer:
      "Shifts are two to four hour blocks laid out on the application like a sign-up sheet, from doors opening on day one through judging and cleanup on the last day. Pick every block you can genuinely cover — you don't need to be there all weekend. The busiest needs are the day-one registration morning, meal times, and the final cleanup after awards.",
  },
  {
    id: "virtual",
    question: "Can I volunteer virtually?",
    answer:
      "For in-person hackathons, volunteer roles need you on site — the application will stop you from choosing 'virtual' and point you to mentoring, which can be done remotely. Our online-only events have virtual roles: event moderation, content creation, and social media.",
  },
  {
    id: "approval",
    question: "Will I hear back after I apply, and what does 'approved' look like?",
    answer:
      "You'll get a confirmation email right away with calendar invites for the shifts you picked. Organizers then approve volunteers before the event. Once you're approved, your application page shows a personal check-in QR code and a card you can share on social media, and your name joins the volunteer roster on the event page. If you reopen your application and see an 'awaiting confirmation' notice, you haven't been approved yet.",
  },
  {
    id: "food",
    question: "Are meals provided?",
    answer:
      "Yes — in-person volunteers eat with everyone else: breakfast, lunch, dinner, late-night snacks, and day-two meals. The application asks for dietary restrictions so the catering counts are right; please fill that in rather than hoping for the best.",
  },
  {
    id: "checkin-access",
    question: "I signed up for check-in. How do I actually check people in?",
    answer:
      "Scan their QR code with the check-in tool inside the event's admin pages, or look them up by name with Manual Entry if they don't have the code. An organizer needs to give you access to that tool before the event — ask when you're approved. The full walkthrough, including what to do when someone isn't on the roster, is on this page.",
  },
  {
    id: "parking",
    question: "Where do I park, and what should I wear?",
    answer:
      "Each event page has venue, parking, and transit details; for our ASU Tempe events there's a dedicated venue guide. Dress comfortably and casually — you'll be on your feet, and the rooms swing from cold overnight to warm in the afternoon. Opportunity Hack volunteer t-shirts are handed out at check-in when we have them, which is why the application asks for your size.",
  },
  {
    id: "hours",
    question: "Can I get a letter, certificate, or volunteer hours?",
    answer:
      "Yes. Track your hours on ohack.dev/volunteer/track during the event. After the event, request a General Volunteer letter from the event's letters page — it's reviewed and signed by an organizer. Every volunteer also earns Hearts toward certificates and rewards on your profile.",
  },
  {
    id: "photo",
    question: "Why does the application ask for my photo, bio, and LinkedIn?",
    answer:
      "They're optional. When you're approved they appear on the event page's volunteer roster so participants can recognize the people helping them, and they feed the share card you can post after the event. Skip them if you'd rather stay off the public roster.",
  },
  {
    id: "other-roles",
    question: "Can I volunteer and also hack, mentor, or judge?",
    answer:
      "Pick the role you'll actually be doing on the day; each one has its own application and roster. Mentors and judges are reviewed separately. Many volunteers hack at a later event once they've seen how a weekend runs — and the year-round projects on ohack.dev/projects are open to anyone any time.",
  },
  {
    id: "contact",
    question: "How do I reach organizers during the event?",
    answer:
      "Organizers are on site all weekend and in the event's Slack channels. Before the event, ask the organizer who approved you for their phone number and join our Slack from ohack.dev/signup — note that an ohack.dev login does not create a Slack account, so you need to join separately.",
  },
];
