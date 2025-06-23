/* ************************************************* */
// *Important:* We never store email addresses here
// Since this API is public, we instead store the user's Slack ID


/* ************************************************* */

const judgeHeaderMapping = {
  "Your Name": "name",
  "Your title": "title",
  "Timestamp": "timestamp",
  "Have you helped us before?": "hasHelpedBefore",
  "Your pronouns (Optional)": "pronouns",
  "LinkedIn Profile (Optional)": "linkedinProfile",
  "A (short) biography - aim for 200 words": "shortBiography",
  "A photo of you we can use on the DevPost site": "photoUrl",
  "Why do you want to be a judge for Opportunity Hack?": "whyJudge",
  Availability: "availability",
  "Are you joining us in-person at ASU in Tempe, Arizona?": "isInPerson",
  "(Optional) Anything else to share?": "additionalInfo",
  "Company Name": "companyName",
  "Do you agree to our code of conduct?": "agreedToCodeOfConduct",
  "Which areas best describe your background?": "background",
};

// Function to transform headers and data
const transformJudgeData = (rawData) => {
  const transformedData = {};

  Object.entries(judgeHeaderMapping).forEach(
    ([googleHeader, firebaseHeader]) => {
      if (rawData.hasOwnProperty(googleHeader)) {
        let value = rawData[googleHeader];

        // Special transformations
        if (firebaseHeader === "isInPerson") {
          value = value.toLowerCase().includes("yes");
        } else if (firebaseHeader === "agreedToCodeOfConduct") {
          value = value.toLowerCase().includes("yes");
        }

        transformedData[firebaseHeader] = value;
      }
    }
  );

  // Add default values for missing fields
  transformedData.isSelected = false;  
  transformedData.linkedinProfile = "";

  return transformedData;
};

export { judgeHeaderMapping, transformJudgeData };
