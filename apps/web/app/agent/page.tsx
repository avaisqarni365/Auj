import Link from 'next/link';
import { Logo } from '@auj/ui';
import { requireRole } from '../../src/auth/session';
import { AgentPortal } from '../../src/agent/AgentPortal';

// Agent portal — AGENT / SUB_AGENT (ADMIN may view). Agents must be approved
// (agentStatus ACTIVE) before they can use the portal.
export default async function AgentPage() {
  const user = await requireRole(['AGENT', 'SUB_AGENT', 'ADMIN'], '/agent');
  const needsApproval = user.role !== 'ADMIN' && user.agentStatus !== 'ACTIVE';

  if (needsApproval) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-sand-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-sand-200 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <Logo size={44} />
          </div>
          <h1 className="font-serif text-2xl font-semibold">Approval pending</h1>
          <p className="mt-2 text-sm leading-relaxed text-sand-500">
            Thanks for registering, {user.displayName}. Your agency account is awaiting review by our team.
            You’ll get full access to wallet, markups and multi-pax booking once an administrator approves it.
          </p>
          <span className="mt-4 inline-block rounded-full bg-warning-bg px-3 py-1 text-[12px] font-semibold text-warning-fg">
            Status: {user.agentStatus ?? 'pending'}
          </span>
          <div className="mt-6">
            <Link href="/" className="text-sm font-semibold text-accent-600">← Back to AUJ</Link>
          </div>
        </div>
      </main>
    );
  }

  return <AgentPortal />;
}
