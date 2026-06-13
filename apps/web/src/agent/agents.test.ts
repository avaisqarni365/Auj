import { describe, it, expect } from 'vitest';
import { AgentService } from './agents';

describe('AgentService', () => {
  it('registers agents as PENDING and approves them', async () => {
    const svc = new AgentService(() => '2026-06-13T00:00:00.000Z');
    const agent = await svc.register({ agencyName: 'Al Noor Travel', email: 'ops@alnoor.example', tier: 'SILVER' });
    expect(agent.status).toBe('PENDING');
    expect(agent.tier).toBe('SILVER');
    const approved = await svc.approve(agent.id);
    expect(approved.status).toBe('APPROVED');
  });

  it('supports an agent -> sub-agent hierarchy', async () => {
    const svc = new AgentService();
    const parent = await svc.register({ agencyName: 'Parent', email: 'p@x.example' });
    const sub = await svc.register({ agencyName: 'Sub', email: 's@x.example', parentAgentId: parent.id });
    expect(sub.parentAgentId).toBe(parent.id);
    expect(await svc.subAgentsOf(parent.id)).toHaveLength(1);
  });

  it('rejects sub-agents under an unknown parent', async () => {
    const svc = new AgentService();
    await expect(svc.register({ agencyName: 'X', email: 'x@x.example', parentAgentId: 'nope' })).rejects.toThrow(/Unknown parent/);
  });
});
