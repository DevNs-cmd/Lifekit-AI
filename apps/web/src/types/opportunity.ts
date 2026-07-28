import type { Category, ID } from "./common";

export type OpportunityType =
  | "job"
  | "internship"
  | "scholarship"
  | "course"
  | "event"
  | "grant"
  | "challenge"
  | "service";

export type ApplicationStatus = "not-applied" | "saved" | "applied" | "interviewing" | "offered" | "rejected" | "withdrawn";

export interface OpportunityRequirement {
  label: string;
  description?: string;
}

export interface Opportunity {
  id: ID;
  title: string;
  organisation: string;
  organisationLogo?: string;
  type: OpportunityType;
  category: Category;
  location?: string;
  isRemote: boolean;
  deadline?: string;
  eligibilitySummary: string;
  eligibilityDetails?: string;
  description: string;
  requirements: OpportunityRequirement[];
  requiredDocuments: string[];
  applicationUrl?: string;
  experienceLevel?: "entry" | "mid" | "senior" | "any";
  matchScore: number; // 0-100
  relatedMissionId?: ID;
  relatedMissionTitle?: string;
  matchReasons: string[];
  isSaved: boolean;
  isDismissed: boolean;
  applicationStatus: ApplicationStatus;
  applicationDeadline?: string;
  applicationNotes?: string;
  tags: string[];
  postedAt: string;
  updatedAt: string;
}

export interface OpportunitySearchFilters {
  type?: OpportunityType;
  location?: string;
  isRemote?: boolean;
  deadline?: string;
  category?: Category;
  experienceLevel?: string;
  minMatchScore?: number;
  isSaved?: boolean;
  applicationStatus?: ApplicationStatus;
}

export interface OpportunityApplication {
  id: ID;
  opportunityId: ID;
  userId: ID;
  status: ApplicationStatus;
  appliedAt?: string;
  notes?: string;
  documents: string[];
  tasks: ID[]; // linked task IDs
  reminderDate?: string;
  outcome?: "pending" | "accepted" | "rejected";
  outcomeNotes?: string;
}
