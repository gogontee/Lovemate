// pages/admin/applicants.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import AdminSidebar from "../../components/AdminSidebar";
import { CheckCircle, Loader2 } from "lucide-react";

export default function ApplicantsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [promoting, setPromoting] = useState(null);

  useEffect(() => {
    const fetchUserAndApplicants = async () => {
      const { data: session } = await supabase.auth.getUser();
      if (!session?.user) return router.push("/auth/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") return router.push("/");

      setUser(session.user);
      const { data: applicantsData } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone_number, created_at")
        .eq("role", "applicant")
        .order("created_at", { ascending: false });

      setApplicants(applicantsData || []);
      setLoading(false);
    };
    fetchUserAndApplicants();
  }, [router]);

  const promoteToCandidate = async (id) => {
    setPromoting(id);
    await supabase
      .from("profiles")
      .update({ role: "candidate" })
      .eq("id", id);

    setApplicants(applicants.filter((a) => a.id !== id));
    setPromoting(null);
  };

  if (!user) return <div className="text-center py-20">Loading...</div>;

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-rose-50">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Applicants</h1>
          {loading ? (
            <div className="text-center py-10 text-gray-500">Loading...</div>
          ) : applicants.length === 0 ? (
            <div className="text-center py-10 text-gray-500">No applicants found.</div>
          ) : (
            <div className="overflow-x-auto bg-white border border-gray-100 shadow rounded-lg">
              <table className="min-w-full text-sm">
                <thead className="bg-rose-100 text-rose-800">
                  <tr>
                    <th className="p-3 text-left">Full Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Phone</th>
                    <th className="p-3 text-left">Date</th>
                    <th className="p-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.map((a) => (
                    <tr key={a.id} className="border-b hover:bg-rose-50">
                      <td className="p-3">{a.full_name || "-"}</td>
                      <td className="p-3">{a.email}</td>
                      <td className="p-3">{a.phone_number || "-"}</td>
                      <td className="p-3">{new Date(a.created_at).toLocaleDateString()}</td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => promoteToCandidate(a.id)}
                          className="text-sm bg-rose-600 text-white px-4 py-1 rounded hover:bg-rose-700 disabled:opacity-60"
                          disabled={promoting === a.id}
                        >
                          {promoting === a.id ? (
                            <span className="flex items-center justify-center">
                              <Loader2 className="animate-spin mr-1" size={16} /> Promoting
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <CheckCircle size={16} /> Promote
                            </span>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
