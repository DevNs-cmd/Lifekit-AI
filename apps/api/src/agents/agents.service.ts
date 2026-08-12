import { Injectable, NotFoundException } from "@nestjs/common";
import { AgentRequestDto } from "./dto/agent-request.dto";
import { AgentResponseDto } from "./dto/agent-response.dto";
import { AppConfigService } from "../config/app-config.service";

export interface DomainAgent {
  id: string;
  name: string;
  domain: string;
  description: string;
  capabilities: string[];
  isAvailable: boolean;
  relatedCategories: string[];
}

@Injectable()
export class AgentsService {
  private readonly domainAgents: DomainAgent[] = [
    {
      id: "agent-career",
      name: "Career Agent",
      domain: "career",
      description:
        "Expert in career planning, job search strategy, interview preparation and professional development.",
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
      description:
        "Your personal finance advisor for budgeting, saving, investing and achieving financial goals.",
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
      description:
        "Dedicated to your fitness and wellness goals with customised plans and expert resources.",
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
      description:
        "Plan, organise and execute meaningful travel experiences aligned with your life goals.",
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
      description:
        "Your startup and business strategy partner for founders and entrepreneurs.",
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

  constructor(private readonly config: AppConfigService) {}

  async getAgents(): Promise<DomainAgent[]> {
    return this.domainAgents;
  }

  async getAgent(id: string): Promise<DomainAgent> {
    const agent = this.domainAgents.find((a) => a.id === id);
    if (!agent) {
      throw new NotFoundException(`Agent ${id} not found`);
    }
    return agent;
  }

  async run(userId: number, dto: AgentRequestDto): Promise<AgentResponseDto> {
    const aiServiceUrl = this.config.aiServiceUrl;

    const baseMeta: Record<string, any> = {
      processedAt: new Date().toISOString(),
      userId: String(userId),
      engine: "gpt-4o-mini",
    };

    // ── AI service not configured ────────────────────────────────────────────
    if (!aiServiceUrl) {
      return {
        agentType: dto.agentType,
        success: false,
        output:
          "AI Service is not configured. Please set the AI_SERVICE_URL environment variable.",
        metadata: { ...baseMeta, fallback: true },
      };
    }

    // ── Call the AI service orchestrator ────────────────────────────────────
    const controller = new AbortController();
    // The orchestrator runs 6+ sequential LLM calls. Allow up to 90s so slow
    // or cold-start LLM providers don't get prematurely aborted.
    const timeoutId = setTimeout(() => controller.abort(), 90_000);

    try {
      const response = await fetch(`${aiServiceUrl}/api/v1/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id:    String(userId),
          message:    dto.userInput,
          session_id: dto.contextData?.sessionId || `sess-${userId}-${Date.now()}`,
          context:    dto.contextData || {},
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errBody = await response.text().catch(() => "");
        throw new Error(`AI service HTTP ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const resJson: any = await response.json();

      // ── Extract the best available output from the response ─────────────
      // The graph always returns domain_result (with fallback advice when the
      // LLM is unavailable), so we can safely read from it.
      const domainResult = resJson?.domain_result ?? {};
      const advice = domainResult.advice || domainResult.output || "";

      // Build a richer reply when we have plan steps
      const planTitle: string   = resJson?.plan?.title || "";
      const planSteps: any[]    = resJson?.plan?.steps || [];
      const nextAction: string  = resJson?.execution_guidance?.next_action || "";
      const intent: string      = resJson?.intent || "";

      let output = advice;

      // Append an execution nudge if the LLM produced a concrete next step
      // and it isn't already included in the advice text
      if (
        nextAction &&
        nextAction.length > 0 &&
        !advice.toLowerCase().includes(nextAction.toLowerCase().slice(0, 20))
      ) {
        output += `\n\n**Next step:** ${nextAction}`;
      }

      // Append a short plan summary when steps are available
      if (planSteps.length > 0 && planTitle) {
        const stepLines = planSteps
          .slice(0, 3)
          .map((s: any, i: number) => `${i + 1}. ${s.task}`)
          .join("\n");
        output += `\n\n**Plan: ${planTitle}**\n${stepLines}`;
        if (planSteps.length > 3) {
          output += `\n…and ${planSteps.length - 3} more steps.`;
        }
      }

      // Final guard — if everything above produced an empty string, use a
      // safe catch-all so the user always sees something meaningful.
      if (!output.trim()) {
        output =
          "I'm here to help you reach your goals! Could you tell me a bit more about what you'd like to work on today?";
      }

      return {
        agentType: dto.agentType,
        success: true,
        output,
        metadata: {
          ...baseMeta,
          intent,
          memoryWritten: resJson?.memory_written ?? false,
          fastapiResponse: true,
        },
      };
    } catch (err: any) {
      clearTimeout(timeoutId);

      const isTimeout = err?.name === "AbortError";
      const output = isTimeout
        ? "The AI service is taking longer than expected. Please try again in a moment."
        : "I'm having trouble connecting right now. Please make sure the AI service is running and try again.";

      return {
        agentType: dto.agentType,
        success: false,
        output,
        metadata: {
          ...baseMeta,
          fallback: true,
          error: err?.message || "unknown",
        },
      };
    }
  }
}
