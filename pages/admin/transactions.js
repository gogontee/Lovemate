import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient.js";
import AdminSidebar from "../../components/AdminSidebar.js";
import AdminHeader from "../../components/AdminHeader.js";
import withAdminAuth from "../../components/withAdminAuth.js";

function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    status: "",
  });

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);

      let query = supabase
        .from("transactions")
        .select(
          `
            id,
            amount,
            type,
            status,
            created_at,
            profiles:profiles (
              id,
              full_name,
              email
            )
          `
        )
        .order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching transactions:", error);
      } else {
        setTransactions(data);
      }

      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const filtered = transactions.filter((tx) => {
    const matchesSearch =
      tx.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      tx.profiles?.email?.toLowerCase().includes(search.toLowerCase());

    const matchesType = filters.type ? tx.type === filters.type : true;
    const matchesStatus = filters.status ? tx.status === filters.status : true;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Transactions</h2>

            <div className="flex flex-wrap gap-3 items-center">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="px-4 py-2 border rounded-md text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <select
                name="type"
                className="border rounded-md px-3 py-2 text-sm"
                onChange={handleFilterChange}
              >
                <option value="">All Types</option>
                <option value="vote">Vote</option>
                <option value="gift">Gift</option>
                <option value="funding">Funding</option>
              </select>

              <select
                name="status"
                className="border rounded-md px-3 py-2 text-sm"
                onChange={handleFilterChange}
              >
                <option value="">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Loading transactions...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead>
                  <tr className="bg-rose-50 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Amount (₦)</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((tx) => (
                    <tr key={tx.id} className="border-b hover:bg-rose-50 text-sm">
                      <td className="px-4 py-3">{tx.profiles?.full_name || "—"}</td>
                      <td className="px-4 py-3">{tx.profiles?.email}</td>
                      <td className="px-4 py-3 font-semibold text-green-700">
                        ₦{tx.amount?.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 capitalize">{tx.type}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            tx.status === "completed"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}

                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-6">
                        No matching transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminTransactions);
