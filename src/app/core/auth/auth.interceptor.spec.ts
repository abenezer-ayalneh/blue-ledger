import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthStore } from './auth.store';
import { authInterceptor } from './auth.interceptor';

afterEach(() => {
  try {
    TestBed.inject(HttpTestingController).verify();
  } finally {
    TestBed.resetTestingModule();
  }
});

describe('authInterceptor', () => {
  it('adds an access token, refreshes once, and retries the original request once', async () => {
    const accessToken = signal<string | null>('expired-token');
    const refreshAccessToken = vi.fn(async () => {
      accessToken.set('fresh-token');
      return true;
    });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        {
          provide: AuthStore,
          useValue: { accessToken: accessToken.asReadonly(), refreshAccessToken },
        },
      ],
    });

    const http = TestBed.inject(HttpTestingController);
    const client = TestBed.inject(HttpClient);
    const response = new Promise<unknown>((resolve, reject) => {
      client.get('https://dummyjson.com/auth/me').subscribe({ next: resolve, error: reject });
    });

    const original = http.expectOne('https://dummyjson.com/auth/me');
    expect(original.request.headers.get('Authorization')).toBe('Bearer expired-token');
    original.flush({ message: 'Expired' }, { status: 401, statusText: 'Unauthorized' });

    await Promise.resolve();
    const retried = http.expectOne('https://dummyjson.com/auth/me');
    expect(retried.request.headers.get('Authorization')).toBe('Bearer fresh-token');
    retried.flush({ id: 1 });

    await expect(response).resolves.toEqual({ id: 1 });
    expect(refreshAccessToken).toHaveBeenCalledTimes(1);
  });
});
