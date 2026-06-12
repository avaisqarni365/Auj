import { describe, it, expect } from 'vitest';
import { PACKAGE } from './index';

describe('@auj/ui', () => {
  it('is wired into the workspace', () => {
    expect(PACKAGE).toBe('@auj/ui');
  });
});
