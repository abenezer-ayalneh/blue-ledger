import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SessionStorageService {
  private readonly platformId = inject(PLATFORM_ID);

  get(key: string): unknown | null {
    if (!isPlatformBrowser(this.platformId)) {
      return null;
    }

    try {
      const value = sessionStorage.getItem(key);
      return value === null ? null : (JSON.parse(value) as unknown);
    } catch {
      this.remove(key);
      return null;
    }
  }

  set(key: string, value: unknown): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.setItem(key, JSON.stringify(value));
    }
  }

  remove(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem(key);
    }
  }
}
