// pages/admin/users.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: sessionData } = await supabase.auth.getUser();
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", sessionData?.user?.id)
        .single();

      if (!profile || profile.role !== "admin") {
        router.push("/");
        return;
      }

      const { data, error } = await supabase.from("profiles").select("id, email, phone_number, role, created_at");
      if (!error) setUsers(data);
      setLoading(false);
    };

    fetchUsers();
  }, [router]);

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-rose-50">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-x-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">All Users</h1>

          {loading ? (
            <p>Loading users...</p>
          ) : (
            <table className="w-full table-auto text-sm text-left">
              <thead>
                <tr className="bg-rose-100 text-gray-700">
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Phone</th>
                  <th className="px-4 py-2">Role</th>
                  <th className="px-4 py-2">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b hover:bg-rose-50">
                    <td className="px-4 py-2">{user.email}</td>
                    <td className="px-4 py-2">{user.phone_number || "-"}</td>
                    <td className="px-4 py-2 capitalize">{user.role}</td>
                    <td className="px-4 py-2">{new Date(user.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
