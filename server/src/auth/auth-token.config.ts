import type { StringValue } from 'ms';

const TTL_PATTERN = /^(\d+)(s|m|h|d)$/;

type TokenTtlUnit = 's' | 'm' | 'h' | 'd';

const UNIT_MILLISECONDS: Record<TokenTtlUnit, number> = {
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
};

export function getTokenTtl(ttl: string): StringValue {
  getTokenTtlMilliseconds(ttl);
  return ttl as StringValue;
}

export function getTokenTtlMilliseconds(ttl: string): number {
  const match = TTL_PATTERN.exec(ttl);

  if (!match) {
    throw new Error(
      'JWT TTL must be a positive integer followed by s, m, h, or d',
    );
  }

  const [, value, unit] = match;
  const unitMilliseconds = UNIT_MILLISECONDS[unit as TokenTtlUnit];

  return Number(value) * unitMilliseconds;
}
