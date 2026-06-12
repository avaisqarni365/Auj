import { describe, it, expect } from 'vitest';
import { Ledger } from './ledger';
import { WalletService, InsufficientFundsError } from './wallet';

const EUR = (amount: number) => ({ amount, currency: 'EUR' as const });

function setup() {
  const ledger = new Ledger();
  const wallets = new WalletService(ledger);
  wallets.open({ agentId: 'agentA', currency: 'EUR', creditLimit: 50000 });
  return { ledger, wallets };
}

describe('WalletService', () => {
  it('top-up increases balance; ledger stays balanced', () => {
    const { ledger, wallets } = setup();
    wallets.topUp('agentA', EUR(100000), 'gw_1');
    expect(wallets.balance('agentA')).toBe(100000);
    expect(wallets.available('agentA')).toBe(150000); // + credit limit
    expect(ledger.isBalanced()).toBe(true);
  });

  it('hold reduces available and moves funds to the held account', () => {
    const { wallets } = setup();
    wallets.topUp('agentA', EUR(100000), 'gw_1');
    wallets.hold('agentA', EUR(40000), 'bk_1');
    expect(wallets.balance('agentA')).toBe(60000);
    expect(wallets.held('agentA')).toBe(40000);
  });

  it('enforces the credit limit', () => {
    const { wallets } = setup();
    wallets.topUp('agentA', EUR(10000), 'gw_1'); // balance 10000, available 60000
    expect(() => wallets.hold('agentA', EUR(70000), 'bk_x')).toThrow(InsufficientFundsError);
    // within credit limit is allowed (balance can go negative)
    wallets.hold('agentA', EUR(60000), 'bk_ok');
    expect(wallets.balance('agentA')).toBe(-50000);
    expect(wallets.available('agentA')).toBe(0);
  });

  it('settle consumes the hold; release returns it', () => {
    const { ledger, wallets } = setup();
    wallets.topUp('agentA', EUR(100000), 'gw_1');
    wallets.hold('agentA', EUR(40000), 'bk_1');
    wallets.settle('agentA', EUR(40000), 'bk_1');
    expect(wallets.held('agentA')).toBe(0);

    wallets.hold('agentA', EUR(20000), 'bk_2');
    wallets.releaseHold('agentA', EUR(20000), 'bk_2');
    expect(wallets.held('agentA')).toBe(0);
    expect(wallets.balance('agentA')).toBe(60000); // 100000 - 40000 settled
    expect(ledger.isBalanced()).toBe(true);
  });

  it('rejects currency mismatches', () => {
    const { wallets } = setup();
    expect(() => wallets.topUp('agentA', { amount: 100, currency: 'PKR' }, 'gw')).toThrow(/EUR/);
  });
});
