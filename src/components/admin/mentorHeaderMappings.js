/* ************************************************* */
// *Important:* We never store email addresses here
// Since this API is public, we instead store the user's Slack ID

/* ************************************************* */


const mentorHeaderMapping = {
  Timestamp: "timestamp",
  "Your Name": "name",
  "Your pronouns (Optional)": "pronouns",
  "What company are you working for?": "company",
  "Short bio (Optional)": "shortBio",
  "Can you send us a picture of you? (Optional)": "photoUrl",
  "LinkedIn Profile (Optional)": "linkedinProfile",
  "Joining us in-person at ASU Tempe?": "isInPerson",
  "What kind of brain power can you help supply us with?": "expertise",
  "How many times have you participated in Opportunity Hack?":
    "participationCount",
  "Software Engineering Specifics": "softwareEngineeringSpecifics",
  "Which days will be you available?": "availability",
  "Which country are you in?": "country",
  "Which state are you in?": "state",
  "Do you agree to our code of conduct?": "agreedToCodeOfConduct",
  "Shirt Size?": "shirtSize",
};

// Function to transform headers and data
const transformMentorData = (rawData) => {
  const transformedData = {};

  Object.entries(mentorHeaderMapping).forEach(
    ([googleHeader, firebaseHeader]) => {
      if (rawData.hasOwnProperty(googleHeader)) {
        let value = rawData[googleHeader];

        // Special transformations
        if (firebaseHeader === "isInPerson") {
          value = value.toLowerCase().includes("yes");
        } else if (firebaseHeader === "agreedToCodeOfConduct") {
          value =
            value.toLowerCase().includes("yes") ||
            value.toLowerCase().includes("agree");
        }

        transformedData[firebaseHeader] = value;
      }
    }
  );

  // Add default values for missing fields
  transformedData.isSelected = false;

  return transformedData;
};

export { mentorHeaderMapping, transformMentorData };
