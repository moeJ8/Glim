// Service Worker for Push Notifications
self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  return self.clients.claim();
});

// Handle push events (when a notification is received)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    const options = {
      body: data.message || 'New notification',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      data: {
        url: data.url || '/'
      },
      vibrate: [100, 50, 100],
      timestamp: Date.now()
    };

    event.waitUntil(
      self.registration.showNotification(data.title || 'Glim', options)
    );
  } catch (error) {
    console.error('Error processing push notification:', error);
  }
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  }
}); 