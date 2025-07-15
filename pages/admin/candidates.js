import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient.js";
import AdminSidebar from "../../components/AdminSidebar.js";
import AdminHeader from "../../components/AdminHeader.js";
import withAdminAuth from "../../components/withAdminAuth.js";
import Link from "next/link";

function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    gender: "",
    status: "",
    stage: "",
  });

  useEffect(() => {
    const fetchCandidates = async () => {
      setLoading(true);

      let query = supabase
        .from("profiles")
        .select("id, full_name, email, photo, role, gender, status, stage, created_at, votes")
        .eq("role", "candidate");

      if (filters.gender) query = query.eq("gender", filters.gender);
      if (filters.status) query = query.eq("status", filters.status);
      if (filters.stage) query = query.eq("stage", filters.stage);

      const { data, error } = await query.order("created_at", { ascending: false });

      if (error) console.error(error);
      else setCandidates(data);

      setLoading(false);
    };

    fetchCandidates();
  }, [filters]);

  const demoteCandidate = async (id) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "fan" })
      .eq("id", id);

    if (!error) {
      setCandidates((prev) => prev.filter((c) => c.id !== id));
    }
  };

  const promoteCandidate = async (id, nextStage) => {
    const { error } = await supabase
      .from("profiles")
      .update({ stage: nextStage })
      .eq("id", id);

    if (!error) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === id ? { ...c, stage: nextStage } : c))
      );
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Manage Candidates</h2>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              name="gender"
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
            <select
              name="status"
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              name="stage"
              onChange={handleFilterChange}
              className="border px-3 py-2 rounded text-sm"
            >
              <option value="">All Stages</option>
              <option value="Top 100">Top 100</option>
              <option value="Top 20">Top 20</option>
              <option value="Finalist">Finalist</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <p>Loading candidates...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead>
                  <tr className="bg-rose-50 text-left text-sm font-semibold text-gray-700">
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Gender</th>
                    <th className="px-4 py-3">Stage</th>
                    <th className="px-4 py-3">Votes</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {candidates.map((c) => (
                    <tr key={c.id} className="border-b hover:bg-rose-50 text-sm">
                      <td className="px-4 py-3">
                        <img
                          src={c.photo || "/avatar.png"}
                          alt="Candidate"
                          className="w-10 h-10 object-cover rounded-full"
                        />
                      </td>
                      <td className="px-4 py-3">{c.full_name || "—"}</td>
                      <td className="px-4 py-3 capitalize">{c.gender || "—"}</td>
                      <td className="px-4 py-3">{c.stage || "N/A"}</td>
                      <td className="px-4 py-3 font-bold text-rose-600">{c.votes || 0}</td>
                      <td className="px-4 py-3">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-y-1 flex flex-col">
                        <Link
                          href={`/candidate/${c.id}`}
                          className="text-blue-600 underline text-xs"
                        >
                          View Profile
                        </Link>
                        <select
                          onChange={(e) => promoteCandidate(c.id, e.target.value)}
                          className="border text-xs rounded px-2 py-1 mt-1"
                          defaultValue=""
                        >
                          <option value="" disabled>
                            Promote to...
                          </option>
                          <option value="Top 100">Top 100</option>
                          <option value="Top 20">Top 20</option>
                          <option value="Finalist">Finalist</option>
                        </select>
                        <button
                          onClick={() => demoteCandidate(c.id)}
                          className="text-red-600 text-xs hover:underline mt-1"
                        >
                          Demote
                        </button>
                      </td>
                    </tr>
                  ))}

                  {candidates.length === 0 && (
                    <tr>
                      <td colSpan="7" className="text-center text-gray-500 py-6">
                        No candidates found.
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

export default withAdminAuth(AdminCandidates);
