// pages/admin/notifications.js
import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        setNotifications(data);
      }

      setLoading(false);
    };

    fetchNotifications();
  }, []);

  return (
    <div className="flex">
      <AdminSidebar />

      <main className="flex-1 p-6">
        <AdminHeader />
        <h2 className="text-2xl font-semibold mb-4 text-rose-600">Notifications</h2>

        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p>No notifications available.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((note) => (
              <li
                key={note.id}
                className="p-4 bg-white rounded shadow border-l-4 border-rose-500"
              >
                <p className="font-medium">{note.message}</p>
                <p className="text-xs text-gray-500">
                  {new Date(note.created_at).toLocaleString()} — {note.type}
                </p>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
