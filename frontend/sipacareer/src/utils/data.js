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
} from "lucide-react";

export const jobSeekerFeatures = [
  {
    icon: Search,
    title: "Smart Job Matching",
    description:
      "Get personalized job suggestions based on your skills and degree program.",
  },
  {
    icon: FileText,
    title: "Built-in Resume Maker",
    description:
      "Quickly generate professional resumes with customizable templates.",
  },
  {
    icon: MessageCircle,
    title: "Secure Chat",
    description:
      "Talk directly with recruiters for interviews and job updates.",
  },
  {
    icon: Award,
    title: "Skills & Achievements",
    description:
      "Showcase verified skills, projects, and awards to stand out to employers.",
  },
];

export const employerFeatures = [
  {
    icon: Users,
    title: "Graduate Profiles",
    description:
      "Access auto-generated, updated graduate profiles organized by degree program.",
  },
  {
    icon: BarChart3,
    title: "Recruitment Insights",
    description:
      "View analytics on job postings, candidate engagement, and hiring results.",
  },
  {
    icon: Shield,
    title: "Data Privacy",
    description:
      "All profiles and communications are protected with secure access.",
  },
  {
    icon: Clock,
    title: "Faster Hiring",
    description:
      "Save time with skill-based candidate search and instant matching.",
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
  "Bachelor of Science in Information Technology":
    "Bachelor of Science in Information Technology",
  "Bachelor of Elementary Education": "Bachelor of Elementary Education",
  "Bachelor of Secondary Education": "Bachelor of Secondary Education",
  "Bachelor of Secondary Education Major in Mathematics":
    "Bachelor of Secondary Education Major in Mathematics",
  "Bachelor of Secondary Education Major in English":
    "Bachelor of Secondary Education Major in English",
  "Bachelor of Secondary Education Major in Science":
    "Bachelor of Secondary Education Major in Science",
  "Bachelor of Secondary Education Major in Social Studies":
    "Bachelor of Secondary Education Major in Social Studies",
  "Bachelor of Science in Business Administration Major in Financial Management":
    "Bachelor of Science in Business Administration Major in Financial Management",
  "Bachelor of Science in Hospitality Management":
    "Bachelor of Science in Hospitality Management",
  "Bachelor of Science in Accountancy": "Bachelor of Science in Accountancy",
  "Bachelor of Science in Criminology": "Bachelor of Science in Criminology",
  "Bachelor of Science in Psychology": "Bachelor of Science in Psychology",
  "Bachelor of Science in Tourism Management":
    "Bachelor of Science in Tourism Management",
};
