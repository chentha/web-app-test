// telegram.service.ts - Robust implementation
import { Injectable } from '@angular/core';
import WebApp from '@twa-dev/sdk';

@Injectable({
  providedIn: 'root'
})
export class TelegramService {
  private tg = WebApp;

  constructor() {
    this.tg.ready();
    this.tg.expand();
  }

  // Method 1: Handle all possible callback formats
  requestPhoneNumber(): Promise<{ phone: string; contact: any }> {
    return new Promise((resolve, reject) => {
      console.log('📞 Requesting contact...');
      
      // The callback receives two parameters: sent (boolean) and event (object)
      this.tg.requestContact((sent: boolean, event: any) => {
        console.log('Callback triggered - sent:', sent);
        console.log('Callback event:', event);
        
        if (sent) {
          console.log('✅ Contact request sent successfully');
          
          // The phone number is in the event parameter, not in initDataUnsafe
          // Access it through event.responseUnsafe.contact
          if (event && event.responseUnsafe && event.responseUnsafe.contact) {
            const contact = event.responseUnsafe.contact;
            
            console.log('📱 Contact data received:', contact);
            console.log('📞 Phone number:', contact.phone_number);
            console.log('👤 First name:', contact.first_name);
            console.log('👤 Last name:', contact.last_name);
            console.log('🆔 User ID:', contact.user_id);
            
            resolve({
              phone: contact.phone_number,
              contact: contact
            });
          } else {
            console.error('❌ Contact data not found in event');
            console.log('Event structure:', JSON.stringify(event, null, 2));
            reject('Contact data not available in response');
          }
        } else {
          console.log('❌ User declined to share contact');
          reject('User declined');
        }
      });
    });
  }
  // Method 2: Using event listeners (more reliable for some versions)
  requestPhoneNumberWithEvent(): Promise<{ phone: string; contact: any }> {
    return new Promise((resolve, reject) => {
      console.log('📞 Requesting contact with event listener...');
      
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          reject('Timeout waiting for contact');
        }
      }, 30000);
      
      // Setup event listener BEFORE requesting
      const handleEvent = (eventData: any) => {
        console.log('📡 Contact event received:', eventData);
        
        if (resolved) return;
        
        clearTimeout(timeout);
        resolved = true;
        
        if (eventData?.contact?.phone_number) {
          console.log('✅ Phone from event:', eventData.contact.phone_number);
          resolve({
            phone: eventData.contact.phone_number,
            contact: eventData.contact
          });
        } else {
          reject('Event received but no contact data');
        }
      };
      
      // Try to attach event listener
      try {
        this.tg.onEvent('contactRequested', handleEvent);
      } catch (e) {
        console.log('Could not attach event listener:', e);
      }
      
      // Make the request
      this.tg.requestContact((sent: any) => {
        console.log('Request callback - sent:', sent);
        
        if (sent === false) {
          if (!resolved) {
            clearTimeout(timeout);
            resolved = true;
            this.tg.offEvent?.('contactRequested', handleEvent);
            reject('User declined');
          }
        }
        // If sent === true, wait for event
      });
    });
  }

  // Method 3: Native JavaScript approach (most compatible)
  requestPhoneNumberNative(): Promise<{ phone: string; contact: any }> {
    return new Promise((resolve, reject) => {
      console.log('📞 Requesting contact (Native approach)...');
      
      const telegram = (window as any).Telegram;
      if (!telegram || !telegram.WebApp) {
        reject('Telegram WebApp not available');
        return;
      }
      
      const webApp = telegram.WebApp;
      console.log('Using native Telegram.WebApp');
      console.log('Version:', webApp.version);
      
      webApp.requestContact((sent: any, data: any) => {
        console.log('=== NATIVE CALLBACK ===');
        console.log('Sent:', sent);
        console.log('Data:', data);
        console.log('Arguments length:', arguments.length);
        console.log('All arguments:', Array.from(arguments));
        
        if (sent) {
          // Check all possible locations for contact data
          const contact = 
            data?.responseUnsafe?.contact ||
            data?.contact ||
            (window as any).Telegram?.WebApp?.initDataUnsafe?.contact;
          
          if (contact && contact.phone_number) {
            console.log('✅ Phone found:', contact.phone_number);
            resolve({
              phone: contact.phone_number,
              contact: contact
            });
          } else {
            console.log('⚠️ Sent=true but no contact data');
            console.log('Data structure:', JSON.stringify(data, null, 2));
            reject('Contact shared but data not accessible');
          }
        } else {
          console.log('❌ User declined or sent=false');
          reject('User declined');
        }
      });
    });
  }

  getWebApp() {
    return this.tg;
  }

  showAlert(message: string) {
    this.tg.showAlert(message);
  }

  logAllUserData() {
    console.group('📱 TELEGRAM DATA');
    console.log('User:', this.tg.initDataUnsafe.user);
    console.log('Platform:', this.tg.platform);
    console.log('Version:', this.tg.version);
    console.log('Init Data:', this.tg.initDataUnsafe);
    console.groupEnd();
    
    return {
      user: this.tg.initDataUnsafe.user,
      platform: this.tg.platform,
      version: this.tg.version
    };
  }
}