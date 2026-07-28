import { sleep } from "@/lib/utils";
import { MOCK_TASKS } from "@/constants/mock-data";
import type { Task, CreateTaskInput, UpdateTaskInput } from "@/types/task";

export async function getTasks(missionId?: string): Promise<Task[]> {
  await sleep(300);
  return missionId
    ? MOCK_TASKS.filter((t) => t.missionId === missionId)
    : MOCK_TASKS;
}

export async function getTask(id: string): Promise<Task> {
  await sleep(200);
  const t = MOCK_TASKS.find((x) => x.id === id);
  if (!t) throw new Error(`Task ${id} not found`);
  return t;
}

export async function getTodayTasks(): Promise<Task[]> {
  await sleep(300);
  const today = new Date().toISOString().slice(0, 10);
  return MOCK_TASKS.filter(
    (t) => t.dueDate === today || t.status === "in-progress"
  );
}

export async function createTask(input: CreateTaskInput): Promise<Task> {
  await sleep(400);
  const task: Task = {
    id: `task-${Date.now()}`,
    userId: "user-1",
    missionId: input.missionId,
    milestoneId: input.milestoneId,
    title: input.title,
    description: input.description,
    status: "not-started",
    priority: input.priority ?? "medium",
    dueDate: input.dueDate,
    dueTime: input.dueTime,
    estimatedDurationMinutes: input.estimatedDurationMinutes,
    dependencies: input.dependencies ?? [],
    notes: [],
    resources: [],
    tags: input.tags ?? [],
    order: MOCK_TASKS.length + 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  MOCK_TASKS.push(task);
  return task;
}

export async function updateTask(
  id: string,
  patch: Partial<UpdateTaskInput>
): Promise<Task> {
  await sleep(200);
  const idx = MOCK_TASKS.findIndex((t) => t.id === id);
  if (idx === -1) throw new Error(`Task ${id} not found`);
  MOCK_TASKS[idx] = {
    ...MOCK_TASKS[idx],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return MOCK_TASKS[idx];
}

export async function completeTask(id: string): Promise<Task> {
  return updateTask(id, {
    status: "completed",
    completedAt: new Date().toISOString(),
  } as Partial<Task>);
}

export async function deleteTask(id: string): Promise<void> {
  await sleep(200);
  const idx = MOCK_TASKS.findIndex((t) => t.id === id);
  if (idx !== -1) MOCK_TASKS.splice(idx, 1);
}
