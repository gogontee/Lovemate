// pages/admin/applicants.js

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import withAdminAuth from "@/components/withAdminAuth";

function AdminApplicants() {
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, created_at, photo")
        .eq("role", "applicant")
        .order("created_at", { ascending: false });

      if (error) console.error(error);
      else setApplicants(data);

      setLoading(false);
    };

    fetchApplicants();
  }, []);

  const promoteToCandidate = async (id) => {
    const { error } = await supabase
      .from("profiles")
      .update({ role: "candidate" })
      .eq("id", id);

    if (!error) {
      setApplicants((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const rejectApplicant = async (id) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (!error) {
      setApplicants((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <AdminHeader />

        <main className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Manage Applicants
          </h2>

          {loading ? (
            <p>Loading applicants...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white shadow rounded-lg">
                <thead>
                  <tr className="bg-rose-100 text-left text-sm font-semibold text-gray-800">
                    <th className="px-4 py-3">Photo</th>
                    <th className="px-4 py-3">Full Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((applicant) => (
                    <tr key={applicant.id} className="border-b hover:bg-rose-50 text-sm">
                      <td className="px-4 py-3">
                        <img
                          src={applicant.photo || "/avatar.png"}
                          alt="photo"
                          className="w-10 h-10 object-cover rounded-full"
                        />
                      </td>
                      <td className="px-4 py-3">{applicant.full_name || "—"}</td>
                      <td className="px-4 py-3">{applicant.email}</td>
                      <td className="px-4 py-3">{applicant.phone || "—"}</td>
                      <td className="px-4 py-3">
                        {new Date(applicant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 space-x-2 flex flex-col sm:flex-row gap-2">
  <button
    onClick={() => promoteToCandidate(applicant.id)}
    className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 text-sm font-medium"
  >
    Approve
  </button>
  <button
    onClick={() => rejectApplicant(applicant.id)}
    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm font-medium"
  >
    Reject
  </button>
</td>
                    </tr>
                  ))}

                  {applicants.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center text-gray-500 py-6">
                        No applicants found.
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

export default withAdminAuth(AdminApplicants);
