import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { UserCircle } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Register", path: "/register" },
    { name: "Vote", path: "/vote" },
    { name: "Gallery", path: "/gallery" },
    { name: "News", path: "/news" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
  };

  return (
    <header className="bg-rose-50 shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-4">
        {/* Logo Only */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/love.png"
            alt="Lovemate Logo"
            width={120}
            height={40}
            className="object-contain"
            priority
          />
        </Link>

        {/* Navigation */}
        <nav className="hidden md:flex space-x-3 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`px-4 py-2 rounded-md font-medium transition-all duration-300 ${
                router.pathname === link.path
                  ? "bg-primary text-white shadow"
                  : "text-gray-700 hover:text-primary hover:bg-rose-100"
              }`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Icons */}
        <div className="flex items-center space-x-4">
          {/* Live Button */}
          <Link
            href="/gallery?tab=stream#livestream"
            className="px-4 py-2 rounded-md bg-rose-100 text-rose-700 hover:bg-primary hover:text-white font-semibold transition duration-300 text-sm"
            title="Live Stream"
          >
            📻 Live
          </Link>

          {/* Auth Icon */}
          <div className="relative">
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-3 py-2 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white font-medium transition"
              >
                <UserCircle size={20} /> Logout
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="flex items-center gap-1 px-3 py-2 rounded-md bg-rose-100 text-rose-700 hover:bg-rose-600 hover:text-white font-medium transition"
                title="Login"
              >
                <UserCircle size={20} /> Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
