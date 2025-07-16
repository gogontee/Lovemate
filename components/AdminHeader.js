// components/AdminHeader.js
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { Bell, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";

export default function AdminHeader() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  return (
    <header className="bg-white shadow px-6 py-4 flex items-center justify-between border-b border-gray-200">
      <div>
        <h1 className="text-lg font-semibold text-rose-600">Admin Panel</h1>
      </div>

      <div className="flex items-center gap-4">
        <button className="text-gray-500 hover:text-rose-600">
          <Bell size={20} />
        </button>

        {user && (
          <div className="flex items-center gap-2">
            <Image
              src="/avatar.png"
              alt="Avatar"
              width={32}
              height={32}
              className="rounded-full object-cover"
            />
            <div className="text-sm">
              <p className="text-gray-700 font-medium">Admin</p>
              <p className="text-gray-400 text-xs">{user.email}</p>
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
