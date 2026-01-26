import { Component, OnInit } from '@angular/core';

declare global {
  interface Window {
    Telegram: any;
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {  // Add OnInit interface
  title = 'wep-app-test';

  user: any;
  phoneNumber: string = '';
  tg: any;

  ngOnInit() {
    // Check if Telegram WebApp is available
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();

      // Get user data
      if (this.tg.initDataUnsafe?.user) {
        this.user = this.tg.initDataUnsafe.user;
        localStorage.setItem('tg_user', JSON.stringify(this.user));
      } else {
        const savedUser = localStorage.getItem('tg_user');
        if (savedUser) {
          this.user = JSON.parse(savedUser);
        }
      }

      // Show main button
      this.tg.MainButton.text = 'Share Phone Number';
      this.tg.MainButton.show();
      this.tg.MainButton.onClick(() => {
        this.requestPhone();
      });
    } else {
      console.warn('Telegram WebApp not available');
    }
  }

  requestPhone() {
    if (!this.tg) {
      console.error('Telegram WebApp not initialized');
      return;
    }

    this.tg.requestContact((result: any) => {
      console.log('Contact result:', result);
      
      if (result && result.responseUnsafe?.contact) {
        this.phoneNumber = result.responseUnsafe.contact.phone_number;
        this.user.push('phone_number',this.phoneNumber)
        // Save to localStorage
        localStorage.setItem('tg_phone', this.phoneNumber);
        
        // Hide button after getting phone
        this.tg.MainButton.hide();
        
        // Show success message
        this.tg.showAlert(`Phone number received: ${this.phoneNumber}`);
        
        // Send to bot
        this.tg.sendData(JSON.stringify({
          phone: this.phoneNumber,
          userId: this.user?.id || this.tg.initDataUnsafe.user?.id
        }));
      } else {
        console.log('User cancelled or no contact data');
        this.tg.showAlert('Phone number not shared');
      }
    });
  }
}