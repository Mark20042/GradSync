import {
  Search,
  Users,
  FileText,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Award,
  Briefcase,
  Building2,
  LayoutDashboard,
  Plus,
  MessageCircle,
  Video,
  Zap,
  ClipboardList,
  Sparkles,
  Brain,
  Bot,
  TrendingUp,
  MapPin,
} from "lucide-react";

export const jobSeekerFeatures = [
  {
    icon: Sparkles,
    title: "AI Job Matching",
    description:
      "Get personalized, AI-driven job suggestions tailored to your specific skills and degree program.",
  },
  {
    icon: Brain,
    title: "AI Suitability Analysis",
    description:
      "Instantly check your match score for any job, complete with actionable insights and recommended skill improvements.",
  },
  {
    icon: FileText,
    title: "ATS-Friendly Resume Builder",
    description:
      "Generate clean, properly formatted resumes optimized to pass Applicant Tracking Systems.",
  },
  {
    icon: Video,
    title: "AI Mock Interviews",
    description:
      "Practice and perfect your interview skills with interactive AI-powered mock interviews.",
  },
  {
    icon: ClipboardList,
    title: "Skill Assessments",
    description:
      "Validate your expertise through targeted assessments based on your core skills.",
  },
  {
    icon: MessageCircle,
    title: "Secure Chat",
    description:
      "Talk directly with recruiters for interviews and job updates.",
  }
];

export const employerFeatures = [
  {
    icon: Brain,
    title: "AI Candidate Analysis",
    description:
      "Instantly analyze and evaluate applicant details to find the best fit for your job postings.",
  },
  {
    icon: Bot,
    title: "Auto-reply FAQs",
    description:
      "Automate initial candidate communication with smart auto-replies for frequently asked questions.",
  },
  {
    icon: Briefcase,
    title: "Job Management",
    description:
      "Easily post, edit, track applicants, and manage active or closed jobs all from one centralized dashboard.",
  },
  {
    icon: TrendingUp,
    title: "Employment Analytics",
    description:
      "Deep dive into advanced analytics covering your hiring funnel, retention, and recruitment health.",
  },
  {
    icon: Users,
    title: "Graduate Profiles",
    description:
      "Access auto-generated, updated graduate profiles organized by degree program.",
  },
  {
    icon: MapPin,
    title: "Company Mapping",
    description:
      "Showcase your brand and pinpoint your exact office location on an interactive map to attract local talent.",
  },
];
export const NAVIGATION_MENU = [
  {
    id: "employer-dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "post-job",
    name: "Post Job",
    icon: Plus,
  },
  {
    id: "manage-jobs",
    name: "Manage Jobs",
    icon: Briefcase,
  },
  {
    id: "employer-messages",
    name: "Messages",
    icon: MessageCircle,
  },

  {
    id: "company-profile",
    name: "Company Profile",
    icon: Building2,
  },
];

export const EMPLOYER_MENU = [
  {
    id: "employer-dashboard",
    name: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "employer-analytics",
    name: "Analytics",
    icon: BarChart3,
  },
  {
    id: "post-job",
    name: "Post Job",
    icon: Plus,
  },
  {
    id: "manage-jobs",
    name: "Manage Jobs",
    icon: Briefcase,
  },
  {
    id: "employer-messages",
    name: "Messages",
    icon: MessageCircle,
  },
  {
    id: "employer-auto-pilot",
    name: "Auto-Pilot",
    icon: Zap,
  },

  {
    id: "company-profile",
    name: "Company Profile",
    icon: Building2,
  },

];

export const JOB_SEEKER_MENU = [
  {
    id: "find-jobs",
    name: "Find Jobs",
    icon: Search,
  },
  {
    id: "my-applications",
    name: "My Applications",
    icon: Briefcase,
  },
  {
    id: "assessments",
    name: "Assessments",
    icon: Award,
  },
  {
    id: "resume-builder",
    name: "Resume Builder",
    icon: FileText,
  },
  {
    id: "messages",
    name: "Messages",
    icon: MessageCircle,
  },
  {
    id: "profile",
    name: "My Profile",
    icon: Users,
  },
];

export const CATEGORIES = [
  {
    value: "Engineering",
    label: "Engineering",
  },
  {
    value: "Design",
    label: "Design",
  },
  {
    value: "Marketing",
    label: "Marketing",
  },
  {
    value: "Sales",
    label: "Sales",
  },
  {
    value: "IT & Software",
    label: "IT & Software",
  },
  {
    value: "Customer Service",
    label: "Customer Service",
  },
  {
    value: "Product",
    label: "Product",
  },
  {
    value: "Operations",
    label: "Operations",
  },
  {
    value: "Finance",
    label: "Finance",
  },
  {
    value: "Hospitality & Tourism",
    label: "Hospitality & Tourism",
  },
  {
    value: "Education & Teaching",
    label: "Education & Teaching",
  },
  {
    value: "Law Enforcement & Security",
    label: "Law Enforcement & Security",
  },
  {
    value: "Healthcare & Medical",
    label: "Healthcare & Medical",
  },
  {
    value: "Psychology & Human Services",
    label: "Psychology & Human Services",
  },
  {
    value: "Other",
    label: "Other",
  },
];

export const JOB_TYPES = [
  { label: "Remote", value: "Remote" },
  { label: "Hybrid", value: "Hybrid" },
  { label: "Full-Time", value: "Full-Time" },
  { label: "Part-Time", value: "Part-Time" },
  { label: "Internship", value: "Internship" },
  { label: "Contract", value: "Contract" },
];

export const SALARY_RANGES = [
  "Less than ₱10,000",
  "₱10,000 - ₱20,000",
  "More than ₱20,000",
];

export const Degrees = {
  "Bachelor of Arts in Literature": "Bachelor of Arts in Literature",
  "Bachelor of Arts in Communication": "Bachelor of Arts in Communication",
  "Bachelor of Arts in Economics": "Bachelor of Arts in Economics",
  "Bachelor of Arts in English Language Studies": "Bachelor of Arts in English Language Studies",
  "Bachelor of Arts in History": "Bachelor of Arts in History",
  "Bachelor of Arts in Journalism": "Bachelor of Arts in Journalism",
  "Bachelor of Arts in Multimedia Arts": "Bachelor of Arts in Multimedia Arts",
  "Bachelor of Arts in Philosophy": "Bachelor of Arts in Philosophy",
  "Bachelor of Arts in Political Science": "Bachelor of Arts in Political Science",
  "Bachelor of Arts in Psychology": "Bachelor of Arts in Psychology",
  "Bachelor of Arts in Sociology": "Bachelor of Arts in Sociology",
  "Bachelor of Early Childhood Education": "Bachelor of Early Childhood Education",
  "Bachelor of Elementary Education": "Bachelor of Elementary Education",
  "Bachelor of Fine Arts": "Bachelor of Fine Arts",
  "Bachelor of Physical Education": "Bachelor of Physical Education",
  "Bachelor of Public Administration": "Bachelor of Public Administration",
  "Bachelor of Secondary Education": "Bachelor of Secondary Education",
  "Bachelor of Secondary Education Major in English": "Bachelor of Secondary Education Major in English",
  "Bachelor of Secondary Education Major in Filipino": "Bachelor of Secondary Education Major in Filipino",
  "Bachelor of Secondary Education Major in Mathematics": "Bachelor of Secondary Education Major in Mathematics",
  "Bachelor of Secondary Education Major in Science": "Bachelor of Secondary Education Major in Science",
  "Bachelor of Secondary Education Major in Social Studies": "Bachelor of Secondary Education Major in Social Studies",
  "Bachelor of Special Needs Education": "Bachelor of Special Needs Education",
  "Bachelor of Technical-Vocational Teacher Education": "Bachelor of Technical-Vocational Teacher Education",
  "Bachelor of Science in Accountancy": "Bachelor of Science in Accountancy",
  "Bachelor of Science in Accounting Information System": "Bachelor of Science in Accounting Information System",
  "Bachelor of Science in Aeronautical Engineering": "Bachelor of Science in Aeronautical Engineering",
  "Bachelor of Science in Agriculture": "Bachelor of Science in Agriculture",
  "Bachelor of Science in Architecture": "Bachelor of Science in Architecture",
  "Bachelor of Science in Biology": "Bachelor of Science in Biology",
  "Bachelor of Science in Business Administration": "Bachelor of Science in Business Administration",
  "Bachelor of Science in Business Administration Major in Financial Management": "Bachelor of Science in Business Administration Major in Financial Management",
  "Bachelor of Science in Business Administration Major in Human Resource Management": "Bachelor of Science in Business Administration Major in Human Resource Management",
  "Bachelor of Science in Business Administration Major in Marketing Management": "Bachelor of Science in Business Administration Major in Marketing Management",
  "Bachelor of Science in Chemical Engineering": "Bachelor of Science in Chemical Engineering",
  "Bachelor of Science in Chemistry": "Bachelor of Science in Chemistry",
  "Bachelor of Science in Civil Engineering": "Bachelor of Science in Civil Engineering",
  "Bachelor of Science in Computer Engineering": "Bachelor of Science in Computer Engineering",
  "Bachelor of Science in Computer Science": "Bachelor of Science in Computer Science",
  "Bachelor of Science in Criminology": "Bachelor of Science in Criminology",
  "Bachelor of Science in Customs Administration": "Bachelor of Science in Customs Administration",
  "Bachelor of Science in Data Science": "Bachelor of Science in Data Science",
  "Bachelor of Science in Electrical Engineering": "Bachelor of Science in Electrical Engineering",
  "Bachelor of Science in Electronics Engineering": "Bachelor of Science in Electronics Engineering",
  "Bachelor of Science in Entertainment and Multimedia Computing": "Bachelor of Science in Entertainment and Multimedia Computing",
  "Bachelor of Science in Entrepreneurship": "Bachelor of Science in Entrepreneurship",
  "Bachelor of Science in Environmental Science": "Bachelor of Science in Environmental Science",
  "Bachelor of Science in Forestry": "Bachelor of Science in Forestry",
  "Bachelor of Science in Geodetic Engineering": "Bachelor of Science in Geodetic Engineering",
  "Bachelor of Science in Hospitality Management": "Bachelor of Science in Hospitality Management",
  "Bachelor of Science in Industrial Engineering": "Bachelor of Science in Industrial Engineering",
  "Bachelor of Science in Information Systems": "Bachelor of Science in Information Systems",
  "Bachelor of Science in Information Technology": "Bachelor of Science in Information Technology",
  "Bachelor of Science in Interior Design": "Bachelor of Science in Interior Design",
  "Bachelor of Science in Management Accounting": "Bachelor of Science in Management Accounting",
  "Bachelor of Science in Marine Engineering": "Bachelor of Science in Marine Engineering",
  "Bachelor of Science in Marine Transportation": "Bachelor of Science in Marine Transportation",
  "Bachelor of Science in Mathematics": "Bachelor of Science in Mathematics",
  "Bachelor of Science in Mechanical Engineering": "Bachelor of Science in Mechanical Engineering",
  "Bachelor of Science in Medical Technology": "Bachelor of Science in Medical Technology",
  "Bachelor of Science in Midwifery": "Bachelor of Science in Midwifery",
  "Bachelor of Science in Naval Architecture and Marine Engineering": "Bachelor of Science in Naval Architecture and Marine Engineering",
  "Bachelor of Science in Nursing": "Bachelor of Science in Nursing",
  "Bachelor of Science in Nutrition and Dietetics": "Bachelor of Science in Nutrition and Dietetics",
  "Bachelor of Science in Occupational Therapy": "Bachelor of Science in Occupational Therapy",
  "Bachelor of Science in Office Administration": "Bachelor of Science in Office Administration",
  "Bachelor of Science in Pharmacy": "Bachelor of Science in Pharmacy",
  "Bachelor of Science in Physical Therapy": "Bachelor of Science in Physical Therapy",
  "Bachelor of Science in Psychology": "Bachelor of Science in Psychology",
  "Bachelor of Science in Radiologic Technology": "Bachelor of Science in Radiologic Technology",
  "Bachelor of Science in Real Estate Management": "Bachelor of Science in Real Estate Management",
  "Bachelor of Science in Respiratory Therapy": "Bachelor of Science in Respiratory Therapy",
  "Bachelor of Science in Social Work": "Bachelor of Science in Social Work",
  "Bachelor of Science in Tourism Management": "Bachelor of Science in Tourism Management",
};