/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch, del } from "./client";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

function mapBackendTaskToFrontend(t: any): Task {
  let mappedStatus: any = "not-started";
  if (t.status === "PENDING") mappedStatus = "not-started";
  else if (t.status === "IN_PROGRESS") mappedStatus = "in-progress";
  else if (t.status === "COMPLETED") mappedStatus = "completed";
  else if (t.status === "BLOCKED") mappedStatus = "blocked";
  else if (t.status === "CANCELLED") mappedStatus = "skipped";

  return {
    id: String(t.task_id || t.id),
    userId: String(t.userId || t.user_id || "1"),
    missionId: String(t.mission_id || t.missionId),
    title: t.title || "",
    description: t.description || "",
    status: mappedStatus,
    priority: (t.priority || "medium").toLowerCase() as any,
    dueDate: t.due_date ? t.due_date.slice(0, 10) : undefined,
    estimatedDurationMinutes: t.estimated_time || t.estimatedDurationMinutes,
    dependencies: [],
    notes: [],
    resources: [],
    tags: [],
    order: t.order || 1,
    createdAt: t.created_at || t.createdAt,
    updatedAt: t.updated_at || t.updatedAt,
  };
}

export async function getTasks(missionId: string | number): Promise<Task[]> {
  const res = await get<{ data: any[] }>("/tasks", {
    params: { missionId: Number(missionId) },
  });
  const list = res?.data || [];
  return list.map(mapBackendTaskToFrontend);
}

export async function getTask(id: string | number): Promise<Task> {
  const data = await get<any>(`/tasks/${id}`);
  return mapBackendTaskToFrontend(data);
}

export async function getTodayTasks(): Promise<Task[]> {
  // Pull tasks for all user missions to find today's active tasks
  try {
    const missions = await get<{ data: any[] }>("/life-missions");
    const missionsList = missions?.data || [];
    const allTasksNested = await Promise.all(
      missionsList.map((m) =>
        getTasks(m.id || m.mission_id).catch(() => [] as Task[])
      )
    );
    const allTasks = allTasksNested.flat();
    const today = new Date().toISOString().slice(0, 10);
    return allTasks.filter(
      (t) => t.dueDate === today || t.status === "in-progress"
    );
  } catch {
    return [];
  }
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  const payload = {
    missionId: Number(input.missionId),
    title: input.title,
    description: input.description || "",
    status: "PENDING",
    priority: input.priority || "medium",
    dueDate: input.dueDate
      ? new Date(input.dueDate).toISOString()
      : new Date().toISOString(),
  };

  const data = await post<any>("/tasks", payload);
  return mapBackendTaskToFrontend(data);
}

export async function updateTask(
  id: string | number,
  patchData: Partial<UpdateTaskInput>
): Promise<Task> {
  const payload: any = {};
  if (patchData.title !== undefined) payload.title = patchData.title;
  if (patchData.description !== undefined)
    payload.description = patchData.description;
  if (patchData.status !== undefined) {
    let backendStatus = "PENDING";
    if (patchData.status === "in-progress") backendStatus = "IN_PROGRESS";
    else if (patchData.status === "completed") backendStatus = "COMPLETED";
    else if (patchData.status === "blocked") backendStatus = "BLOCKED";
    payload.status = backendStatus;
  }
  if (patchData.priority !== undefined) payload.priority = patchData.priority;
  if (patchData.dueDate !== undefined)
    payload.dueDate = patchData.dueDate
      ? new Date(patchData.dueDate).toISOString()
      : undefined;

  const data = await patch<any>(`/tasks/${id}`, payload);
  return mapBackendTaskToFrontend(data);
}

export async function updateTaskStatus(
  id: string | number,
  status: string
): Promise<Task> {
  const data = await patch<any>(`/tasks/${id}/status`, { status });
  return mapBackendTaskToFrontend(data);
}

export async function completeTask(id: string | number): Promise<Task> {
  return updateTaskStatus(id, "COMPLETED");
}

export async function deleteTask(id: string | number): Promise<void> {
  await del<void>(`/tasks/${id}`);
}
