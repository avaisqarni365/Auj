import type { Money } from '@auj/contracts';
import type { ItemKind } from '@auj/core-booking';
import { uuidv7 } from './ids';
import type { AgentTier, QuoteLine, Quotation } from './domain';
import { MarkupEngine } from './markup';

function sumLines(lines: QuoteLine[]): Money {
  const currency = lines[0]?.net.currency ?? 'EUR';
  return { amount: lines.reduce((sum, l) => sum + l.net.amount, 0), currency };
}

/** Assemble a quote, price it with the markup engine, and track its status. */
export class QuotationService {
  private readonly quotes = new Map<string, Quotation>();

  constructor(
    private readonly engine: MarkupEngine,
    private readonly now: () => string = () => new Date().toISOString(),
  ) {}

  create(input: {
    agentId: string;
    tier: AgentTier;
    kind?: ItemKind;
    lines: QuoteLine[];
    validUntil: string;
  }): Quotation {
    const netTotal = sumLines(input.lines);
    const { sell, markup } = this.engine.price(netTotal, { tier: input.tier, kind: input.kind ?? 'HOTEL' });
    const quote: Quotation = {
      id: uuidv7(),
      agentId: input.agentId,
      lines: input.lines,
      netTotal,
      markup,
      sell,
      status: 'DRAFT',
      validUntil: input.validUntil,
      createdAt: this.now(),
    };
    this.quotes.set(quote.id, quote);
    return quote;
  }

  send(id: string): Quotation {
    const quote = this.require(id);
    quote.status = 'SENT';
    return quote;
  }

  markConverted(id: string): Quotation {
    const quote = this.require(id);
    quote.status = 'CONVERTED';
    return quote;
  }

  get(id: string): Quotation | undefined {
    return this.quotes.get(id);
  }

  private require(id: string): Quotation {
    const quote = this.quotes.get(id);
    if (!quote) throw new Error(`Unknown quote: ${id}`);
    return quote;
  }
}
