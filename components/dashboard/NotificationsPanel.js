import { Bell, Gift, Star, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../lib/supabaseClient"; // or your backend client

export default function NotificationsPanel({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;
    
    fetchNotifications();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          // Add new notification in real-time
          const newNotification = {
            ...payload.new,
            read: false,
            icon: getIconForType(payload.new.type),
            color: getColorForType(payload.new.type)
          };
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Show browser notification if permitted
          if (Notification.permission === 'granted') {
            new Notification(newNotification.title, {
              body: newNotification.message,
              icon: '/notification-icon.png'
            });
          }
        }
      )
      .subscribe();

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      // Transform data with icons and colors
      const transformedData = data.map(notif => ({
        ...notif,
        icon: getIconForType(notif.type),
        color: getColorForType(notif.type)
      }));

      setNotifications(transformedData);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIconForType = (type) => {
    const icons = {
      event: Calendar,
      promo: Gift,
      alert: Star,
      default: Bell
    };
    return icons[type] || icons.default;
  };

  const getColorForType = (type) => {
    const colors = {
      event: "bg-blue-100 text-blue-600",
      promo: "bg-purple-100 text-purple-600",
      alert: "bg-yellow-100 text-yellow-600",
      default: "bg-gray-100 text-gray-600"
    };
    return colors[type] || colors.default;
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  const markAsRead = async (id) => {
    try {
      // Optimistic update
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));

      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert on error
      fetchNotifications();
    }
  };

  const markAllAsRead = async () => {
    try {
      // Optimistic update
      setNotifications(notifications.map(n => ({ ...n, read: true })));

      // Update in database
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking all as read:', err);
      fetchNotifications();
    }
  };

  const dismissNotification = async (id) => {
    try {
      // Optimistic update
      setNotifications(notifications.filter(notif => notif.id !== id));

      // Delete or archive in database
      const { error } = await supabase
        .from('notifications')
        .update({ dismissed: true, dismissed_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error dismissing notification:', err);
      fetchNotifications();
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-red-600">
          <p>Failed to load notifications</p>
          <button 
            onClick={fetchNotifications}
            className="mt-2 text-sm underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-rose-100 rounded-lg">
            <Bell className="w-5 h-5 text-rose-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-800">Notifications</h3>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="px-2 py-1 bg-rose-600 text-white text-xs rounded-full"
            >
              {unreadCount} new
            </motion.span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={markAllAsRead}
            className="text-xs text-rose-600 hover:text-rose-700"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
        {loading && notifications.length === 0 ? (
          // Skeleton loading
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 h-20 rounded-xl"></div>
            </div>
          ))
        ) : (
          <AnimatePresence>
            {notifications.map((notif, index) => {
              const Icon = notif.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative p-4 rounded-xl transition-all cursor-pointer hover:shadow-md ${
                    notif.read ? 'bg-gray-50' : 'bg-rose-50 border-l-4 border-rose-500'
                  }`}
                  onClick={() => !notif.read && markAsRead(notif.id)}
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      dismissNotification(notif.id);
                    }}
                    className="absolute top-2 right-2 p-1 hover:bg-white/50 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                  
                  <div className="flex gap-3">
                    <div className={`p-2 rounded-lg ${notif.color} flex-shrink-0`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-800 text-sm">
                        {notif.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {notif.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {formatTime(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}

        {!loading && notifications.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No new notifications</p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}