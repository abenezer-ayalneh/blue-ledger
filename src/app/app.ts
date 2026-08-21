import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp } from '@ionic/angular/standalone';
import { AppShellComponent } from './shell/app-shell.component';

@Component({
  imports: [AppShellComponent, IonApp],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}
