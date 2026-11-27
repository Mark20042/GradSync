// Sample mock data for the landing page "Industry Trends" section.
// Used only as a fallback when the analytics API has no real hiring data yet.
export const MOCK_TRENDS_DATA = {
  Engineering: {
    skills: [
      { skill: "AutoCAD", count: 142 },
      { skill: "Project Management", count: 126 },
      { skill: "SolidWorks", count: 98 },
      { skill: "Structural Analysis", count: 84 },
      { skill: "MATLAB", count: 61 },
    ],
    roles: [
      { job: "Civil Engineer", count: 38 },
      { job: "Mechanical Engineer", count: 27 },
      { job: "Electrical Engineer", count: 21 },
    ],
  },
  Design: {
    skills: [
      { skill: "Figma", count: 168 },
      { skill: "UI/UX Design", count: 151 },
      { skill: "Adobe Photoshop", count: 132 },
      { skill: "Adobe Illustrator", count: 109 },
      { skill: "Prototyping", count: 77 },
    ],
    roles: [
      { job: "UI/UX Designer", count: 34 },
      { job: "Graphic Designer", count: 29 },
      { job: "Product Designer", count: 18 },
    ],
  },
  Marketing: {
    skills: [
      { skill: "SEO", count: 155 },
      { skill: "Social Media Management", count: 143 },
      { skill: "Google Analytics", count: 118 },
      { skill: "Content Marketing", count: 96 },
      { skill: "Meta Ads", count: 72 },
    ],
    roles: [
      { job: "Digital Marketing Specialist", count: 31 },
      { job: "Social Media Manager", count: 24 },
      { job: "Content Strategist", count: 19 },
    ],
  },
  Sales: {
    skills: [
      { skill: "CRM (Salesforce)", count: 147 },
      { skill: "Lead Generation", count: 129 },
      { skill: "Negotiation", count: 111 },
      { skill: "Account Management", count: 94 },
      { skill: "Cold Calling", count: 68 },
    ],
    roles: [
      { job: "Sales Executive", count: 36 },
      { job: "Account Manager", count: 25 },
      { job: "Business Development Officer", count: 20 },
    ],
  },
  "IT & Software": {
    skills: [
      { skill: "JavaScript", count: 214 },
      { skill: "React", count: 187 },
      { skill: "SQL", count: 163 },
      { skill: "Node.js", count: 141 },
      { skill: "Python", count: 122 },
    ],
    roles: [
      { job: "Full Stack Developer", count: 44 },
      { job: "Software Engineer", count: 37 },
      { job: "DevOps Engineer", count: 23 },
    ],
  },
  "Customer Service": {
    skills: [
      { skill: "Communication", count: 176 },
      { skill: "CRM Tools", count: 139 },
      { skill: "Problem Solving", count: 124 },
      { skill: "Ticketing Systems", count: 97 },
      { skill: "Conflict Resolution", count: 75 },
    ],
    roles: [
      { job: "Customer Support Specialist", count: 41 },
      { job: "Customer Success Associate", count: 26 },
      { job: "Call Center Agent", count: 22 },
    ],
  },
  Product: {
    skills: [
      { skill: "Product Roadmapping", count: 133 },
      { skill: "Agile/Scrum", count: 128 },
      { skill: "User Research", count: 112 },
      { skill: "A/B Testing", count: 88 },
      { skill: "Jira", count: 74 },
    ],
    roles: [
      { job: "Product Manager", count: 24 },
      { job: "Product Owner", count: 18 },
      { job: "Associate Product Manager", count: 13 },
    ],
  },
  Operations: {
    skills: [
      { skill: "Process Improvement", count: 138 },
      { skill: "Supply Chain Management", count: 121 },
      { skill: "Excel", count: 115 },
      { skill: "Inventory Management", count: 92 },
      { skill: "Six Sigma", count: 63 },
    ],
    roles: [
      { job: "Operations Manager", count: 27 },
      { job: "Operations Analyst", count: 21 },
      { job: "Logistics Coordinator", count: 17 },
    ],
  },
  Finance: {
    skills: [
      { skill: "Financial Analysis", count: 158 },
      { skill: "Excel", count: 146 },
      { skill: "Auditing", count: 112 },
      { skill: "Budgeting", count: 101 },
      { skill: "QuickBooks", count: 79 },
    ],
    roles: [
      { job: "Financial Analyst", count: 33 },
      { job: "Accountant", count: 28 },
      { job: "Audit Associate", count: 16 },
    ],
  },
  "Hospitality & Tourism": {
    skills: [
      { skill: "Customer Service", count: 149 },
      { skill: "Event Planning", count: 117 },
      { skill: "Communication", count: 104 },
      { skill: "Reservation Systems", count: 83 },
      { skill: "Food Safety", count: 66 },
    ],
    roles: [
      { job: "Front Desk Officer", count: 29 },
      { job: "Event Coordinator", count: 22 },
      { job: "Restaurant Supervisor", count: 15 },
    ],
  },
  "Education & Teaching": {
    skills: [
      { skill: "Lesson Planning", count: 164 },
      { skill: "Classroom Management", count: 152 },
      { skill: "Curriculum Development", count: 108 },
      { skill: "Educational Technology", count: 86 },
      { skill: "Assessment", count: 71 },
    ],
    roles: [
      { job: "Elementary Teacher", count: 32 },
      { job: "High School Teacher", count: 27 },
      { job: "ESL Instructor", count: 19 },
    ],
  },
  "Law Enforcement & Security": {
    skills: [
      { skill: "Criminal Investigation", count: 118 },
      { skill: "Report Writing", count: 106 },
      { skill: "Emergency Response", count: 98 },
      { skill: "Surveillance", count: 81 },
      { skill: "Risk Assessment", count: 64 },
    ],
    roles: [
      { job: "Security Officer", count: 26 },
      { job: "Police Officer", count: 19 },
      { job: "Loss Prevention Specialist", count: 12 },
    ],
  },
  "Healthcare & Medical": {
    skills: [
      { skill: "Patient Care", count: 189 },
      { skill: "Medical Terminology", count: 143 },
      { skill: "Electronic Health Records", count: 127 },
      { skill: "Vital Signs Monitoring", count: 105 },
      { skill: "Clinical Documentation", count: 88 },
    ],
    roles: [
      { job: "Staff Nurse", count: 39 },
      { job: "Medical Technologist", count: 23 },
      { job: "Healthcare Assistant", count: 17 },
    ],
  },
  "Psychology & Human Services": {
    skills: [
      { skill: "Active Listening", count: 141 },
      { skill: "Case Management", count: 119 },
      { skill: "Counseling", count: 103 },
      { skill: "Psychological Assessment", count: 87 },
      { skill: "Crisis Intervention", count: 69 },
    ],
    roles: [
      { job: "Guidance Counselor", count: 21 },
      { job: "HR Associate", count: 18 },
      { job: "Case Worker", count: 13 },
    ],
  },
  Other: {
    skills: [
      { skill: "Communication", count: 182 },
      { skill: "Microsoft Office", count: 157 },
      { skill: "Time Management", count: 134 },
      { skill: "Teamwork", count: 118 },
      { skill: "Adaptability", count: 93 },
    ],
    roles: [
      { job: "Administrative Assistant", count: 35 },
      { job: "Data Entry Specialist", count: 24 },
      { job: "Executive Assistant", count: 18 },
    ],
  },
};
