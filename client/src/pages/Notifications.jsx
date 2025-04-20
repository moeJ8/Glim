import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';

export default function Notifications() {
  const { currentUser } = useSelector((state) => state.user);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/notification');
        const data = await res.json();
        if (res.ok) {
          setNotifications(data.notifications);
        } else {
          setError(data.message);
        }
      } catch (error) {
        setError('Failed to fetch notifications');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchNotifications();
    }
  }, [currentUser]);

  const markAsRead = async (notificationId) => {
    try {
      const res = await fetch(`/api/notification/${notificationId}/read`, {
        method: 'PUT',
      });
      
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch('/api/notification/read-all', {
        method: 'PUT',
      });
      
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      const res = await fetch(`/api/notification/${notificationId}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        setNotifications((prev) =>
          prev.filter((notification) => notification._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationTypeStyle = (type) => {
    switch (type) {
      case 'comment':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'reply':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'like_comment':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'new_donation':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'donation_received':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const getNotificationTypeLabel = (type) => {
    switch (type) {
      case 'comment':
        return 'Comment';
      case 'reply':
        return 'Reply';
      case 'like_comment':
        return 'Like';
      case 'new_donation':
        return 'Donation';
      case 'donation_received':
        return 'Donation Received';
      default:
        return type;
    }
  };

  const getNotificationLink = (notification) => {
    if (notification.type === 'new_donation' || notification.type === 'donation_received') {
      return `/donate/${notification.donationId}`;
    }
    return `/post/${notification.postSlug}`;
  };

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
  };

  const hasUnread = notifications.some((notification) => !notification.read);

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-6 max-w-md">
          <h1 className="text-2xl font-bold mb-4">Sign in Required</h1>
          <p className="mb-4">Please sign in to view your notifications.</p>
          <Link to="/sign-in">
            <Button gradientDuoTone="purpleToBlue">Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-3 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold my-5 text-center">Notifications</h1>
      
      <div className="flex justify-between items-center mb-5">
        <div className="text-sm text-gray-500">
          {notifications.length > 0 
            ? `Showing ${notifications.length} notifications` 
            : 'No notifications'}
        </div>
        {hasUnread && (
          <Button color="gray" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Spinner size="xl" />
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-500 mb-4">{error}</p>
          <Button color="failure" onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-2">No notifications found</p>
          <p className="text-gray-400 text-sm">
            You don&apos;t have any notifications yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3 mt-5">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`border p-4 rounded-lg shadow-sm ${
                notification.read ? 'bg-white dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900/20'
              } transition-all hover:shadow-md`}
            >
              <div className="flex justify-between">
                <Link
                  to={getNotificationLink(notification)}
                  className="flex-1"
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3 items-start">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        notification.read ? 'invisible' : 'bg-blue-600'
                      }`}
                    ></div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {notification.title}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getNotificationTypeStyle(notification.type)}`}
                        >
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </Link>
                <div>
                  <Button
                    size="xs"
                    color="failure"
                    pill
                    onClick={() => deleteNotification(notification._id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 