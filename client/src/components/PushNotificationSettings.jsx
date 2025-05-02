import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Spinner, ToggleSwitch } from 'flowbite-react';
import { 
  isPushNotificationSupported,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications
} from '../services/pushNotificationService';
import CustomAlert from './CustomAlert';

export default function PushNotificationSettings() {
  const { currentUser } = useSelector((state) => state.user);
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Check if push notifications are supported and if the user is subscribed
  useEffect(() => {
    const checkPushStatus = async () => {
      try {
        if (!currentUser) {
          setLoading(false);
          return;
        }

        // Check if browser supports push notifications
        const supported = isPushNotificationSupported();
        setIsSupported(supported);

        if (!supported) {
          setLoading(false);
          return;
        }

        // Check if service worker is registered
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error checking push status:', err);
        setError('Failed to check push notification status');
        setLoading(false);
      }
    };

    checkPushStatus();
  }, [currentUser]);

  // Clear alerts after timeout
  useEffect(() => {
    let timeoutId;
    
    if (error || success) {
      timeoutId = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 4000); // 4 seconds
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [error, success]);

  // Handle toggling push notifications
  const handleToggle = async (enabled) => {
    if (!currentUser) return;
    
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (enabled) {
        await subscribeToPushNotifications();
        setSuccess('Stay updated! You\'ll now receive alerts when you\'re offline.');
      } else {
        await unsubscribeFromPushNotifications();
        setSuccess('Alerts turned off. You\'ll only see updates when using the app.');
      }
      
      setIsSubscribed(enabled);
    } catch (err) {
      console.error('Error toggling push notifications:', err);
      
      if (err.message && err.message.includes('Permission')) {
        setError('Your browser blocked notifications. Please allow them in your browser settings.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Return early if user is not logged in
  if (!currentUser) {
    return null;
  }

  // If push notifications are not supported
  if (!isSupported) {
    return (
      <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-medium mb-2">Stay Updated</h3>
        <CustomAlert
          type="warning"
          message="Your browser doesn't support alerts when you're offline."
        />
      </div>
    );
  }

  return (
    <div className="my-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <h3 className="text-lg font-medium mb-2">Stay Updated</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Get alerts about new comments and activity even when you&apos;re offline
      </p>

      <div className="flex items-center gap-2 mb-3">
        <ToggleSwitch
          checked={isSubscribed}
          onChange={handleToggle}
          disabled={loading}
          label="Get alerts when offline"
          color="purple"
        />
        {loading && <Spinner size="sm" />}
      </div>

      {error && (
        <CustomAlert
          type="error"
          message={error}
          className="mt-3"
        />
      )}

      {success && (
        <CustomAlert
          type="success"
          message={success}
          className="mt-3"
        />
      )}
    </div>
  );
} 