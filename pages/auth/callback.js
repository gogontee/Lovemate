// pages/auth/callback.js
import { useEffect } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/utils/supabaseClient";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleRedirect = async () => {
      const { error } = await supabase.auth.getSession();

      if (!error) {
        router.push("/dashboard"); // or wherever you want to send them
      } else {
        router.push("/auth/login");
      }
    };

    handleRedirect();
  }, [router]);

  return <p className="p-6 text-center">Verifying...</p>;
}
