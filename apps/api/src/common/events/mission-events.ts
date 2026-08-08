/** Centralised event name constants — import from here everywhere. */
export const MISSION_EVENTS = {
  CREATED: "mission.created",
  UPDATED: "mission.updated",
  DELETED: "mission.deleted",
} as const;

/** Payload carried by the mission.created event. */
export class MissionCreatedEvent {
  constructor(
    public readonly userId: number,
    public readonly missionId: number,
    public readonly title: string,
    public readonly category: string | null,
  ) {}
}

/** Payload carried by the mission.updated event. */
export class MissionUpdatedEvent {
  constructor(
    public readonly userId: number,
    public readonly missionId: number,
    public readonly title: string,
    public readonly category: string | null,
  ) {}
}
