import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { Menu, X, UserCircle, Home, Heart, Eye } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

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
        data: { user: currentUser },
      } = await supabase.auth.getUser();
      setUser(currentUser);

      if (currentUser) {
        const { data } = await supabase
          .from("profiles")
          .select("photo")
          .eq("id", currentUser.id)
          .single();
        if (data?.photo) setAvatarUrl(data.photo);
      }
    };

    getUser();
  }, []);

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push("/");
    setDropdownOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [menuOpen]);

  return (
    <>
      <header className="bg-gradient-to-r from-rose-50 to-pink-50 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          {/* Logo - Reduced by 30% */}
          <Link href="/" className="block leading-none">
            <div className="relative w-11 h-11 md:w-14 md:h-14">
              <Image
                src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
                alt="Lovemate Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex space-x-2 text-sm items-center">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-1 rounded-md font-medium transition-all duration-300 ${
                  router.pathname === link.path
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md"
                    : "text-gray-700 hover:text-red-600 hover:bg-rose-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3 relative">
            {/* Live */}
            <Link
              href="/gallery?tab=stream#livestream"
              className="hidden md:flex px-4 py-1 rounded-md bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 hover:from-red-600 hover:to-rose-600 hover:text-white font-semibold transition-all duration-300 items-center gap-1"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              📻 Live
            </Link>

            {/* Auth Area */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="hidden md:flex items-center gap-2 px-2 py-0 rounded-full hover:bg-rose-100 transition"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={36}
                      height={36}
                      className="rounded-full border-2 border-rose-300 object-cover"
                    />
                  ) : (
                    <UserCircle size={36} className="text-rose-600" />
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl z-50 text-sm border border-rose-100 overflow-hidden">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-3 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 text-gray-700 transition"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 text-gray-700 transition border-t border-rose-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden md:flex items-center gap-2 px-4 py-1 rounded-md bg-gradient-to-r from-red-600 to-rose-600 text-white hover:from-red-700 hover:to-rose-700 font-medium transition-all duration-300 shadow-md hover:shadow-lg"
              >
                <UserCircle size={20} /> Login
              </Link>
            )}

            {/* Hamburger for Mobile */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-1 rounded-lg text-rose-700 hover:bg-rose-100 transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-64 bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-end p-4 border-b border-rose-100">
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 rounded-lg text-rose-700 hover:bg-rose-100"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="p-4 space-y-2">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <div className="border-t border-rose-100 my-4 pt-4">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-3 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link
                      href="/auth/login"
                      onClick={() => setMenuOpen(false)}
                      className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 transition"
                    >
                      Login
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile & Tablet Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-rose-100 shadow-2xl shadow-rose-200/30 z-50">
        <div className="flex justify-around items-center h-20 px-2 relative">
          {/* Home - Left */}
          <Link
            href="/"
            className={`
              flex flex-col items-center justify-center py-2 px-3 rounded-xl
              transition-all duration-300 group relative
              ${router.pathname === "/" ? 'bg-gradient-to-r from-red-50 to-rose-50' : ''}
            `}
          >
            <Home 
              size={24} 
              className={`
                transition-all duration-300
                ${router.pathname === "/" 
                  ? 'text-red-600' 
                  : 'text-gray-500 group-hover:text-red-500'
                }
              `}
            />
            <span className={`
              text-xs mt-1 font-medium transition-all duration-300
              ${router.pathname === "/" 
                ? 'text-red-600 font-semibold' 
                : 'text-gray-500 group-hover:text-red-500'
              }
            `}>
              Home
            </span>
            {router.pathname === "/" && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-red-500"></div>
            )}
          </Link>

          {/* Vote - Center */}
          <Link
            href="/vote"
            className="relative -top-6 flex flex-col items-center group"
          >
            <div className={`
              bg-gradient-to-r from-red-500 to-rose-600 p-4 rounded-full 
              shadow-lg shadow-red-400/30 transform transition-all duration-300
              ${router.pathname === "/vote" 
                ? 'scale-110 ring-4 ring-red-200 shadow-red-500/50' 
                : 'group-hover:scale-105'
              }
            `}>
              <Heart 
                size={28} 
                className="text-white"
                fill={router.pathname === "/vote" ? "white" : "transparent"}
              />
            </div>
            <span className={`
              absolute -bottom-5 text-xs font-medium transition-all duration-300
              ${router.pathname === "/vote" 
                ? 'text-red-600 font-bold' 
                : 'text-gray-500 group-hover:text-red-500'
              }
            `}>
              Vote
            </span>
          </Link>

          {/* Watch - Right */}
          <Link
            href="/gallery?tab=stream#livestream"
            className={`
              flex flex-col items-center justify-center py-2 px-3 rounded-xl
              transition-all duration-300 group relative
              ${router.pathname === "/gallery" ? 'bg-gradient-to-r from-red-50 to-rose-50' : ''}
            `}
          >
            <Eye 
              size={24} 
              className={`
                transition-all duration-300
                ${router.pathname === "/gallery" 
                  ? 'text-red-600' 
                  : 'text-gray-500 group-hover:text-red-500'
                }
              `}
            />
            <span className={`
              text-xs mt-1 font-medium transition-all duration-300
              ${router.pathname === "/gallery" 
                ? 'text-red-600 font-semibold' 
                : 'text-gray-500 group-hover:text-red-500'
              }
            `}>
              Watch
            </span>
            {router.pathname === "/gallery" && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-red-500"></div>
            )}
          </Link>
        </div>
        
        {/* Safe area padding for modern phones */}
        <div className="h-[env(safe-area-inset-bottom)] bg-white/95"></div>
      </nav>
    </>
  );
}