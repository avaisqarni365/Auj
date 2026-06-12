import { describe, it, expect } from 'vitest';
import { PACKAGE } from './index';

describe('@auj/compliance', () => {
  it('is wired into the workspace', () => {
    expect(PACKAGE).toBe('@auj/compliance');
  });
});
