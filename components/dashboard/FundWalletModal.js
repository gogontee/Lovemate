import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Zap, Shield } from "lucide-react";
import { useState } from "react";

export default function FundWalletModal({ isOpen, onClose, onConfirm }) {
  const [amount, setAmount] = useState("");
  const [selectedAmount, setSelectedAmount] = useState(null);

  const presetAmounts = [1000, 5000, 10000, 20000, 50000];

  const handlePresetClick = (value) => {
    setAmount(value.toString());
    setSelectedAmount(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (amount && Number(amount) > 0) {
      onConfirm(amount);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4"
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-rose-600 to-pink-600 p-6 text-white relative">
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-white/20 rounded-xl">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <h2 className="text-xl font-bold">Fund Your Wallet</h2>
                </div>
                <p className="text-sm text-rose-100">Add funds to vote and support your favorite contestants</p>
              </div>

              {/* Body */}
              <form onSubmit={handleSubmit} className="p-6">
                {/* Preset Amounts */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Quick Select
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {presetAmounts.map((preset) => (
                      <motion.button
                        key={preset}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePresetClick(preset)}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          selectedAmount === preset
                            ? 'border-rose-600 bg-rose-50 text-rose-600'
                            : 'border-gray-200 hover:border-rose-300 text-gray-700'
                        }`}
                      >
                        ₦{preset.toLocaleString()}
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Custom Amount */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Or Enter Custom Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">₦</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setSelectedAmount(null);
                      }}
                      placeholder="0.00"
                      min="100"
                      step="100"
                      className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">Minimum amount: ₦100</p>
                </div>

                {/* Features */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-rose-600" />
                    <span className="text-sm font-medium text-gray-700">Why fund your wallet?</span>
                  </div>
                  <ul className="space-y-2 text-xs text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-rose-600 rounded-full"></div>
                      Vote for your favorite contestants
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-rose-600 rounded-full"></div>
                      Send gifts to support contestants
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-rose-600 rounded-full"></div>
                      Unlock exclusive fan rewards
                    </li>
                  </ul>
                </div>

                {/* Security Badge */}
                <div className="flex items-center justify-center gap-2 mb-4 text-xs text-gray-500">
                  <Shield className="w-3 h-3" />
                  <span>Secured by Paystack</span>
                </div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={!amount || Number(amount) < 100}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 text-white py-4 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-shadow"
                >
                  Continue to Payment
                </motion.button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}