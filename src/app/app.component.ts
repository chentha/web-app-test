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
    // if (window['Telegram']?.WebApp) {
      this.user = Telegram.WebApp.initDataUnsafe?.user;
      console.log('Telegram user:', this.user);
    // }
  }
}
