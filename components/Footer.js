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
    { icon: Instagram, href: "https://instagram.com/lovemateshow", label: "Instagram", color: "hover:text-pink-600" },
    { icon: Twitter, href: "https://twitter.com/lovemateshow", label: "Twitter", color: "hover:text-sky-500" },
    { icon: Facebook, href: "https://facebook.com/lovemateshow", label: "Facebook", color: "hover:text-blue-600" },
    { icon: Music, href: "https://tiktok.com/@lovemateshow", label: "TikTok", color: "hover:text-gray-900" },
    { icon: Youtube, href: "https://youtube.com/@lovemateshow", label: "YouTube", color: "hover:text-red-600" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: "Please enter your name",
      });
      return false;
    }
    
    if (!formData.email.trim()) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: "Please enter your email address",
      });
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: "Please enter a valid email address",
      });
      return false;
    }
    
    if (!formData.whatsapp.trim()) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: "Please enter your WhatsApp number",
      });
      return false;
    }
    
    // Basic WhatsApp number validation (accepts international format)
    const whatsappRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,5}[-\s\.]?[0-9]{1,5}$/;
    if (!whatsappRegex.test(formData.whatsapp)) {
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: "Please enter a valid WhatsApp number",
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setStatus({
      submitting: true,
      success: false,
      error: false,
      message: "Subscribing...",
    });
    
    try {
      // Insert data into newsletter_subscribers table
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
        // Check if it's a duplicate email error
        if (error.code === '23505') {
          setStatus({
            submitting: false,
            success: false,
            error: true,
            message: "This email is already subscribed to our newsletter!",
          });
        } else {
          console.error("Supabase error:", error);
          setStatus({
            submitting: false,
            success: false,
            error: true,
            message: "Something went wrong. Please try again later.",
          });
        }
        return;
      }
      
      // Success
      setStatus({
        submitting: false,
        success: true,
        error: false,
        message: "Thank you for subscribing! Stay tuned for updates.",
      });
      
      // Reset form
      setFormData({
        name: "",
        email: "",
        whatsapp: "",
      });
      
      // Clear success message after 5 seconds
      setTimeout(() => {
        setStatus(prev => ({ ...prev, success: false, message: "" }));
      }, 5000);
      
    } catch (err) {
      console.error("Subscription error:", err);
      setStatus({
        submitting: false,
        success: false,
        error: true,
        message: "An unexpected error occurred. Please try again.",
      });
    }
  };

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
          {/* Brand Column */}
          <div className="md:col-span-3">
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
            
            <p className="text-sm text-gray-400 leading-relaxed">
              Where love meets destiny, and every heartbeat tells a story. 
              Africa's premier love and lifestyle reality show.
            </p>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-2">
            <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-rose-500"></span>
              Quick Links
            </h4>
            <ul className="space-y-2">
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

          {/* Contact Info */}
          <div className="md:col-span-3">
            <h4 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-0.5 bg-rose-500"></span>
              Contact Us
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
            <div className="flex items-center gap-3 mb-4 bg-white/5 rounded-lg p-3 border border-white/10">
              <MapPin className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span className="text-sm text-gray-300">Lagos, Nigeria</span>
            </div>

            {/* Social Icons */}
            <div className="flex flex-wrap gap-2">
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

          {/* Newsletter Subscription - Horizontal Layout on Desktop */}
          <div className="md:col-span-4">
            <div className="bg-gradient-to-br from-rose-500/10 to-pink-500/10 backdrop-blur-sm rounded-xl p-5 border border-rose-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Send className="w-5 h-5 text-rose-400" />
                <h4 className="text-white font-semibold">Stay Updated</h4>
              </div>
              <p className="text-xs text-gray-400 mb-4">Get the latest news, updates, and exclusive content</p>
              
              <form onSubmit={handleSubmit}>
                {/* 2 Column Grid for Name and Email on Desktop */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your full name"
                      disabled={status.submitting}
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>
                
                {/* WhatsApp Field - Full Width */}
                <div className="mb-3">
                  <input
                    type="tel"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="WhatsApp number (e.g., +234 801 234 5678)"
                    disabled={status.submitting}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                
                {/* Submit Button - Full Width */}
                <button
                  type="submit"
                  disabled={status.submitting}
                  className="w-full bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
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
                
                {/* Status Messages */}
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
              <Link href="/policy" className="hover:text-rose-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/termsofparticiption" className="hover:text-rose-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/policy" className="hover:text-rose-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}