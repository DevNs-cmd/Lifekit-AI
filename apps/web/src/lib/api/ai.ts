/* eslint-disable @typescript-eslint/no-explicit-any */
import { get, post, patch } from "./client";
import type { ConversationMessage, AiRecommendation, Agent } from "@/types/ai";

export const MOCK_AGENTS: Agent[] = [
  {
    id: "agent-career",
    name: "Career Agent",
    domain: "career",
    description: "Expert in career planning, job search strategy, interview preparation and professional development.",
    capabilities: [
      "Build personalised career roadmaps",
      "Review and optimise your resume",
      "Prepare for technical interviews",
      "Match you to relevant job opportunities",
      "Suggest upskilling resources",
    ],
    isAvailable: true,
    relatedCategories: ["career", "education"],
  },
  {
    id: "agent-finance",
    name: "Finance Agent",
    domain: "finance",
    description: "Your personal finance advisor for budgeting, saving, investing and achieving financial goals.",
    capabilities: [
      "Create personalised savings plans",
      "Analyse spending patterns",
      "Recommend investment options",
      "Calculate goal timelines",
      "Track financial milestones",
    ],
    isAvailable: true,
    relatedCategories: ["finance"],
  },
  {
    id: "agent-health",
    name: "Health Agent",
    domain: "health",
    description: "Dedicated to your fitness and wellness goals with customised plans and expert resources.",
    capabilities: [
      "Design fitness training plans",
      "Set nutrition guidelines",
      "Track health metrics",
      "Find local trainers and gyms",
      "Monitor recovery and consistency",
    ],
    isAvailable: true,
    relatedCategories: ["health", "lifestyle"],
  },
  {
    id: "agent-travel",
    name: "Travel Agent",
    domain: "travel",
    description: "Plan, organise and execute meaningful travel experiences aligned with your life goals.",
    capabilities: [
      "Plan detailed trip itineraries",
      "Find best-value flights and stays",
      "Create travel budgets",
      "Research visa requirements",
      "Discover local experiences",
    ],
    isAvailable: true,
    relatedCategories: ["travel", "lifestyle"],
  },
  {
    id: "agent-business",
    name: "Business Agent",
    domain: "business",
    description: "Your startup and business strategy partner for founders and entrepreneurs.",
    capabilities: [
      "Validate business ideas",
      "Create go-to-market strategies",
      "Build financial projections",
      "Find co-founders and talent",
      "Prepare investor pitch materials",
    ],
    isAvailable: true,
    relatedCategories: ["business", "career"],
  },
];

export async function getAgents(): Promise<Agent[]> {
  const list = await get<Agent[]>("/agents");
  if (list && list.length > 0) return list;
  return MOCK_AGENTS;
}

export async function getAgent(id: string): Promise<Agent> {
  try {
    return await get<Agent>(`/agents/${id}`);
  } catch (error) {
    const a = MOCK_AGENTS.find((x) => x.id === id);
    if (!a) throw error;
    return a;
  }
}

export async function sendCoachMessage(
  message: string,
  context?: Record<string, unknown>
): Promise<ConversationMessage> {
  const res = await post<any>("/agents/run", {
    agentType: "COACH",
    userInput: message,
    contextData: context || {},
  });

  // The gateway now returns HTTP 201 even when it could not reach the AI
  // service (graceful fallback) - `success` is what actually tells us
  // whether this was a real answer or an error message in disguise.
  const isError = res?.success === false;

  return {
    id: `ai-${Date.now()}`,
    role: "assistant",
    content: res.output || "I am processing your request.",
    timestamp: new Date().toISOString(),
    metadata: isError
      ? { isError: true }
      : {
          memoryUsed: true,
          suggestedActions: [
            {
              id: `act-${Date.now()}`,
              label: "Create execution plan",
              type: "create-plan",
              requiresConfirmation: true,
              payload: {},
            },
          ],
        },
  };
}

function mapBackendRecToFrontend(r: any): AiRecommendation {
  return {
    id: String(r.opportunity_id || r.id),
    userId: String(r.user_id || "user-1"),
    title: r.title || "",
    description: r.description || "",
    category: (r.category || "learning").toLowerCase() as any,
    type: "opportunity",
    matchScore: Math.round((r.relevanceScore || 0.85) * 100),
    reasons: ["Matched with your current objectives"],
    isDismissed: r.status === "DISMISSED",
    isSaved: r.status === "ACCEPTED",
    createdAt: r.created_at || r.createdAt || new Date().toISOString(),
  };
}

export async function getRecommendations(): Promise<AiRecommendation[]> {
  const res = await get<{ data: any[] }>("/recommendations");
  const list = res?.data || [];
  return list.map(mapBackendRecToFrontend);
}

export async function dismissRecommendation(id: string | number): Promise<void> {
  await patch<void>(`/recommendations/${id}/status`, { status: "DISMISSED" });
}

export async function saveRecommendation(id: string | number): Promise<void> {
  await patch<void>(`/recommendations/${id}/status`, { status: "ACCEPTED" });
}
