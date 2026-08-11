/* eslint-disable @typescript-eslint/no-explicit-any */
import { post } from "./client";

export type PlannerAction = "generate" | "optimise" | "reduce" | "accelerate";

export interface PlanChange {
  type: "added" | "changed" | "removed";
  description: string;
  field: "task" | "timeline" | "hours" | string;
  before?: string;
  after?: string;
}

export async function runPlannerAction(
  missionId: string | number,
  action: PlannerAction
): Promise<PlanChange[]> {
  const res = await post<any>("/planner/action", {
    missionId: Number(missionId),
    action,
  });
  return (res?.changes ?? []) as PlanChange[];
}
