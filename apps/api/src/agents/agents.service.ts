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
    let output = "";
    let success = false;
    let metadata: Record<string, any> = {
      processedAt: new Date().toISOString(),
      userId: String(userId),
      engine: "gemini-3.5-flash",
    };

    if (aiServiceUrl) {
      const controller = new AbortController();
      // The orchestrator runs 6+ sequential LLM calls (intent, mission,
      // planner, domain agent, recommendation, execution). 8s was too short
      // and caused premature aborts on real requests - raised to 45s.
      const timeoutId = setTimeout(() => controller.abort(), 45000);

      try {
        const response = await fetch(`${aiServiceUrl}/api/v1/orchestrate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: String(userId),
            message: dto.userInput,
            session_id:
              dto.contextData?.sessionId || `sess-${userId}-${Date.now()}`,
            context: dto.contextData || {},
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`AI service returned status ${response.status}: ${await response.text()}`);
        }

        const resJson: any = await response.json();
        if (resJson && resJson.domain_result) {
          output =
            resJson.domain_result.advice ||
            resJson.domain_result.output ||
            JSON.stringify(resJson.domain_result);
          success = true;
          metadata = {
            ...metadata,
            intent: resJson.intent,
            memoryWritten: resJson.memory_written,
            fastapiResponse: true,
          };
        } else {
          throw new Error("AI service returned an invalid response structure");
        }
      } catch (err: any) {
        clearTimeout(timeoutId);
        throw new Error(`AI Service connection failed: ${err.message}`);
      }
    } else {
      throw new Error("AI Service URL is not configured");
    }

    return {
      agentType: dto.agentType,
      success,
      output,
      metadata,
    };
  }
}
