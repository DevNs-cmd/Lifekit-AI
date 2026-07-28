import type { ID, Priority } from "./common";

export type TaskStatus = "not-started" | "in-progress" | "blocked" | "completed" | "skipped";

export interface TaskNote {
  id: ID;
  content: string;
  createdAt: string;
}

export interface TaskResource {
  id: ID;
  title: string;
  url?: string;
  type: string;
}

export interface Task {
  id: ID;
  userId: ID;
  missionId: ID;
  missionTitle?: string;
  milestoneId?: ID;
  milestoneTitle?: string;

  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;

  dueDate?: string;
  dueTime?: string;
  estimatedDurationMinutes?: number;
  actualDurationMinutes?: number;

  dependencies: ID[];
  notes: TaskNote[];
  resources: TaskResource[];
  tags: string[];

  completedAt?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  missionId: ID;
  milestoneId?: ID;
  title: string;
  description?: string;
  priority?: Priority;
  dueDate?: string;
  dueTime?: string;
  estimatedDurationMinutes?: number;
  dependencies?: ID[];
  tags?: string[];
}

export interface UpdateTaskInput extends Partial<CreateTaskInput> {
  id: ID;
  status?: TaskStatus;
  order?: number;
}

export interface TaskGroup {
  id: string;
  title: string;
  tasks: Task[];
}
