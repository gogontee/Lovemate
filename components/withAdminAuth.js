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
        const { data, error } = await supabase.auth.getUser();

        if (error || !data?.user) {
          router.push("/auth/login");
          return;
        }

        // Fetch role from Supabase user metadata or profiles table
        const { user } = data;

        const { data: profile } = await supabase
          .from("profiles") // adjust table name if different
          .select("role")
          .eq("id", user.id)
          .single();

        if (profile?.role === "admin") {
          setAuthorized(true);
        } else {
          router.push("/auth/login");
        }

        setLoading(false);
      };

      checkSession();
    }, []);

    if (loading) {
      return <div className="p-10 text-center">Checking authorization...</div>;
    }

    if (!authorized) return null;

    return <Component {...props} />;
  };
}
