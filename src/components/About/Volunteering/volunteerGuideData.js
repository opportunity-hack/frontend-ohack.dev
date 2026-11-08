// Content for the event-volunteer guide (/about/volunteers).
//
// Everything here mirrors what the volunteer application actually asks and
// what the check-in tooling actually does, so keep the three in sync:
//   - roles + shift blocks ← pages/hack/[event_id]/volunteer-application.js
//     (getVolunteerTypeOptions / timeBlocksConfig / inPersonOnlyRoles)
//   - the check-in steps ← components/admin/checkin/CheckInWorkbench.js and
//     components/VolunteerCheckInQR/VolunteerCheckInQR.js
//   - the food-area rules + rhythm ← the printed "Volunteer Reference Sheet"
//     organizers leave in the snack room (no single lead on shift, initial
//     the row when done, trash ~2h / snacks ~4h / food away 1h after a meal)
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
      "Hackers who aren't on the roster can apply on their phone and be checked in right there; for anyone else not on the roster, wave an organizer over — they'll take it from there.",
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
      "Put food away one hour after serving ends, then wipe the tables and reset the area for the next meal.",
      "Refresh snacks and drinks about every four hours — and top up sooner if the table looks bare. A hungry team at 11pm is a slow team.",
      "The snack and fridge room is just for volunteers — keep the door closed, and if someone wanders in, a friendly heads-up is all it takes.",
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
      "Check the trash about every two hours, and if a bin is full or getting fragrant, feel free to change it straight away — no need to wait for the next check.",
      "Walk the room once an hour with a trash bag; teams deep in their code rarely notice the pizza boxes piling up, and they're always grateful.",
      "Do a trash collect before the midnight pizza lands so it arrives in a clean room.",
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
      "Everyone agreed to our photo release when they applied, so candids are fine — a quick 'mind if I grab a photo?' before close-ups is still a kind touch.",
      "Get a wide shot of every pitch and demo plus a few candid team moments — those are what sponsors and nonprofits share.",
      "Drop photos into the event's shared Google Drive folder the same day — a selection goes on the event's media page with your name as the credit (see the photographer notes below).",
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
      {
        time: "8:00am – 11:00am",
        label: "Doors open & registration",
        roles: "Check-in, breakfast setup, room setup",
      },
      {
        time: "10:00am – 12:00pm",
        label: "Nonprofit pitches",
        roles: "Pitch support, photography",
      },
      {
        time: "12:00pm – 3:00pm",
        label: "Lunch",
        roles: "Food service, cleanup",
      },
      {
        time: "2:30pm – 5:00pm",
        label: "Afternoon hacking",
        roles: "Cleanup, photography, general support",
      },
      {
        time: "4:00pm – 7:00pm",
        label: "Dinner & evening",
        roles: "Food service, cleanup",
      },
      {
        time: "7:00pm – 11:00pm",
        label: "Evening hacking",
        roles: "Cleanup, general support",
      },
      {
        time: "11:30pm – 12:30am",
        label: "Midnight run",
        roles: "Pizza setup, snack refresh, cleanup",
      },
    ],
  },
  {
    day: "Day 2",
    blocks: [
      {
        time: "8:00am – 11:00am",
        label: "Breakfast setup & cleanup",
        roles: "Food service, cleanup",
      },
      {
        time: "11:00am – 2:00pm",
        label: "Expert hours",
        roles: "General support, photography",
      },
      {
        time: "12:00pm – 3:00pm",
        label: "Lunch setup & cleanup",
        roles: "Food service, cleanup",
      },
      {
        time: "3:00pm – 6:00pm",
        label: "Judging & cleanup",
        roles: "Judging support, pitch support, final cleanup",
      },
    ],
  },
];

// For anyone on the photography & video shift — rendered as a callout under
// the role cards. Links are data too so the FAQ and the callout can't drift.
export const PHOTOGRAPHER_NOTES = [
  {
    id: "drive",
    title: "Share through the event's Google Drive folder",
    body: "Organizers set up a shared Google Drive folder for every event. Ask for the link once you're approved (or in Slack on the day) and drop photos in as you go, ideally the same day. Unedited is perfectly fine — we'd rather have everything than a polished few.",
    links: [],
  },
  {
    id: "consent",
    title: "It's a public event, and two pages are worth knowing",
    body: "Everyone agreed to our photo release when they applied, so candid shots of teams at work, pitches, and the awards are all welcome. Our code of conduct applies behind the lens too: if someone would rather not be photographed, that's always okay — just move on with a smile.",
    links: [
      { label: "Photo release", href: "/hack/photo-release" },
      { label: "Code of conduct", href: "/hack/code-of-conduct" },
    ],
  },
  {
    id: "credit",
    title: "Your photos go on the event's media page, with credit",
    body: "After the hackathon, organizers publish a selection on the event's media page and in the recap, with your name as the photo credit. Let us know how you'd like to be credited — your name, a handle, or a portfolio link.",
    links: [
      {
        label: "Example: a past event's media page",
        href: "/hack/2026_spring_wics_asu/media",
      },
    ],
  },
  {
    id: "certificate",
    title: "You'll receive a certificate",
    body: "Photography counts as volunteer time like any other shift. You'll get a volunteer certificate after the event, plus Hearts on your ohack.dev profile. If you need documented hours for work or school, the time tracker keeps a log for you (optional).",
    links: [{ label: "Volunteer time tracker", href: "/volunteer/track" }],
  },
];

// How a shift actually runs. Organizers print a reference sheet and leave it
// in the food area; these are its operating principles, verbatim in spirit.
export const SHIFT_PRINCIPLES = [
  {
    id: "no-lead",
    title: "Everyone on shift shares the room",
    body: "Volunteers come in time slots rather than all day, so there isn't one person in charge at any given moment — and that's fine. If you spot something on the shared sheet that needs doing during your shift, you're welcome to pick it up.",
  },
  {
    id: "initial",
    title: "Initial the sheet when you finish something",
    body: "A printed reference sheet lives in the food area with a row per task and an Initials column. Adding your initials when you finish lets the next volunteer know it's handled, so nothing gets done twice.",
  },
  {
    id: "assess",
    title: "Use your judgment between checks",
    body: "The times are a rhythm, not a rule. If a bin is full or the snack table looks bare between checks, go ahead and sort it out; if everything looks fine at check time, a quick look is plenty.",
  },
];

// The food-area rules from the reference sheet.
export const FOOD_AREA_RULES = [
  {
    id: "meals",
    label: "Meals",
    body: "Put food away one hour after serving ends. Wipe the tables and reset the area so it's clean for the next setup.",
  },
  {
    id: "snacks",
    label: "Snacks",
    body: "Refresh about every four hours. In between, take a look: if snacks are low or the area is messy, top it up or tidy it.",
  },
  {
    id: "trash",
    label: "Trash",
    body: "Check about every two hours. If a bin is full or getting fragrant, go ahead and change it — no need to wait for the next check.",
  },
  {
    id: "room",
    label: "Snack & fridge room",
    body: "This room is just for volunteers. Keep the door closed, and if someone wanders in, a friendly heads-up that it's the volunteer room is all it takes.",
  },
  {
    id: "taking-food",
    label: "Taking food",
    body: "Hackers are welcome to take food with them. If someone's loading up, a gentle reminder to leave enough for everyone — and to leave the trays, containers, and bulk supplies behind — is plenty.",
  },
  {
    id: "setup-takedown",
    label: "Setup & take-down",
    body: "Keep the snack and meal areas clean for setup, and leave them clean at take-down. A little general awareness while you're on shift goes a long way.",
  },
];

// The day's rhythm, in cadence terms rather than clock times — the printed
// sheet has the exact times for that event, and meal times are confirmed on
// the day.
export const FOOD_RHYTHM = [
  {
    when: "Doors open",
    what: "Set up the snack station and the welcome table.",
  },
  { when: "Every ~2 hours", what: "Trash check — change any bin that's full." },
  { when: "Every ~4 hours", what: "Refresh snacks and drinks." },
  {
    when: "After each meal",
    what: "Put food away one hour after serving ends; wipe and reset.",
  },
  {
    when: "Before the midnight run",
    what: "Collect the trash so the pizza lands in a clean room.",
  },
  {
    when: "End of day 1",
    what: "Tidy up, wipe down the food area, pack away leftover supplies.",
  },
  {
    when: "After winners are announced",
    what: "Take down and leave the space clean.",
  },
];

// What organizers aim to stock — handy if you're sent on a supply run.
export const SNACK_IDEAS = [
  {
    group: "Drinks",
    items: "Water, coffee and cold brew, energy drinks, soda, sparkling water",
  },
  {
    group: "Snacks",
    items:
      "Chips and salsa, popcorn, pretzels, trail mix, granola bars, fruit (bananas, apples, oranges), candy and cookies",
  },
  {
    group: "Late-day treats",
    items: "Brownies, ice cream cups, instant ramen, pizza rolls",
  },
];
export const SNACK_INCLUSIVE_NOTE =
  "Fruit, popcorn, chips and salsa, and granola bars cover vegan and gluten-free needs without a separate table.";

// The registration-desk playbook. Mirrors what the check-in tool really does:
// scan → PATCH checkedIn, manual lookup by name as the fallback.
export const CHECKIN_STEPS = [
  {
    id: "access",
    title: "Grab a scanning phone at the desk",
    body: "Organizers provide phones for scanning QR codes at the registration desk, so there's nothing to set up or get access to ahead of time. When your shift starts, find the organizer on duty — they'll hand you a phone and point you to the Check-In section.",
  },
  {
    id: "qr",
    title: "Everyone approved has a QR code",
    body: "Once approved, everyone has a personal check-in QR code on their application page (the approval email links to it). Ask people to have it open on their phone while they're in line.",
  },
  {
    id: "scan",
    title: "Open the Check-In section and start scanning",
    body: "Choose Check-In, tap Start Scanning, and allow camera access. Point the camera at the QR code — you'll see \"Successfully checked in\" with their name. If the camera opens the wrong way, use Switch Camera.",
  },
  {
    id: "manual",
    title: "No QR code? Look them up by name",
    body: "Tap Manual Entry, pick their role, then search by name or email. Select them and tap Check In — same result as a scan.",
  },
  {
    id: "edge",
    title: "Not on the list? Hackers can apply right there",
    body: "Hackers who haven't applied or aren't on the roster can apply on their phone at the desk, and you can check them in. Most events are first-come-first-served, and budget can cap the headcount, so if a hacker still doesn't appear or you hear we're full, flag an organizer. For mentors, judges, volunteers, and sponsors, an organizer handles approval. Mentors may already have checked in online; that counts, so just confirm they're in the list.",
  },
];

export const CHECKIN_SITUATIONS = [
  {
    situation: "They have the QR code on their phone",
    action:
      "Scan it. Confirm the name on screen matches the person, then send them to breakfast and the kickoff room.",
  },
  {
    situation: "Phone died or no QR code",
    action:
      "Manual Entry → pick their role → search their name or email → Check In.",
  },
  {
    situation: "A hacker applied but isn't on the roster",
    action:
      "Look them up by name first. If they still don't appear, call an organizer — most events are first-come-first-served with a capped headcount, and the organizer will sort it out.",
  },
  {
    situation: "A hacker never applied (a walk-up)",
    action:
      "Have them apply on their phone from the event page right there, then check them in. If we're at capacity, an organizer will let you know.",
  },
  {
    situation: "A mentor, judge, volunteer, or sponsor isn't on the roster",
    action:
      "Call an organizer over — they approve from the Volunteer section, and then you can scan or look the person up like anyone else.",
  },
  {
    situation: "A mentor says they already checked in online",
    action:
      "That's real — remote mentor check-in sets the same flag. Find them in the checked-in list to confirm, no second scan needed.",
  },
  {
    situation: "The name on screen is misspelled or out of date",
    action:
      "Check them in anyway and let an organizer know; details are easy to fix in the Volunteer section afterwards.",
  },
];

export const WHAT_TO_BRING = [
  "No laptop needed — your phone covers everything a shift asks for",
  "A fully charged phone (and a battery pack if you're on the photo shift)",
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
    id: "lead",
    question: "Who's in charge during my shift?",
    answer:
      "Everyone on shift shares it. Volunteers come in time slots rather than all day, so instead of one lead, the printed reference sheet in the food area is the shared source of truth: it lists what needs doing and when, with an Initials column you fill in as you go. Pick up whatever is due during your shift, and lean on the organizers for anything that needs a decision — roster questions, venue issues, medical or safety concerns. They're on site all weekend.",
  },
  {
    id: "virtual",
    question: "Can I volunteer virtually?",
    answer:
      "For in-person hackathons, volunteer roles need you on site — the application will stop you from choosing 'virtual' and point you to mentoring, which can be done remotely. Our online-only events have virtual roles: event moderation, content creation, and social media.",
  },
  {
    id: "approval",
    question:
      "Will I hear back after I apply, and what does 'approved' look like?",
    answer:
      "You'll get a confirmation email right away with calendar invites for the shifts you picked. Organizers then approve volunteers before the event. Once you're approved, your application page shows a personal check-in QR code and a card you can share on social media, and your name joins the volunteer roster on the event page. If you reopen your application and see an 'awaiting confirmation' notice, that just means organizers haven't gotten to it yet — nothing more is needed from you.",
  },
  {
    id: "food",
    question: "Are meals provided?",
    answer:
      "Yes — in-person volunteers eat with everyone else: breakfast, lunch, dinner, late-night snacks, and day-two meals. The application asks for dietary restrictions so the catering counts are right; please fill that in so we can take good care of you.",
  },
  {
    id: "checkin-access",
    question: "I signed up for check-in. How do I actually check people in?",
    answer:
      "Scan their QR code with the check-in tool inside the event's admin pages, or look them up by name with Manual Entry if they don't have the code. Organizers provide phones at the registration desk for scanning, so there's nothing to set up beforehand. The full walkthrough, including what to do when someone isn't on the roster, is on this page.",
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
      "Yes. If you need documented hours for work or school, you can log them on ohack.dev/volunteer/track — it's optional. After the event, request a General Volunteer letter from the event's letters page — it's reviewed and signed by an organizer. Every volunteer also earns Hearts toward certificates and rewards on your profile.",
  },
  {
    id: "photo",
    question: "Why does the application ask for my photo, bio, and LinkedIn?",
    answer:
      "They're optional. When you're approved they appear on the event page's volunteer roster so participants can recognize the people helping them, and they feed the share card you can post after the event. Skip them if you'd rather stay off the public roster.",
  },
  {
    id: "photos",
    question: "I'm on the photography shift — where do my photos go?",
    answer:
      "Into the shared Google Drive folder organizers create for the event; ask for the link once you're approved or in Slack on the day. After the hackathon a selection goes up on the event's media page and in the recap with your name as the credit, and you'll receive a volunteer certificate like every other shift. It's a public event and everyone agreed to the photo release when they applied, but if someone would rather not be in a shot, that's always fine.",
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
