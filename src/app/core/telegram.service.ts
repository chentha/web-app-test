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
      console.log('Telegram WebApp version:', this.tg.version);
      
      this.tg.requestContact((result: any) => {
        console.log('=== REQUEST CONTACT CALLBACK ===');
        console.log('Raw result:', result);
        console.log('Result type:', typeof result);
        console.log('Result stringified:', JSON.stringify(result, null, 2));
        
        // Case 1: Result is boolean (user accepted/declined)
        if (typeof result === 'boolean') {
          console.log('Result is boolean:', result);
          
          if (result === true) {
            console.log('✅ User accepted to share contact');
            // Contact data might come in the next parameter or event
            // Try to get from arguments
            const args = Array.from(arguments);
            console.log('All callback arguments:', args);
            
            if (args.length > 1) {
              const eventData = args[1];
              console.log('Event data from second argument:', eventData);
              
              if (eventData?.responseUnsafe?.contact) {
                const contact = eventData.responseUnsafe.contact;
                console.log('✅ Phone found:', contact.phone_number);
                resolve({
                  phone: contact.phone_number,
                  contact: contact
                });
                return;
              }
            }
            
            // If no event data, try to access from WebApp state
            setTimeout(() => {
              console.log('Checking WebApp state for contact data...');
              console.log('initDataUnsafe:', this.tg.initDataUnsafe);
              reject('Contact shared but phone data not accessible');
            }, 1000);
            
          } else {
            console.log('❌ User declined');
            reject('User declined');
          }
          return;
        }
        
        // Case 2: Result is an object with contact data
        if (result && typeof result === 'object') {
          console.log('Result is object');
          
          // Try different possible structures
          const possiblePaths = [
            result.responseUnsafe?.contact,
            result.contact,
            result.data?.contact,
            result.response?.contact
          ];
          
          for (const contact of possiblePaths) {
            if (contact && contact.phone_number) {
              console.log('✅ Phone found in object:', contact.phone_number);
              resolve({
                phone: contact.phone_number,
                contact: contact
              });
              return;
            }
          }
          
          console.log('⚠️ Object found but no contact data in known paths');
          console.log('Full object:', JSON.stringify(result, null, 2));
          reject('Contact data structure unknown');
          return;
        }
        
        // Case 3: Unexpected format
        console.log('⚠️ Unexpected result format');
        reject('Unexpected response format');
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