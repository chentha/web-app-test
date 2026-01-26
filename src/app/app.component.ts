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

      console.log('Full initData:', this.tg.initData);
      console.log('Full initDataUnsafe:', this.tg.initDataUnsafe);

      // Get user info
      if (this.tg.initDataUnsafe?.user) {
        this.user = this.tg.initDataUnsafe.user;
        localStorage.setItem('tg_user', JSON.stringify(this.user));
        
        // ✅ Try to get phone from user object
        if (this.user.phone_number) {
          this.phoneNumber = this.user.phone_number;
          localStorage.setItem('tg_phone', JSON.stringify(this.phoneNumber));
          console.log('Phone from user object:', this.phoneNumber);
        }
      }

      // ✅ Check if contact/phone is in initDataUnsafe
      if (this.tg.initDataUnsafe?.contact) {
        this.phoneNumber = this.tg.initDataUnsafe.contact.phone_number;
        localStorage.setItem('tg_phone', JSON.stringify(this.phoneNumber));
        console.log('Phone from contact:', this.phoneNumber);
      }

      // ✅ Parse initData string for phone
      if (!this.phoneNumber && this.tg.initData) {
        const phoneMatch = this.tg.initData.match(/phone_number=([^&]+)/);
        if (phoneMatch) {
          this.phoneNumber = decodeURIComponent(phoneMatch[1]);
          localStorage.setItem('tg_phone', JSON.stringify(this.phoneNumber));
          console.log('Phone from initData string:', this.phoneNumber);
        }
      }

      // ✅ Check localStorage as fallback
      if (!this.phoneNumber) {
        const savedPhone = localStorage.getItem('tg_phone');
        if (savedPhone) {
          this.phoneNumber = JSON.parse(savedPhone);
          console.log('Phone from localStorage:', this.phoneNumber);
        }
      }

      // If still no phone, show button to request it
      if (!this.phoneNumber) {
        this.showPhoneRequestButton();
      }
    } else {
      console.error('Telegram WebApp not available');
    }
  }

  showPhoneRequestButton() {
    this.tg.MainButton.text = '📱 Share Phone Number';
    this.tg.MainButton.color = '#0088cc';
    this.tg.MainButton.textColor = '#ffffff';
    this.tg.MainButton.show();
    this.tg.MainButton.onClick(() => {
      // Inform user to use bot
      this.tg.showAlert('Please restart the bot with /start and share your phone number');
      this.tg.close();
    });
  }
}