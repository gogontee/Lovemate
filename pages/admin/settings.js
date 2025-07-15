// pages/admin/settings.js
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";
import Head from "next/head";
import { useState } from "react";

export default function AdminSettings() {
  const [settings, setSettings] = useState({
    votePrice: "100", // default vote price
    giftOptions: "Rose, Teddy Bear, Chocolate",
    maintenanceMode: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // You can add Supabase update logic here
    alert("Settings saved successfully!");
  };

  return (
    <div className="min-h-screen flex">
      <Head>
        <title>Admin Settings - Lovemate</title>
      </Head>

      <AdminSidebar />

      <main className="flex-1 bg-gray-50 p-6">
        <AdminHeader title="Settings" />

        <div className="max-w-xl bg-white shadow-md rounded p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Platform Settings</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Vote Price (₦)</label>
              <input
                type="number"
                name="votePrice"
                value={settings.votePrice}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gift Options (comma-separated)</label>
              <input
                type="text"
                name="giftOptions"
                value={settings.giftOptions}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                name="maintenanceMode"
                checked={settings.maintenanceMode}
                onChange={handleChange}
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Enable Maintenance Mode</label>
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white py-2 rounded"
            >
              Save Settings
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
