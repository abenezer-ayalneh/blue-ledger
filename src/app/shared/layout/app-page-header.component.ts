import { ChangeDetectionStrategy, Component, input, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  ActionSheetController,
  AlertController,
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonHeader,
  IonIcon,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { ellipsisHorizontal, logOutOutline } from 'ionicons/icons';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'app-page-header',
  imports: [
    IonAvatar,
    IonBackButton,
    IonButton,
    IonButtons,
    IonHeader,
    IonIcon,
    IonTitle,
    IonToolbar,
  ],
  templateUrl: './app-page-header.component.html',
  styleUrl: './app-page-header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppPageHeaderComponent {
  readonly auth = inject(AuthStore);
  private readonly actionSheetController = inject(ActionSheetController);
  private readonly alertController = inject(AlertController);
  private readonly router = inject(Router);

  readonly title = input('BlueLedger');
  readonly backHref = input<string | null>(null);
  readonly compact = input(false);
  readonly avatarFailed = signal(false);

  constructor() {
    addIcons({ ellipsisHorizontal, logOutOutline });
  }

  async showAccountActions(): Promise<void> {
    const sheet = await this.actionSheetController.create({
      header: this.auth.displayName(),
      subHeader: this.auth.investor()?.email ?? 'BlueLedger account',
      buttons: [
        {
          text: 'Sign out',
          icon: 'log-out-outline',
          role: 'destructive',
          handler: () => void this.confirmSignOut(),
        },
        { text: 'Cancel', role: 'cancel' },
      ],
    });
    await sheet.present();
  }

  onAvatarError(): void {
    this.avatarFailed.set(true);
  }

  async confirmSignOut(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Sign out of BlueLedger?',
      message:
        'Your portfolio plan stays in this browser tab, but the mock session will be cleared.',
      buttons: [
        { text: 'Stay signed in', role: 'cancel' },
        {
          text: 'Sign out',
          role: 'destructive',
          handler: () => void this.signOut(),
        },
      ],
    });
    await alert.present();
  }

  private async signOut(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }
}
