// components/AdminHeader.js
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Bell, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";

export default function AdminHeader() {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("/avatar.png");
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      const currentUser = data?.user;
      setUser(currentUser);

      if (currentUser?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("photo")
          .eq("id", currentUser.id)
          .single();

        if (profile?.photo) setAvatarUrl(profile.photo);
      }
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const isAdminPage = router.pathname.startsWith("/admin");

  return (
    <header className="bg-white shadow px-6 py-4 flex items-center justify-between border-b border-gray-200">
      {/* Left side: title */}
      <div>
        <h1 className="text-lg font-semibold text-rose-600">Admin Panel</h1>
      </div>

      {/* Right side: nav & user info */}
      <div className="flex items-center gap-4">
        {/* Navigation Switch */}
        <Link
          href={isAdminPage ? "/" : "/admin"}
          className="text-sm bg-gray-100 hover:bg-rose-600 hover:text-white text-gray-700 px-3 py-1 rounded transition"
        >
          {isAdminPage ? "Go to Website" : "Back to Admin"}
        </Link>

        {/* Bell Icon */}
        <button className="text-gray-500 hover:text-rose-600" title="Notifications">
          <Bell size={20} />
        </button>

        {/* User Info */}
        {user && (
          <div className="flex items-center gap-3">
            <div className="relative w-9 h-9">
              <Image
                src={avatarUrl}
                alt="Admin Avatar"
                fill
                className="rounded-full object-cover border"
              />
            </div>
            <div className="text-sm">
              <p className="text-gray-700 font-medium">Admin</p>
              <p className="text-gray-400 text-xs truncate max-w-[140px]">{user.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="ml-2 text-gray-500 hover:text-red-600"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

