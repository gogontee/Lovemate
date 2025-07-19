import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";
import withAdminAuth from "@/components/withAdminAuth";

function AdminApplicants() {
  const [profilesApplicants, setProfilesApplicants] = useState([]);
  const [registeredApplicants, setRegisteredApplicants] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchApplicants = async () => {
      setLoading(true);

      // Get applicants from `profiles`
      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, phone, role, created_at, photo")
        .eq("role", "applicant")
        .order("created_at", { ascending: false });

      if (!profilesError) setProfilesApplicants(profilesData);

      // Get applicants from `register`
      const { data: registerData, error: registerError } = await supabase
        .from("register")
        .select("*")
        .order("created_at", { ascending: false });

      if (!registerError) setRegisteredApplicants(registerData);

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
      setProfilesApplicants((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const rejectApplicant = async (id) => {
    const { error } = await supabase
      .from("profiles")
      .delete()
      .eq("id", id);

    if (!error) {
      setProfilesApplicants((prev) => prev.filter((a) => a.id !== id));
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
            <>
              {/* Applicants from 'profiles' */}
              <div className="mb-10">
                <h3 className="text-lg font-semibold mb-2 text-rose-600">Profiles Applicants</h3>
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
                      {profilesApplicants.map((applicant) => (
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
                      {profilesApplicants.length === 0 && (
                        <tr>
                          <td colSpan="6" className="text-center text-gray-500 py-6">
                            No applicants found in profiles.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Applicants from 'register' */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-pink-600">Registered Applicants</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {registeredApplicants.map((applicant) => (
                    <div key={applicant.id} className="bg-white p-4 shadow rounded">
                      <img
                        src={applicant.photo_url || "/avatar.png"}
                        alt={applicant.full_name}
                        className="w-full h-40 object-cover rounded mb-2"
                      />
                      <h2 className="font-semibold text-lg">{applicant.full_name}</h2>
                      <p><strong>Email:</strong> {applicant.email}</p>
                      <p><strong>Phone:</strong> {applicant.phone}</p>
                      <p><strong>Intention:</strong> {applicant.intention}</p>
                    </div>
                  ))}
                  {registeredApplicants.length === 0 && (
                    <p className="text-gray-500">No registered applicants found.</p>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default withAdminAuth(AdminApplicants);
