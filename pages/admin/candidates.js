// pages/admin/candidates.js
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import AdminSidebar from "../components/AdminSidebar";
import AdminHeader from "../components/AdminHeader";
import Image from "next/image";

export default function AdminCandidates() {
  const [candidates, setCandidates] = useState([]);
  const [filters, setFilters] = useState({ gender: "", age: "", location: "" });
  const [loading, setLoading] = useState(true);

  const fetchCandidates = async () => {
    setLoading(true);
    let query = supabase.from("profiles").select("id, full_name, avatar_url, gender, age, location, vote_count, total_gift").eq("role", "candidate");

    if (filters.gender) query = query.eq("gender", filters.gender);
    if (filters.age) query = query.eq("age", filters.age);
    if (filters.location) query = query.ilike("location", `%${filters.location}%`);

    const { data, error } = await query;
    if (!error) setCandidates(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCandidates();
  }, [filters]);

  const handleRoleChange = async (id, newRole) => {
    await supabase.from("profiles").update({ role: newRole }).eq("id", id);
    fetchCandidates();
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-rose-50">
        <AdminHeader title="Candidates" />

        <div className="p-4">
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <select
              value={filters.gender}
              onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
              className="p-2 border rounded"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <input
              type="number"
              placeholder="Filter by Age"
              className="p-2 border rounded"
              value={filters.age}
              onChange={(e) => setFilters({ ...filters, age: e.target.value })}
            />
            <input
              type="text"
              placeholder="Filter by Location"
              className="p-2 border rounded"
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            />
          </div>

          {loading ? (
            <p className="text-center">Loading candidates...</p>
          ) : candidates.length === 0 ? (
            <p className="text-center text-gray-500">No candidates found.</p>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {candidates.map((candidate) => (
                <div key={candidate.id} className="bg-white border rounded shadow p-4">
                  <div className="flex items-center gap-4">
                    <Image
                      src={candidate.avatar_url || "/placeholder.png"}
                      alt={candidate.full_name}
                      width={60}
                      height={60}
                      className="rounded-full object-cover"
                    />
                    <div>
                      <h2 className="font-semibold text-lg">{candidate.full_name}</h2>
                      <p className="text-sm text-gray-500">{candidate.gender}, {candidate.age}</p>
                      <p className="text-sm text-gray-500">{candidate.location}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-700">
                    <p>Votes: <span className="font-bold">{candidate.vote_count || 0}</span></p>
                    <p>Total Gifts: ₦<span className="font-bold">{candidate.total_gift || 0}</span></p>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleRoleChange(candidate.id, "fan")}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-1 rounded text-xs"
                    >
                      Demote
                    </button>
                    <button
                      onClick={() => handleRoleChange(candidate.id, "candidate")}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-3 py-1 rounded text-xs"
                    >
                      Promote
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

