// components/directors/DirectorsLayout.js
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, LogOut, Crown, Eye, Users, UserCheck, BarChart3, DollarSign, X, Gift, CreditCard } from "lucide-react";
import Image from "next/image";

const formatName = (fullName) => {
  if (!fullName) return "Director";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[1].charAt(0)}.`;
};

export default function DirectorsLayout({ 
  children, 
  profile, 
  activeTab, 
  setActiveTab, 
  sidebarOpen, 
  setSidebarOpen,
  onLogout 
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "overview", label: "Overview", icon: Eye },
    { id: "candidates", label: "Candidates", icon: Users },
    { id: "fans", label: "Fans", icon: UserCheck },
    { id: "transactions", label: "Transactions", icon: DollarSign },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-rose-100">
      {/* Top Bar */}
      <div className="bg-white/90 backdrop-blur-md border-b border-rose-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            {/* Desktop Sidebar Toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:block p-2 hover:bg-rose-100 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-yellow-500" />
              <h1 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
                Director's Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-rose-50 rounded-full px-3 py-1.5">
              {profile?.photo_url ? (
                <Image
                  src={profile.photo_url}
                  alt={profile.full_name}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {profile?.full_name?.charAt(0) || "D"}
                  </span>
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {formatName(profile?.full_name)}
              </span>
            </div>

            <button
              onClick={onLogout}
              className="p-2 hover:bg-rose-100 rounded-lg transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Horizontal Scroll Menu - appears after header */}
      <div className="lg:hidden bg-white/90 backdrop-blur-md border-b border-rose-200 sticky top-[65px] z-20 overflow-x-auto scrollbar-hide">
        <div className="flex gap-1 p-2 min-w-max">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-rose-50'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Slide-out Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-rose-100">
                <div className="flex items-center gap-2">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-rose-600">
                    Director's Menu
                  </span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 hover:bg-rose-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              
              {/* Director Profile in Mobile Menu */}
              <div className="p-4 border-b border-rose-100 bg-gradient-to-r from-rose-50 to-red-50">
                <div className="flex items-center gap-3">
                  {profile?.photo_url ? (
                    <Image
                      src={profile.photo_url}
                      alt={profile.full_name}
                      width={40}
                      height={40}
                      className="rounded-full border-2 border-white shadow-md"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center shadow-md">
                      <span className="text-sm font-bold text-white">
                        {profile?.full_name?.charAt(0) || "D"}
                      </span>
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{formatName(profile?.full_name)}</p>
                    <p className="text-[10px] text-gray-500">Director</p>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === item.id
                        ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-rose-50'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                ))}
              </nav>

              {/* Logout button in mobile menu */}
              <div className="absolute bottom-4 left-4 right-4">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-600 hover:bg-rose-50 transition-all border border-rose-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Layout */}
      <div className="flex">
        {/* Desktop Static Sidebar - Hidden on mobile, fixed on desktop */}
        <motion.aside
          animate={{ width: sidebarOpen ? 256 : 80 }}
          className={`hidden lg:block bg-white/90 backdrop-blur-md border-r border-rose-200 h-[calc(100vh-64px)] sticky top-[64px] overflow-hidden transition-all duration-300`}
        >
          <div className="h-full overflow-y-auto scrollbar-hide p-4">
            {/* Director Profile in Sidebar */}
            <div className={`mb-6 pb-4 border-b border-rose-100 transition-all ${
              sidebarOpen ? 'block' : 'hidden'
            }`}>
              <div className="flex items-center gap-3">
                {profile?.photo_url ? (
                  <Image
                    src={profile.photo_url}
                    alt={profile.full_name}
                    width={40}
                    height={40}
                    className="rounded-full border-2 border-white shadow-md"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-rose-600 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-sm font-bold text-white">
                      {profile?.full_name?.charAt(0) || "D"}
                    </span>
                  </div>
                )}
                <div className="overflow-hidden">
                  <p className="font-semibold text-gray-800 text-sm truncate">{formatName(profile?.full_name)}</p>
                  <p className="text-[10px] text-gray-500">Director</p>
                </div>
              </div>
            </div>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                    activeTab === item.id
                      ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-rose-50'
                  }`}
                  title={!sidebarOpen ? item.label : undefined}
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className={`text-sm font-medium transition-opacity duration-300 ${
                    sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 hidden'
                  }`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </motion.aside>

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Add scrollbar-hide utility */}
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}