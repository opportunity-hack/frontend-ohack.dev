/**
 * Mentor availability-string parser for /hack/[event_id]/mentor-checkin.
 *
 * Moved VERBATIM out of the page's old fetch effect (Nov 2026) so the page can
 * compute slots in a useMemo on `mentor.availability` and the check-in gate
 * can name the first shift. No logic edits — the mentor form's availability
 * strings ("Saturday Oct 11: ☀️ Morning (9am - 12pm MST), …") are messy and
 * this parser's quirks are load-bearing. Snapshot-tested in
 * src/lib/__tests__/mentorAvailabilitySlots.test.js.
 */

/**
 * Availability text → sorted, de-duplicated slot objects
 * `{id, displayText, date, dayName, time, timePeriod, isCurrent}`.
 */
export function parseAvailabilitySlots(availability) {
  if (!availability || typeof availability !== "string") return [];
  const availabilityText = availability;

  // Use the same regex pattern from MentorAvailability.js
  const availabilityPattern = /([A-Za-z]+\s+[A-Za-z]+\s+\d+:\s+[^,]+)/g;

  // Try to match with regex first
  const matches = availabilityText.match(availabilityPattern);

  // If regex doesn't work, fall back to comma split
  const availabilityArray = matches || availabilityText.split(", ");

  // Create slots and prepare for sorting
  const slots = availabilityArray.map((slotText) => {
    // Make sure slotText is properly cleaned and formatted
    const cleanSlotText = slotText.trim();

    // Initialize with defaults
    let dayName = "";
    let datePart = "";
    let timePart = "";
    let timeRange = "";

    // Check if the format is like "Oct 11: ☀️ Morning (9am - 12pm PST)"
    if (cleanSlotText.includes(":")) {
      [datePart, timePart] = cleanSlotText
        .split(":")
        .map((part) => part?.trim());

      // Extract the time range from parentheses if available
      const timeMatch = timePart ? timePart.match(/\((.*?)\)/) : null;
      timeRange = timeMatch ? timeMatch[1] : "";

      // If datePart contains month and day (e.g., "Oct 11")
      if (/[A-Za-z]+\s+\d+/.test(datePart)) {
        // Try to extract the day of week from this date
        const dateObj = new Date();
        const monthName = datePart.split(" ")[0];
        const day = parseInt(datePart.split(" ")[1], 10);

        // Set the month
        const months = {
          Jan: 0,
          Feb: 1,
          Mar: 2,
          Apr: 3,
          May: 4,
          Jun: 5,
          Jul: 6,
          Aug: 7,
          Sep: 8,
          Oct: 9,
          Nov: 10,
          Dec: 11,
        };

        dateObj.setMonth(months[monthName] || 0);
        dateObj.setDate(day);

        // Get the day of week
        const days = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        dayName = days[dateObj.getDay()];
      }
    } else {
      // Format is likely just a day name like "Friday" or "Saturday"
      datePart = cleanSlotText;
      dayName = cleanSlotText;
    }

    // If we still don't have a dayName but have a datePart, try to extract dayName
    if (!dayName && datePart) {
      const dayNames = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      if (dayNames.includes(datePart)) {
        dayName = datePart;
      } else {
        dayName = datePart.split(" ")[0];
      }
    }

    return {
      id: `slot-${Math.random().toString(36).substr(2, 9)}`,
      displayText: cleanSlotText,
      date: datePart || "",
      dayName: dayName || "",
      time: timeRange || "",
      timePeriod: timePart || "",
      isCurrent: false,
    };
  });

  // Filter out any potentially empty slots
  const validSlots = slots.filter((slot) => slot.displayText && slot.date);

  // Sort slots similar to MentorAvailability.js
  const sortedSlots = validSlots.sort((a, b) => {
    const dayOrder = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const datePatternA = a.date.match(/([A-Za-z]+)\s+(\d+)/);
    const datePatternB = b.date.match(/([A-Za-z]+)\s+(\d+)/);

    if (datePatternA && datePatternB) {
      const monthOrder = {
        Jan: 1,
        Feb: 2,
        Mar: 3,
        Apr: 4,
        May: 5,
        Jun: 6,
        Jul: 7,
        Aug: 8,
        Sep: 9,
        Oct: 10,
        Nov: 11,
        Dec: 12,
      };

      const monthOrderA = monthOrder[datePatternA[1]] || 0;
      const monthOrderB = monthOrder[datePatternB[1]] || 0;

      if (monthOrderA !== monthOrderB) {
        return monthOrderA - monthOrderB;
      }

      const dayA = parseInt(datePatternA[2], 10);
      const dayB = parseInt(datePatternB[2], 10);

      if (dayA !== dayB) {
        return dayA - dayB;
      }
    } else {
      const dayOrderA = dayOrder[a.dayName] || 99;
      const dayOrderB = dayOrder[b.dayName] || 99;

      if (dayOrderA !== dayOrderB) {
        return dayOrderA - dayOrderB;
      }
    }

    const timeOrderMap = {
      "Early Morning": 1,
      Morning: 2,
      Afternoon: 3,
      Evening: 4,
      Night: 5,
      "Late Night": 6,
    };

    const timeA = a.timePeriod.match(
      /(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/,
    );
    const timeB = b.timePeriod.match(
      /(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/,
    );

    const timePeriodA = timeA ? timeA[1] : "";
    const timePeriodB = timeB ? timeB[1] : "";

    const timeOrderA = timeOrderMap[timePeriodA] || 99;
    const timeOrderB = timeOrderMap[timePeriodB] || 99;

    return timeOrderA - timeOrderB;
  });

  // Filter out general day entries (like "Friday") if we have more specific entries for the same day
  const filteredSlots = (() => {
    const slotsByDay = {};
    sortedSlots.forEach((slot) => {
      if (!slotsByDay[slot.dayName]) {
        slotsByDay[slot.dayName] = [];
      }
      slotsByDay[slot.dayName].push(slot);
    });

    const result = [];
    Object.entries(slotsByDay).forEach(([dayName, daySlots]) => {
      const hasSpecificTimeSlots = daySlots.some(
        (slot) => slot.time && slot.time.trim() !== "",
      );

      if (hasSpecificTimeSlots) {
        daySlots.forEach((slot) => {
          if (slot.time && slot.time.trim() !== "") {
            result.push(slot);
          }
        });
      } else {
        result.push(daySlots[0]);
      }
    });

    return result.sort((a, b) => {
      const dayOrder = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };

      const dayOrderA = dayOrder[a.dayName] || 99;
      const dayOrderB = dayOrder[b.dayName] || 99;

      if (dayOrderA !== dayOrderB) {
        return dayOrderA - dayOrderB;
      }

      if (a.time && !b.time) return -1;
      if (!a.time && b.time) return 1;

      if (a.time && b.time) {
        const timeOrderMap = {
          "Early Morning": 1,
          Morning: 2,
          Afternoon: 3,
          Evening: 4,
          Night: 5,
          "Late Night": 6,
        };

        const timeA = a.timePeriod.match(
          /(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/,
        );
        const timeB = b.timePeriod.match(
          /(?:🌅|☀️|🏙️|🌆|🌃|🌙)\s*(Early Morning|Morning|Afternoon|Evening|Night|Late Night)/,
        );

        const timePeriodA = timeA ? timeA[1] : "";
        const timePeriodB = timeB ? timeB[1] : "";

        const timeOrderA = timeOrderMap[timePeriodA] || 99;
        const timeOrderB = timeOrderMap[timePeriodB] || 99;

        return timeOrderA - timeOrderB;
      }

      return 0;
    });
  })();

  return filteredSlots;
}

// Helper function to check if a time slot is current
export const isCurrentTimeSlot = (slot, now = new Date()) => {
  if (!slot || !slot.time) return false;

  // The mentor form writes "Saturday Oct 11"; older strings were "Oct 11".
  // (Fix, Nov 2026: splitting on the first space read "Saturday" as the
  // month, so no slot was ever "current" and check-ins always sent
  // "Custom time slot".)
  const dateMatch = slot.date.match(/([A-Za-z]{3})[A-Za-z]*\s+(\d+)/);
  if (!dateMatch) return false;
  const month = dateMatch[1];
  const day = parseInt(dateMatch[2], 10);

  // Parse the time range directly from the time property
  const timeRange = slot.time;
  const [startTimeStr, endTimeStr] = timeRange.split(" - ");
  if (!endTimeStr) return false;

  // Remove timezone from end time if present
  const cleanEndTimeStr = endTimeStr.replace(/\s+[A-Z]+$/, "");

  // Convert time strings to Date objects
  const startTime = parseTimeString(startTimeStr, month, day);
  const endTime = parseTimeString(cleanEndTimeStr, month, day);

  if (!startTime || !endTime) return false;

  return now >= startTime && now <= endTime;
};

// Helper function to parse time strings
const parseTimeString = (timeStr, month, day) => {
  // Handle if timeStr is undefined, return nothing
  if (!timeStr) return null;

  const [hours, minutes] = timeStr.split(":").map((num) => parseInt(num));
  const isPM = timeStr.includes("pm");

  const date = new Date();
  date.setMonth(getMonthNumber(month));
  date.setDate(day);
  date.setHours(isPM && hours !== 12 ? hours + 12 : hours);
  date.setMinutes(minutes || 0);
  date.setSeconds(0);

  return date;
};

// Convert month name to month number (0-based)
const getMonthNumber = (monthName) => {
  const months = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  return months[monthName] || 0;
};

// Helper function to compare Month/Day only
const compareDatesDayMonthOnly = (date1, date2) => {
  const month1 = date1.getMonth();
  const day1 = date1.getDate();
  const month2 = date2.getMonth();
  const day2 = date2.getDate();

  if (month1 === month2 && day1 === day2) {
    return 0;
  } else if (month1 < month2 || (month1 === month2 && day1 < day2)) {
    return -1;
  } else {
    return 1;
  }
};

// Compare month and day of Date to current time
export const isDateInThePast = (date1) => {
  const currDate = new Date();
  return compareDatesDayMonthOnly(date1, currDate) >= 0;
};

/** The slot happening right now, or null. */
export function findCurrentSlot(slots, now = new Date()) {
  return (slots || []).find((slot) => isCurrentTimeSlot(slot, now)) || null;
}
