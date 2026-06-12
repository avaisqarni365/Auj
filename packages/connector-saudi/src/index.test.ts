import { describe, it, expect } from 'vitest';
import { PACKAGE } from './index';

describe('@auj/connector-saudi', () => {
  it('is wired into the workspace', () => {
    expect(PACKAGE).toBe('@auj/connector-saudi');
  });
});
