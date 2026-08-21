import { ChangeDetectionStrategy, Component, computed, signal, inject } from '@angular/core';
import { Router } from '@angular/router';
import {
  IonButton,
  IonContent,
  IonIcon,
  IonInput,
  IonInputPasswordToggle,
  IonNote,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowForwardOutline,
  lockClosedOutline,
  peopleOutline,
  personOutline,
} from 'ionicons/icons';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-login-page',
  imports: [IonButton, IonContent, IonIcon, IonInput, IonInputPasswordToggle, IonNote, IonSpinner],
  templateUrl: './login.page.html',
  styleUrl: './login.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  readonly username = signal('');
  readonly password = signal('');
  readonly submitted = signal(false);
  readonly isSubmitting = signal(false);
  readonly formError = signal<string | null>(null);
  readonly canSubmit = computed(
    () => this.username().trim().length > 0 && this.password().length > 0,
  );

  constructor() {
    addIcons({ arrowForwardOutline, lockClosedOutline, peopleOutline, personOutline });
  }

  fillDemo(): void {
    this.username.set('emilys');
    this.password.set('emilyspass');
    this.submitted.set(false);
    this.formError.set(null);
  }

  onUsernameInput(event: Event): void {
    this.username.set(readIonValue(event));
  }

  onPasswordInput(event: Event): void {
    this.password.set(readIonValue(event));
  }

  async signIn(): Promise<void> {
    this.submitted.set(true);
    this.formError.set(null);
    if (!this.canSubmit() || this.isSubmitting()) {
      return;
    }

    this.isSubmitting.set(true);
    const success = await this.auth.login({
      username: this.username().trim(),
      password: this.password(),
    });
    this.isSubmitting.set(false);

    if (success) {
      const returnUrl = this.router.parseUrl(this.router.url).queryParams['returnUrl'];
      await this.router.navigateByUrl(
        isSafeReturnUrl(returnUrl) ? returnUrl : '/app/home/overview',
      );
      return;
    }

    this.formError.set(this.auth.error() ?? 'BlueLedger could not sign you in.');
  }
}

function readIonValue(event: Event): string {
  const detail = event as CustomEvent<{ readonly value?: string | null }>;
  return detail.detail.value ?? '';
}

function isSafeReturnUrl(value: unknown): value is string {
  return typeof value === 'string' && value.startsWith('/app/') && !value.startsWith('//');
}
