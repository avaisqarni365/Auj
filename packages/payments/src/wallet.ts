import type { Currency, Money } from '@auj/contracts';
import { Ledger } from './ledger';

export interface AgentWallet {
  agentId: string;
  currency: Currency;
  /** How far the wallet may go negative (minor units). */
  creditLimit: number;
}

export class WalletNotFoundError extends Error {
  constructor(agentId: string) {
    super(`No wallet for agent: ${agentId}`);
    this.name = 'WalletNotFoundError';
  }
}

export class InsufficientFundsError extends Error {
  constructor(agentId: string, requested: number, available: number) {
    super(`Agent ${agentId}: requested ${requested} exceeds available ${available}`);
    this.name = 'InsufficientFundsError';
  }
}

const walletAccount = (agentId: string): string => `wallet:${agentId}`;
const heldAccount = (agentId: string): string => `wallet-held:${agentId}`;
const gatewayAccount = (currency: Currency): string => `gateway:${currency}`;
const REVENUE = 'revenue:bookings';

/**
 * Agent wallet + credit on top of the double-entry ledger. Every movement is a
 * balanced journal entry; the ledger — not these methods — is the source of truth.
 */
export class WalletService {
  private readonly wallets = new Map<string, AgentWallet>();

  constructor(private readonly ledger: Ledger) {}

  open(wallet: AgentWallet): AgentWallet {
    this.wallets.set(wallet.agentId, wallet);
    return wallet;
  }

  private require(agentId: string): AgentWallet {
    const w = this.wallets.get(agentId);
    if (!w) throw new WalletNotFoundError(agentId);
    return w;
  }

  private assertCurrency(wallet: AgentWallet, money: Money): void {
    if (money.currency !== wallet.currency) {
      throw new Error(`Wallet ${wallet.agentId} is ${wallet.currency}, got ${money.currency}`);
    }
  }

  /** Spendable available balance = ledger balance + credit limit. */
  balance(agentId: string): number {
    const w = this.require(agentId);
    return this.ledger.balance(walletAccount(agentId), w.currency);
  }

  held(agentId: string): number {
    const w = this.require(agentId);
    return this.ledger.balance(heldAccount(agentId), w.currency);
  }

  available(agentId: string): number {
    return this.balance(agentId) + this.require(agentId).creditLimit;
  }

  /** Fund the wallet from a captured gateway payment. */
  topUp(agentId: string, amount: Money, gatewayRef: string): void {
    const w = this.require(agentId);
    this.assertCurrency(w, amount);
    this.ledger.post({
      ref: gatewayRef,
      memo: `wallet top-up ${agentId}`,
      postings: [
        { account: gatewayAccount(w.currency), direction: 'DEBIT', amount: amount.amount, currency: w.currency },
        { account: walletAccount(agentId), direction: 'CREDIT', amount: amount.amount, currency: w.currency },
      ],
    });
  }

  /** Reserve funds for a booking (respecting the credit limit). */
  hold(agentId: string, amount: Money, bookingRef: string): void {
    const w = this.require(agentId);
    this.assertCurrency(w, amount);
    if (amount.amount > this.available(agentId)) {
      throw new InsufficientFundsError(agentId, amount.amount, this.available(agentId));
    }
    this.ledger.post({
      ref: bookingRef,
      memo: `hold ${agentId}`,
      postings: [
        { account: walletAccount(agentId), direction: 'DEBIT', amount: amount.amount, currency: w.currency },
        { account: heldAccount(agentId), direction: 'CREDIT', amount: amount.amount, currency: w.currency },
      ],
    });
  }

  /** Consume a hold when the booking is confirmed. */
  settle(agentId: string, amount: Money, bookingRef: string): void {
    const w = this.require(agentId);
    this.assertCurrency(w, amount);
    this.ledger.post({
      ref: bookingRef,
      memo: `settle ${agentId}`,
      postings: [
        { account: heldAccount(agentId), direction: 'DEBIT', amount: amount.amount, currency: w.currency },
        { account: REVENUE, direction: 'CREDIT', amount: amount.amount, currency: w.currency },
      ],
    });
  }

  /** Return a hold to the wallet when a booking is cancelled before settlement. */
  releaseHold(agentId: string, amount: Money, bookingRef: string): void {
    const w = this.require(agentId);
    this.assertCurrency(w, amount);
    this.ledger.post({
      ref: bookingRef,
      memo: `release hold ${agentId}`,
      postings: [
        { account: heldAccount(agentId), direction: 'DEBIT', amount: amount.amount, currency: w.currency },
        { account: walletAccount(agentId), direction: 'CREDIT', amount: amount.amount, currency: w.currency },
      ],
    });
  }
}
