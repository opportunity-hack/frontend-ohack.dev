// Shared email/Slack-lookup parsing utilities used by the admin Email tab
// (EmailCommunication) and the broadcast source picker.

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const parseEmailsFromText = (text) => {
  if (!text) return [];

  // Split by common delimiters: comma, semicolon, space, newline
  const emails = text
    .split(/[,;\s\n]+/)
    .map((email) => email.trim())
    .filter((email) => email.length > 0)
    .filter(validateEmail);

  return [...new Set(emails)]; // Remove duplicates
};

export const normalizeSlackLookupToken = (value) => {
  if (!value) return "";

  let normalized = value.trim().replace(/^['"]+|['"]+$/g, "");
  if (!normalized) return "";

  const slackMentionMatch = normalized.match(/^<@([A-Z0-9]+)>$/i);
  if (slackMentionMatch) {
    return slackMentionMatch[1].toLowerCase();
  }

  const embeddedEmailMatch = normalized.match(/<?([^\s<>]+@[^\s<>]+)>?/);
  if (embeddedEmailMatch) {
    return embeddedEmailMatch[1].toLowerCase();
  }

  normalized = normalized.replace(/^@/, "");
  return normalized.toLowerCase();
};

export const parseSlackLookupInput = (text) => {
  if (!text) return [];

  return [
    ...new Set(
      text
        .split(/[\n,;]+/)
        .map((token) => token.trim())
        .filter(Boolean),
    ),
  ];
};

export const parseCsvFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split("\n");
        const emails = [];

        lines.forEach((line) => {
          // Split by comma and extract potential emails
          const fields = line
            .split(",")
            .map((field) => field.trim().replace(/["']/g, ""));
          fields.forEach((field) => {
            if (validateEmail(field)) {
              emails.push(field);
            }
          });
        });

        resolve([...new Set(emails)]); // Remove duplicates
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsText(file);
  });
};
