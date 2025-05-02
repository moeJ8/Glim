/**
 * This script generates VAPID keys for push notifications.
 * Run it once to generate keys and then save them in your .env file.
 */

import webpush from 'web-push';
import fs from 'fs';

// Generate VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();

console.log('VAPID Keys generated successfully:');
console.log('Public Key:', vapidKeys.publicKey);
console.log('Private Key:', vapidKeys.privateKey);

// Create a text file with the keys
const envVars = `
# Push Notification VAPID Keys
# Add these to your .env file
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
VAPID_SUBJECT=mailto:your-email@example.com
`;

fs.writeFileSync('vapid-keys.txt', envVars);

console.log('\nKeys have been saved to vapid-keys.txt');
console.log('Add these to your .env file and replace the VAPID_SUBJECT with your email.'); 