import { HttpContextToken } from '@angular/common/http';
import { AuthenticatedInvestor, AuthTokens } from '../models/blue-ledger.models';

export const AUTH_API_BASE_URL = 'https://dummyjson.com/auth';

export const SKIP_AUTH_INTERCEPTOR = new HttpContextToken<boolean>(() => false);
export const SKIP_AUTH_REFRESH = new HttpContextToken<boolean>(() => false);

type UnknownRecord = Record<string, unknown>;

export function parseAuthTokens(value: unknown): AuthTokens | null {
  if (!isRecord(value)) {
    return null;
  }

  const accessToken = asString(value['accessToken']);
  const refreshToken = asString(value['refreshToken']);
  return accessToken && refreshToken ? { accessToken, refreshToken } : null;
}

export function parseInvestor(value: unknown): AuthenticatedInvestor | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = value['id'];
  const username = asString(value['username']);
  const firstName = asString(value['firstName']);
  const lastName = asString(value['lastName']);
  const email = asString(value['email']);
  const image = asString(value['image']);

  if (
    typeof id !== 'number' ||
    !Number.isFinite(id) ||
    !username ||
    !firstName ||
    !lastName ||
    !email ||
    !image
  ) {
    return null;
  }

  return { id, username, firstName, lastName, email, image };
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value : null;
}
