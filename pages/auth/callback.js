// pages/auth/callback.js

import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const redirectAfterLogin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        router.push("/dashboard");
      } else {
        router.push("/auth/login");
      }
    };

    redirectAfterLogin();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center text-gray-600">
      Redirecting, please wait...
    </div>
  );
}
