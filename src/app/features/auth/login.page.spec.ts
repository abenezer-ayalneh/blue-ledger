import { provideZonelessChangeDetection, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthStore } from '../../core/auth/auth.store';
import { LoginPage } from './login.page';

afterEach(() => {
  TestBed.resetTestingModule();
});

describe('LoginPage in a zoneless Ionic TestBed', () => {
  it('reacts to Ionic input events and the Ionic demo action', async () => {
    const auth = {
      error: signal<string | null>(null).asReadonly(),
      login: vi.fn(async () => true),
    };

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideZonelessChangeDetection(),
        provideIonicAngular({ animated: false, mode: 'ios' }),
        provideRouter([]),
        { provide: AuthStore, useValue: auth },
      ],
    });

    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const usernameInput = fixture.nativeElement.querySelector('ion-input') as HTMLElement;
    usernameInput.dispatchEvent(
      new CustomEvent('ionInput', {
        bubbles: true,
        composed: true,
        detail: { value: 'sample-user' },
      }),
    );
    await fixture.whenStable();
    expect(fixture.componentInstance.username()).toBe('sample-user');

    const demoAction = fixture.nativeElement.querySelector('ion-button.demo-action') as HTMLElement;
    demoAction.click();
    await fixture.whenStable();

    expect(fixture.componentInstance.username()).toBe('emilys');
    expect(fixture.componentInstance.password()).toBe('emilyspass');
  });
});
