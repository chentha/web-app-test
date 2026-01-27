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

  

  phoneNumber: string | null = null;
  contactInfo: any = null;
  isRequesting: boolean = false;
  statusMessage: string = '';
  statusType: string = '';
  consoleLog: Array<{ time: string; message: string; type: string }> = [];
  
  // All data object
  allData: any = {};

  constructor(private telegramService: TelegramService) {}

  ngOnInit() {
    this.addLog('App initialized', 'info');
    this.loadFromStorage();
    this.updateAllData();
  }

  updateAllData() {
    const webApp = this.telegramService.getWebApp();
    const user = webApp.initDataUnsafe?.user || null;
    this.allData = {
      timestamp: new Date().toISOString(),
      phoneData: {
        phoneNumber: this.phoneNumber,
        contactInfo: this.contactInfo,
        savedAt: localStorage.getItem('phone_timestamp')
      },
      telegramUser: {
        id: user?.id || null,
        firstName: user?.first_name || null,
        lastName: user?.last_name || null,
        username: user?.username || null
      },
      telegramPlatform: {
        platform: webApp.platform,
        version: webApp.version,
        colorScheme: webApp.colorScheme,
        isExpanded: webApp.isExpanded,
        viewportHeight: webApp.viewportHeight,
        viewportStableHeight: webApp.viewportStableHeight
      },
      telegramTheme: webApp.themeParams || {},
      telegramInitData: {
        authDate: webApp.initDataUnsafe?.auth_date,
        hash: webApp.initDataUnsafe?.hash,
        queryId: webApp.initDataUnsafe?.query_id,
        startParam: webApp.initDataUnsafe?.start_param,
        chatType: webApp.initDataUnsafe?.chat_type,
        chatInstance: webApp.initDataUnsafe?.chat_instance
      },
      localStorage: {
        keys: Object.keys(localStorage),
        data: this.getLocalStorageData()
      },
      app: {
        isRequesting: this.isRequesting,
        statusMessage: this.statusMessage,
        statusType: this.statusType,
        logsCount: this.consoleLog.length
      }
    }
  }

  getLocalStorageData() {
    const data: any = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          const value = localStorage.getItem(key);
          data[key] = value ? JSON.parse(value) : value;
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    return data;
  }

  addLog(message: string, type: string = 'info') {
    const time = new Date().toLocaleTimeString();
    this.consoleLog.unshift({ time, message, type });
    if (this.consoleLog.length > 50) {
      this.consoleLog.pop();
    }
    console.log(`[${type.toUpperCase()}] ${message}`);
  }

  loadFromStorage() {
    const savedPhone = localStorage.getItem('telegram_phone_number');
    if (savedPhone) {
      this.phoneNumber = savedPhone;
      this.addLog(`Loaded phone from storage: ${savedPhone}`, 'success');
    }

    const savedContact = localStorage.getItem('telegram_contact');
    if (savedContact) {
      try {
        this.contactInfo = JSON.parse(savedContact);
      } catch (e) {
        this.addLog('Error parsing saved contact', 'error');
      }
    }
  }

  savePhone(phone: string, contact: any) {
    this.phoneNumber = phone;
    this.contactInfo = contact;
    
    const timestamp = new Date().toISOString();
    
    localStorage.setItem('telegram_phone_number', phone);
    localStorage.setItem('telegram_contact', JSON.stringify(contact));
    localStorage.setItem('phone_timestamp', timestamp);
    
    this.addLog(`Phone saved: ${phone}`, 'success');
    this.updateAllData();
  }

  async requestMethod1() {
    if (this.isRequesting) return;
    this.isRequesting = true;
    this.statusMessage = '';
    this.addLog('Method 1: Requesting phone...', 'info');
    this.updateAllData();

    try {
      const result = await this.telegramService.requestPhoneNumber();
      this.savePhone(result.phone, result.contact);
      this.statusMessage = `✅ Success: ${result.phone}`;
      this.statusType = 'success';
      this.addLog(`Phone received: ${result.phone}`, 'success');
      this.telegramService.showAlert(`✅ ${result.phone}`);
    } catch (error: any) {
      this.statusMessage = `❌ ${error}`;
      this.statusType = 'error';
      this.addLog(`Error: ${error}`, 'error');
      this.telegramService.showAlert(`❌ ${error}`);
    } finally {
      this.isRequesting = false;
      this.updateAllData();
    }
  }

  async requestMethod2() {
    if (this.isRequesting) return;
    this.isRequesting = true;
    this.statusMessage = '';
    this.addLog('Method 2: Requesting phone with events...', 'info');
    this.updateAllData();

    try {
      const result = await this.telegramService.requestPhoneNumberWithEvent();
      this.savePhone(result.phone, result.contact);
      this.statusMessage = `✅ Success: ${result.phone}`;
      this.statusType = 'success';
      this.addLog(`Phone received: ${result.phone}`, 'success');
      this.telegramService.showAlert(`✅ ${result.phone}`);
    } catch (error: any) {
      this.statusMessage = `❌ ${error}`;
      this.statusType = 'error';
      this.addLog(`Error: ${error}`, 'error');
      this.telegramService.showAlert(`❌ ${error}`);
    } finally {
      this.isRequesting = false;
      this.updateAllData();
    }
  }

  async requestMethod3() {
    if (this.isRequesting) return;
    this.isRequesting = true;
    this.statusMessage = '';
    this.addLog('Method 3: Requesting phone with native API...', 'info');
    this.updateAllData();

    try {
      const result = await this.telegramService.requestPhoneNumberNative();
      this.savePhone(result.phone, result.contact);
      this.statusMessage = `✅ Success: ${result.phone}`;
      this.statusType = 'success';
      this.addLog(`Phone received: ${result.phone}`, 'success');
      this.telegramService.showAlert(`✅ ${result.phone}`);
    } catch (error: any) {
      this.statusMessage = `❌ ${error}`;
      this.statusType = 'error';
      this.addLog(`Error: ${error}`, 'error');
      this.telegramService.showAlert(`❌ ${error}`);
    } finally {
      this.isRequesting = false;
      this.updateAllData();
    }
  }

  refreshData() {
    this.updateAllData();
    this.addLog('Data refreshed', 'info');
    this.telegramService.showAlert('✅ Data refreshed!');
  }

  copyToClipboard() {
    const jsonString = JSON.stringify(this.allData, null, 2);
    navigator.clipboard.writeText(jsonString).then(() => {
      this.addLog('Data copied to clipboard', 'success');
      this.telegramService.showAlert('📋 Copied to clipboard!');
    }).catch(err => {
      this.addLog('Failed to copy: ' + err, 'error');
    });
  }

  clearData() {
    if (confirm('⚠️ Clear all data?')) {
      localStorage.clear();
      this.phoneNumber = null;
      this.contactInfo = null;
      this.statusMessage = '';
      this.consoleLog = [];
      this.updateAllData();
      this.addLog('All data cleared', 'warn');
      this.telegramService.showAlert('🗑️ All data cleared!');
    }
  }

}
