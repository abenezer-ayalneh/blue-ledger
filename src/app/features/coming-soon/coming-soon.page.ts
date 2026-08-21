import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { IonButton, IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  arrowBackOutline,
  settingsOutline,
  shieldCheckmarkOutline,
} from 'ionicons/icons';
import { AppPageHeaderComponent } from '../../shared/layout/app-page-header.component';

@Component({
  selector: 'app-coming-soon-page',
  imports: [AppPageHeaderComponent, IonButton, IonContent, IonIcon, RouterLink],
  templateUrl: './coming-soon.page.html',
  styleUrl: './coming-soon.page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ComingSoonPage {
  readonly title: string;
  readonly icon: string;

  constructor() {
    const route = inject(ActivatedRoute);

    this.title =
      typeof route.snapshot.data['title'] === 'string'
        ? route.snapshot.data['title']
        : 'Coming soon';
    this.icon =
      typeof route.snapshot.data['icon'] === 'string'
        ? route.snapshot.data['icon']
        : 'add-circle-outline';
    addIcons({ addCircleOutline, arrowBackOutline, settingsOutline, shieldCheckmarkOutline });
  }
}
