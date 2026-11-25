import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState, useRef } from "react";
import { supabase } from "../utils/supabaseClient";
import { Menu, X, UserCircle, Home, Heart, LayoutDashboard, Tv, ChevronDown } from "lucide-react";

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
          .from("profile")
          .select("photo_url")
          .eq("id", currentUser.id)
          .single();
          
        if (data?.photo_url) setAvatarUrl(data.photo_url);
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
      <header className="bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.025)_22%,transparent_48%),linear-gradient(90deg,#08080b_0%,#270a18_50%,#08080b_100%)] shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4">
          {/* Logo */}
          <Link href="/" className="block leading-none">
            <div className="relative w-11 h-11 md:w-14 md:h-14">
              <Image
                src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
                alt="Lovemate Logo"
                fill
                sizes="(max-width: 768px) 44px, 56px"
                loading="eager"
                className="object-contain"
                priority
                unoptimized
                quality={85} 
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
                    : "text-white hover:text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Side */}
          <div className="flex items-center space-x-3 relative">
            {/* Live - Desktop - Icon only, white */}
            <Link
              href="/gallery?tab=stream#livestream"
              className="hidden md:flex p-2 rounded-md text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition-all duration-300 items-center"
              title="Live TV"
            >
              <Tv size={20} />
            </Link>

            {/* Live - Mobile Header - White icon, no container */}
            <Link
              href="/gallery?tab=stream#livestream"
              className="md:hidden flex items-center p-1.5 rounded-md text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition-all duration-300"
              title="Live TV"
            >
              <Tv size={20} />
            </Link>

            {/* Auth Area */}
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)} 
                  className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 transition-all"
                >
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt="Profile"
                      width={36}
                      height={36}
                      sizes="36px"
                      loading="eager"
                      unoptimized
                      className="rounded-full border-2 border-[#DC143C] object-cover"
                    />
                  ) : (
                    <UserCircle size={36} className="text-white hover:text-rose-400 transition" />
                  )}
                  
                  {/* Added Chevron Icon to indicate dropdown */}
                  <ChevronDown 
                    size={16} 
                    className={`text-white/70 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#1a0a12] rounded-xl shadow-xl z-50 text-sm border border-rose-900/50 overflow-hidden">
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-3 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 text-gray-200 transition"
                    >
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 text-gray-200 transition border-t border-rose-900/50"
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
              className="md:hidden p-1 rounded-lg text-white hover:text-rose-400 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 transition"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {menuOpen && (
          <div className="fixed inset-0 bg-black/70 z-40 md:hidden" onClick={() => setMenuOpen(false)}>
            <div 
              className="absolute right-0 top-0 h-full w-64 bg-[#0a0a0f] shadow-2xl flex flex-col border-l border-rose-900/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b border-rose-900/50">
                <span className="text-base font-semibold text-white">Menu</span>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-1 rounded-lg text-white hover:text-rose-400 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 transition"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-2 pb-24">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="block px-4 py-2 text-sm text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <Link
                  href="/gallery?tab=stream#livestream"
                  className="block px-4 py-2 text-sm text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition"
                  onClick={() => setMenuOpen(false)}
                >
                  <span className="flex items-center gap-2">
                    <Tv size={16} className="text-white" />
                    Live TV
                  </span>
                </Link>
                
                <div className="border-t border-rose-900/50 my-2 pt-2">
                  {user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          handleLogout();
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/login"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition"
                      >
                        Login
                      </Link>
                      <Link
                        href="/auth/signup"
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-white hover:bg-gradient-to-r hover:from-red-600/20 hover:to-rose-600/20 hover:text-rose-400 transition"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mobile & Tablet Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/95 backdrop-blur-lg border-t border-rose-900/50 shadow-2xl shadow-rose-900/20 z-50">
        <div className="flex justify-around items-center h-20 px-2 relative">
          <Link
            href="/"
            className={`
              flex flex-col items-center justify-center py-2 px-3 rounded-xl
              transition-all duration-300 group relative
              ${router.pathname === "/" ? 'bg-gradient-to-r from-red-600/20 to-rose-600/20' : ''}
            `}
          >
            <Home 
              size={24} 
              className={`
                transition-all duration-300
                ${router.pathname === "/" 
                  ? 'text-rose-400' 
                  : 'text-white group-hover:text-rose-400'
                }
              `}
            />
            <span className={`
              text-xs mt-1 font-medium transition-all duration-300
              ${router.pathname === "/" 
                ? 'text-rose-400 font-semibold' 
                : 'text-white group-hover:text-rose-400'
              }
            `}>
              Home
            </span>
            {router.pathname === "/" && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500"></div>
            )}
          </Link>

          <Link
            href="/vote"
            className="relative -top-6 flex flex-col items-center group"
          >
            <div className={`
              bg-gradient-to-r from-red-500 to-rose-600 p-4 rounded-full 
              shadow-lg shadow-red-400/30 transform transition-all duration-300
              ${router.pathname === "/vote" 
                ? 'scale-110 ring-4 ring-rose-900/50 shadow-red-500/50' 
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
                ? 'text-rose-400 font-bold' 
                : 'text-white group-hover:text-rose-400'
              }
            `}>
              Vote
            </span>
          </Link>

          <Link
            href={user ? "/dashboard" : "/auth/login"}
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                router.push("/auth/login");
              }
            }}
            className={`
              flex flex-col items-center justify-center py-2 px-3 rounded-xl
              transition-all duration-300 group relative
              ${router.pathname === "/dashboard" ? 'bg-gradient-to-r from-red-600/20 to-rose-600/20' : ''}
            `}
          >
            <LayoutDashboard 
              size={24} 
              className={`
                transition-all duration-300
                ${router.pathname === "/dashboard" 
                  ? 'text-rose-400' 
                  : 'text-white group-hover:text-rose-400'
                }
              `}
            />
            <span className={`
              text-xs mt-1 font-medium transition-all duration-300
              ${router.pathname === "/dashboard" 
                ? 'text-rose-400 font-semibold' 
                : 'text-white group-hover:text-rose-400'
              }
            `}>
              Dashboard
            </span>
            {router.pathname === "/dashboard" && (
              <div className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-rose-500"></div>
            )}
          </Link>
        </div>
        
        <div className="h-[env(safe-area-inset-bottom)] bg-[#0a0a0f]/95"></div>
      </nav>
    </>
  );
}