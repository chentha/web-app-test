import { Component } from '@angular/core';

declare const Telegram: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'wep-app-test';

  tgUser: any;

  ngOnInit() {
    // Telegram WebApp object
    this.tgUser = Telegram.WebApp.initDataUnsafe.user; // user info
    console.log('Telegram User:', this.tgUser);

  }
}
