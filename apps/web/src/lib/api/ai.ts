import { sleep, generateId } from "@/lib/utils";
import type { ConversationMessage, AiRecommendation, Agent } from "@/types/ai";
import { MOCK_RECOMMENDATIONS } from "@/constants/mock-data";

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
  await sleep(300);
  return MOCK_AGENTS;
}

export async function getAgent(id: string): Promise<Agent> {
  await sleep(200);
  const a = MOCK_AGENTS.find((x) => x.id === id);
  if (!a) throw new Error(`Agent ${id} not found`);
  return a;
}

export async function sendCoachMessage(
  message: string,
  context?: Record<string, unknown>
): Promise<ConversationMessage> {
  await sleep(1200 + Math.random() * 800);
  const responses: Record<string, string> = {
    default: `Based on your current missions and progress, here's my recommendation: Focus on completing your most impactful task today. Your **Career mission** is at 42% — the next milestone requires consistent daily effort. I've identified 2 blockers you should address this week. Would you like me to create a focused execution plan for the next 7 days?`,
    next: `Looking at your active missions, I recommend you focus on **completing the React advanced patterns module** today. This unblocks the next 3 tasks in your Software Engineer mission. After that, spend 30 minutes reviewing the matched internship at Razorpay — it's a 91% match.`,
    review: `**Mission Progress Review:**\n\n• **Become a Software Engineer**: 42% complete, on track ✓\n• **Save ₹5 Lakh**: 28% complete, slightly behind ⚠️\n• **Improve Fitness**: 35% complete, on track ✓\n\n**Recommended action:** Increase savings contribution by ₹2,000/month to get back on track for your finance mission.`,
  };

  const lowerMsg = message.toLowerCase();
  const content =
    lowerMsg.includes("next") ? responses.next :
    lowerMsg.includes("review") || lowerMsg.includes("progress") ? responses.review :
    responses.default;

  return {
    id: generateId(),
    role: "assistant",
    content: content + `\n\n*Context: ${context?.missionTitle ?? "All missions"} · Memory active*`,
    timestamp: new Date().toISOString(),
    metadata: {
      memoryUsed: true,
      suggestedActions: [
        {
          id: generateId(),
          label: "Create execution plan",
          type: "create-plan",
          requiresConfirmation: true,
          payload: {},
        },
        {
          id: generateId(),
          label: "Find resources",
          type: "find-opportunity",
          requiresConfirmation: false,
          payload: {},
        },
      ],
    },
  };
}

export async function getRecommendations(): Promise<AiRecommendation[]> {
  await sleep(400);
  return MOCK_RECOMMENDATIONS;
}

export async function dismissRecommendation(id: string): Promise<void> {
  await sleep(200);
  const r = MOCK_RECOMMENDATIONS.find((x) => x.id === id);
  if (r) r.isDismissed = true;
}

export async function saveRecommendation(id: string): Promise<void> {
  await sleep(200);
  const r = MOCK_RECOMMENDATIONS.find((x) => x.id === id);
  if (r) r.isSaved = true;
}
