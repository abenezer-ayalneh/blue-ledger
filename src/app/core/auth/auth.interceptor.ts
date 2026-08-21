import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpContextToken,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';
import { AuthStore } from './auth.store';
import { AUTH_API_BASE_URL, SKIP_AUTH_INTERCEPTOR, SKIP_AUTH_REFRESH } from './auth.api';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn,
): Observable<HttpEvent<unknown>> => {
  if (request.context.get(SKIP_AUTH_INTERCEPTOR) || !request.url.startsWith(AUTH_API_BASE_URL)) {
    return next(request);
  }

  const authStore = inject(AuthStore);
  const token = authStore.accessToken();
  const authorizedRequest = token
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authorizedRequest).pipe(
    catchError((error: unknown) => {
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401 ||
        request.context.get(RETRIED_AUTH) ||
        request.context.get(SKIP_AUTH_REFRESH)
      ) {
        return throwError(() => error);
      }

      return from(authStore.refreshAccessToken()).pipe(
        switchMap((refreshed) => {
          if (!refreshed || !authStore.accessToken()) {
            return throwError(() => error);
          }

          return next(
            request.clone({
              context: request.context.set(RETRIED_AUTH, true),
              setHeaders: { Authorization: `Bearer ${authStore.accessToken()}` },
            }),
          );
        }),
      );
    }),
  );
};

const RETRIED_AUTH = new HttpContextToken<boolean>(() => false);
