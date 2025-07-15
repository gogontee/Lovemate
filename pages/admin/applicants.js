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
    const fetchData = async () => {
      const { data: session } = await supabase.auth.getUser();
      if (!session?.user) return router.push("/auth/login");

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (profile?.role !== "admin") return router.push("/");

      setUser(session.user);
      const { data } = await supabase
        .from("profiles")
        .select("id, email, full_name, phone_number, created_at")
        .eq("role", "applicant")
        .order("created_at", { ascending: false });

      setApplicants(data || []);
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const promote = async (id) => {
    setPromoting(id);
    await supabase.from("profiles").update({ role: "candidate" }).eq("id", id);
    setApplicants(applicants.filter((a) => a.id !== id));
    setPromoting(null);
  };

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-rose-50">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold mb-6">Applicants</h1>
          {loading ? (
            <div>Loading...</div>
          ) : applicants.length === 0 ? (
            <div>No applicants found.</div>
          ) : (
            <table className="w-full bg-white rounded shadow overflow-hidden text-sm">
              <thead className="bg-rose-100 text-rose-800">
                <tr>
                  <th className="p-3 text-left">Name</th>
                  <th className="p-3 text-left">Email</th>
                  <th className="p-3 text-left">Phone</th>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {applicants.map((a) => (
                  <tr key={a.id} className="border-b hover:bg-rose-50">
                    <td className="p-3">{a.full_name}</td>
                    <td className="p-3">{a.email}</td>
                    <td className="p-3">{a.phone_number}</td>
                    <td className="p-3">
                      {new Date(a.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => promote(a.id)}
                        className="bg-rose-600 text-white px-3 py-1 rounded hover:bg-rose-700 disabled:opacity-50"
                        disabled={promoting === a.id}
                      >
                        {promoting === a.id ? (
                          <span className="flex items-center justify-center">
                            <Loader2 size={16} className="animate-spin mr-1" />
                            Promoting...
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
          )}
        </main>
      </div>
      <Footer />
    </>
  );
}
