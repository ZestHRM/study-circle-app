import type { EducationLevel } from "@/lib/api";

export interface EducationLevelItem {
  id: EducationLevel;
  label: string;
  sublabel: string;
  iconName: "book-open" | "award" | "users" | "zap";
}

export const EDUCATION_LEVEL_ITEMS: EducationLevelItem[] = [
  {
    id: "School",
    label: "School",
    sublabel: "Class 1st to 12th",
    iconName: "book-open",
  },
  {
    id: "College",
    label: "College",
    sublabel: "Degree & Uni",
    iconName: "award",
  },
  {
    id: "Coaching",
    label: "Coaching",
    sublabel: "Institute / Academy",
    iconName: "users",
  },
  {
    id: "CompetitiveExams",
    label: "Competitive",
    sublabel: "UPSC, JEE, NEET, etc.",
    iconName: "zap",
  },
];

export const PREPARATION_SUGGESTIONS: Record<EducationLevel, string[]> = {
  School: [
    "10th CBSE",
    "12th Board",
    "9th Class",
    "11th Science",
    "State Board",
  ],
  College: [
    "B.Tech / B.E.",
    "B.Sc / M.Sc",
    "B.Com / BBA",
    "MBA / MCA",
    "Medicine / MBBS",
  ],
  Coaching: ["JEE Mains / Adv", "NEET UG", "CA Foundation", "CUET", "CLAT"],
  CompetitiveExams: [
    "UPSC Civil Services",
    "SSC CGL / CHSL",
    "Banking / IBPS",
    "GATE / ESE",
    "State PCS",
  ],
};

export interface StepPromptInfo {
  title: string;
  prompt: string;
}

export function getStepPrompt(
  step: 1 | 2 | 3 | 4 | 5,
  selectedLevel: EducationLevel = "School",
  userEmail?: string
): StepPromptInfo {
  switch (step) {
    case 1:
      return {
        title: "Step 1 of 5 • Education Level",
        prompt:
          "Hi there! 👋 I'm your AI Study Companion. Let me customize your space! First, what is your education level?",
      };
    case 2:
      return {
        title: "Step 2 of 5 • Target Goal",
        prompt: `Awesome! What class, degree, or competitive exam are you currently preparing for as a ${selectedLevel} student?`,
      };
    case 3:
      return {
        title: "Step 3 of 5 • Personal Profile",
        prompt:
          "Great! How should I address you, and where can I send your study updates and progress reports?",
      };
    case 4:
      return {
        title: "Step 4 of 5 • Account Password",
        prompt:
          "Almost done! Choose a secure password to protect your personal AI study workspace.",
      };
    case 5:
      return {
        title: "Step 5 of 5 • Confirm Verification OTP",
        prompt: `I've sent a 6-digit verification code to ${
          userEmail || "your email"
        }. Enter it below to unlock your dashboard!`,
      };
  }
}
