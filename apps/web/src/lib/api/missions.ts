// ============================================================
// Mission API – mock implementations until backend is ready
// ============================================================
import { sleep } from "@/lib/utils";
import {
  MOCK_MISSIONS,
} from "@/constants/mock-data";
import type {
  Mission,
  MissionSummary,
  CreateMissionInput,
  GeneratedMissionPlan,
  MissionActivity,
} from "@/types/mission";

export async function getMissions(): Promise<Mission[]> {
  await sleep(400);
  return MOCK_MISSIONS;
}

export async function getMission(id: string): Promise<Mission> {
  await sleep(300);
  const m = MOCK_MISSIONS.find((x) => x.id === id);
  if (!m) throw new Error(`Mission ${id} not found`);
  return m;
}

export async function getMissionSummaries(): Promise<MissionSummary[]> {
  const missions = await getMissions();
  return missions.map((m) => ({
    id: m.id,
    title: m.title,
    goal: m.goal,
    category: m.category,
    status: m.status,
    progress: m.progress,
    targetDate: m.targetDate,
    currentMilestone: m.milestones.find((ms) => ms.id === m.currentMilestoneId)?.title,
    nextTaskTitle: m.nextTaskTitle,
    updatedAt: m.updatedAt,
  }));
}

export async function createMission(input: CreateMissionInput): Promise<Mission> {
  await sleep(600);
  const newMission: Mission = {
    id: `mission-${Date.now()}`,
    userId: "user-1",
    title: `Mission: ${input.goal.slice(0, 50)}`,
    description: input.goal,
    goal: input.goal,
    category: input.category,
    status: "draft",
    progress: 0,
    priority: "medium",
    targetDate: input.targetDate,
    budgetAmount: input.budgetAmount,
    budgetCurrency: input.budgetCurrency ?? "INR",
    weeklyAvailableHours: input.weeklyAvailableHours,
    milestones: [],
    successMetrics: [],
    risks: [],
    resources: [],
    tags: [],
    isPersonal: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_MISSIONS.push(newMission);
  return newMission;
}

export async function updateMission(
  id: string,
  patch: Partial<Mission>
): Promise<Mission> {
  await sleep(300);
  const idx = MOCK_MISSIONS.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error(`Mission ${id} not found`);
  MOCK_MISSIONS[idx] = { ...MOCK_MISSIONS[idx], ...patch, updatedAt: new Date().toISOString() };
  return MOCK_MISSIONS[idx];
}

export async function deleteMission(id: string): Promise<void> {
  await sleep(300);
  const idx = MOCK_MISSIONS.findIndex((m) => m.id === id);
  if (idx !== -1) MOCK_MISSIONS.splice(idx, 1);
}

export async function generateMissionPlan(
  input: CreateMissionInput
): Promise<GeneratedMissionPlan> {
  await sleep(2500);
  return {
    title: `Mission: ${input.goal.slice(0, 60)}`,
    description: `A structured execution plan to: ${input.goal}`,
    category: input.category,
    goal: input.goal,
    estimatedDurationWeeks: 24,
    milestones: [
      {
        id: "ms-gen-1",
        missionId: "",
        title: "Foundation & Research",
        description: "Build foundational knowledge and research your goal",
        status: "pending",
        progress: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 86400000).toISOString(),
        tasks: [],
        resources: [],
        dependencies: [],
        order: 1,
      },
      {
        id: "ms-gen-2",
        missionId: "",
        title: "Skill Building",
        description: "Develop core skills required for your goal",
        status: "pending",
        progress: 0,
        startDate: new Date(Date.now() + 31 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        tasks: [],
        resources: [],
        dependencies: [],
        order: 2,
      },
      {
        id: "ms-gen-3",
        missionId: "",
        title: "Execution & Practice",
        description: "Apply skills through real projects and practice",
        status: "pending",
        progress: 0,
        startDate: new Date(Date.now() + 61 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 90 * 86400000).toISOString(),
        tasks: [],
        resources: [],
        dependencies: [],
        order: 3,
      },
      {
        id: "ms-gen-4",
        missionId: "",
        title: "Review & Optimise",
        description: "Review progress and optimise your approach",
        status: "pending",
        progress: 0,
        startDate: new Date(Date.now() + 91 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 120 * 86400000).toISOString(),
        tasks: [],
        resources: [],
        dependencies: [],
        order: 4,
      },
    ],
    successMetrics: [
      { id: "sm-gen-1", description: "Goal achieved with measurable outcome", measurable: true, achieved: false },
      { id: "sm-gen-2", description: "All milestones completed on time", measurable: true, achieved: false },
    ],
    risks: [
      { id: "r-gen-1", description: "Time constraints from other commitments", severity: "medium", mitigation: "Block dedicated time slots" },
    ],
    resources: [],
    suggestedSchedule: "Dedicate focused blocks of time each week",
  };
}

export async function getMissionActivity(id: string): Promise<MissionActivity[]> {
  await sleep(300);
  return [
    {
      id: "act-1",
      missionId: id,
      type: "mission-created",
      description: "Mission created",
      userId: "user-1",
      createdAt: "2025-08-01T10:00:00Z",
    },
    {
      id: "act-2",
      missionId: id,
      type: "milestone-achieved",
      description: "Milestone 'Learn Python, DSA and GitHub' completed",
      userId: "user-1",
      createdAt: "2025-08-28T18:00:00Z",
    },
  ];
}
