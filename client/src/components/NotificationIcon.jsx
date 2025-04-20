import { useEffect, useState, useRef, useCallback } from 'react';
import { Badge, Button, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { BsArrowRightCircle } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { getSocket, authenticateSocket } from '../services/socketService';

export default function NotificationIcon() {
  const { currentUser } = useSelector(state => state.user);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const socketRef = useRef(null);
  
  // Fetch unread count from API
  const fetchUnreadCount = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const res = await fetch('/api/notification/unread-count');
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [currentUser]);
  
  // Handle clicks outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Initial setup and fetch
  useEffect(() => {
    if (!currentUser) return;
    
    // Fetch initial count
    fetchUnreadCount();
    
    // Setup socket connection
    if (currentUser?.token) {
      authenticateSocket(currentUser.token);
      const socket = getSocket();
      socketRef.current = socket;
    }
  }, [currentUser, fetchUnreadCount]);
  
  // Socket event listeners
  useEffect(() => {
    if (!currentUser) return;
    
    // Get active socket connection
    const socket = getSocket();
    socketRef.current = socket;
    
    const handleNewNotification = (data) => {
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
      
      if (data.notification) {
        // Always update the notification list when a new one comes in,
        // regardless of dropdown state
        setRecentNotifications(prev => {
          // Check if notification already exists
          if (prev.some(n => n._id === data.notification._id)) {
            return prev;
          }
          // Add the new notification and limit to 5
          return [data.notification, ...prev.slice(0, 4)];
        });
      }
    };
    
    const handleNotificationRead = (data) => {
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
      
      setRecentNotifications(prev => 
        prev.map(notification => 
          notification._id === data.notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    };
    
    const handleAllNotificationsRead = (data) => {
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(0);
      }
      
      setRecentNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    };
    
    const handleNotificationDeleted = (data) => {
      if (typeof data.unreadCount === 'number') {
        setUnreadCount(data.unreadCount);
      }
      
      // Always remove the deleted notification from the list if it exists
      setRecentNotifications(prev => 
        prev.filter(notification => notification._id !== data.notificationId)
      );
    };
    
    const handleUnreadCountUpdate = (data) => {
      if (typeof data.unreadCount === 'number') {
        // Use immediate state update for faster UI response
        setUnreadCount(data.unreadCount);
      }
    };
    
    // Add socket event listeners
    socket.on('new-notification', handleNewNotification);
    socket.on('notification-read', handleNotificationRead);
    socket.on('all-notifications-read', handleAllNotificationsRead);
    socket.on('notification-deleted', handleNotificationDeleted);
    socket.on('unread-count-update', handleUnreadCountUpdate);
    
    // Verify socket connection
    if (!socket.connected) {
      socket.connect();
    }
    
    return () => {
      // Remove socket event listeners
      socket.off('new-notification', handleNewNotification);
      socket.off('notification-read', handleNotificationRead);
      socket.off('all-notifications-read', handleAllNotificationsRead);
      socket.off('notification-deleted', handleNotificationDeleted);
      socket.off('unread-count-update', handleUnreadCountUpdate);
    };
  }, [currentUser]);
  
  // Check socket connection status periodically
  useEffect(() => {
    if (!currentUser) return;

    const checkSocketStatus = () => {
      if (socketRef.current) {
        if (!socketRef.current.connected) {
          socketRef.current.connect();
        }
      } else {
        if (currentUser?.token) {
          authenticateSocket(currentUser.token);
          socketRef.current = getSocket();
        }
      }
    };

    // Check immediately
    checkSocketStatus();
    
    // And then periodically
    const intervalId = setInterval(checkSocketStatus, 30000); // Every 30 seconds
    
    return () => {
      clearInterval(intervalId);
    };
  }, [currentUser]);
  
  // Poll for unread count as a backup (every 10 seconds)
  useEffect(() => {
    if (!currentUser) return;
    
    // Set up a polling interval as a backup for socket events
    const pollInterval = setInterval(() => {
      fetchUnreadCount();
    }, 10000); // Poll every 10 seconds
    
    // Clear the interval when the component unmounts
    return () => {
      clearInterval(pollInterval);
    };
  }, [currentUser, fetchUnreadCount]);
  
  const handleBellClick = async () => {
    // Toggle dropdown
    const newDropdownState = !showDropdown;
    setShowDropdown(newDropdownState);
    
    // If opening dropdown, fetch the latest unread count and notifications
    if (newDropdownState) {
      // Refresh unread count
      await fetchUnreadCount();
      
      // Always fetch the most recent notifications when opening the dropdown
      setLoading(true);
      try {
        const res = await fetch('/api/notification?limit=5');
        if (res.ok) {
          const data = await res.json();
          setRecentNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching recent notifications:', error);
      } finally {
        setLoading(false);
      }
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
  
  const getNotificationLink = (notification) => {
    if (notification.type === 'new_donation' || notification.type === 'donation_received') {
      return `/donate/${notification.donationId}`;
    }
    return `/post/${notification.postSlug}`;
  };
  
  const markAsRead = async (notificationId) => {
    try {
      // Optimistic UI update - update the notification state immediately
      setRecentNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
      
      // Also optimistically decrease the unread count
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      
      // Then send the API request
      await fetch(`/api/notification/${notificationId}/read`, {
        method: 'PUT',
      });
      
      // The socket update will eventually confirm the change
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // If there's an error, revert the optimistic UI updates
      fetchUnreadCount();
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <Button 
        color="gray" 
        pill 
        className="w-12 h-10 flex items-center justify-center"
        onClick={handleBellClick}
      >
        <div className="flex items-center justify-center w-full h-full">
          <IoMdNotificationsOutline className="text-xl" />
          {unreadCount > 0 && (
            <Badge color="failure" className="absolute -top-1 -right-1 px-1.5 py-0.5">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </div>
      </Button>
      
      {showDropdown && (
        <div className="fixed md:absolute right-0 md:right-0 left-0 md:left-auto top-16 md:top-auto md:mt-2 w-full md:w-80 bg-white dark:bg-gray-800 rounded-none md:rounded-lg shadow-lg overflow-hidden z-50 border-t border-b md:border md:border-gray-200 md:dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium flex justify-between items-center">
            <span>Recent Notifications</span>
            {unreadCount > 0 && (
              <Badge color="failure" className="px-2.5 py-1">
                {unreadCount} unread
              </Badge>
            )}
          </div>
          
          <div className="max-h-[calc(100vh-12rem)] md:max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex justify-center items-center p-4 h-20">
                <Spinner size="md" />
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                No notifications found
              </div>
            ) : (
              <div>
                {recentNotifications.map((notification) => (
                  <Link 
                    key={notification._id} 
                    to={getNotificationLink(notification)}
                    onClick={() => {
                      // Mark as read before navigation if not already read
                      if (!notification.read) {
                        markAsRead(notification._id);
                      }
                      // Close dropdown after a short delay to ensure state updates
                      setTimeout(() => setShowDropdown(false), 50);
                    }}
                    className={`block p-3 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                      !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="flex items-start">
                      <div className={`flex-shrink-0 w-2 h-2 mt-2 rounded-full ${!notification.read ? 'bg-blue-600' : 'bg-transparent'}`}></div>
                      <div className="ml-2 flex-1 overflow-hidden">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{notification.title}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${getNotificationTypeStyle(notification.type)}`}>
                            {notification.type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                          {notification.message}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            to="/notifications" 
            className="block p-3 text-center text-blue-600 dark:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 font-medium"
            onClick={() => setShowDropdown(false)}
          >
            <div className="flex items-center justify-center gap-2">
              <span>Show All Notifications</span>
              <BsArrowRightCircle />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
} 