import { Component } from '@angular/core';

declare const Telegram: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'wep-app-test';

  user: any;

  ngOnInit() {
    const tg = Telegram.WebApp;

    // Expand mini app
    tg.expand();

    // Get user session info
    this.user = tg.initDataUnsafe?.user;

    console.log('Telegram user:', this.user);
  }
}
