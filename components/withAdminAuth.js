// components/withAdminAuth.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";

export default function withAdminAuth(Component) {
  return function ProtectedComponent(props) {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
      const checkSession = async () => {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();

        if (error || !user) {
          router.push("/auth/login");
          return;
        }

        // Fetch user role from profile table using email
        const { data: profile, error: profileError } = await supabase
          .from("profile") // ✅ Your actual table name
          .select("role")
          .eq("email", user.email) // ✅ Lookup by email
          .single();

        if (profileError || !profile) {
          console.error("Profile not found or error:", profileError);
          router.push("/auth/login");
          return;
        }

        if (profile.role === "admin") {
          setAuthorized(true);
        } else {
          router.push("/auth/login");
        }

        setLoading(false);
      };

      checkSession();
    }, []);

    if (loading) {
      return <div className="p-10 text-center">Checking admin access...</div>;
    }

    if (!authorized) return null;

    return <Component {...props} />;
  };
}
