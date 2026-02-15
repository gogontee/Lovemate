import Image from "next/image";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music,
  Heart,
  Mail,
  MapPin,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/" },
    { label: "Register", href: "/register" },
    { label: "Vote", href: "/vote" },
    { label: "Gallery", href: "/gallery" },
    { label: "News", href: "/news" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  const socialLinks = [
    { icon: Instagram, href: "https://instagram.com/lovemateshow", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Twitter, href: "https://twitter.com/lovemateshow", label: "Twitter", color: "hover:text-sky-500" },
    { icon: Facebook, href: "https://facebook.com/lovemateshow", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Music, href: "https://tiktok.com/@lovemateshow", label: "TikTok", color: "hover:text-gray-900" },
    { icon: Youtube, href: "https://youtube.com/@lovemateshow", label: "YouTube", color: "hover:text-red-600" },
  ];

  return (
    <footer className="relative bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-gray-300 pt-16 pb-8 px-4 overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-64 h-64 bg-rose-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-rose-600 rounded-full blur-3xl"></div>
      </div>
      
      {/* Animated Hearts */}
      <div className="absolute top-20 right-20 opacity-10 hidden lg:block">
        <Heart className="w-32 h-32 text-rose-400 animate-pulse" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 hidden lg:block">
        <Heart className="w-24 h-24 text-rose-400 animate-bounce" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          {/* Brand Column - Wider */}
          <div className="md:col-span-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
                  alt="Lovemate Show Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-2xl font-bold text-white">Lovemate Show</h3>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Where love meets destiny, and every heartbeat tells a story. 
              Africa's premier love and lifestyle reality show bringing you 
              drama, romance, and unforgettable moments.
            </p>

            {/* Email Subscription */}
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <h4 className="text-white text-sm font-semibold mb-2">Stay Updated</h4>
              <p className="text-xs text-gray-400 mb-3">Get the latest news and updates</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 bg-white/10 border border-white/10 rounded-l-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500"
                />
                <button className="bg-rose-600 hover:bg-rose-700 text-white px-3 rounded-r-lg transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Links - Middle */}
          <div className="md:col-span-3">
            <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-rose-500"></span>
              Quick Links
            </h4>
            <ul className="grid grid-cols-2 gap-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-rose-400 transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-1 h-1 bg-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Social - Right */}
          <div className="md:col-span-3 md:col-start-9">
            <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-rose-500"></span>
              Connect With Us
            </h4>
            
            {/* Email Contact */}
            <div className="flex items-center gap-3 mb-4 bg-white/5 rounded-lg p-3 border border-white/10">
              <Mail className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <a 
                href="mailto:lovemateshow@gmail.com" 
                className="text-sm text-gray-300 hover:text-rose-400 transition-colors truncate"
              >
                lovemateshow@gmail.com
              </a>
            </div>

            {/* Location */}
            <div className="flex items-center gap-3 mb-6 bg-white/5 rounded-lg p-3 border border-white/10">
              <MapPin className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Lagos, Nigeria</span>
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`bg-white/10 hover:bg-white/20 p-2 rounded-lg text-gray-400 ${social.color} transition-all hover:scale-110`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © {currentYear} Lovemate Show. All rights reserved.
            </p>
            <div className="flex gap-6 text-xs text-gray-500">
              <Link href="/privacy" className="hover:text-rose-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="hover:text-rose-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/cookies" className="hover:text-rose-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}