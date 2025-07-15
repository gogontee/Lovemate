import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  UserCircle,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <Image
            src="/logo/logo10.png"
            width={120}
            height={40}
            className="object-contain"
            alt="Lovemate Logo"
            priority
          />
        </Link>

        {/* Desktop Nav */}
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

        {/* Right Side */}
        <div className="flex items-center space-x-3">
          {/* Live Button */}
          <Link
            href="/gallery?tab=stream#livestream"
            className="px-4 py-2 rounded-md bg-rose-100 text-rose-700 hover:bg-primary hover:text-white font-semibold transition text-sm"
          >
            📻 Live
          </Link>

          {/* Dashboard Link */}
          {user && (
            <Link
              href="/dashboard"
              className="hidden md:flex items-center gap-1 px-3 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700 font-medium transition"
            >
              <LayoutDashboard size={18} /> Dashboard
            </Link>
          )}

          {/* Login/Logout */}
          <div className="hidden md:flex">
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
              >
                <UserCircle size={20} /> Login
              </Link>
            )}
          </div>

          {/* Hamburger for Mobile */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded text-rose-700 hover:bg-rose-100"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav Dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white shadow px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-rose-100"
              onClick={() => setMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}

          {user && (
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-rose-100"
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </Link>
          )}

          {user ? (
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="w-full text-left px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-rose-100"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-rose-100"
              onClick={() => setMenuOpen(false)}
            >
              Login
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
