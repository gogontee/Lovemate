// pages/frequentquestion.js
"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Search,
  Heart,
  Sparkles,
  Users,
  Award,
  CreditCard,
  Camera,
  MessageCircle,
  Mail,
  Phone,
  ArrowRight
} from "lucide-react";

export default function FrequentQuestion() {
  const [activeTab, setActiveTab] = useState("general");
  const [searchQuery, setSearchQuery] = useState("");
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (category, index) => {
    const key = `${category}-${index}`;
    setOpenItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const faqCategories = [
    { id: "general", label: "General", icon: <HelpCircle className="w-3 h-3 md:w-4 md:h-4" /> },
    { id: "registration", label: "Registration", icon: <Users className="w-3 h-3 md:w-4 md:h-4" /> },
    { id: "voting", label: "Voting", icon: <Heart className="w-3 h-3 md:w-4 md:h-4" /> },
    { id: "sponsorship", label: "Sponsorship", icon: <Award className="w-3 h-3 md:w-4 md:h-4" /> },
    { id: "payment", label: "Payment", icon: <CreditCard className="w-3 h-3 md:w-4 md:h-4" /> },
    { id: "production", label: "Production", icon: <Camera className="w-3 h-3 md:w-4 md:h-4" /> },
  ];

  const faqData = {
    general: [
      {
        question: "What is Lovemate Show?",
        answer: "Lovemate is Africa's premier love and lifestyle reality show, a spotlight of intrigues for singles finding love, fame and wealth. The show combines romance, drama, and competition in an unforgettable entertainment experience."
      },
      {
        question: "When does Lovemate Show air?",
        answer: "The show will be live on designated official streaming platform and partner TV networks. To be published on all our social platforms channels."
      },
      {
        question: "How long does the show last?",
        answer: "Each season of Lovemate runs for 15 days (360 hours) of non-stop entertainment, drama, and romance. The journey culminates in a grand finale where one couple emerges winner."
      },
      {
        question: "Where is the Lovemate season 1 host city?",
        answer: "The Lovemate host city for season 1 is Lagos, Nigeria."
      },
      {
        question: "Can I visit the Lovemate mansion?",
        answer: "For security and privacy reasons, the mansion is not open to public visits. However, you can follow all the action through our live streams, daily updates, and behind-the-scenes content on our social media channels."
      }
    ],
    registration: [
      {
        question: "How do I register to participate?",
        answer: "Registration is done through our official website. Visit the registration page, fill out the application form, and submit, wait for success popup massage, if successful, a popup whatsapp button will open, click on it to open a follow up chat with the Lovemate team."
      },
      {
        question: "What are the requirements to participate?",
        answer: "Participants must be at least 18 years old, single, legally eligible to be in Nigeria, have a valid ID, and be available for the entire 15-day filming period. No prior acting or television experience is required – just an open heart and a willingness to dive into the drama as there will be zero tolerance for dull moment!"
      },
      {
        question: "Is there a registration fee?",
        answer: "Yes, registration is completely free but you must prove yourself worthy of emerging one of the 24 mates through an open pre-show vote challenge. All official communication will come from our verified email addresses whatsapp platform and social media accounts."
      },
      {
        question: "How are contestants selected?",
        answer: "Contestants are selected through a multi-stage process including application review, social profile review and most importantly pre-show vote challenge. We look for diverse personalities, genuine intentions, and compelling stories aswell."
      },
      {
        question: "Can I register if I'm from outside Nigeria?",
        answer: "Yes! Lovemate welcomes participants from all across the globe. International contestants are responsible for their travel arrangements to and from Nigeria, but accommodation and meals are provided during the show."
      }
    ],
    voting: [
      {
        question: "How does voting work?",
        answer: "Viewers can vote for their favorite contestants through our official website even without opening account on lovemateshow.com but for fans with an intention of voting more than once, the best approach is to create a fan account on lovemateshow.com then fund your wallet once so you dont have to keep repeating payment process. Use the balance in your wallet to vote or gift your favorite candidate at anytime with just one click. Each vote costs 1000 NGN (or equivalent in your local currency). Votes determine who stays in the mansion and who gets eliminated."
      },
      {
        question: "Can I vote from outside Nigeria?",
        answer: "Yes, international voting is supported. We accept payments through Paystack, paypal, and other integrated payment methods that support international transactions."
      },
      {
        question: "How many votes can I cast?",
        answer: "There is no limit to the number of votes you can cast. However, each vote is a separate transaction. We encourage fair play and have systems in place to detect and prevent fraudulent voting activities."
      },
      {
        question: "Can I get a refund on my votes?",
        answer: "Votes are non-refundable as they are considered digital goods and services rendered. Please ensure you want to support a contestant before casting your vote."
      }
    ],
    sponsorship: [
      {
        question: "How can I become a sponsor?",
        answer: "We offer various sponsorship packages tailored to different business sizes and goals. Contact our partnerships team at lovematepartnerships@gmail.com or fill out the contact form to request our sponsorship deck."
      },
      {
        question: "What sponsorship opportunities are available?",
        answer: "Sponsorship opportunities include headline sponsorship, segment sponsorship, product placement, and more. Each package includes brand visibility across our platforms and at events."
      },
      {
        question: "What are the benefits of sponsoring Lovemate?",
        answer: "Sponsors enjoy massive brand exposure across our TV broadcast, streaming platforms, social media, website, and inhouse activations/live events."
      },
      {
        question: "Can small businesses sponsor?",
        answer: "Absolutely! We have micro-sponsorship packages designed specifically for small businesses and startups. Contact our team to discuss options that fit your budget and marketing goals."
      },
      {
        question: "Do you offer media partnerships?",
        answer: "Yes, we're always looking to partner with media outlets, influencers, and content creators. Media partners receive exclusive access, interviews, and content in exchange for coverage and promotion."
      }
    ],
    payment: [
      {
        question: "How can i fund my account?",
        answer: " Go to your dashboard and click on 'Fund Wallet, then follow the onscreen instructions'. We accept payments via Paystack (cards, bank transfers, USSD), , and direct bank deposits. International audience can fund their wallet using their credit/debit cards or PayPal through our integrated payment gateways."
      },
      {
        question: "Is my payment information secure?",
        answer: "Yes, all payments are processed through PCI-compliant payment gateways. We do not store any sensitive payment information on our servers. Your security is our top priority."
      },
      {
        question: "Why was my payment declined?",
        answer: "Payments may be declined due to insufficient funds, bank restrictions on online transactions, or security flags. Contact your bank to authorize international transactions if you're paying from outside Nigeria."
      },
      {
        question: "What is your refund policy?",
        answer: "Generally, wallet funding and payment for votes and digital services Like gifting are non-refundable. However, if you experience technical issues or unauthorized charges, contact our support team within 7 days for assistance. Note: wallet balance is not withdrawable and so it must be used for vote, gift or other digital services on the Lovemate platform."
      }
    ],
    production: [
      {
        question: "Who produces Lovemate Show?",
        answer: "Lovemate is produced by Stagate studios in partnership with Brightknight Entertainment, an entertainment brands specializing in reality TV and digital content across Africa."
      },
      {
        question: "How can I work on the show?",
        answer: "We're always looking for talented professionals! Send your resume and portfolio to lovemateshow@gmail.com. Open positions are also posted on Mygigzz.com."
      },
      {
        question: "Where can I watch behind-the-scenes content?",
        answer: "Behind-the-scenes content is available on our YouTube channel, Instagram stories, and TikTok. Subscribe to our channels for exclusive access to what happens off-camera."
      }
    ]
  };

  // Filter FAQs based on search query
  const filteredFaqs = (category) => {
    if (!searchQuery) return faqData[category];
    
    return faqData[category].filter(
      item => 
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  return (
    <>
      <Head>
        <title>FAQ – Lovemate Show</title>
        <meta
          name="description"
          content="Find answers to frequently asked questions about Lovemate Show – registration, voting, sponsorship, and more."
        />
      </Head>

      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-rose-600 via-red-600 to-rose-700 py-12 md:py-20 px-4">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-rose-300 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        {/* Floating Icons */}
        <div className="absolute top-20 right-20 opacity-20 hidden md:block">
          <HelpCircle className="w-32 h-32 text-white animate-bounce" />
        </div>
        <div className="absolute bottom-20 left-20 opacity-20 hidden md:block">
          <Sparkles className="w-32 h-32 text-white animate-pulse" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 rounded-full mb-4 md:mb-6">
              <HelpCircle className="w-3 h-3 md:w-4 md:h-4 text-white" />
              <span className="text-[10px] md:text-sm text-white font-medium">Got Questions?</span>
            </div>
            
            <h1 className="text-2xl md:text-5xl font-bold text-white mb-2 md:mb-4">
              Frequently Asked <span className="text-rose-200">Questions</span>
            </h1>
            
            <p className="text-xs md:text-lg text-rose-100 max-w-2xl mx-auto px-2">
              Everything you need to know about Lovemate Show – from registration to voting and beyond
            </p>
          </motion.div>
        </div>
      </section>

      {/* Search Bar */}
      <section className="bg-white py-4 md:py-8 px-4 border-b border-rose-100">
        <div className="max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 md:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 md:pl-12 pr-4 py-2 md:py-3 text-sm md:text-base bg-rose-50 border border-rose-200 rounded-full focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-200 transition text-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Category Tabs */}
      <section className="bg-white pt-4 md:pt-8 pb-2 md:pb-4 px-4 sticky top-0 z-30 shadow-sm">
        <div className="max-w-6xl mx-auto">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 md:gap-2 pb-2">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveTab(category.id)}
                className={`flex items-center gap-1 md:gap-2 px-3 md:px-4 py-1.5 md:py-2 rounded-full whitespace-nowrap transition-all text-xs md:text-sm ${
                  activeTab === category.id
                    ? "bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md"
                    : "bg-rose-50 text-gray-700 hover:bg-rose-100"
                }`}
              >
                {category.icon}
                <span className="text-xs md:text-sm font-medium">{category.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Content with Animation */}
      <section className="bg-gradient-to-b from-white via-rose-50 to-white py-8 md:py-12 px-4 min-h-[500px]">
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-3 md:space-y-4"
            >
              {filteredFaqs(activeTab).length > 0 ? (
                filteredFaqs(activeTab).map((faq, index) => {
                  const itemKey = `${activeTab}-${index}`;
                  const isOpen = openItems[itemKey];
                  
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg md:rounded-xl shadow-md hover:shadow-lg transition-all border border-rose-100 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(activeTab, index)}
                        className="w-full flex justify-between items-center px-4 md:px-6 py-3 md:py-4 text-left hover:bg-rose-50/50 transition-colors"
                      >
                        <span className="text-xs md:text-base text-gray-800 font-medium pr-2">{faq.question}</span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                          className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-rose-100 flex items-center justify-center flex-shrink-0"
                        >
                          <ChevronDown className="w-3 h-3 md:w-4 md:h-4 text-red-600" />
                        </motion.div>
                      </button>
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 md:px-6 pb-3 md:pb-4 text-xs md:text-base text-gray-600 leading-relaxed">
                              {faq.answer}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 md:py-16 bg-white rounded-xl border border-rose-100"
                >
                  <HelpCircle className="w-12 h-12 md:w-16 md:h-16 text-rose-300 mx-auto mb-3 md:mb-4" />
                  <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-1 md:mb-2">No results found</h3>
                  <p className="text-xs md:text-base text-gray-600">Try searching with different keywords</p>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="mt-3 md:mt-4 text-sm md:text-base text-rose-600 font-medium hover:text-rose-700 transition-colors"
                  >
                    Clear search
                  </button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Still have questions? */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-8 md:mt-12 bg-gradient-to-br from-rose-500 to-red-600 rounded-xl md:rounded-2xl p-6 md:p-8 text-white text-center"
          >
            <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">Still have questions?</h3>
            <p className="text-xs md:text-base text-rose-100 mb-4 md:mb-6">Can't find the answer you're looking for? Please chat with our friendly team.</p>
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
              <a
                href="https://wa.me/2349072646902"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1 md:gap-2 bg-white text-rose-600 px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold hover:bg-rose-50 transition-all"
              >
                <MessageCircle className="w-3 h-3 md:w-4 md:h-4" />
                WhatsApp Us
              </a>
              <a
                href="mailto:support@lovemateshow.com"
                className="inline-flex items-center justify-center gap-1 md:gap-2 bg-white/20 backdrop-blur-sm text-white px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-base font-semibold hover:bg-white/30 transition-all border border-white/30"
              >
                <Mail className="w-3 h-3 md:w-4 md:h-4" />
                Email Support
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Quick Contact Section */}
      <section className="bg-white py-8 md:py-12 px-4 border-t border-rose-100">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-base md:text-xl font-semibold text-gray-800 mb-4 md:mb-6">Quick Contact</h3>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
            <a href="tel:+2349072646902" className="flex items-center gap-1 md:gap-2 bg-rose-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm text-gray-700 hover:bg-rose-100 transition">
              <Phone className="w-3 h-3 md:w-4 md:h-4 text-rose-600" />
              +234 907 264 6902
            </a>
            <a href="mailto:info@lovemateshow.com" className="flex items-center gap-1 md:gap-2 bg-rose-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm text-gray-700 hover:bg-rose-100 transition">
              <Mail className="w-3 h-3 md:w-4 md:h-4 text-rose-600" />
              info@lovemateshow.com
            </a>
            <a href="https://wa.me/2349072646902" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 md:gap-2 bg-green-50 px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm text-gray-700 hover:bg-green-100 transition">
              <MessageCircle className="w-3 h-3 md:w-4 md:h-4 text-green-600" />
              WhatsApp
            </a>
          </div>
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