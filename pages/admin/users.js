import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import AdminHeader from "@/components/AdminHeader";
import AdminSidebar from "@/components/AdminSidebar";
import withAdminAuth from "@/components/withAdminAuth";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
  const fetchUsers = async () => {
  const { data, error } = await supabase
    .from("profile")
    .select("id, full_name, email, role, phone, photo_url, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching users:", error);
    return;
  }

  setUsers(data); // just use the data directly
};


  fetchUsers();
}, []);

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      user.email?.toLowerCase().includes(search.toLowerCase())
  );

  const promoteToRole = async (userId, newRole) => {
    const { error } = await supabase
      .from("profile")
      .update({ role: newRole })
      .eq("id", userId);

    if (error) {
      console.error("Failed to update role:", error.message);
    } else {
      console.log(`User role updated to ${newRole}`);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Manage Users</h2>
            <input
              type="text"
              placeholder="Search users..."
              className="px-4 py-2 border border-gray-300 rounded-md w-64 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-white shadow-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white shadow rounded-lg">
              <thead>
                <tr className="bg-rose-100 text-left text-sm font-semibold text-gray-700">
                  <th className="px-4 py-3">Photo</th>
                  <th className="px-4 py-3">Full Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Joined</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b hover:bg-rose-50 text-sm text-gray-800"
                  >
                    <td className="px-4 py-3">
                      <img
  src={user.photo_url || "https://via.placeholder.com/40?text=👤"}
  alt={user.full_name}
  className="w-10 h-10 rounded-full object-cover"
/>

                    </td>

                    <td className="px-4 py-3">{user.full_name || "—"}</td>
                    <td className="px-4 py-3">{user.email || "—"}</td>
                    <td className="px-4 py-3">{user.phone_number || "—"}</td>

                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={async (e) => {
                          const newRole = e.target.value;
                          await promoteToRole(user.id, newRole);
                          setUsers((prevUsers) =>
                            prevUsers.map((u) =>
                              u.id === user.id ? { ...u, role: newRole } : u
                            )
                          );
                        }}
                        className="border rounded-md px-2 py-1 text-sm text-rose-600 font-semibold bg-white shadow-sm focus:outline-none"
                      >
                        <option value="fan">Fan</option>
                        <option value="candidate">Candidate</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>

                    <td className="px-4 py-3">
                      {user.created_at
                        ? new Date(user.created_at).toLocaleDateString("en-GB")
                        : "—"}
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminUsers);
