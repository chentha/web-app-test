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
export class AppComponent implements OnInit {
  title = 'wep-app-test';
  user: any;
  phoneNumber: string = '';
  tg: any;

  ngOnInit() {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      this.tg = window.Telegram.WebApp;
      this.tg.ready();
      this.tg.expand();

      console.log('Telegram WebApp version:', this.tg.version);
      console.log('Available methods:', this.tg);

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
      this.tg.MainButton.color = '#0088cc';
      this.tg.MainButton.textColor = '#ffffff';
      this.tg.MainButton.show();
      this.tg.MainButton.onClick(() => {
        this.requestPhone();
      });
    } else {
      console.error('Telegram WebApp not available');
    }
  }

  requestPhone() {
    console.log('requestPhone called');
    
    // Method 1: Check if requestContact exists
    if (typeof this.tg.requestContact === 'function') {
      console.log('Using requestContact');
      this.tg.requestContact((result: any) => {
        console.log('Contact result:', result);
        
        if (result && result.responseUnsafe?.contact) {
          this.phoneNumber = result.responseUnsafe.contact.phone_number;
          localStorage.setItem('tg_phone', this.phoneNumber);
          
          this.tg.MainButton.hide();
          this.tg.showAlert(`Phone: ${this.phoneNumber}`);
          
          this.tg.sendData(JSON.stringify({
            phone: this.phoneNumber,
            userId: this.user?.id
          }));
        } else {
          console.log('User cancelled or no data');
          this.tg.showAlert('Phone not shared');
        }
      });
    } 
    // Method 2: Try requestWriteAccess first
    else if (typeof this.tg.requestWriteAccess === 'function') {
      console.log('Using requestWriteAccess');
      this.tg.requestWriteAccess((granted: boolean) => {
        if (granted) {
          this.tg.showAlert('Access granted! But phone request not available in this version.');
        } else {
          this.tg.showAlert('Access denied');
        }
      });
    }
    // Method 3: Fallback - use KeyboardButton in bot
    else {
      console.log('requestContact not available');
      this.tg.showAlert('Please update your Telegram app or use the bot button to share phone');
      this.tg.close();
    }
  }
}