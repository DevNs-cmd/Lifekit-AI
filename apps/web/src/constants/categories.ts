import type { Category } from "@/types/common";

export interface CategoryConfig {
  value: Category;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
}

export const CATEGORIES: CategoryConfig[] = [
  {
    value: "career",
    label: "Career",
    icon: "Briefcase",
    color: "text-blue-600",
    bgColor: "bg-blue-50 dark:bg-blue-950",
    description: "Career growth, job search, professional development",
  },
  {
    value: "finance",
    label: "Finance",
    icon: "TrendingUp",
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    description: "Financial planning, savings, investments",
  },
  {
    value: "health",
    label: "Health",
    icon: "Heart",
    color: "text-red-600",
    bgColor: "bg-red-50 dark:bg-red-950",
    description: "Fitness, wellness, mental health",
  },
  {
    value: "travel",
    label: "Travel",
    icon: "Globe",
    color: "text-cyan-600",
    bgColor: "bg-cyan-50 dark:bg-cyan-950",
    description: "Travel planning, experiences, adventures",
  },
  {
    value: "business",
    label: "Business",
    icon: "Building2",
    color: "text-orange-600",
    bgColor: "bg-orange-50 dark:bg-orange-950",
    description: "Entrepreneurship, startups, business operations",
  },
  {
    value: "education",
    label: "Education",
    icon: "GraduationCap",
    color: "text-violet-600",
    bgColor: "bg-violet-50 dark:bg-violet-950",
    description: "Learning, certifications, academic goals",
  },
  {
    value: "productivity",
    label: "Productivity",
    icon: "Zap",
    color: "text-yellow-600",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
    description: "Time management, systems, efficiency",
  },
  {
    value: "personal-development",
    label: "Personal Growth",
    icon: "Sparkles",
    color: "text-purple-600",
    bgColor: "bg-purple-50 dark:bg-purple-950",
    description: "Habits, mindset, personal improvement",
  },
  {
    value: "lifestyle",
    label: "Lifestyle",
    icon: "Smile",
    color: "text-pink-600",
    bgColor: "bg-pink-50 dark:bg-pink-950",
    description: "Life quality, hobbies, social connections",
  },
  {
    value: "family",
    label: "Family",
    icon: "Users",
    color: "text-teal-600",
    bgColor: "bg-teal-50 dark:bg-teal-950",
    description: "Family planning, home, shared goals",
  },
];

export const getCategoryConfig = (value: Category): CategoryConfig => {
  return (
    CATEGORIES.find((c) => c.value === value) ?? {
      value,
      label: value,
      icon: "Circle",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
      description: "",
    }
  );
};
