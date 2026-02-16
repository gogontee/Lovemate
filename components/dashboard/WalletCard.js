import { Wallet, ArrowUpRight, CreditCard } from "lucide-react";
import { motion } from "framer-motion";

export default function WalletCard({ balance, onFundClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-rose-500 to-rose-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-8 -mt-8"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full -ml-8 -mb-8"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            <span className="text-sm font-medium uppercase tracking-wider opacity-90">Wallet</span>
          </div>
          <CreditCard className="w-5 h-5 opacity-75" />
        </div>
        
        <div className="mb-6">
          <p className="text-3xl font-bold mb-1">₦{balance.toLocaleString()}</p>
          <p className="text-xs opacity-75">Available Balance</p>
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onFundClick}
          className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all rounded-xl py-3 px-4 flex items-center justify-between group"
        >
          <span className="font-medium">Fund Wallet</span>
          <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </motion.button>
      </div>
    </motion.div>
  );
}