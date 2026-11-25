// components/Footer.js
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
  Send,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
  });
  const [status, setStatus] = useState({
    submitting: false,
    success: false,
    error: false,
    message: "",
  });

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
    { icon: Instagram, href: "https://instagram.com/lovemateshow", label: "Instagram", color: "hover:text-[#DC143C]" },
    { icon: Twitter, href: "https://twitter.com/lovemateshow", label: "Twitter", color: "hover:text-[#DC143C]" },
    { icon: Facebook, href: "https://facebook.com/lovemateshow", label: "Facebook", color: "hover:text-[#DC143C]" },
    { icon: Music, href: "https://tiktok.com/@lovemateshow", label: "TikTok", color: "hover:text-[#DC143C]" },
    { icon: Youtube, href: "https://youtube.com/@lovemateshow", label: "YouTube", color: "hover:text-[#DC143C]" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatus({ submitting: false, success: false, error: true, message: "Please enter your name" });
      return false;
    }
    
    if (!formData.email.trim()) {
      setStatus({ submitting: false, success: false, error: true, message: "Please enter your email address" });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({ submitting: false, success: false, error: true, message: "Please enter a valid email address" });
      return false;
    }
    
    if (!formData.whatsapp.trim()) {
      setStatus({ submitting: false, success: false, error: true, message: "Please enter your WhatsApp number" });
      return false;
    }
    
    const whatsappRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    if (!whatsappRegex.test(formData.whatsapp)) {
      setStatus({ submitting: false, success: false, error: true, message: "Please enter a valid WhatsApp number" });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setStatus({ submitting: true, success: false, error: false, message: "Subscribing..." });
    
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          {
            name: formData.name.trim(),
            email: formData.email.trim().toLowerCase(),
            whatsapp: formData.whatsapp.trim(),
            subscribed_at: new Date().toISOString(),
            status: 'active',
          }
        ])
        .select();
      
      if (error) {
        if (error.code === '23505') {
          setStatus({ submitting: false, success: false, error: true, message: "This email is already subscribed to our newsletter!" });
        } else {
          setStatus({ submitting: false, success: false, error: true, message: "Something went wrong. Please try again later." });
        }
        return;
      }
      
      setStatus({ submitting: false, success: true, error: false, message: "Thank you for subscribing! Stay tuned for updates." });
      setFormData({ name: "", email: "", whatsapp: "" });
      
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false, message: "" }));
      }, 5000);
      
    } catch (err) {
      setStatus({ submitting: false, success: false, error: true, message: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <footer className="relative bg-[#0a0a0f] text-gray-300 pt-16 pb-8 px-4 overflow-hidden border-t border-[#DC143C]/20">
      {/* Decorative Background Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#DC143C]/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2 z-0"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#DC143C]/5 rounded-full blur-[100px] pointer-events-none translate-y-1/2 z-0"></div>
      
      {/* Animated Hearts */}
      <div className="absolute top-20 right-20 opacity-10 hidden lg:block z-0 pointer-events-none">
        <Heart className="w-32 h-32 text-[#DC143C] animate-pulse" />
      </div>
      <div className="absolute bottom-20 left-20 opacity-10 hidden lg:block z-0 pointer-events-none">
        <Heart className="w-24 h-24 text-[#DC143C] animate-bounce" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Column */}
          <div className="md:col-span-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="https://pztuwangpzlzrihblnta.supabase.co/storage/v1/object/public/lovemateshow/logo/lovemateicon.png"
                  alt="Lovemate Show Logo"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-2xl font-bold text-white">Lovemate Show</h3>
            </div>
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Where love meets destiny, and every heartbeat tells a story. 
              Africa's premier love and lifestyle reality show.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-[#DC143C]"></span>
              Quick Links
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-gray-400 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-1 h-1 bg-[#DC143C] rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-3">
            <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-[#DC143C]"></span>
              Contact Us
            </h4>
            
            <div className="flex items-center gap-3 mb-4 bg-white/5 rounded-lg p-3 border border-white/10 hover:border-[#DC143C]/30 transition-colors">
              <Mail className="w-5 h-5 text-[#DC143C] flex-shrink-0" />
              <a href="mailto:lovemateshow@gmail.com" className="text-sm text-gray-300 hover:text-white transition-colors truncate">
                lovemateshow@gmail.com
              </a>
            </div>

            <div className="flex items-center gap-3 mb-4 bg-white/5 rounded-lg p-3 border border-white/10 hover:border-[#DC143C]/30 transition-colors">
              <MapPin className="w-5 h-5 text-[#DC143C] flex-shrink-0" />
              <span className="text-sm text-gray-300">Lagos, Nigeria</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className={`bg-white/5 hover:bg-white/10 p-2 rounded-lg text-gray-400 ${social.color} transition-all hover:scale-110 border border-white/5 hover:border-[#DC143C]/30`}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Newsletter Subscription */}
          <div className="md:col-span-4">
            <div className="bg-[#DC143C]/5 backdrop-blur-sm rounded-xl p-5 border border-[#DC143C]/20">
              <div className="flex items-center gap-2 mb-3">
                <Send className="w-5 h-5 text-[#DC143C]" />
                <h4 className="text-white font-semibold">Stay Updated</h4>
              </div>
              <p className="text-xs text-gray-400 mb-4">Get the latest news, updates, and exclusive content</p>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      disabled={status.submitting}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DC143C] transition-colors disabled:opacity-50"
                    />
                  </div>
                  
                  <div>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Email address"
                      disabled={status.submitting}
                      className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DC143C] transition-colors disabled:opacity-50"
                    />
                  </div>
                </div>
                
                <div className="mb-3">
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp number (e.g., +234 801 234 5678)"
                    disabled={status.submitting}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#DC143C] transition-colors disabled:opacity-50"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={status.submitting}
                  className="w-full bg-[#DC143C] hover:bg-[#B80B35] text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 group font-semibold"
                >
                  {status.submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Subscribing...</span>
                    </>
                  ) : (
                    <>
                      <span>Subscribe Now</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                {status.error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 rounded-lg p-2 mt-3">
                    <XCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{status.message}</span>
                  </div>
                )}
                
                {status.success && (
                  <div className="flex items-center gap-2 text-green-400 text-xs bg-green-500/10 rounded-lg p-2 mt-3">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{status.message}</span>
                  </div>
                )}
              </form>
              
              <p className="text-[10px] text-gray-500 mt-3 text-center">
                We'll never share your information. Unsubscribe anytime.
              </p>
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
              <Link href="/policy" className="hover:text-[#DC143C] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/termsofparticipation" className="hover:text-[#DC143C] transition-colors">
                Terms of Service
              </Link>
              <Link href="/policy" className="hover:text-[#DC143C] transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}