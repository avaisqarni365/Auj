import type { Money } from '@auj/contracts';
import type { ItemKind } from '@auj/core-booking';
import { uuidv7 } from './ids';
import type { AgentTier, MarkupRule } from './domain';

/** Apply a single rule to a net amount. PERCENT = whole percent; FIXED = minor units. */
export function applyMarkup(net: Money, rule: MarkupRule): Money {
  const markup = rule.kind === 'PERCENT' ? Math.round((net.amount * rule.value) / 100) : rule.value;
  return { amount: net.amount + markup, currency: net.currency };
}

export interface MarkupResult {
  net: Money;
  markup: Money;
  sell: Money;
  rule?: MarkupRule;
}

/** Configurable markups; the most specific enabled matching rule wins (tier+kind > tier > kind > any). */
export class MarkupEngine {
  private readonly rules: MarkupRule[];

  constructor(rules: MarkupRule[] = []) {
    this.rules = [...rules];
  }

  addRule(rule: Omit<MarkupRule, 'id'>): MarkupRule {
    const created: MarkupRule = { ...rule, id: uuidv7() };
    this.rules.push(created);
    return created;
  }

  toggle(id: string, enabled: boolean): void {
    const rule = this.rules.find((r) => r.id === id);
    if (rule) rule.enabled = enabled;
  }

  list(): MarkupRule[] {
    return [...this.rules];
  }

  private specificity(r: MarkupRule): number {
    return (r.tier ? 2 : 0) + (r.productKind ? 1 : 0);
  }

  match(ctx: { tier: AgentTier; kind: ItemKind }): MarkupRule | undefined {
    return this.rules
      .filter(
        (r) =>
          r.enabled &&
          (r.tier === undefined || r.tier === ctx.tier) &&
          (r.productKind === undefined || r.productKind === ctx.kind),
      )
      .sort((a, b) => this.specificity(b) - this.specificity(a))[0];
  }

  price(net: Money, ctx: { tier: AgentTier; kind: ItemKind }): MarkupResult {
    const rule = this.match(ctx);
    if (!rule) return { net, markup: { amount: 0, currency: net.currency }, sell: net };
    const sell = applyMarkup(net, rule);
    return { net, markup: { amount: sell.amount - net.amount, currency: net.currency }, sell, rule };
  }
}
