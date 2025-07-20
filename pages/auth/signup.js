import { useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "../../utils/supabaseClient";
import { Eye, EyeOff } from "lucide-react";

export default function SignUp() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    contact: "", // Email or phone
    password: "",
    confirmPassword: "",
    photo: null,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isEmail = (value) => /\S+@\S+\.\S+/.test(value);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!form.contact) {
      setError("Please enter a valid email or phone number.");
      return;
    }

    setLoading(true);

    const signupPayload = isEmail(form.contact)
      ? { email: form.contact, password: form.password }
      : { phone: form.contact, password: form.password };

    const { error: signUpError } = await supabase.auth.signUp(signupPayload);

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    const {
      data: userData,
      error: userFetchError,
    } = await supabase.auth.getUser();

    if (userFetchError || !userData?.user?.id) {
      setError("Could not get user after sign up.");
      setLoading(false);
      return;
    }

    const userId = userData.user.id;

    let photo_url = null;

    if (form.photo) {
      const fileExt = form.photo.name.split(".").pop();
      const filePath = `${userId}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, form.photo, {
          upsert: true,
          contentType: form.photo.type,
        });

      if (uploadError) {
        console.error("Photo upload error:", uploadError.message);
        setError("Failed to upload profile photo.");
        setLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(filePath);
      photo_url = urlData?.publicUrl;
    }

    const { data: existingProfile, error: fetchProfileError } = await supabase
      .from("profile")
      .select("id")
      .eq("id", userId)
      .single();

    if (fetchProfileError && fetchProfileError.code !== "PGRST116") {
      setError("Failed to check existing profile.");
      setLoading(false);
      return;
    }

    if (existingProfile) {
      const { error: updateError } = await supabase
        .from("profile")
        .update({
          full_name: form.fullName,
          phone: !isEmail(form.contact) ? form.contact : null,
          email: isEmail(form.contact) ? form.contact : null,
          photo_url,
        })
        .eq("id", userId);

      if (updateError) {
        setError("Profile update failed: " + updateError.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insertError } = await supabase.from("profile").insert([
        {
          id: userId,
          email: isEmail(form.contact) ? form.contact : null,
          phone: !isEmail(form.contact) ? form.contact : null,
          full_name: form.fullName,
          role: "fan",
          photo_url,
        },
      ]);

      if (insertError) {
        setError("Profile insert failed: " + insertError.message);
        setLoading(false);
        return;
      }
    }

    // ✅ Success flow
    setLoading(false);
    router.push("/auth/login");
  };

  return (
    <section className="min-h-screen bg-rose-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-2xl font-bold mb-4 text-center text-rose-600">
          Create Account
        </h2>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            className="w-full p-3 border rounded text-black"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            required
          />

          <input
            type="text"
            placeholder="Email or Phone Number"
            className="w-full p-3 border rounded text-black"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            required
          />

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, photo: e.target.files[0] })}
            className="w-full p-2 border rounded text-black"
          />

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border rounded text-black pr-10"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full p-3 border rounded text-black pr-10"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-3 flex items-center text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              tabIndex={-1}
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-100 p-2 rounded">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 rounded font-semibold"
            disabled={loading}
          >
            {loading ? "Creating..." : "Sign Up"}
          </button>

          <p className="text-sm text-center mt-4 text-gray-700">
            Already have an account?{" "}
            <a
              href="/auth/login"
              className="text-rose-600 font-semibold hover:underline"
            >
              Log in
            </a>
          </p>
        </form>
      </div>
    </section>
  );
}
