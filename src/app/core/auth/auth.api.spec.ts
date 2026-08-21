import { describe, expect, it } from 'vitest';
import { parseAuthTokens, parseInvestor } from './auth.api';

describe('DummyJSON payload parsing', () => {
  it('accepts a complete token contract', () => {
    expect(parseAuthTokens({ accessToken: 'access', refreshToken: 'refresh' })).toEqual({
      accessToken: 'access',
      refreshToken: 'refresh',
    });
  });

  it('rejects malformed token payloads without throwing', () => {
    expect(parseAuthTokens({ accessToken: 'access' })).toBeNull();
    expect(parseAuthTokens('tokens')).toBeNull();
  });

  it('accepts only a complete investor contract', () => {
    const investor = parseInvestor({
      id: 1,
      username: 'emilys',
      firstName: 'Emily',
      lastName: 'Johnson',
      email: 'emily@example.com',
      image: 'https://example.com/avatar.png',
    });

    expect(investor?.username).toBe('emilys');
    expect(parseInvestor({ ...investor, id: '1' })).toBeNull();
  });
});
