# Hackathon Event Agenda - Data Structure Extensions

This document outlines the additional fields that can be added to the event data object to enhance the agenda page functionality.

## Current Event Data Structure

The current event object contains:
- `title`: Event name
- `location`: Location name
- `start_date`: Start date/time
- `end_date`: End date/time
- `countdowns`: Array of scheduled events with `name`, `time`, and `description`

## Suggested Additional Fields

### Main Event Information
```javascript
{
  // Existing fields...
  title: "Opportunity Hack 2024",
  location: "Arizona State University",
  start_date: "2024-10-12T09:00:00Z",
  end_date: "2024-10-13T18:00:00Z",
  countdowns: [...],

  // New suggested fields for comprehensive agenda
  venue: "CIDSE Building", // Specific venue/building name
  address: "699 S Mill Ave, Tempe, AZ 85281", // Full address
  description: "Join us for an exciting hackathon...", // Event description
  website: "https://ohack.dev/hack/2024fall", // Event website
  contact: "info@opportunityhack.org", // Contact email
  hashtag: "#OpportunityHack2024", // Social media hashtag

  // Organizer information
  organizers: [
    {
      name: "Opportunity Hack",
      email: "info@opportunityhack.org",
      website: "https://opportunityhack.org"
    }
  ],

  // Sponsors (for agenda display)
  sponsors: [
    {
      name: "Company Name",
      logo: "https://cdn.ohack.dev/sponsors/company-logo.png",
      tier: "gold", // gold, silver, bronze
      website: "https://company.com"
    }
  ],

  // Venue details
  venue_details: {
    name: "CIDSE Building",
    address: "699 S Mill Ave, Tempe, AZ 85281",
    parking_info: "Free parking available in Structure 1",
    wifi_info: "Network: ASU_Guest, Password: OpHack2024",
    accessibility_info: "Building is ADA compliant with elevator access",
    capacity: 300
  },

  // Enhanced countdown/schedule events
  countdowns: [
    {
      name: "Registration & Check-in",
      time: "2024-10-12T09:00:00Z",
      description: "Get your badge and swag bag!",

      // New suggested fields for each event
      location: "Main Lobby", // Specific room/area
      room: "CIDSE 101", // Room number
      duration_minutes: 60, // Event duration
      capacity: 300, // Max attendees
      event_type: "registration", // registration, presentation, meal, break, competition
      presenters: ["John Doe", "Jane Smith"], // Speaker names
      requirements: "Bring ID and confirmation email", // What attendees need
      live_stream_url: "https://youtube.com/watch?v=...", // For virtual/hybrid
      materials: [ // Any handouts or materials
        {
          name: "Welcome Packet",
          url: "https://ohack.dev/materials/welcome-packet.pdf"
        }
      ],
      tags: ["mandatory", "networking"], // Event categories
      color: "#4CAF50" // Color for calendar display
    },
    {
      name: "Opening Keynote",
      time: "2024-10-12T10:00:00Z",
      description: "Welcome and hackathon kickoff",
      location: "Main Auditorium",
      room: "CIDSE Auditorium",
      duration_minutes: 30,
      capacity: 300,
      event_type: "presentation",
      presenters: ["Dr. Tech Leader"],
      live_stream_url: "https://youtube.com/watch?v=...",
      tags: ["mandatory", "keynote"],
      color: "#2196F3"
    }
    // ... more events
  ]
}
```

## Event Types Categories

The agenda system can benefit from categorizing events:

- `registration` - Check-in, badge pickup
- `presentation` - Keynotes, workshops, demos
- `meal` - Breakfast, lunch, dinner, snacks
- `break` - Coffee breaks, networking
- `competition` - Hacking time, judging, awards
- `workshop` - Technical sessions, tutorials
- `networking` - Social events, mixers
- `ceremony` - Opening/closing ceremonies

## Display Enhancements

With these additional fields, the agenda page can show:

1. **Room assignments** - Where each event takes place
2. **Duration bars** - Visual representation of event length
3. **Color coding** - Different colors for different event types
4. **Capacity indicators** - Show if events are at capacity
5. **Material links** - Direct access to presentations or handouts
6. **Live stream links** - For virtual/hybrid attendance
7. **Presenter information** - Who's speaking at each event
8. **Prerequisites** - What attendees need to bring/know

## Implementation Notes

- All new fields should be optional with sensible defaults
- The agenda page already includes stub placeholders for the main event fields
- Individual countdown events can be enhanced incrementally
- Consider adding validation for required fields based on event type
- Print-friendly formatting should adapt based on available data

## Migration Strategy

1. Add new optional fields to existing event objects
2. Update agenda page to display new fields when available
3. Gradually populate new fields for future events
4. Maintain backward compatibility with existing event data