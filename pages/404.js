// pages/403.js
import Link from "next/link";

export default function Forbidden() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-100">
      <h1 className="text-5xl font-bold text-red-600 mb-4">403</h1>
      <p className="text-xl text-gray-700 mb-6">
        You’re not authorized to access this page.
      </p>
      <Link href="/login" className="px-6 py-2 bg-rose-600 text-white rounded hover:bg-rose-700 transition">
        Go to Login
      </Link>
    </div>
  );
}
