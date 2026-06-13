import { uuidv7 } from './ids';
import type { Agent, AgentTier } from './domain';

/** Agent onboarding + approval + agent->sub-agent hierarchy. */
export class AgentService {
  private readonly agents = new Map<string, Agent>();

  constructor(private readonly now: () => string = () => new Date().toISOString()) {}

  async register(input: {
    agencyName: string;
    email: string;
    tier?: AgentTier;
    parentAgentId?: string;
  }): Promise<Agent> {
    if (input.parentAgentId && !this.agents.has(input.parentAgentId)) {
      throw new Error(`Unknown parent agent: ${input.parentAgentId}`);
    }
    const agent: Agent = {
      id: uuidv7(),
      agencyName: input.agencyName,
      email: input.email,
      tier: input.tier ?? 'BRONZE',
      status: 'PENDING',
      parentAgentId: input.parentAgentId,
      createdAt: this.now(),
    };
    this.agents.set(agent.id, agent);
    return agent;
  }

  async approve(agentId: string): Promise<Agent> {
    const agent = this.require(agentId);
    agent.status = 'APPROVED';
    return agent;
  }

  async suspend(agentId: string): Promise<Agent> {
    const agent = this.require(agentId);
    agent.status = 'SUSPENDED';
    return agent;
  }

  async get(agentId: string): Promise<Agent | undefined> {
    return this.agents.get(agentId);
  }

  async list(): Promise<Agent[]> {
    return [...this.agents.values()];
  }

  async subAgentsOf(parentAgentId: string): Promise<Agent[]> {
    return [...this.agents.values()].filter((a) => a.parentAgentId === parentAgentId);
  }

  private require(agentId: string): Agent {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Unknown agent: ${agentId}`);
    return agent;
  }
}
