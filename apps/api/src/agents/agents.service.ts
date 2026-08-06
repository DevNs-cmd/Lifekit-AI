import { Injectable, NotFoundException } from "@nestjs/common";
import { AgentRequestDto, AgentType } from "./dto/agent-request.dto";
import { AgentResponseDto } from "./dto/agent-response.dto";

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
    // Simulated AI execution mapping based on the input agentType
    let output = "";
    switch (dto.agentType) {
      case AgentType.COACH:
        output = `Hello from Coach Agent. Based on your input: "${dto.userInput}", I recommend focusing on small, iterative daily habits.`;
        break;
      case AgentType.PLANNER:
        output = `Hello from Planner Agent. Let's create a roadmap. Your goal: "${dto.userInput}". Let's start with breaking it into 3 phases.`;
        break;
      case AgentType.ANALYST:
        output = `Hello from Analyst Agent. Analyzing context data: ${JSON.stringify(dto.contextData ?? {})}. Analysis suggests optimal efficiency.`;
        break;
      default:
        output = `Processed request for agent: ${dto.agentType} with input: "${dto.userInput}".`;
    }

    return {
      agentType: dto.agentType,
      success: true,
      output,
      metadata: {
        processedAt: new Date().toISOString(),
        userId: String(userId),
        engine: "gemini-3.5-flash",
      },
    };
  }
}
