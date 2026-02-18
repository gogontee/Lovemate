// components/directors/TransactionsView.js
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { CreditCard, Gift, ArrowLeftRight, User, Clock, Package, DollarSign } from "lucide-react";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
};

export default function TransactionsView({ voteTransactions, giftTransactions }) {
  const [activeTab, setActiveTab] = useState("votes");
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Update transactions when tab changes or data updates
  useEffect(() => {
    const data = activeTab === "votes" ? voteTransactions : giftTransactions;
    setTransactions(data || []);
  }, [activeTab, voteTransactions, giftTransactions]);

  // Filter transactions based on search
  const filteredTransactions = transactions.filter(t => {
    if (!searchTerm) return true;
    
    const userName = t.profile?.full_name?.toLowerCase() || '';
    const packageName = t.package_name?.toLowerCase() || '';
    const giftType = t.gift_type?.toLowerCase() || '';
    const searchLower = searchTerm.toLowerCase();
    
    return userName.includes(searchLower) || 
           packageName.includes(searchLower) || 
           giftType.includes(searchLower);
  });

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format name (first name + first letter of second name)
  const formatName = (fullName) => {
    if (!fullName) return 'Unknown User';
    const parts = fullName.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  return (
    <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-rose-100">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ArrowLeftRight className="w-5 h-5 text-red-500" />
          Live Transactions
        </h3>
        <p className="text-xs text-gray-500 mt-1">Real-time updates of votes and gifts</p>
      </div>

      {/* Tab switcher */}
      <div className="flex border-b border-rose-100">
        <button
          onClick={() => setActiveTab("votes")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "votes" 
              ? 'text-red-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-4 h-4" />
            <span>Votes</span>
            <span className="bg-rose-100 text-red-600 text-xs px-1.5 rounded-full">
              {voteTransactions?.length || 0}
            </span>
          </div>
          {activeTab === "votes" && (
            <motion.div 
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
            />
          )}
        </button>
        
        <button
          onClick={() => setActiveTab("gifts")}
          className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
            activeTab === "gifts" 
              ? 'text-red-600' 
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-4 h-4" />
            <span>Gifts</span>
            <span className="bg-rose-100 text-red-600 text-xs px-1.5 rounded-full">
              {giftTransactions?.length || 0}
            </span>
          </div>
          {activeTab === "gifts" && (
            <motion.div 
              layoutId="activeTabIndicator"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-500"
            />
          )}
        </button>
      </div>

      {/* Search bar */}
      <div className="p-3 border-b border-rose-100">
        <div className="relative">
          <input
            type="text"
            placeholder={`Search ${activeTab} by user or package...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 pl-9 text-sm bg-rose-50/50 border border-rose-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
          <svg
            className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Transactions list */}
      <div className="max-h-[500px] md:max-h-[600px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredTransactions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-8 text-center"
            >
              <div className="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-3">
                {activeTab === "votes" ? (
                  <CreditCard className="w-8 h-8 text-rose-300" />
                ) : (
                  <Gift className="w-8 h-8 text-rose-300" />
                )}
              </div>
              <p className="text-gray-500 text-sm">No {activeTab} found</p>
              {searchTerm && (
                <p className="text-xs text-gray-400 mt-1">Try adjusting your search</p>
              )}
            </motion.div>
          ) : (
            filteredTransactions.map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.02 }}
                className="p-3 border-b border-rose-50 hover:bg-rose-50/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* User avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-red-100 to-rose-100 border-2 border-white shadow-sm">
                      {transaction.profile?.photo_url ? (
                        <Image
                          src={transaction.profile.photo_url}
                          alt={transaction.profile.full_name}
                          width={40}
                          height={40}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-red-500 font-bold text-sm">
                          {formatName(transaction.profile?.full_name).charAt(0)}
                        </div>
                      )}
                    </div>
                    {activeTab === "votes" ? (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                        <CreditCard className="w-2 h-2 text-white" />
                      </div>
                    ) : (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                        <Gift className="w-2 h-2 text-white" />
                      </div>
                    )}
                  </div>

                  {/* Transaction details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm text-gray-800 truncate">
                        {formatName(transaction.profile?.full_name)}
                      </h4>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDate(transaction.created_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs">
                      {activeTab === "votes" ? (
                        <>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full truncate max-w-[120px]">
                            <Package className="w-3 h-3 inline mr-1" />
                            {transaction.package_name || 'Vote Package'}
                          </span>
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full whitespace-nowrap">
                            <DollarSign className="w-3 h-3 inline" />
                            ₦{transaction.total_amount?.toLocaleString()}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 rounded-full truncate max-w-[120px]">
                            <Gift className="w-3 h-3 inline mr-1" />
                            {transaction.gift_type || 'Gift'}
                          </span>
                          <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded-full whitespace-nowrap">
                            <DollarSign className="w-3 h-3 inline" />
                            ₦{transaction.amount?.toLocaleString()}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Additional info */}
                    <div className="mt-1 flex items-center gap-2 text-[10px] text-gray-400">
                      <User className="w-3 h-3" />
                      <span className="truncate">ID: {transaction.user_id?.substring(0, 8)}</span>
                      {transaction.reference && (
                        <>
                          <span className="w-1 h-1 bg-gray-300 rounded-full" />
                          <span className="truncate">Ref: {transaction.reference}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer with real-time indicator */}
      <div className="p-3 border-t border-rose-100 bg-rose-50/30 flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span>Live updates</span>
        </div>
        <span>
          Showing {filteredTransactions.length} of {transactions.length} {activeTab}
        </span>
      </div>
    </motion.div>
  );
}