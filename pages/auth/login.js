// pages/auth/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";

export default function Login() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: form.email,
      password: form.password,
    });

    if (error) setError(error.message);
    else router.push("/"); // Redirect to home or dashboard

    setLoading(false);
  };

  return (
    <section className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-rose-600">Log In</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email Address"
            className="w-full p-3 border rounded text-black"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border rounded text-black"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          <p className="text-sm text-center mt-4 text-gray-700">
  Don&apos;t have an account?{" "}
  <a
    href="/auth/signup"
    className="text-rose-600 font-semibold hover:underline"
  >
    Sign up
  </a>
</p>
<p className="text-sm text-center text-gray-600 mt-2">
  <a href="/auth/reset" className="hover:underline">
    Forgot password?
  </a>
</p>
        </form>
      </div>
    </section>
  );
}
