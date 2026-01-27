// telegram.service.ts
import { Injectable } from '@angular/core';
import WebApp from '@twa-dev/sdk';

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private tg = WebApp;

  constructor() {
    // Initialize Telegram WebApp
    this.tg.ready();
    this.tg.expand();
  }

  // Get user data
  getUserData() {
    return this.tg.initDataUnsafe.user;
  }

  // Log all user data to console
  logAllUserData() {
    console.group('📱 TELEGRAM MINI APP DATA');
    
    // User Information
    console.group('👤 User Information');
    const user = this.tg.initDataUnsafe.user;
    if (user) {
      console.log('User ID:', user.id);
      console.log('First Name:', user.first_name);
      console.log('Last Name:', user.last_name);
      console.log('Username:', user.username);
      console.log('Language Code:', user.language_code);
      console.log('Is Premium:', user.is_premium);
      console.log('Is Bot:', user.is_bot);
      console.log('Photo URL:', user.photo_url);
      console.log('Added to Attachment Menu:', user.added_to_attachment_menu);
      console.log('Allows Write to PM:', user.allows_write_to_pm);
      console.table(user);
    }
    console.groupEnd();

    // Init Data
    console.group('🔧 Init Data');
    console.log('Query ID:', this.tg.initDataUnsafe.query_id);
    console.log('Auth Date:', this.tg.initDataUnsafe.auth_date);
    console.log('Hash:', this.tg.initDataUnsafe.hash);
    console.log('Start Param:', this.tg.initDataUnsafe.start_param);
    console.log('Chat Type:', this.tg.initDataUnsafe.chat_type);
    console.log('Chat Instance:', this.tg.initDataUnsafe.chat_instance);
    console.log('Full initDataUnsafe:', this.tg.initDataUnsafe);
    console.groupEnd();

    // Platform Info
    console.group('📱 Platform Information');
    console.log('Platform:', this.tg.platform);
    console.log('Version:', this.tg.version);
    console.log('Color Scheme:', this.tg.colorScheme);
    console.log('Is Expanded:', this.tg.isExpanded);
    console.log('Viewport Height:', this.tg.viewportHeight);
    console.log('Viewport Stable Height:', this.tg.viewportStableHeight);
    console.log('Header Color:', this.tg.headerColor);
    console.log('Background Color:', this.tg.backgroundColor);
    console.log('Is Closing Confirmation Enabled:', this.tg.isClosingConfirmationEnabled);
    console.groupEnd();

    // Theme Parameters
    console.group('🎨 Theme Parameters');
    console.table(this.tg.themeParams);
    console.groupEnd();

    console.groupEnd();

    return {
      user: this.tg.initDataUnsafe.user,
      platform: this.tg.platform,
      version: this.tg.version,
      colorScheme: this.tg.colorScheme
    };
  }

  // Request phone number
//   requestPhoneNumber(): Promise<string> {
//     return new Promise((resolve, reject) => {
//       this.tg.requestContact((sent) => {
//         if (sent) {
//           console.log('Contact request sent successfully');
          
//           // Listen for contact data
//           const contact = this.tg.initDataUnsafe.user;
//           if (contact) {
//             console.log('Contact data:', contact);
//           }
          
//           resolve('Request sent');
//         } else {
//           console.log('User declined to share contact');
//           reject('User declined');
//         }
//       });
//     });
//   }

requestPhoneNumberDirect(): Promise<{ phone: string; contact: any }> {
    return new Promise((resolve, reject) => {
      console.log('📞 Requesting contact (Direct API)...');
      
      try {
        // Request contact with proper callback structure
        (window as any).Telegram.WebApp.requestContact((result: any) => {
          console.log('Direct API callback result:', result);
          
          if (result && result.contact) {
            const contact = result.contact;
            console.log('✅ Phone received:', contact.phone_number);
            
            resolve({
              phone: contact.phone_number,
              contact: contact
            });
          } else if (result === false) {
            console.log('❌ User declined');
            reject('User declined');
          } else {
            console.log('⚠️ Unexpected result:', result);
            reject('Unexpected response format');
          }
        });
      } catch (error) {
        console.error('Error calling requestContact:', error);
        reject(error);
      }
    });
  }

  // Get WebApp instance
  getWebApp() {
    return this.tg;
  }

  // Show main button
  showMainButton(text: string, onClick: () => void) {
    this.tg.MainButton.setText(text);
    this.tg.MainButton.onClick(onClick);
    this.tg.MainButton.show();
  }

  // Hide main button
  hideMainButton() {
    this.tg.MainButton.hide();
  }

  // Show alert
  showAlert(message: string) {
    this.tg.showAlert(message);
  }

  // Show confirm
  showConfirm(message: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.tg.showConfirm(message, resolve);
    });
  }

  // Show popup
  showPopup(params: {
    title?: string;
    message: string;
    buttons?: Array<{ id?: string; type?: string; text?: string }>;
  }) {
    return new Promise((resolve) => {
    //   this.tg.showPopup(params, resolve);
    });
  }

  // Send data to bot
  sendData(data: any) {
    this.tg.sendData(JSON.stringify(data));
  }

  // Close WebApp
  close() {
    this.tg.close();
  }
}
