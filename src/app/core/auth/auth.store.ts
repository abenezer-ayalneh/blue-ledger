import { HttpClient, HttpContext, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthCredentials, AuthStatus, AuthenticatedInvestor } from '../models/blue-ledger.models';
import { SessionStorageService } from '../storage/session-storage.service';
import {
  AUTH_API_BASE_URL,
  SKIP_AUTH_INTERCEPTOR,
  SKIP_AUTH_REFRESH,
  parseAuthTokens,
  parseInvestor,
} from './auth.api';

const REFRESH_TOKEN_KEY = 'blueledger.auth.refresh-token.v1';

interface StoredRefreshToken {
  readonly version: 1;
  readonly value: string;
}

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly http = inject(HttpClient);
  private readonly storage = inject(SessionStorageService);

  private readonly statusState = signal<AuthStatus>('checking');
  private readonly investorState = signal<AuthenticatedInvestor | null>(null);
  private readonly accessTokenState = signal<string | null>(null);
  private readonly errorState = signal<string | null>(null);
  private refreshPromise: Promise<boolean> | null = null;

  readonly status = this.statusState.asReadonly();
  readonly investor = this.investorState.asReadonly();
  readonly accessToken = this.accessTokenState.asReadonly();
  readonly error = this.errorState.asReadonly();
  readonly isAuthenticated = computed(() => this.statusState() === 'authenticated');
  readonly displayName = computed(() => {
    const investor = this.investorState();
    return investor ? `${investor.firstName} ${investor.lastName}` : 'Investor';
  });
  readonly initials = computed(() => {
    const investor = this.investorState();
    return investor ? `${investor.firstName.at(0) ?? ''}${investor.lastName.at(0) ?? ''}` : 'BL';
  });

  async restore(): Promise<void> {
    const refreshToken = this.readRefreshToken();
    if (!refreshToken) {
      this.statusState.set('anonymous');
      return;
    }

    this.statusState.set('checking');
    const restored = await this.refreshAccessToken();
    if (!restored) {
      this.clearSession();
    }
  }

  async login(credentials: AuthCredentials): Promise<boolean> {
    this.statusState.set('authenticating');
    this.errorState.set(null);

    try {
      const response = await firstValueFrom(
        this.http.post<unknown>(
          `${AUTH_API_BASE_URL}/login`,
          { ...credentials, expiresInMins: 30 },
          { context: new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true) },
        ),
      );
      const tokens = parseAuthTokens(response);
      if (!tokens) {
        throw new Error('The login service returned an invalid session.');
      }

      this.accessTokenState.set(tokens.accessToken);
      this.writeRefreshToken(tokens.refreshToken);
      const userLoaded = await this.fetchInvestor();
      if (!userLoaded) {
        this.clearSession();
        return false;
      }

      this.statusState.set('authenticated');
      return true;
    } catch (error: unknown) {
      this.errorState.set(toAuthMessage(error));
      this.statusState.set('anonymous');
      return false;
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performRefresh();
    try {
      return await this.refreshPromise;
    } finally {
      this.refreshPromise = null;
    }
  }

  async logout(): Promise<void> {
    this.clearSession();
  }

  private async performRefresh(): Promise<boolean> {
    const refreshToken = this.readRefreshToken();
    if (!refreshToken) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<unknown>(
          `${AUTH_API_BASE_URL}/refresh`,
          { refreshToken, expiresInMins: 30 },
          { context: new HttpContext().set(SKIP_AUTH_INTERCEPTOR, true) },
        ),
      );
      const tokens = parseAuthTokens(response);
      if (!tokens) {
        return false;
      }

      this.accessTokenState.set(tokens.accessToken);
      this.writeRefreshToken(tokens.refreshToken);
      const userLoaded = await this.fetchInvestor(true);
      if (userLoaded) {
        this.statusState.set('authenticated');
        this.errorState.set(null);
      }
      return userLoaded;
    } catch {
      return false;
    }
  }

  private async fetchInvestor(skipRefreshOnUnauthorized = false): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.get<unknown>(`${AUTH_API_BASE_URL}/me`, {
          context: skipRefreshOnUnauthorized
            ? new HttpContext().set(SKIP_AUTH_REFRESH, true)
            : undefined,
        }),
      );
      const investor = parseInvestor(response);
      if (!investor) {
        this.errorState.set('BlueLedger could not read the user profile returned by the demo API.');
        return false;
      }

      this.investorState.set(investor);
      return true;
    } catch (error: unknown) {
      this.errorState.set(toAuthMessage(error));
      return false;
    }
  }

  private readRefreshToken(): string | null {
    const stored = this.storage.get(REFRESH_TOKEN_KEY);
    if (!isStoredRefreshToken(stored)) {
      this.storage.remove(REFRESH_TOKEN_KEY);
      return null;
    }
    return stored.value;
  }

  private writeRefreshToken(value: string): void {
    this.storage.set(REFRESH_TOKEN_KEY, { version: 1, value } satisfies StoredRefreshToken);
  }

  private clearSession(): void {
    this.accessTokenState.set(null);
    this.investorState.set(null);
    this.storage.remove(REFRESH_TOKEN_KEY);
    this.statusState.set('anonymous');
  }
}

function isStoredRefreshToken(value: unknown): value is StoredRefreshToken {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    candidate['version'] === 1 &&
    typeof candidate['value'] === 'string' &&
    candidate['value'].length > 0
  );
}

function toAuthMessage(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 400 || error.status === 401) {
      return 'Those credentials were not accepted. Try the demo account or another DummyJSON user.';
    }
    if (error.status === 0) {
      return 'BlueLedger could not reach the demo API. Check your connection and try again.';
    }
  }
  return error instanceof Error ? error.message : 'BlueLedger could not complete that request.';
}
