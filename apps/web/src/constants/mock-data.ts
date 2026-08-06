// ============================================================
// LifeKit Mock Data – used until APIs are connected
// ============================================================
import type { Mission } from "@/types/mission";
import type { Task } from "@/types/task";
import type { AiRecommendation } from "@/types/ai";
import type { Opportunity } from "@/types/opportunity";
import type { Memory } from "@/types/memory";
import type { Notification } from "@/types/notification";
import type { MarketplaceListing } from "@/types/marketplace";
import type { User } from "@/types/user";
import type { UserAnalytics } from "@/types/analytics";

export const MOCK_USER: User = {
  id: "user-1",
  fullName: "Arjun Sharma",
  email: "arjun@example.com",
  phone: "+91 98765 43210",
  avatarUrl: undefined,
  userType: "professional",
  location: "Bengaluru, India",
  bio: "Software engineer passionate about AI and building meaningful products.",
  focusAreas: ["career", "finance", "health"],
  skills: [
    { name: "JavaScript", level: "advanced" },
    { name: "React", level: "advanced" },
    { name: "Python", level: "intermediate" },
  ],
  interests: ["Technology", "Startups", "Fitness", "Reading"],
  careerInfo: {
    currentRole: "Software Engineer",
    company: "TechCorp",
    industry: "Technology",
    yearsOfExperience: 3,
    education: "B.Tech Computer Science",
  },
  preferences: {
    learningStyle: "hands-on",
    weeklyAvailableHours: 15,
    budgetRange: { min: 0, max: 10000, currency: "INR" },
    notificationPreference: "important",
    theme: "light",
    language: "en",
    timezone: "Asia/Kolkata",
    dateFormat: "DD/MM/YYYY",
    aiResponseStyle: "balanced",
    recommendationFrequency: "weekly",
    planningDepth: "standard",
    memoryEnabled: true,
  },
  personalGoals: ["Become an AI engineer", "Save ₹5 Lakh", "Run a half marathon"],
  isEmailVerified: true,
  isTwoFactorEnabled: false,
  createdAt: "2024-01-15T10:00:00Z",
  updatedAt: "2025-07-20T08:00:00Z",
  role: "user",
  subscriptionPlan: "plus",
  onboardingCompleted: true,
};

export const MOCK_MISSIONS: Mission[] = [];
export const MOCK_TASKS: Task[] = [];
export const MOCK_RECOMMENDATIONS: AiRecommendation[] = [];
export const MOCK_OPPORTUNITIES: Opportunity[] = [];
export const MOCK_MEMORIES: Memory[] = [];
export const MOCK_NOTIFICATIONS: Notification[] = [];
export const MOCK_MARKETPLACE_LISTINGS: MarketplaceListing[] = [];

export const MOCK_ANALYTICS: UserAnalytics = {
  missionCompletionRate: 33,
  taskCompletionRate: 68,
  activeMissions: 3,
  completedMissions: 1,
  completedMilestones: 4,
  totalTasksCompleted: 47,
  weeklyProductivity: [
    { day: "Mon", tasksCompleted: 3, minutesWorked: 90 },
    { day: "Tue", tasksCompleted: 2, minutesWorked: 60 },
    { day: "Wed", tasksCompleted: 4, minutesWorked: 120 },
    { day: "Thu", tasksCompleted: 1, minutesWorked: 30 },
    { day: "Fri", tasksCompleted: 3, minutesWorked: 90 },
    { day: "Sat", tasksCompleted: 5, minutesWorked: 150 },
    { day: "Sun", tasksCompleted: 2, minutesWorked: 60 },
  ],
  progressOverTime: [
    { date: "2025-06-01", planned: 10, actual: 8 },
    { date: "2025-06-15", planned: 25, actual: 20 },
    { date: "2025-07-01", planned: 40, actual: 35 },
    { date: "2025-07-15", planned: 55, actual: 42 },
    { date: "2025-07-27", planned: 65, actual: 50 },
  ],
  categoryProgress: [
    { category: "career", completedMissions: 0, activeMissions: 1, completionRate: 42 },
    { category: "finance", completedMissions: 0, activeMissions: 1, completionRate: 28 },
    { category: "health", completedMissions: 1, activeMissions: 1, completionRate: 35 },
  ],
  taskStatusDistribution: {
    notStarted: 12,
    inProgress: 5,
    blocked: 2,
    completed: 47,
    skipped: 3,
  },
  milestoneTimeline: [
    {
      milestoneTitle: "Learn Python, DSA and GitHub",
      missionTitle: "Become a Software Engineer",
      plannedDate: "2025-08-31",
      actualDate: "2025-08-28",
      status: "completed",
    },
  ],
  currentStreak: 5,
  longestStreak: 12,
  averageDelayDays: 1.8,
  recommendedFocusAreas: ["Complete ML milestone", "Review financial savings plan"],
};
