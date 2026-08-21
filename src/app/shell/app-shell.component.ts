import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  home,
  homeOutline,
  settingsOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AuthStore } from '../core/auth/auth.store';

@Component({
  selector: 'app-shell',
  imports: [IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, RouterLink],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent {
  readonly auth = inject(AuthStore);

  constructor() {
    addIcons({ addOutline, home, homeOutline, settingsOutline, shieldCheckmarkOutline });
  }
}
