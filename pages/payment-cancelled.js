import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function PaymentCancelled() {
  const router = useRouter();

  useEffect(() => {
    // Close this window/tab after 3 seconds
    setTimeout(() => {
      window.close();
    }, 3000);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="text-center text-white">
        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center text-4xl mx-auto mb-4">
          ❌
        </div>
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-gray-400 mb-4">You cancelled the payment.</p>
        <p className="text-sm text-gray-500">This window will close automatically in 3 seconds...</p>
      </div>
    </div>
  );
}