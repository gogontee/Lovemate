// pages/admin/notifications.js
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import { PlusCircle } from "lucide-react";

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setNotifications(data);
  };

  const handleCreateNotification = async () => {
    if (!newMessage.trim()) return;
    setLoading(true);

    const { error } = await supabase.from("notifications").insert([
      {
        message: newMessage,
        is_global: true,
      },
    ]);

    if (!error) {
      setNewMessage("");
      fetchNotifications();
    }
    setLoading(false);
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 bg-rose-50 min-h-screen p-6">
        <AdminHeader title="Notifications" />

        {/* Notification Form */}
        <div className="bg-white rounded-md shadow p-4 mb-6">
          <h2 className="text-lg font-semibold mb-2">Send Global Notification</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 border rounded p-2 text-sm"
              placeholder="Type your message..."
            />
            <button
              onClick={handleCreateNotification}
              className="bg-rose-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-rose-700 flex items-center gap-1"
              disabled={loading}
            >
              <PlusCircle size={16} /> Send
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-md shadow p-4">
          <h3 className="text-md font-semibold mb-3">Notification History</h3>
          <ul className="divide-y text-sm">
            {notifications.map((note) => (
              <li key={note.id} className="py-2 text-gray-800">
                <div className="flex justify-between items-center">
                  <span>{note.message}</span>
                  <span className="text-gray-400 text-xs">
                    {new Date(note.created_at).toLocaleString()}
                  </span>
                </div>
              </li>
            ))}
            {notifications.length === 0 && (
              <li className="text-gray-500 py-2">No notifications yet.</li>
            )}
          </ul>
        </div>
      </main>
    </div>
  );
}
