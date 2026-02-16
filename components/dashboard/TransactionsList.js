import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDownLeft, ArrowUpRight, Filter, Clock } from "lucide-react";

export default function TransactionsList({ transactions }) {
  const [filter, setFilter] = useState("all");

  const filteredTransactions = transactions.filter(txn => {
    if (filter === "all") return true;
    return txn.type === filter;
  });

  const getTransactionIcon = (type) => {
    switch(type) {
      case "funding":
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case "vote":
      case "gift":
        return <ArrowUpRight className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTransactionColor = (type) => {
    switch(type) {
      case "funding":
        return "bg-green-100";
      case "vote":
      case "gift":
        return "bg-red-100";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-2xl shadow-lg p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800">Recent Activity</h3>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-400" />
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="text-sm border-0 bg-gray-50 rounded-lg px-2 py-1 text-gray-600 focus:ring-1 focus:ring-rose-500"
          >
            <option value="all">All</option>
            <option value="funding">Funding</option>
            <option value="vote">Votes</option>
            <option value="gift">Gifts</option>
          </select>
        </div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
        <AnimatePresence>
          {filteredTransactions.length > 0 ? (
            filteredTransactions.map((txn, index) => (
              <motion.div
                key={txn.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getTransactionColor(txn.type)}`}>
                    {getTransactionIcon(txn.type)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {txn.type === "funding" ? "Wallet Top-up" : 
                       txn.type === "vote" ? `Voted for ${txn.recipient_name}` :
                       txn.type === "gift" ? `Gifted ${txn.recipient_name}` : txn.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(txn.created_at).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`font-semibold ${
                  txn.type === "funding" ? "text-green-600" : "text-red-500"
                }`}>
                  {txn.type === "funding" ? "+" : "-"}₦{txn.amount.toLocaleString()}
                </span>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Your activity will appear here</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}