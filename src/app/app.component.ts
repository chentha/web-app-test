import { Component, OnInit } from '@angular/core';
import { TelegramService } from './core/telegram.service';

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
  // title = 'wep-app-test';
  // user: any;
  // phoneNumber: string = '';
  // tg: any;

  // ngOnInit() {
  //   if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
  //     this.tg = window.Telegram.WebApp;
  //     this.tg.ready();
  //     this.tg.expand();

  //     console.log('Telegram WebApp version:', this.tg.version);
  //     console.log('Available methods:', this.tg);

  //     if (this.tg.initDataUnsafe?.user) {
  //       this.user = this.tg.initDataUnsafe.user;
  //       localStorage.setItem('tg_user', JSON.stringify(this.user));
  //     } else {
  //       const savedUser = localStorage.getItem('tg_user');
  //       if (savedUser) {
  //         this.user = JSON.parse(savedUser);
  //       }
        
  //     }

  //     // Show main button
  //     this.tg.MainButton.text = 'Share Phone Number';
  //     this.tg.MainButton.color = '#0088cc';
  //     this.tg.MainButton.textColor = '#ffffff';
  //     this.tg.MainButton.show();
  //     this.tg.MainButton.onClick(() => {
  //       this.requestPhone();
  //     });
  //   } else {
  //     console.error('Telegram WebApp not available');
  //   }
  // }

  // requestPhone() {
  //   console.log('requestPhone called');
    
  //   // Method 1: Check if requestContact exists
  //   if (typeof this.tg.requestContact === 'function') {
  //     console.log('Using requestContact');
  //     this.tg.requestContact((result: any) => {
  //       console.log('Contact result:', result);
        
  //       if (result && result.responseUnsafe?.contact) {
  //         this.phoneNumber = result.responseUnsafe.contact.phone_number;
  //         localStorage.setItem('tg_phone', this.phoneNumber);
          
  //         this.tg.MainButton.hide();
  //         this.tg.showAlert(`Phone: ${this.phoneNumber}`);
          
  //         this.tg.sendData(JSON.stringify({
  //           phone: this.phoneNumber,
  //           userId: this.user?.id
  //         }));
  //       } else {
  //         console.log('User cancelled or no data');
  //         this.tg.showAlert('Phone not shared');
  //       }
  //     });
  //   } 
  //   // Method 2: Try requestWriteAccess first
  //   else if (typeof this.tg.requestWriteAccess === 'function') {
  //     console.log('Using requestWriteAccess');
  //     this.tg.requestWriteAccess((granted: boolean) => {
  //       if (granted) {
  //         this.tg.showAlert('Access granted! But phone request not available in this version.');
  //       } else {
  //         this.tg.showAlert('Access denied');
  //       }
  //     });
  //   }
  //   // Method 3: Fallback - use KeyboardButton in bot
  //   else {
  //     console.log('requestContact not available');
  //     this.tg.showAlert('Please update your Telegram app or use the bot button to share phone');
  //     this.tg.close();
  //   }
  // }

  

  userData: any = null;
  phoneNumber: string | null = null;
  contactInfo: any = null;
  phoneTimestamp: Date | null = null;
  storageData: any = {};
  showStorage: boolean = false;
  isRequesting: boolean = false;
  requestStatus: { type: string; message: string } | null = null;

  constructor(private telegramService: TelegramService) {}

  ngOnInit() {
    this.loadFromStorage();
    this.userData = this.telegramService.getUserData();
    this.saveUserDataToStorage();
    console.log('🚀 App initialized');
  }

  loadFromStorage() {
    const savedPhone = localStorage.getItem('telegram_phone_number');
    if (savedPhone) {
      this.phoneNumber = savedPhone;
      console.log('📱 Loaded phone from storage:', savedPhone);
    }

    const savedContact = localStorage.getItem('telegram_contact');
    if (savedContact) {
      this.contactInfo = JSON.parse(savedContact);
    }

    const savedTimestamp = localStorage.getItem('phone_timestamp');
    if (savedTimestamp) {
      this.phoneTimestamp = new Date(savedTimestamp);
    }

    const savedUserData = localStorage.getItem('telegram_user_data');
    if (savedUserData) {
      this.userData = JSON.parse(savedUserData);
    }
  }

  saveUserDataToStorage() {
    if (this.userData) {
      localStorage.setItem('telegram_user_data', JSON.stringify(this.userData));
      console.log('💾 User data saved to storage');
    }
  }

  savePhoneToStorage(phone: string, contact: any) {
    this.phoneNumber = phone;
    this.contactInfo = contact;
    this.phoneTimestamp = new Date();

    localStorage.setItem('telegram_phone_number', phone);
    localStorage.setItem('telegram_contact', JSON.stringify(contact));
    localStorage.setItem('phone_timestamp', this.phoneTimestamp.toISOString());
    
    console.log('✅ Phone data saved to localStorage');
    this.updateStorageData();
  }

  updateStorageData() {
    this.storageData = {
      userData: this.userData,
      phoneNumber: this.phoneNumber,
      contactInfo: this.contactInfo,
      phoneTimestamp: this.phoneTimestamp,
      storageKeys: Object.keys(localStorage)
    };
  }

  // Method 1: Using SDK
  async requestPhone() {
    if (this.isRequesting) return;
    
    this.isRequesting = true;
    this.requestStatus = null;
    
    try {
      console.log('🔄 Requesting phone number...');
      
      const result = await this.telegramService.requestPhoneNumberDirect();
      
      console.log('✅ SUCCESS! Phone received:', result.phone);
      console.log('📋 Contact info:', result.contact);
      
      // Save to component state and localStorage
      this.savePhoneToStorage(result.phone, result.contact);
      
      // Show success status
      this.requestStatus = {
        type: 'success',
        message: `✅ Phone number received: ${result.phone}`
      };
      
      // Show Telegram alert
      this.telegramService.showAlert(`✅ Phone: ${result.phone}`);
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      
      this.requestStatus = {
        type: 'error',
        message: `❌ ${error}`
      };
      
      this.telegramService.showAlert(`❌ ${error}`);
      
    } finally {
      this.isRequesting = false;
    }
  }

  // Method 2: Using Direct API
  async requestPhoneDirect() {
    if (this.isRequesting) return;
    
    this.isRequesting = true;
    this.requestStatus = null;
    
    try {
      console.log('🔄 Requesting phone (Direct API)...');
      
      const result = await this.telegramService.requestPhoneNumberDirect();
      
      console.log('✅ Phone received:', result.phone);
      
      this.savePhoneToStorage(result.phone, result.contact);
      
      this.requestStatus = {
        type: 'success',
        message: `✅ Phone: ${result.phone}`
      };
      
      this.telegramService.showAlert(`✅ Success: ${result.phone}`);
      
    } catch (error: any) {
      console.error('❌ Error:', error);
      
      this.requestStatus = {
        type: 'error',
        message: `❌ ${error}`
      };
      
      this.telegramService.showAlert(`❌ ${error}`);
      
    } finally {
      this.isRequesting = false;
    }
  }

  showStoredData() {
    this.showStorage = !this.showStorage;
    this.updateStorageData();
    console.log('📦 Storage data:', this.storageData);
  }

  clearAllData() {
    if (confirm('⚠️ Clear all data including phone number?')) {
      localStorage.clear();
      this.phoneNumber = null;
      this.contactInfo = null;
      this.phoneTimestamp = null;
      this.requestStatus = null;
      this.storageData = {};
      
      console.log('🗑️ All data cleared');
      this.telegramService.showAlert('🗑️ All data cleared!');
    }
  }

}
