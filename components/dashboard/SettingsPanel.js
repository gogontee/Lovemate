import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Settings, 
  User, 
  Lock, 
  Bell, 
  Globe, 
  Moon,
  ChevronRight,
  Save
} from "lucide-react";

export default function SettingsPanel({ 
  fullName, 
  setFullName, 
  phone, 
  setPhone, 
  onUpdate,
  loading,
  message 
}) {
  const [activeSection, setActiveSection] = useState("profile");
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    push: true,
    marketing: false
  });

  const sections = [
    { id: "profile", label: "Profile Information", icon: User },
    { id: "security", label: "Security", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
  ];

  const renderContent = () => {
    switch(activeSection) {
      case "profile":
        return (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={onUpdate}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Enter phone number"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-shadow disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Changes"}
            </motion.button>
            {message && (
              <p className={`text-sm text-center ${message.includes('✅') ? 'text-green-600' : 'text-red-500'}`}>
                {message}
              </p>
            )}
          </motion.form>
        );

      case "security":
        return (
          <motion.form
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                placeholder="Confirm new password"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-shadow"
            >
              Update Password
            </motion.button>
          </motion.form>
        );

      case "notifications":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            {Object.entries(notifications).map(([key, value]) => (
              <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <span className="text-gray-700 capitalize">{key} Notifications</span>
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setNotifications(prev => ({ ...prev, [key]: !prev[key] }))}
                    className="sr-only"
                  />
                  <div className={`w-10 h-6 rounded-full transition-colors ${value ? 'bg-rose-600' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform ${value ? 'translate-x-5' : 'translate-x-1'} mt-1`}></div>
                  </div>
                </div>
              </label>
            ))}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-3 rounded-xl font-medium mt-4 hover:shadow-lg transition-shadow"
            >
              Save Preferences
            </motion.button>
          </motion.div>
        );

      case "preferences":
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Dark Mode</span>
              </div>
              <div className="relative">
                <input type="checkbox" className="sr-only" />
                <div className="w-10 h-6 rounded-full bg-gray-300">
                  <div className="w-4 h-4 bg-white rounded-full translate-x-1 mt-1"></div>
                </div>
              </div>
            </div>
            <div className="p-3 bg-gray-50 rounded-xl">
              <label className="block text-sm text-gray-600 mb-2">Language</label>
              <select className="w-full p-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-rose-500">
                <option>English</option>
                <option>French</option>
                <option>Spanish</option>
              </select>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Settings className="w-5 h-5 text-gray-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-800">Settings</h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="md:w-48 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${
                  activeSection === section.id
                    ? 'bg-rose-600 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span>{section.label}</span>
                </div>
                <ChevronRight className="w-4 h-4" />
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {renderContent()}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}