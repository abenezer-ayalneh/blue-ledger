import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SessionStorageService } from '../storage/session-storage.service';
import { SKIP_AUTH_REFRESH } from './auth.api';
import { AuthStore } from './auth.store';

interface StorageDouble {
  readonly get: ReturnType<typeof vi.fn>;
  readonly set: ReturnType<typeof vi.fn>;
  readonly remove: ReturnType<typeof vi.fn>;
}

function createAuthStore(initialRefreshToken: unknown | null = null): {
  readonly store: AuthStore;
  readonly http: HttpTestingController;
  readonly storage: StorageDouble;
} {
  const storage: StorageDouble = {
    get: vi.fn(() => initialRefreshToken),
    set: vi.fn(),
    remove: vi.fn(),
  };

  TestBed.configureTestingModule({
    providers: [
      AuthStore,
      provideHttpClient(),
      provideHttpClientTesting(),
      { provide: SessionStorageService, useValue: storage },
    ],
  });

  return { store: TestBed.inject(AuthStore), http: TestBed.inject(HttpTestingController), storage };
}

function investorPayload(): Record<string, unknown> {
  return {
    id: 1,
    username: 'emilys',
    firstName: 'Emily',
    lastName: 'Johnson',
    email: 'emily@example.com',
    image: 'https://example.com/emily.png',
  };
}

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } finally {
    TestBed.resetTestingModule();
  }
});

describe('AuthStore', () => {
  it('keeps the access token in memory and persists only the refresh token after login', async () => {
    const { store, http, storage } = createAuthStore();
    const login = store.login({ username: 'emilys', password: 'emilyspass' });

    const loginRequest = http.expectOne('https://dummyjson.com/auth/login');
    expect(loginRequest.request.body).toEqual({
      username: 'emilys',
      password: 'emilyspass',
      expiresInMins: 30,
    });
    loginRequest.flush({ accessToken: 'access-token', refreshToken: 'refresh-token' });

    await Promise.resolve();
    http.expectOne('https://dummyjson.com/auth/me').flush(investorPayload());

    await expect(login).resolves.toBe(true);
    expect(store.accessToken()).toBe('access-token');
    expect(store.investor()?.username).toBe('emilys');
    expect(storage.set).toHaveBeenCalledWith('blueledger.auth.refresh-token.v1', {
      version: 1,
      value: 'refresh-token',
    });
  });

  it('restores the refresh-token envelope and then loads the investor', async () => {
    const { store, http } = createAuthStore({ version: 1, value: 'stored-refresh' });
    const restore = store.restore();

    const refreshRequest = http.expectOne('https://dummyjson.com/auth/refresh');
    expect(refreshRequest.request.body).toEqual({
      refreshToken: 'stored-refresh',
      expiresInMins: 30,
    });
    refreshRequest.flush({ accessToken: 'new-access', refreshToken: 'new-refresh' });

    await Promise.resolve();
    const profileRequest = http.expectOne('https://dummyjson.com/auth/me');
    expect(profileRequest.request.context.get(SKIP_AUTH_REFRESH)).toBe(true);
    profileRequest.flush(investorPayload());

    await restore;
    expect(store.isAuthenticated()).toBe(true);
  });

  it('clears an invalid refresh session and stays anonymous', async () => {
    const { store, http, storage } = createAuthStore({ version: 1, value: 'invalid-refresh' });
    const restore = store.restore();

    http
      .expectOne('https://dummyjson.com/auth/refresh')
      .flush({ message: 'Invalid refresh token' }, { status: 401, statusText: 'Unauthorized' });

    await restore;
    expect(store.status()).toBe('anonymous');
    expect(storage.remove).toHaveBeenCalledWith('blueledger.auth.refresh-token.v1');
  });
});
