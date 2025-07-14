// pages/admin/transactions.js
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import AdminSidebar from "../../components/AdminSidebar";
import AdminHeader from "../../components/AdminHeader";

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      let { data, error } = await supabase
        .from("transactions")
        .select("*, profiles:profiles(email)")
        .order("created_at", { ascending: false });

      if (!error) {
        setTransactions(data);
      }
      setLoading(false);
    };

    fetchTransactions();
  }, []);

  const filteredTransactions = transactions.filter((tx) =>
    tx.type.toLowerCase().includes(filter.toLowerCase()) ||
    tx.profiles?.email.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 bg-gray-50">
        <AdminHeader title="Transactions" />

        <div className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-800">All Transactions</h2>
            <input
              type="text"
              placeholder="Search by email or type..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 px-3 py-2 rounded-md text-sm w-64"
            />
          </div>

          {loading ? (
            <p>Loading transactions...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-md">
                <thead>
                  <tr className="bg-rose-100 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="border-b text-sm hover:bg-rose-50">
                      <td className="px-4 py-2">{tx.profiles?.email || "-"}</td>
                      <td className="px-4 py-2">₦{tx.amount?.toLocaleString()}</td>
                      <td className="px-4 py-2 capitalize">{tx.type}</td>
                      <td className="px-4 py-2">{tx.description}</td>
                      <td className="px-4 py-2">{new Date(tx.created_at).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredTransactions.length === 0 && (
                <p className="text-sm text-center text-gray-500 mt-6">No matching transactions found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
