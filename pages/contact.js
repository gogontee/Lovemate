// pages/contact.js
"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import {
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Send,
  Heart,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function Contact() {
  const [openIndex, setOpenIndex] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const faqs = [
    {
      question: "How do I register to participate?",
      answer:
        "Visit the registration page and fill in the required form. Ensure you meet all criteria before submitting.",
    },
    {
      question: "Can I vote from outside the country?",
      answer:
        "Yes, international voting is supported via our online platform using Paystack and other integrated methods.",
    },
    {
      question: "How can I sponsor or partner?",
      answer:
        "Send us a message using the form below or reach out on our official email/social handles for sponsorship decks.",
    },
    {
      question: "What are the benefits of participating?",
      answer:
        "Participants get national visibility, access to fame, and a chance to build real romantic connections.",
    },
    {
      question: "Where can I stream Lovemate Show?",
      answer:
        "Live streams will be available on our official platform and partner streaming services.",
    },
  ];

  const toggle = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setSubmitStatus("success");
      setIsSubmitting(false);
      setFormData({ name: "", email: "", subject: "", message: "" });
      
      // Reset status after 3 seconds
      setTimeout(() => setSubmitStatus(null), 3000);
    }, 1500);
  };

  return (
    <>
      <Head>
        <title>Contact Us – Lovemate Show</title>
        <meta
          name="description"
          content="Get in touch with the Lovemate team. We'd love to hear from you."
        />
      </Head>

      <Header />

      {/* Hero Section with Gradient Animation */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 py-16 md:py-28 px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-rose-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        {/* Floating Hearts */}
        <div className="absolute top-20 right-20 opacity-20 hidden md:block">
          <Heart className="w-32 h-32 text-white animate-bounce" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20 hidden md:block">
          <Sparkles className="w-32 h-32 text-white animate-pulse" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 md:mb-6">
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
              <span className="text-xs md:text-sm text-white font-medium">Get in Touch</span>
            </div>
            
            <h1 className="text-3xl md:text-6xl font-bold text-white mb-2 md:mb-4">
              Contact <span className="text-rose-200">Lovemate</span>
            </h1>
            
            <p className="text-sm md:text-xl text-rose-100 max-w-2xl mx-auto px-4">
              We'd love to hear from you – whether you're a fan, a sponsor, or a curious soul.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards - Compact version */}
      <section className="bg-gradient-to-b from-white via-rose-50 to-white pt-8 pb-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-3 gap-2 md:gap-4 -mt-8 md:-mt-16">
            {/* Phone Card - Updated with both numbers */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="bg-white rounded-lg md:rounded-2xl p-2 md:p-6 shadow-lg hover:shadow-xl transition-all border border-rose-100 group text-center"
            >
              <div className="w-8 h-8 md:w-14 md:h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-1 md:mb-4 group-hover:scale-110 transition-transform">
                <Phone className="w-4 h-4 md:w-7 md:h-7 text-red-600" />
              </div>
              <h3 className="text-xs md:text-xl font-bold text-gray-900 mb-1 md:mb-2">Call Us</h3>
              <div className="space-y-1">
                <a href="tel:+2349072646902" className="text-[8px] md:text-base text-rose-600 font-semibold hover:text-rose-700 transition-colors block truncate px-1">
                  +234 907 264 6902
                </a>
                <a href="tel:+447903184051" className="text-[8px] md:text-base text-rose-600 font-semibold hover:text-rose-700 transition-colors block truncate px-1">
                  +44 7903 184051
                </a>
              </div>
            </motion.div>

            {/* WhatsApp Card - Highlighted */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg md:rounded-2xl p-2 md:p-6 shadow-lg hover:shadow-xl transition-all text-white group transform hover:scale-105 text-center"
            >
              <div className="w-8 h-8 md:w-14 md:h-14 bg-white/20 backdrop-blur rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-1 md:mb-4 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-4 h-4 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-xs md:text-xl font-bold text-white mb-0.5 md:mb-2">WhatsApp</h3>
              <p className="text-[8px] md:text-sm text-green-100 mb-1 md:mb-3">Quick response, 24/7</p>
              <a 
                href="https://wa.me/2349072646902" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 md:gap-2 bg-white text-green-600 px-1.5 md:px-4 py-0.5 md:py-2 rounded-full text-[8px] md:text-base font-semibold hover:bg-green-50 transition-all"
              >
                Chat <Send className="w-2 h-2 md:w-4 md:h-4" />
              </a>
            </motion.div>

            {/* Email Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="bg-white rounded-lg md:rounded-2xl p-2 md:p-6 shadow-lg hover:shadow-xl transition-all border border-rose-100 group text-center"
            >
              <div className="w-8 h-8 md:w-14 md:h-14 bg-gradient-to-br from-rose-100 to-rose-200 rounded-lg md:rounded-xl flex items-center justify-center mx-auto mb-1 md:mb-4 group-hover:scale-110 transition-transform">
                <Mail className="w-4 h-4 md:w-7 md:h-7 text-red-600" />
              </div>
              <h3 className="text-xs md:text-xl font-bold text-gray-900 mb-0.5 md:mb-2">Email</h3>
              <p className="text-[8px] md:text-sm text-gray-600 mb-1 md:mb-3">Reply within 24hrs</p>
              <a href="mailto:lovemateshow@gmail.com" className="text-[8px] md:text-base text-rose-600 font-semibold hover:text-rose-700 transition-colors block truncate px-1">
                lovemateshow@gmail.com
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Form - Modern Design (Moved up) */}
      <section className="bg-gradient-to-br from-rose-50 via-white to-rose-50 py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl md:rounded-3xl shadow-xl md:shadow-2xl p-6 md:p-10 border border-rose-100"
          >
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-xl md:text-3xl font-bold mb-1 md:mb-2">
                <span className="text-gray-900">Send Us a</span>{" "}
                <span className="text-red-600">Message</span>
              </h2>
              <p className="text-xs md:text-base text-gray-600">We'll get back to you within 24 hours</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition text-gray-900"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition text-gray-900"
                />
              </div>
              
              <input
                type="text"
                name="subject"
                placeholder="Subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition text-gray-900"
              />
              
              <textarea
                rows="4"
                name="message"
                placeholder="Your Message"
                value={formData.message}
                onChange={handleChange}
                required
                className="w-full px-3 md:px-4 py-2 md:py-3 text-xs md:text-base bg-gray-50 border border-gray-200 rounded-lg md:rounded-xl focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition text-gray-900"
              />
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-rose-500 to-red-600 text-white px-4 md:px-6 py-2.5 md:py-4 rounded-lg md:rounded-xl text-sm md:text-base font-semibold hover:from-rose-600 hover:to-red-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1 md:gap-2"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    Send Message <Send className="w-3 h-3 md:w-4 md:h-4" />
                  </>
                )}
              </button>

              {submitStatus === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 text-green-700 px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl text-xs md:text-base text-center"
                >
                  Message sent successfully! We'll get back to you soon.
                </motion.div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section - Sleek Design with See More button */}
      <section className="bg-white py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-8 md:mb-12"
          >
            <div className="inline-flex items-center gap-2 bg-rose-100 px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-3 md:mb-4">
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
              <span className="text-xs md:text-sm font-semibold text-red-600">Got Questions?</span>
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-4">
              <span className="text-gray-900">Frequently Asked</span>{" "}
              <span className="text-red-600">Questions</span>
            </h2>
            <div className="w-16 md:w-20 h-1 bg-gradient-to-r from-rose-400 to-red-600 mx-auto rounded-full"></div>
          </motion.div>

          <div className="space-y-3 md:space-y-4">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-all border border-rose-100 overflow-hidden"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex justify-between items-center px-4 md:px-6 py-3 md:py-4 text-left hover:bg-rose-50/50 transition-colors"
                >
                  <span className="text-xs md:text-base text-gray-800 font-medium pr-2">{faq.question}</span>
                  <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full bg-rose-100 flex items-center justify-center transition-transform flex-shrink-0 ${openIndex === i ? 'rotate-180' : ''}`}>
                    {openIndex === i ? (
                      <ChevronUp className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                    ) : (
                      <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                    )}
                  </div>
                </button>
                {openIndex === i && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="px-4 md:px-6 pb-3 md:pb-4 text-xs md:text-base text-gray-600"
                  >
                    {faq.answer}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>

          {/* See More Button */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-6 md:mt-8"
          >
            <Link href="/frequentquestion">
              <button className="group inline-flex items-center gap-1 md:gap-2 bg-rose-50 text-red-600 px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold hover:bg-rose-100 transition-all border border-rose-200">
                See More Questions
                <ArrowRight className="w-3 h-3 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="bg-gradient-to-b from-white to-rose-50 py-12 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-4">
              <span className="text-gray-900">Connect With</span>{" "}
              <span className="text-red-600">Us</span>
            </h3>
            <p className="text-xs md:text-base text-gray-600 mb-6 md:mb-8">Follow us on social media for the latest updates</p>
            
            <div className="flex flex-wrap justify-center gap-2 md:gap-4">
              {[
                { icon: Facebook, href: "https://facebook.com/lovemateshow", color: "hover:text-blue-600", label: "Facebook" },
                { icon: Twitter, href: "https://twitter.com/lovemateshow", color: "hover:text-sky-500", label: "Twitter" },
                { icon: Instagram, href: "https://instagram.com/lovemateshow", color: "hover:text-pink-600", label: "Instagram" },
                { icon: Linkedin, href: "https://linkedin.com/company/lovemateshow", color: "hover:text-blue-700", label: "LinkedIn" },
                { icon: Youtube, href: "https://youtube.com/@lovemateshow", color: "hover:text-red-600", label: "YouTube" },
              ].map((social, index) => (
                <motion.a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`w-10 h-10 md:w-14 md:h-14 bg-rose-50 rounded-lg md:rounded-2xl flex items-center justify-center text-gray-700 ${social.color} transition-all hover:scale-110 hover:shadow-lg`}
                  aria-label={social.label}
                >
                  <social.icon className="w-4 h-4 md:w-6 md:h-6" />
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer - Hidden on mobile */}
      <div className="hidden md:block">
        <Footer />
      </div>

      {/* Bottom Padding for Mobile */}
      <div className="h-16 md:h-0"></div>
    </>
  );
}