import { describe, it, expect } from 'vitest';
import type { Pilgrim } from '@auj/contracts';
import { routeFor, routeForGroup } from './router';
import { DEFAULT_VISA_CONFIG, type VisaConfig } from './config';

const pilgrim = (over: Partial<Pilgrim>): Pilgrim => ({
  id: 'p',
  firstName: 'A',
  lastName: 'B',
  passportNumber: 'X1',
  nationality: 'PK',
  dob: '1990-01-01',
  gender: 'M',
  ...over,
});

describe('routeFor — nationality branch', () => {
  it('eligible nationality -> EVISA_DIRECT, no warnings', () => {
    const r = routeFor(pilgrim({ nationality: 'LT' }));
    expect(r.route).toBe('EVISA_DIRECT');
    expect(r.warnings).toEqual([]);
  });

  it('non-eligible nationality, no residence -> AGENT_CHANNEL', () => {
    expect(routeFor(pilgrim({ nationality: 'PK' })).route).toBe('AGENT_CHANNEL');
  });

  it('nationality is case-insensitive', () => {
    expect(routeFor(pilgrim({ nationality: 'lt' })).route).toBe('EVISA_DIRECT');
  });
});

describe('routeFor — residence branch', () => {
  it('PK passport + Schengen residence permit -> EVISA_DIRECT', () => {
    expect(
      routeFor(pilgrim({ nationality: 'PK', residenceCountry: 'DE', residencePermit: true })).route,
    ).toBe('EVISA_DIRECT');
  });

  it('residence country set but permit not held -> AGENT_CHANNEL', () => {
    expect(
      routeFor(pilgrim({ nationality: 'PK', residenceCountry: 'DE', residencePermit: false })).route,
    ).toBe('AGENT_CHANNEL');
  });

  it('GCC residence permit qualifies -> EVISA_DIRECT', () => {
    expect(
      routeFor(pilgrim({ nationality: 'PK', residenceCountry: 'AE', residencePermit: true })).route,
    ).toBe('EVISA_DIRECT');
  });

  it('residence country is case-insensitive', () => {
    expect(
      routeFor(pilgrim({ nationality: 'PK', residenceCountry: 'us', residencePermit: true })).route,
    ).toBe('EVISA_DIRECT');
  });

  it('non-qualifying residence -> AGENT_CHANNEL', () => {
    expect(
      routeFor(pilgrim({ nationality: 'PK', residenceCountry: 'PK', residencePermit: true })).route,
    ).toBe('AGENT_CHANNEL');
  });
});

describe('routeFor — dual nationals', () => {
  it('prefers the eligible nationality', () => {
    const r = routeFor(pilgrim({ nationality: 'PK' }), { additionalNationalities: ['GB'] });
    expect(r.route).toBe('EVISA_DIRECT');
  });

  it('both non-eligible -> AGENT_CHANNEL', () => {
    const r = routeFor(pilgrim({ nationality: 'PK' }), { additionalNationalities: ['IN'] });
    expect(r.route).toBe('AGENT_CHANNEL');
  });
});

describe('routeFor — missing data safe default', () => {
  it('empty nationality -> AGENT_CHANNEL + warning', () => {
    const r = routeFor(pilgrim({ nationality: '' }));
    expect(r.route).toBe('AGENT_CHANNEL');
    expect(r.warnings).toHaveLength(1);
    expect(r.warnings[0]).toContain('Missing nationality');
  });
});

describe('routeFor — seasonal suspensions (warn, not block)', () => {
  const config: VisaConfig = {
    ...DEFAULT_VISA_CONFIG,
    seasonalSuspensions: [
      { nationalities: ['PK'], from: '2026-05-01', to: '2026-06-15', reason: 'Hajj-prep window' },
    ],
  };

  it('inside window -> route unchanged, warning added', () => {
    const r = routeFor(pilgrim({ nationality: 'PK' }), { config, today: '2026-06-01' });
    expect(r.route).toBe('AGENT_CHANNEL'); // not hard-blocked
    expect(r.warnings.some((w) => w.includes('Seasonal suspension'))).toBe(true);
  });

  it('outside window -> no warning', () => {
    const r = routeFor(pilgrim({ nationality: 'PK' }), { config, today: '2026-07-01' });
    expect(r.warnings).toEqual([]);
  });

  it('suspension never overrides an eligible route, only warns', () => {
    const r = routeFor(pilgrim({ nationality: 'LT' }), {
      config: {
        ...DEFAULT_VISA_CONFIG,
        seasonalSuspensions: [
          { nationalities: ['LT'], from: '2026-01-01', to: '2026-12-31', reason: 'test' },
        ],
      },
      today: '2026-06-01',
    });
    expect(r.route).toBe('EVISA_DIRECT');
    expect(r.warnings).toHaveLength(1);
  });
});

describe('config-only updates change behaviour without code changes', () => {
  it('adding a nationality to the eligible set flips the route', () => {
    const config: VisaConfig = {
      ...DEFAULT_VISA_CONFIG,
      evisaEligibleNationalities: new Set([...DEFAULT_VISA_CONFIG.evisaEligibleNationalities, 'PK']),
    };
    expect(routeFor(pilgrim({ nationality: 'PK' }), { config }).route).toBe('EVISA_DIRECT');
  });
});

describe('routeForGroup', () => {
  it('returns a per-pilgrim route for mixed groups', () => {
    const results = routeForGroup([
      pilgrim({ id: 'a', nationality: 'PK' }),
      pilgrim({ id: 'b', nationality: 'LT' }),
    ]);
    expect(results.map((r) => ({ pilgrimId: r.pilgrimId, route: r.route, warnings: r.warnings }))).toEqual([
      { pilgrimId: 'a', route: 'AGENT_CHANNEL', warnings: [] },
      { pilgrimId: 'b', route: 'EVISA_DIRECT', warnings: [] },
    ]);
    expect(results.every((r) => r.trace.length === 3)).toBe(true); // each carries its trace
  });
});

describe('routeFor — decision trace', () => {
  it('emits nationality/residence/seasonal steps with correct pass flags', () => {
    const r = routeFor(pilgrim({ nationality: 'LT' }));
    expect(r.trace.map((t) => t.check)).toEqual(['nationality', 'residence', 'seasonal']);
    expect(r.trace.find((t) => t.check === 'nationality')?.pass).toBe(true); // LT is e-visa eligible
    expect(r.trace.find((t) => t.check === 'residence')?.pass).toBe(false);
    expect(r.trace.find((t) => t.check === 'seasonal')?.pass).toBe(false);
  });

  it('residence step passes when a qualifying permit is held', () => {
    const r = routeFor(pilgrim({ nationality: 'PK', residenceCountry: 'DE', residencePermit: true }));
    expect(r.trace.find((t) => t.check === 'residence')?.pass).toBe(true);
    expect(r.trace.find((t) => t.check === 'nationality')?.pass).toBe(false);
  });

  it('missing nationality yields a single failed-nationality trace step', () => {
    const r = routeFor(pilgrim({ nationality: '' }));
    expect(r.route).toBe('AGENT_CHANNEL');
    expect(r.trace).toEqual([{ check: 'nationality', pass: false, detail: expect.stringContaining('No nationality') }]);
  });

  it('seasonal step passes (warns) inside a suspension window, route unchanged', () => {
    const config = {
      evisaEligibleNationalities: new Set(['LT']),
      residenceQualifiers: new Set<string>(),
      seasonalSuspensions: [{ nationalities: ['LT'], from: '2026-01-01', to: '2026-12-31', reason: 'test' }],
    };
    const r = routeFor(pilgrim({ nationality: 'LT' }), { config, today: '2026-06-01' });
    expect(r.route).toBe('EVISA_DIRECT'); // unchanged
    expect(r.trace.find((t) => t.check === 'seasonal')?.pass).toBe(true);
  });
});
