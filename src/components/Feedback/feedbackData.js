const roles = [
  "Software Engineer",
  "Data Scientist",
  "Product Manager",
  "UX Designer",
  "Project Manager",
  "Data Engineer",
  "Other",
];

const feedbackAreas = {
  "Software Engineer": [
    {
      name: "Code Quality",
      type: "slider",
      tooltip:
        "Consider readability, maintainability, and adherence to best practices. 0-20: Poor, 40-60: Average, 80-100: Exceptional",
    },
    {
      name: "Problem Solving",
      type: "slider",
      tooltip:
        "Evaluate ability to break down complex issues and devise effective solutions. 0-20: Struggles, 40-60: Competent, 80-100: Innovative",
    },
    {
      name: "Technical Knowledge",
      type: "slider",
      tooltip:
        "Assess depth and breadth of relevant technical skills. 0-20: Limited, 40-60: Solid, 80-100: Expert",
    },
    {
      name: "System Design",
      type: "slider",
      tooltip:
        "Judge ability to architect scalable and efficient systems. 0-20: Basic, 40-60: Proficient, 80-100: Masterful",
    },
    {
      name: "Debugging Skills",
      type: "slider",
      tooltip:
        "Evaluate efficiency in identifying and resolving issues. 0-20: Slow, 40-60: Methodical, 80-100: Rapid and Insightful",
    },
  ],
  "Data Scientist": [
    {
      name: "Statistical Analysis",
      type: "slider",
      tooltip:
        "Assess ability to apply statistical methods to data. 0-20: Basic, 40-60: Proficient, 80-100: Advanced",
    },
    {
      name: "Machine Learning",
      type: "slider",
      tooltip:
        "Evaluate skill in developing and applying ML models. 0-20: Novice, 40-60: Competent, 80-100: Expert",
    },
    {
      name: "Data Visualization",
      type: "slider",
      tooltip:
        "Judge ability to create clear, insightful visualizations. 0-20: Basic, 40-60: Effective, 80-100: Compelling",
    },
    {
      name: "Big Data Technologies",
      type: "slider",
      tooltip:
        "Assess proficiency with big data tools and platforms. 0-20: Limited, 40-60: Proficient, 80-100: Advanced",
    },
    {
      name: "Research Skills",
      type: "slider",
      tooltip:
        "Evaluate ability to formulate and test hypotheses. 0-20: Basic, 40-60: Thorough, 80-100: Innovative",
    },
    {
      name: "Domain Knowledge",
      type: "slider",
      tooltip:
        "Assess understanding of the business domain. 0-20: Limited, 40-60: Solid, 80-100: Expert",
    },
  ],
  "Product Manager": [
    {
      name: "User Empathy",
      type: "slider",
      tooltip:
        "Evaluate ability to understand and advocate for user needs. 0-20: Low, 40-60: Good, 80-100: Exceptional",
    },
    {
      name: "Strategic Thinking",
      type: "slider",
      tooltip:
        "Assess capability to align product with business goals. 0-20: Tactical, 40-60: Strategic, 80-100: Visionary",
    },
    {
      name: "Prioritization Skills",
      type: "slider",
      tooltip:
        "Judge ability to effectively prioritize features and tasks. 0-20: Unfocused, 40-60: Balanced, 80-100: Optimized",
    },
    {
      name: "Cross-functional Leadership",
      type: "slider",
      tooltip:
        "Evaluate effectiveness in leading diverse teams. 0-20: Struggles, 40-60: Competent, 80-100: Exceptional",
    },
    {
      name: "Data-driven Decision Making",
      type: "slider",
      tooltip:
        "Assess use of data in decision-making process. 0-20: Intuition-based, 40-60: Data-aware, 80-100: Data-driven",
    },
    {
      name: "Product Vision",
      type: "slider",
      tooltip:
        "Evaluate clarity and inspiring nature of product vision. 0-20: Unclear, 40-60: Defined, 80-100: Compelling",
    },
  ],
  "UX Designer": [
    {
      name: "User Research",
      type: "slider",
      tooltip:
        "Assess ability to gather and analyze user insights. 0-20: Basic, 40-60: Thorough, 80-100: Insightful",
    },
    {
      name: "Information Architecture",
      type: "slider",
      tooltip:
        "Evaluate skill in organizing and structuring information. 0-20: Confusing, 40-60: Clear, 80-100: Intuitive",
    },
    {
      name: "Interaction Design",
      type: "slider",
      tooltip:
        "Judge ability to create engaging user interactions. 0-20: Basic, 40-60: Effective, 80-100: Innovative",
    },
    {
      name: "Visual Design",
      type: "slider",
      tooltip:
        "Assess aesthetic quality and consistency of designs. 0-20: Amateur, 40-60: Professional, 80-100: Outstanding",
    },
    {
      name: "Prototyping",
      type: "slider",
      tooltip:
        "Evaluate ability to create effective prototypes. 0-20: Basic, 40-60: Functional, 80-100: High-fidelity",
    },
    {
      name: "Usability Testing",
      type: "slider",
      tooltip:
        "Assess skill in conducting and analyzing usability tests. 0-20: Limited, 40-60: Competent, 80-100: Expert",
    },
  ],
  // You can add more roles here as needed
};

const generalFeedbackAreas = [
  {
    name: "Communication",
    type: "slider",
    tooltip:
      "Assess clarity, frequency, and effectiveness of communication. 0-20: Poor, 40-60: Clear, 80-100: Exceptional",
  },
  {
    name: "Teamwork",
    type: "slider",
    tooltip:
      "Evaluate collaboration and contribution to team dynamics. 0-20: Disruptive, 40-60: Cooperative, 80-100: Synergistic",
  },
  {
    name: "Leadership",
    type: "slider",
    tooltip:
      "Consider ability to guide, motivate, and influence others. 0-20: Follower, 40-60: Supportive, 80-100: Inspirational",
  },
  {
    name: "Adaptability",
    type: "slider",
    tooltip:
      "Assess flexibility in face of changes or challenges. 0-20: Rigid, 40-60: Flexible, 80-100: Thrives on Change",
  },
  {
    name: "Overall Performance",
    type: "text",
    tooltip:
      "Provide a holistic view of their performance, citing specific examples if possible.",
  },
  {
    name: "Areas for Improvement",
    type: "text",
    tooltip:
      "Suggest specific, actionable areas for growth, framed constructively.",
  },
];

export { roles, feedbackAreas, generalFeedbackAreas };