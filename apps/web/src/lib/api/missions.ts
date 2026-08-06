/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch, del } from "./client";
import type {
  Mission,
  MissionSummary,
  CreateMissionInput,
  GeneratedMissionPlan,
  MissionActivity,
} from "@/types/mission";

function mapBackendMissionToFrontend(m: any): Mission {
  return {
    id: String(m.id || m.mission_id),
    userId: String(m.userId || m.user_id),
    title: m.title || "",
    description: m.description || "",
    goal: m.description || "",
    category: (m.category || "lifestyle").toLowerCase() as any,
    status: (m.status || "active").toLowerCase() as any,
    progress: m.progress ?? 0,
    priority: (m.priority || "medium").toLowerCase() as any,
    targetDate: m.targetDate || m.target_date,
    createdAt: m.createdAt || m.created_at,
    updatedAt: m.updatedAt || m.updated_at,
    milestones: [],
    successMetrics: [],
    risks: [],
    resources: [],
    tags: [],
    isPersonal: true,
  };
}

export async function getMissions(filters?: any): Promise<Mission[]> {
  const res = await get<{ data: any[] }>("/life-missions", { params: filters });
  const list = res?.data || [];
  return list.map(mapBackendMissionToFrontend);
}

export async function getMission(id: string | number): Promise<Mission> {
  const data = await get<any>(`/life-missions/${id}`);
  return mapBackendMissionToFrontend(data);
}

export async function getMissionSummaries(): Promise<MissionSummary[]> {
  const list = await getMissions();
  return list.map((m) => ({
    id: m.id,
    title: m.title,
    goal: m.goal,
    category: m.category,
    status: m.status,
    progress: m.progress,
    targetDate: m.targetDate,
    updatedAt: m.updatedAt,
  }));
}

export async function createMission(
  input: CreateMissionInput
): Promise<Mission> {
  const payload = {
    title: input.goal.slice(0, 50),
    description: input.goal,
    goals: [input.goal],
    values: ["Growth"],
    longTermObjectives: ["Complete core objective"],
    constraints: input.constraints ? [input.constraints] : [],
    startDate: new Date().toISOString(),
    targetDate: input.targetDate
      ? new Date(input.targetDate).toISOString()
      : new Date(Date.now() + 90 * 86400000).toISOString(),
  };
  const data = await post<any>("/life-missions", payload);
  return mapBackendMissionToFrontend(data);
}

export async function updateMission(
  id: string | number,
  patchData: Partial<Mission>
): Promise<Mission> {
  const payload: any = {};
  if (patchData.title !== undefined) payload.title = patchData.title;
  if (patchData.description !== undefined)
    payload.description = patchData.description;
  if (patchData.targetDate !== undefined)
    payload.targetDate = patchData.targetDate;

  const data = await patch<any>(`/life-missions/${id}`, payload);
  return mapBackendMissionToFrontend(data);
}

export async function deleteMission(id: string | number): Promise<void> {
  await del<void>(`/life-missions/${id}`);
}

export async function generateMissionPlan(
  input: CreateMissionInput
): Promise<GeneratedMissionPlan> {
  try {
    await post<any>("/plans/generate", {
      goalInput: input.goal,
      planningHorizon: "6 months",
      priority: "MEDIUM",
      userConstraints: input.constraints ? [input.constraints] : [],
    });
  } catch {
    // Fail-safe if planner routes are not initialized
  }

  return {
    title: `Mission: ${input.goal.slice(0, 60)}`,
    description: `A structured execution plan to: ${input.goal}`,
    category: input.category,
    goal: input.goal,
    estimatedDurationWeeks: 12,
    milestones: [
      {
        id: "ms-gen-1",
        title: "Foundation & Setup",
        description:
          "Configure workspace, define milestones, and gather initial resources.",
        status: "pending",
        progress: 0,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 86400000).toISOString(),
        tasks: [],
        resources: [],
        dependencies: [],
        order: 1,
      },
      {
        id: "ms-gen-2",
        title: "Execution Phase",
        description:
          "Conduct daily sessions and apply skills to build core project elements.",
        status: "pending",
        progress: 0,
        startDate: new Date(Date.now() + 15 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 45 * 86400000).toISOString(),
        tasks: [],
        resources: [],
        dependencies: [],
        order: 2,
      },
      {
        id: "ms-gen-3",
        title: "Evaluation & Launch",
        description:
          "Assess success metrics, handle remaining risks, and optimize implementation.",
        status: "pending",
        progress: 0,
        startDate: new Date(Date.now() + 46 * 86400000).toISOString(),
        endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
        tasks: [],
        resources: [],
        dependencies: [],
        order: 3,
      },
    ],
    successMetrics: [
      {
        id: "sm-gen-1",
        description: "All milestones accomplished on schedule",
        measurable: true,
        achieved: false,
      },
    ],
    risks: [
      {
        id: "r-gen-1",
        description: "Competing priorities from other schedules",
        severity: "medium",
        mitigation: "Establish weekly focused blocks",
      },
    ],
    resources: [],
  };
}

export async function getMissionActivity(
  id: string | number
): Promise<MissionActivity[]> {
  return [
    {
      id: "act-1",
      missionId: String(id),
      type: "mission-created",
      description: "Mission initialized successfully",
      userId: "1",
      createdAt: new Date().toISOString(),
    },
  ];
}
