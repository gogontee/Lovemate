// pages/contact.js
"use client";

import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
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
} from "lucide-react";
import { useState } from "react";

export default function Contact() {
  const [openIndex, setOpenIndex] = useState(null);

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

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-rose-100 via-white to-pink-50 py-20 px-4 text-center">
        <h1 className="text-4xl font-bold text-rose-600 mb-2">Contact Lovemate</h1>
        <p className="text-gray-700 text-lg">
          We'd love to hear from you – whether you're a fan, a sponsor, or a curious soul.
        </p>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-rose-600 mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-rose-200 rounded-lg shadow-sm hover:shadow-md transition duration-300"
              >
                <button
                  onClick={() => toggle(i)}
                  className="w-full flex justify-between items-center px-6 py-4 text-left hover:bg-rose-50 transition rounded-t-lg"
                >
                  <span className="text-gray-800 font-medium">{faq.question}</span>
                  {openIndex === i ? (
                    <ChevronUp className="text-rose-600" />
                  ) : (
                    <ChevronDown className="text-rose-600" />
                  )}
                </button>
                {openIndex === i && (
                  <div className="px-6 pb-4 text-gray-600 text-sm">{faq.answer}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
<section className="bg-rose-50 py-16 px-6">
  <div className="max-w-4xl mx-auto">
    <h2 className="text-2xl font-bold text-rose-600 mb-6">Send Us a Message</h2>
    <form className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <input
        type="text"
        placeholder="Full Name"
        className="p-3 border rounded text-black"
      />
      <input
        type="email"
        placeholder="Email Address"
        className="p-3 border rounded text-black"
      />
      <input
        type="text"
        placeholder="Subject"
        className="p-3 border rounded col-span-2 text-black"
      />
      <textarea
        rows="5"
        placeholder="Your Message"
        className="p-3 border rounded col-span-2 text-black"
      />
      <button
        type="submit"
        className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded col-span-2 transition"
      >
        Send Message
      </button>
    </form>
  </div>
</section>


      {/* WhatsApp + Socials */}
      <section className="bg-white py-10 px-6 text-center">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Prefer to chat directly?</h3>
        <a
          href="https://wa.me/2340000000000"
          target="_blank"
          className="inline-block mb-6 text-green-600 font-semibold hover:underline"
          rel="noopener noreferrer"
        >
          Drop us a WhatsApp message ↗
        </a>
        <div className="flex justify-center space-x-6 text-gray-600 mt-4">
  <a
    href="https://facebook.com/lovemateshow"
    className="hover:text-rose-600 transition"
    aria-label="Facebook"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Facebook />
  </a>
  <a
    href="https://twitter.com/lovemateshow"
    className="hover:text-rose-600 transition"
    aria-label="Twitter"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Twitter />
  </a>
  <a
    href="https://instagram.com/lovemateshow"
    className="hover:text-rose-600 transition"
    aria-label="Instagram"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Instagram />
  </a>
  <a
    href="https://linkedin.com/company/lovemateshow"
    className="hover:text-rose-600 transition"
    aria-label="LinkedIn"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Linkedin />
  </a>
  <a
    href="https://youtube.com/@lovemateshow"
    className="hover:text-rose-600 transition"
    aria-label="YouTube"
    target="_blank"
    rel="noopener noreferrer"
  >
    <Youtube />
  </a>
</div>

      </section>

      <Footer />
    </>
  );
}
