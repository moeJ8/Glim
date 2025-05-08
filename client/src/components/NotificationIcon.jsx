import { useEffect, useState, useRef, useCallback } from 'react';
import { Button, Spinner } from 'flowbite-react';
import { Link } from 'react-router-dom';
import { IoMdNotificationsOutline } from 'react-icons/io';
import { BsArrowRightCircle } from 'react-icons/bs';
import { useSelector } from 'react-redux';
import { getSocket, authenticateSocket } from '../services/socketService';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaComment, FaReply } from 'react-icons/fa';
import { MdPublish, MdThumbUp, MdCheck, MdClose } from 'react-icons/md';
import moment from 'moment';

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
  
  const getNotificationLink = (notification) => {
    console.log("Notification link data:", notification);
    
    if (notification.type === 'new_donation' || notification.type === 'donation_received') {
      return `/donate/${notification.donationId}`;
    }
    if (notification.type === 'follow') {
      if (notification.triggeredBy && notification.triggeredBy.username) {
        return `/profile/${notification.triggeredBy.username}`;
      } else {
        return `/`;
      }
    }
    if (notification.type === 'report') {
      if (currentUser?.isAdmin) {
        return `/dashboard?tab=reports`;
      } else {
        return `/`;
      }
    }
    if (notification.type === 'publisher_request') {
      if (currentUser?.isAdmin) {
        return `/dashboard?tab=requests`;
      } else {
        return `/`;
      }
    }
    if (notification.type === 'publisher_approved' || notification.type === 'publisher_rejected') {
      return `/dashboard?tab=profile`;
    }
    if (!notification.postSlug) {
      return `/`;
    }
    return `/post/${notification.postSlug}`;
  };
  
  const markAsRead = async (notificationId) => {
    try {
      setRecentNotifications(prev => 
        prev.map(notification => 
          notification._id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );

      setUnreadCount(prevCount => Math.max(0, prevCount - 1));

      await fetch(`/api/notification/${notificationId}/read`, {
        method: 'PUT',
      });

    } catch (error) {
      console.error('Error marking notification as read:', error);
      fetchUnreadCount();
    }
  };
  
  const markAllAsRead = async () => {
    try {
      // Optimistic UI update - mark all as read immediately
      setRecentNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      // Then make API request
      await fetch('/api/notification/read-all', {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
      fetchUnreadCount();
    }
  };
  
  const renderNotification = (notification) => {
    const { type } = notification;
    switch (type) {
        case 'comment':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                        <FaComment className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'reply':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                        <FaReply className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'like_comment':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-pink-100 dark:bg-pink-900/30 p-2 rounded-lg">
                        <MdThumbUp className="text-pink-600 dark:text-pink-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'new_post':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                        <IoMdNotificationsOutline className="text-green-600 dark:text-green-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'new_donation':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-lg">
                        <IoMdNotificationsOutline className="text-green-600 dark:text-green-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'donation_received':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded-lg">
                        <IoMdNotificationsOutline className="text-yellow-600 dark:text-yellow-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'follow':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-indigo-100 dark:bg-indigo-900/30 p-2 rounded-lg">
                        <IoMdNotificationsOutline className="text-indigo-600 dark:text-indigo-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'report':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                        <HiOutlineExclamationCircle className="text-purple-600 dark:text-purple-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'publisher_request':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-amber-100 dark:bg-amber-900/30 p-2 rounded-lg">
                        <MdPublish className="text-amber-600 dark:text-amber-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'publisher_approved':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-emerald-100 dark:bg-emerald-900/30 p-2 rounded-lg">
                        <MdCheck className="text-emerald-600 dark:text-emerald-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        case 'publisher_rejected':
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
                        <MdClose className="text-rose-600 dark:text-rose-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
        default:
            return (
                <div className="flex items-start gap-3">
                    <div className="bg-gray-100 dark:bg-gray-900/30 p-2 rounded-lg">
                        <IoMdNotificationsOutline className="text-gray-600 dark:text-gray-400 w-5 h-5" />
                    </div>
                    <div className="flex-1">
                        <h5 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                            {notification.title}
                        </h5>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            {notification.message}
                        </p>
                        <span className="text-xs text-gray-500 dark:text-gray-500 mt-1 block">
                            {moment(notification.createdAt).fromNow()}
                        </span>
                    </div>
                </div>
            );
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
            <div className="absolute -top-1.5 -right-1.5 min-w-[20px] h-5 flex items-center justify-center rounded-full text-xs font-bold border border-white dark:border-gray-800 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm">
              <span className="px-1.5 py-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            </div>
          )}
        </div>
      </Button>
      
      {showDropdown && (
        <div className="fixed md:absolute right-0 md:right-0 left-0 md:left-auto top-16 md:top-auto md:mt-2 w-full md:w-80 bg-white dark:bg-gray-800 rounded-none md:rounded-lg shadow-lg overflow-hidden z-50 border-t border-b md:border md:border-gray-200 md:dark:border-gray-700">
          <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-medium flex justify-between items-center">
            <span>Recent Notifications</span>
            {unreadCount > 0 && (
              <div className="px-2.5 py-1 rounded-full font-semibold text-xs shadow-sm bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                {unreadCount} unread
              </div>
            )}
          </div>
          
          {unreadCount > 0 && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                markAllAsRead();
              }}
              className="w-full py-2 px-3 text-center bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 border-b border-gray-200 dark:border-gray-700 font-medium"
            >
              Mark All as Read
            </button>
          )}
          
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
                      !notification.read ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                    }`}
                  >
                    {renderNotification(notification)}
                  </Link>
                ))}
              </div>
            )}
          </div>
          
          <Link 
            to="/notifications" 
            className="block p-3 text-center text-purple-600 dark:text-purple-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 font-medium"
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