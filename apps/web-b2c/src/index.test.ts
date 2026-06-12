import { describe, it, expect } from 'vitest';
import { PACKAGE } from './index';

describe('@auj/web-b2c', () => {
  it('is wired into the workspace', () => {
    expect(PACKAGE).toBe('@auj/web-b2c');
  });
});
