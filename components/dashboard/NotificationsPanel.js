import { Bell, Gift, Star, Calendar, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: "event",
      title: "New Voting Round",
      message: "Voting round 2 begins tomorrow at 8 PM!",
      time: "2 hours ago",
      icon: Calendar,
      color: "bg-blue-100 text-blue-600",
      read: false
    },
    {
      id: 2,
      type: "promo",
      title: "Exclusive Merch Alert!",
      message: "Top 5 fans win exclusive merchandise",
      time: "5 hours ago",
      icon: Gift,
      color: "bg-purple-100 text-purple-600",
      read: false
    },
    {
      id: 3,
      type: "alert",
      title: "Live Show Tonight",
      message: "Don't miss the live show at 9 PM",
      time: "1 day ago",
      icon: Star,
      color: "bg-yellow-100 text-yellow-600",
      read: true
    }
  ]);

  const markAsRead = (id) => {
    setNotifications(notifications.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  };

  const dismissNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

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
            <span className="px-2 py-1 bg-rose-600 text-white text-xs rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button 
            onClick={() => setNotifications(notifications.map(n => ({ ...n, read: true })))}
            className="text-xs text-rose-600 hover:text-rose-700"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
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
                className={`relative p-4 rounded-xl transition-all ${
                  notif.read ? 'bg-gray-50' : 'bg-rose-50 border-l-4 border-rose-500'
                }`}
                onClick={() => markAsRead(notif.id)}
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
                      {notif.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {notifications.length === 0 && (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">All caught up!</p>
            <p className="text-sm text-gray-400 mt-1">No new notifications</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}