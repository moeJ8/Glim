/**
 * Push Notification Service
 * Handles registration and management of push notifications
 */

export const isPushNotificationSupported = () => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const registerServiceWorker = async () => {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported by your browser');
  }

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    throw error;
  }
};

export const subscribeToPushNotifications = async () => {
  try {
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }
    }

    // Get VAPID public key from server
    const response = await fetch('/api/notification/vapid-public-key');
    const { publicKey } = await response.json();

    if (!publicKey) {
      throw new Error('VAPID public key not available');
    }

    // Convert the VAPID key to the format expected by the browser
    const vapidPublicKey = urlBase64ToUint8Array(publicKey);

    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;


    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidPublicKey
    });

    await saveSubscriptionToServer(subscription);

    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
};

const saveSubscriptionToServer = async (subscription) => {
  try {
    const response = await fetch('/api/notification/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ subscription })
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription on server');
    }

    return await response.json();
  } catch (error) {
    console.error('Error saving subscription to server:', error);
    throw error;
  }
};

export const updatePushNotificationSettings = async (enabled) => {
  try {
    const response = await fetch('/api/notification/push-settings', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled })
    });

    if (!response.ok) {
      throw new Error('Failed to update push notification settings');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating push notification settings:', error);
    throw error;
  }
};

export const unsubscribeFromPushNotifications = async () => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      await updatePushNotificationSettings(false);
    }

    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    throw error;
  }
};

// Helper function to convert base64 string to Uint8Array
// This is needed for the applicationServerKey
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
} 