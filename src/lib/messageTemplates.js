/**
 * Message Templates and Utilities
 *
 * Shared utilities for handling email/message templates across the application.
 * Used by VolunteerCommunication.js and BatchEmailDialog.js
 */

/**
 * Message templates organized by category
 * Each template includes:
 * - id: unique identifier
 * - title: template title/subject
 * - applicableRoles: array of volunteer types this template applies to
 * - message: template message with optional placeholders
 * - icon: emoji icon for UI display
 */
export const MESSAGE_TEMPLATES = {
  APPROVAL: {
    category: "Approval & Confirmation",
    templates: [
      {
        id: "hacker_approved",
        title: "Hacker Application Approved",
        applicableRoles: ["hacker", "hackers"],
        message: "🎉 You're in! Welcome to Opportunity Hack!\n\nYour hacker application is approved. Get ready to build impactful solutions for nonprofits alongside amazing teammates.\n\n🚀 Next steps:\n• Join our Slack for updates\n• Wait for us to announce nonprofit projects at https://www.ohack.dev/hack/[EVENT_ID]\n• Learn what's expected: https://www.ohack.dev/about/hackers\n• Understand judging criteria: https://www.ohack.dev/about/judges\n• Optional: Track your volunteer hours (if you want to keep track): https://www.ohack.dev/volunteer/track\n\nLet's change the world, one line of code at a time! 💻\n\nStay connected: @opportunityhack on all socials",
        icon: "✅"
      },
      {
        id: "mentor_approved",
        title: "Mentor Application Approved",
        applicableRoles: ["mentor", "mentors"],
        message: "🌟 Welcome to our mentor squad!\n\nYour expertise will guide teams to create life-changing solutions for nonprofits. Thank you for sharing your knowledge!\n\n📚 Resources:\n• Mentor guide: https://www.ohack.dev/about/mentors\n• **Remote mentors only**: Check in at [mentor check-in portal](https://www.ohack.dev/hack/[EVENT_ID]/mentor-checkin)\n• **In-person mentors**: Use your QR code at the venue for check-in\n• Optional: Track your volunteer hours (if you want to keep track): https://www.ohack.dev/volunteer/track\n\nReady to inspire the next generation of changemakers? 🚀",
        icon: "🎯"
      },
      {
        id: "judge_travel_confirmation",
        title: "Judge Application Approved - Please Confirm Travel",
        applicableRoles: ["judge", "judges"],
        message: "⚖️ Congratulations! Your judge application has been approved!\n\nWe're excited to have you evaluate the innovative solutions our teams will create for nonprofits. However, we need your confirmation for an important detail:\n\n✈️ **All judging for Opportunity Hack is done IN PERSON at [LOCATION_NAME].**\n\n📍 Location Details:\n• Event location: [LOCATION_NAME]\n• More info & hotel recommendations: [LOCATION_URL]\n• Full schedule of events: https://www.ohack.dev/hack/[EVENT_ID]#countdown\n• Add yourself to our LinkedIn event: [LINKEDIN_EVENT_URL]\n\n⏰ **ACTION REQUIRED by [RSVP_DEADLINE]:**\nPlease reply to this email at questions@ohack.org to confirm:\n✅ \"I confirm I can attend in person at [LOCATION_NAME]\" OR\n❌ \"I need to decline due to travel constraints\"\n\n✏️ **Need to edit your application?**\nGo to: https://www.ohack.dev/hack/[EVENT_ID]/judge-application\nUse code: \"[ACCESS_CODE]\"\n\nWe understand travel requirements may not work for everyone. We just need to know by the deadline to finalize our judging panel.\n\nThank you for your interest in supporting nonprofit innovation! 🌟",
        icon: "✈️"
      },
      {
        id: "judge_approved",
        title: "Judge Application Approved",
        applicableRoles: ["judge", "judges"],
        message: "⚖️ Welcome to our judging panel!\n\nThank you for being here! Having your talent and background to review these projects helps us to find the top teams who have solved problems for nonprofits.\n\n📋 Resources & Next Steps:\n1. Judging Intro [video](https://youtu.be/YM8j-2CA-mE?si=WNiRqI9Ww_Jd0yx0)\n2. When the projects have closed and we're ready to judge, you'll go [here](https://www.ohack.dev/judge)\n3. Judging criteria is [here](https://www.ohack.dev/about/judges)\n4. You can already start reviewing teams GitHub and DevPost now (knowing that they might land more changes before the end of the hack) all teams are listed [here](https://www.ohack.dev/hack/[EVENT_ID]#teams)\n5. All judges are listed [here](https://www.ohack.dev/hack/[EVENT_ID]#judge)\n6. Take time to say hi and introduce yourself to everyone, this is a great way to market amongst similar-minded, community focused people\n\n⏱️ Track your impact: https://www.ohack.dev/volunteer/track\n\nReady to discover amazing innovations! ✨",
        icon: "⚖️"
      },
      {
        id: "volunteer_approved",
        title: "Volunteer Application Approved",
        applicableRoles: ["volunteer", "volunteers"],
        message: "🙌 You're part of the dream team!\n\nThank you for helping make Opportunity Hack magical. Every volunteer contribution creates ripple effects of positive change.\n\n⏱️ Track your impact: https://www.ohack.dev/volunteer/track\n\nAssignments coming soon. Ready to be part of something amazing? 🌟",
        icon: "🙌"
      },
      {
        id: "sponsor_approved",
        title: "Sponsorship Approved",
        applicableRoles: ["sponsor", "sponsors"],
        message: "🤝 Partnership activated!\n\nThank you for investing in nonprofit innovation. Together, we're amplifying social impact through technology.\n\n📈 Your support enables:\n• Free participation for nonprofits\n• Quality mentorship and resources\n• Lasting solutions for communities\n\n⏱️ Team volunteering? Track at: https://www.ohack.dev/volunteer/track",
        icon: "🤝"
      },
      {
        id: "checkin_information_mentors",
        title: "Check-in Information",
        applicableRoles: ["mentor", "mentors"],
        message: "📱 Ready for check-in? Here's everything you need!\n\nFor in-person participants, we've made check-in super easy with your personal QR code below **and also bring your identification**:\n\n[QRCode:[EVENT_ID]|[VOLUNTEER_ID]|[VOLUNTEER_TYPE]]\n\n**How to use your QR code:**\n• Simply show this QR code when you arrive at the venue\n• Our volunteers will scan it for instant check-in\n• No need to remember names, emails, or confirmation numbers!\n\n**Remote mentors**: Use the [mentor check-in portal](https://www.ohack.dev/hack/[EVENT_ID]/mentor-checkin) to check in virtually\n\n**Can't see the QR code?** No worries! You can also access it anytime from your application page:\n[View Your Application](https://www.ohack.dev/hack/[EVENT_ID]/[VOLUNTEER_TYPE]-application)\n\n📍 **Venue Information:**\nGet directions, parking details, and venue specifics at:\n[ASU Tempe Location Details](https://www.ohack.dev/about/locations/asu-tempe-arizona)\n\n🎯 **What to bring:**\n• This QR code (screenshot or bookmark this email)\n• Your laptop and charger\n• Enthusiasm for making an impact!\n\nSee you soon! 🚀",
        icon: "📱"
      },
      {
        id: "checkin_information",
        title: "Check-in Information",
        applicableRoles: ["hacker", "hackers", "judge", "judges", "volunteer", "volunteers"],
        message: "📱 Ready for check-in? Here's everything you need!\n\nFor in-person participants, we've made check-in super easy with your personal QR code below **and also bring your identification**:\n\n[QRCode:[EVENT_ID]|[VOLUNTEER_ID]|[VOLUNTEER_TYPE]]\n\n**How to use your QR code:**\n• Simply show this QR code when you arrive at the venue\n• Our volunteers will scan it for instant check-in\n• No need to remember names, emails, or confirmation numbers!\n\n**Can't see the QR code?** No worries! You can also access it anytime from your application page:\n[View Your Application](https://www.ohack.dev/hack/[EVENT_ID]/[VOLUNTEER_TYPE]-application)\n\n📍 **Venue Information:**\nGet directions, parking details, and venue specifics at:\n[ASU Tempe Location Details](https://www.ohack.dev/about/locations/asu-tempe-arizona)\n\n🎯 **What to bring:**\n• This QR code (screenshot or bookmark this email)\n• Your laptop and charger\n• Enthusiasm for making an impact!\n\nSee you soon! 🚀",
        icon: "📱"
      }
    ]
  },
  DENIAL: {
    category: "Application Denial",
    templates: [
      {
        id: "judge_application_denied",
        title: "Judge Application - Alternative Opportunity Available!",
        applicableRoles: ["judge", "judges"],
        message: "Thank you for your interest in judging at Opportunity Hack! 🙏\n\nWhile our judging panel is at capacity for this event, we have an exciting alternative that offers even more meaningful volunteer experience and community impact.\n\n🌟 **Consider becoming a MENTOR instead!**\n\nHere's why mentoring might be perfect for you:\n• **More volunteer hours** - Mentors typically contribute 8-12 hours vs 2-4 for judges\n• **Direct community impact** - Guide teams solving real nonprofit problems\n• **Professional development** - Share your expertise while learning from diverse teams\n• **Networking opportunities** - Work closely with passionate developers and nonprofit leaders\n• **Recognition** - All mentor contributions are documented for professional/visa purposes\n• **🏠 Remote-friendly** - Mentor virtually from anywhere! No travel required - support teams through Slack, video calls, and code reviews\n• **Flexible schedule** - Choose when and how much you engage throughout the hackathon weekend\n• **Deeper relationships** - Build lasting connections with teams as you guide their entire project journey\n\n📝 **Ready to make an even bigger impact?**\nApply to be a mentor: [Mentor Application](https://www.ohack.dev/hack/[EVENT_ID]/mentor-application)\n\n⏱️ All mentoring hours can be tracked at: https://www.ohack.dev/volunteer/track\n\n🚀 **Still want to judge future events?** Keep an eye out for our next hackathon announcements!\n\nYour expertise can transform ideas into lasting solutions. We'd love to have you on our mentor team! 💡\n\nStay connected: @opportunityhack on all socials",
        icon: "🎯"
      },
      {
        id: "application_denied",
        title: "Application Not Approved",
        applicableRoles: ["mentor", "mentors", "volunteer", "volunteers", "hacker", "hackers", "sponsor", "sponsors"],
        message: "Thank you for wanting to join our mission! 🙏\n\nWhile we can't accommodate your application this time due to capacity, your interest in helping nonprofits means everything.\n\n🌟 Stay involved:\n• Apply for future events\n• Follow @opportunityhack for opportunities\n• Share our mission with your network\n\nEvery action towards social good counts. We hope to work together soon! 💫",
        icon: "💫"
      }
    ]
  },
  WAITLIST: {
    category: "Waitlist Management",
    templates: [
      {
        id: "hacker_waitlisted",
        title: "You're on the Waitlist - Stay Tuned!",
        applicableRoles: ["hacker", "hackers"],
        message: "⏳ You're on our hacker waitlist!\n\nThank you for your interest in Opportunity Hack! While we've reached capacity for initial registrations, we've added you to our waitlist.\n\n🔄 **What happens next:**\n• We'll complete check-in process at 9:00 AM on event day\n• If spots open up, you'll get an immediate notification\n• Keep your phone handy and stay ready to join!\n\n🎒 **Stay prepared:**\n• Keep your laptop charged and ready\n• Review the nonprofit projects: https://www.ohack.dev/hack/[EVENT_ID]#nonprofits\n• Join our Slack for real-time updates\n• Track your preparation time: https://www.ohack.dev/volunteer/track\n\nWe appreciate your patience and enthusiasm for nonprofit innovation. Whether you join us this time or next, you're already part of our community! 🌟\n\nStay connected: @opportunityhack on all socials",
        icon: "⏳"
      },
      {
        id: "hacker_waitlist_accepted",
        title: "🎉 You're In! Come Join Us Now!",
        applicableRoles: ["hacker", "hackers"],
        message: "🎉 Amazing news - you're off the waitlist and INTO the hackathon!\n\nA spot just opened up and we want YOU to fill it! Time to grab your laptop and join us for an incredible day of building solutions for nonprofits.\n\n📱 **Your Check-in QR Code:**\n[QRCode:[EVENT_ID]|[VOLUNTEER_ID]|[VOLUNTEER_TYPE]]\n\n🏃‍♂️ **Come NOW - Here's what to do:**\n• Head to the venue immediately\n• Bring this QR code for instant check-in\n• Get your laptop, charger, and enthusiasm ready!\n\n📍 **Venue Information:**\n[ASU Tempe Location Details](https://www.ohack.dev/about/locations/asu-tempe-arizona)\n\n🎯 **What's happening:**\n• Team formation is in progress\n• Nonprofit presentations are starting soon\n• Amazing prizes and impact awaiting!\n\n**Can't see the QR code?** Access it anytime at:\n[Your Application](https://www.ohack.dev/hack/[EVENT_ID]/hacker-application)\n\n⏱️ Track your impact: https://www.ohack.dev/volunteer/track\n\nLet's build something incredible together! 🚀",
        icon: "🎉"
      },
      {
        id: "hacker_waitlist_full",
        title: "Waitlist Update - This Event is Full",
        applicableRoles: ["hacker", "hackers"],
        message: "💙 Thank you for your interest in Opportunity Hack!\n\nWe've completed our check-in process and unfortunately don't have any remaining spots available for today's hackathon. We truly appreciate your enthusiasm and patience.\n\n🌟 **You're still part of our community:**\n• Follow us for future hackathon announcements\n• Join our Slack to stay connected with the community\n• Consider other ways to get involved with nonprofits year-round\n• Track any volunteer hours: https://www.ohack.dev/volunteer/track\n\n📅 **Future opportunities:**\n• We host multiple hackathons throughout the year\n• Volunteer opportunities at future events\n• Mentor roles for experienced developers\n• Stay updated on all events at https://www.ohack.dev\n\n💡 **Get involved now:**\n• Share our mission with your network\n• Follow our social impact stories\n• Connect with nonprofits in your area\n\nYour interest in using technology for social good means everything to us. We hope to hack together at a future event! 💫\n\nStay connected: @opportunityhack on all socials",
        icon: "💙"
      }
    ]
  },
  FOLLOW_UP: {
    category: "Follow-up & Information",
    templates: [
      {
        id: "sponsor_info_request",
        title: "Sponsor Information Request",
        applicableRoles: ["sponsor", "sponsors"],
        message: "Excited about your sponsorship interest! 🚀\n\nLet's create a partnership that amplifies your impact and aligns with your values.\n\n💭 Quick questions:\n• Preferred involvement level?\n• Specific causes you're passionate about?\n• Would your team like to volunteer?\n\n⏱️ Team volunteers can track time: https://www.ohack.dev/volunteer/track\n\nReply with your thoughts - we'll craft the perfect partnership! ✨",
        icon: "📋"
      },
      {
        id: "mentor_checkin_reminder",
        title: "Mentor Check-in Reminder",
        applicableRoles: ["mentor", "mentors"],
        message: "Time to check in! 👋\n\nYour guidance is transforming ideas into impact. Quick reminder:\n\n✅ Check-in: https://www.ohack.dev/hack/[EVENT_ID]/mentor-checkin\n📚 Resources: https://www.ohack.dev/about/mentors\n⏱️ Track time: https://www.ohack.dev/volunteer/track\n\nEvery minute you spend mentoring creates lasting change! 🌟",
        icon: "⏰"
      },
      {
        id: "judge_info_sharing",
        title: "Judge Information & Resources",
        applicableRoles: ["judge", "judges"],
        message: "Ready to spot game-changing solutions? ⚖️\n\nYour expertise helps identify innovations that will transform nonprofit work.\n\n📚 Resources:\n0. Dates and times are [here on the hackathon page](https://www.ohack.dev/hack/[EVENT_ID]#countdown)\n1. Judging Intro [video](https://youtu.be/YM8j-2CA-mE?si=WNiRqI9Ww_Jd0yx0)\n2. When the projects have closed and we're ready to judge, you'll go [here](https://www.ohack.dev/judge)\n3. Judging criteria is [here](https://www.ohack.dev/about/judges)\n4. You can already start reviewing teams GitHub and DevPost now (knowing that they might land more changes before the end of the hack) all teams are listed [here](https://www.ohack.dev/hack/[EVENT_ID]#teams)\n5. All judges are listed [here](https://www.ohack.dev/hack/[EVENT_ID]#judge)\n6. Take time to say hi and introduce yourself to everyone, this is a great way to market amongst similar-minded, community focused people, join our judges Slack channel: [SLACK_CHANNEL]\n\n⏱️ Track your volunteer hours: https://www.ohack.dev/volunteer/track\n\nGet excited to discover the next big breakthrough! 🎯",
        icon: "📚"
      },
      {
        id: "volunteer_time_tracking",
        title: "Volunteer Time Tracking Reminder",
        applicableRoles: ["mentor", "mentors", "judge", "judges", "volunteer", "volunteers", "hacker", "hackers", "sponsor", "sponsors"],
        message: "Your time = Real impact! ⏱️\n\nEvery hour you contribute creates ripple effects in nonprofit communities. Don't let your impact go uncounted!\n\n📊 Track at: https://www.ohack.dev/volunteer/track\n\nWhy track?\n• Celebrate your contribution\n• Show sponsors our collective power\n• Inspire others to join our mission\n\nYou're changing the world - let's measure it! 🌍",
        icon: "⏱️"
      },
      {
        id: "hacker_team_reminder",
        title: "Team Formation Reminder",
        applicableRoles: ["hacker", "hackers"],
        message: "Ready to find your dream team? 👥\n\nThe best solutions come from diverse minds working together!\n\n🎯 Team tips:\n• 2-6 members work best\n• Mix skills: code + design + strategy\n• Track your journey: https://www.ohack.dev/volunteer/track\n\nTeam formation activities start soon. Prepare to meet your future collaborators! ⚡",
        icon: "👥"
      }
    ]
  },
  COMMUNITY: {
    category: "Community Communications",
    templates: [
      {
        id: "community_announcement",
        title: "Community Announcement",
        applicableRoles: ["community members", "community", "slack"],
        message: "Hello Opportunity Hack Community! 🌟\n\nWe have some exciting news to share with all of our amazing community members who make our mission possible.\n\n📢 [Your announcement here]\n\n🙏 Thank you for being part of our community and helping us create lasting impact for nonprofits through technology.\n\n💬 Join the discussion on Slack\n🌐 Stay updated: https://www.ohack.dev\n📱 Follow us: @opportunityhack on all socials\n\nTogether, we're changing the world! 💫",
        icon: "📢"
      },
      {
        id: "community_newsletter",
        title: "Community Newsletter",
        applicableRoles: ["community members", "community", "slack"],
        message: "📧 Opportunity Hack Community Update\n\nHello amazing community members! 👋\n\nHere's what's been happening in our community:\n\n🎯 **Recent Impact:**\n• [Add recent achievements]\n• [Add project highlights]\n• [Add community milestones]\n\n📅 **Upcoming Events:**\n• [Add upcoming hackathons]\n• [Add mentorship opportunities]\n• [Add community meetings]\n\n🌟 **Community Spotlight:**\n[Highlight a community member, project, or nonprofit]\n\n📚 **Resources & Opportunities:**\n• Track your volunteer hours: https://www.ohack.dev/volunteer/track\n• Explore our projects: https://www.ohack.dev\n• Join discussions on Slack\n\n💙 Thank you for being part of our mission to create lasting technology solutions for nonprofits!\n\nStay connected: @opportunityhack on all socials",
        icon: "📰"
      },
      {
        id: "community_event_reminder",
        title: "Event Reminder",
        applicableRoles: ["community members", "community", "slack"],
        message: "⏰ Don't Miss Out! Event Reminder\n\nHey community! Just a friendly reminder about our upcoming event:\n\n📅 **[EVENT NAME]**\n🗓️ Date: [DATE]\n⏰ Time: [TIME]\n📍 Location: [LOCATION/VIRTUAL LINK]\n\n🎯 **What to Expect:**\n• [Add event highlights]\n• [Add what attendees will learn/do]\n• [Add networking opportunities]\n\n🚀 **How to Join:**\n[Add registration/join information]\n\n💡 **Why Attend:**\n• Make a real impact for nonprofits\n• Learn new technologies\n• Meet like-minded changemakers\n• Build your portfolio\n\n⏱️ Track your volunteer hours: https://www.ohack.dev/volunteer/track\n\nSee you there! 🌟\n\nQuestions? Reply to this email or ask in Slack.\n\nStay connected: @opportunityhack on all socials",
        icon: "📅"
      },
      {
        id: "community_thanks",
        title: "Community Appreciation",
        applicableRoles: ["community members", "community", "slack"],
        message: "🙏 A Heartfelt Thank You to Our Amazing Community!\n\nDear Opportunity Hack Community,\n\nWe wanted to take a moment to express our genuine gratitude for each and every one of you. Whether you're a developer, designer, project manager, mentor, or nonprofit advocate - you are the heart of our mission.\n\n💫 **Your Impact:**\n• [Add specific community achievements]\n• [Add nonprofit success stories]\n• [Add volunteer hour milestones]\n\n🌟 **What Makes You Special:**\n• Your passion for social good\n• Your technical expertise shared freely\n• Your dedication to helping nonprofits\n• Your collaborative spirit\n\n📈 **Looking Ahead:**\nTogether, we're building a future where technology serves humanity. Every line of code, every design element, every mentoring session creates ripples of positive change.\n\n⏱️ Track your volunteer hours: https://www.ohack.dev/volunteer/track\n\n💬 Keep the conversations going on Slack - we love seeing your ideas and collaborations!\n\nWith immense gratitude,\nThe Opportunity Hack Team 💙\n\nStay connected: @opportunityhack on all socials",
        icon: "💝"
      }
    ]
  }
};

/**
 * Human-friendly labels and examples for template placeholders
 */
export const PLACEHOLDER_LABELS = {
  LOCATION_NAME: { label: 'Location Name', example: 'e.g., Arizona State University in Tempe, Arizona' },
  LOCATION_URL: { label: 'Location URL', example: 'e.g., https://ohack.dev/about/locations/asu-tempe-arizona' },
  LINKEDIN_EVENT_URL: { label: 'LinkedIn Event URL', example: 'e.g., https://www.linkedin.com/events/...' },
  RSVP_DEADLINE: { label: 'RSVP Deadline', example: 'e.g., August 28th at 5:00 PM PST' },
  ACCESS_CODE: { label: 'Access Code', example: 'e.g., 2025' },
  SLACK_CHANNEL: { label: 'Slack Channel', example: 'e.g., [#2026-spring-judging](https://opportunity-hack.slack.com/archives/XXXXX)' },
};

/**
 * Placeholders that are automatically replaced and should not prompt the admin
 */
const AUTO_REPLACED_PLACEHOLDERS = ['EVENT_ID', 'VOLUNTEER_ID', 'VOLUNTEER_TYPE'];

/**
 * Detect unreplaced placeholders in a message that need manual input.
 * Returns an array of unique placeholder names (without brackets).
 *
 * @param {string} message - The message text to scan
 * @returns {string[]} Array of placeholder names needing manual input
 */
export const detectPlaceholders = (message) => {
  if (!message) return [];
  const matches = [...message.matchAll(/\[([A-Z_]+)\]/g)];
  const unique = [...new Set(matches.map(m => m[1]))];
  return unique.filter(name => !AUTO_REPLACED_PLACEHOLDERS.includes(name));
};

/**
 * Replace placeholders in message text with actual values
 *
 * Supported placeholders:
 * - [EVENT_ID]: Event identifier
 * - [VOLUNTEER_ID]: Volunteer/user identifier
 * - [VOLUNTEER_TYPE]: Type of volunteer (hacker, mentor, judge, etc.)
 * - [LOCATION_NAME]: Event venue name (e.g., "Arizona State University in Tempe, Arizona")
 * - [LOCATION_URL]: URL to venue info page (e.g., "https://ohack.dev/about/locations/asu-tempe-arizona")
 * - [LINKEDIN_EVENT_URL]: LinkedIn event URL for this hackathon
 * - [RSVP_DEADLINE]: RSVP deadline text (e.g., "August 28th at 5:00 PM PST")
 * - [ACCESS_CODE]: Application access code (e.g., "2025")
 * - [SLACK_CHANNEL]: Slack channel link/name (e.g., "[#2026-spring-judging](https://opportunity-hack.slack.com/archives/XXXXX)")
 *
 * @param {string} message - The message text with placeholders
 * @param {Object} replacements - Object containing replacement values
 * @param {string} replacements.eventId - Event ID to replace [EVENT_ID]
 * @param {string} replacements.volunteerId - Volunteer ID to replace [VOLUNTEER_ID]
 * @param {string} replacements.volunteerType - Volunteer type to replace [VOLUNTEER_TYPE]
 * @param {string} replacements.locationName - Venue name to replace [LOCATION_NAME]
 * @param {string} replacements.locationUrl - Venue info URL to replace [LOCATION_URL]
 * @param {string} replacements.linkedinEventUrl - LinkedIn event URL to replace [LINKEDIN_EVENT_URL]
 * @param {string} replacements.rsvpDeadline - RSVP deadline text to replace [RSVP_DEADLINE]
 * @param {string} replacements.accessCode - Access code to replace [ACCESS_CODE]
 * @param {string} replacements.slackChannel - Slack channel link to replace [SLACK_CHANNEL]
 * @returns {string} Message with placeholders replaced
 */
export const replacePlaceholders = (message, { eventId, volunteerId, volunteerType, locationName, locationUrl, linkedinEventUrl, rsvpDeadline, accessCode, slackChannel } = {}) => {
  let result = message;

  const replacementMap = {
    '[EVENT_ID]': eventId,
    '[VOLUNTEER_ID]': volunteerId,
    '[VOLUNTEER_TYPE]': volunteerType,
    '[LOCATION_NAME]': locationName,
    '[LOCATION_URL]': locationUrl,
    '[LINKEDIN_EVENT_URL]': linkedinEventUrl,
    '[RSVP_DEADLINE]': rsvpDeadline,
    '[ACCESS_CODE]': accessCode,
    '[SLACK_CHANNEL]': slackChannel,
  };

  for (const [placeholder, value] of Object.entries(replacementMap)) {
    if (value && result.includes(placeholder)) {
      result = result.replaceAll(placeholder, value);
    }
  }

  return result;
};

/**
 * Filter templates by volunteer type
 *
 * @param {string} volunteerType - The type of volunteer to filter templates for
 * @returns {Object} Filtered templates object with only applicable templates
 */
export const filterTemplatesByType = (volunteerType) => {
  const filteredCategories = {};

  Object.entries(MESSAGE_TEMPLATES).forEach(([categoryKey, category]) => {
    const filteredTemplates = category.templates.filter(template =>
      template.applicableRoles.includes(volunteerType)
    );

    if (filteredTemplates.length > 0) {
      filteredCategories[categoryKey] = {
        ...category,
        templates: filteredTemplates
      };
    }
  });

  return filteredCategories;
};

/**
 * Get a specific template by ID
 *
 * @param {string} templateId - The ID of the template to retrieve
 * @returns {Object|null} The template object or null if not found
 */
export const getTemplateById = (templateId) => {
  for (const category of Object.values(MESSAGE_TEMPLATES)) {
    const template = category.templates.find(t => t.id === templateId);
    if (template) {
      return template;
    }
  }
  return null;
};

/**
 * Prepare a template message with placeholder replacements
 *
 * @param {Object} template - The template object
 * @param {Object} replacements - Replacement values for placeholders
 * @returns {string} The prepared message with placeholders replaced
 */
export const prepareTemplateMessage = (template, replacements) => {
  if (!template || !template.message) {
    return '';
  }
  return replacePlaceholders(template.message, replacements);
};
