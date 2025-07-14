// pages/admin/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import AdminSidebar from "../../components/AdminSidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Link from "next/link";
import { Users, ClipboardList, Star, Bell } from "lucide-react";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profile?.role !== "admin") {
          router.push("/");
        } else {
          setUser(data.user);
        }
      } else {
        router.push("/auth/login");
      }
    };
    getUser();
  }, [router]);

  if (!user) return <div className="text-center p-20">Loading...</div>;

  return (
    <>
      <Header />
      <div className="flex min-h-screen bg-rose-50">
        <AdminSidebar />

        <main className="flex-1 p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link
              href="/admin/users"
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Users</h2>
                <Users className="text-rose-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">Manage all platform users</p>
            </Link>

            <Link
              href="/admin/applicants"
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Applicants</h2>
                <ClipboardList className="text-rose-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">View and promote applicants</p>
            </Link>

            <Link
              href="/admin/candidates"
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Candidates</h2>
                <Star className="text-yellow-500" />
              </div>
              <p className="text-sm text-gray-500 mt-2">Manage current Lovemates</p>
            </Link>

            <Link
              href="/admin/notifications"
              className="bg-white shadow rounded-lg p-6 hover:shadow-md transition border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-700">Notifications</h2>
                <Bell className="text-rose-600" />
              </div>
              <p className="text-sm text-gray-500 mt-2">Send global updates</p>
            </Link>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
