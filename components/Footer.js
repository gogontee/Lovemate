import Image from "next/image";
import {
  Instagram,
  Twitter,
  Facebook,
  Youtube,
  Music,
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-t from-rose-100 via-white to-white text-gray-700 pt-12 pb-6 px-4 border-t border-rose-200">
      <div className="max-w-7xl mx-auto grid gap-10 sm:grid-cols-3 text-center sm:text-left">
        {/* Logo & Description */}
        <div>
          <h3 className="text-2xl font-bold text-gray-800">Lovemate Show</h3>
          <p className="mt-2 text-sm text-gray-600 leading-relaxed">
            Set in an atmosphere of luxury, challenge, and passion, the Lovemate Show combines romance with fierce competition, where every vote counts and every moment matters. Whether you're rooting for your favorite contestant, gifting them your support, or simply enjoying the emotional rollercoaster, Lovemate invites the world to witness love in its rawest, most dazzling form.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Quick Links</h4>
          <ul className="text-sm space-y-2">
            {[
              { label: "Home", href: "/" },
              { label: "Register", href: "/register" },
              { label: "Vote", href: "/vote" },
              { label: "Gallery", href: "/gallery" },
              { label: "News", href: "/news" },
              { label: "About", href: "/about" },
              { label: "Contact", href: "/contact" },
            ].map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="hover:text-rose-600 transition duration-300"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Social & Contact */}
        <div>
          <h4 className="text-lg font-semibold text-gray-800 mb-3">Follow & Contact</h4>
          <div className="flex justify-center sm:justify-start gap-4 mb-4">
            <a
              href="https://instagram.com/lovemateshow"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-gray-600 hover:text-rose-600 transition"
            >
              <Instagram size={20} />
            </a>
            <a
              href="https://twitter.com/lovemateshow"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="text-gray-600 hover:text-rose-600 transition"
            >
              <Twitter size={20} />
            </a>
            <a
              href="https://facebook.com/lovemateshow"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-gray-600 hover:text-rose-600 transition"
            >
              <Facebook size={20} />
            </a>
            <a
              href="https://tiktok.com/@lovemateshow"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-gray-600 hover:text-rose-600 transition"
            >
              <Music size={20} />
            </a>
            <a
              href="https://youtube.com/@lovemateshow"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-gray-600 hover:text-rose-600 transition"
            >
              <Youtube size={20} />
            </a>
          </div>

          <p className="text-sm text-gray-600">📧 lovemateshow@gmail.com</p>
          <p className="text-sm text-gray-600 mb-4">📞 +234 815 309 3402</p>

          {/* Logo Placement */}
          <div className="flex justify-center sm:justify-start">
            <Image
              src="/logo/love.png"
              width={100}
              height={32}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-gray-500">
        &copy; {new Date().getFullYear()} Lovemate Show. All rights reserved.
      </div>
    </footer>
  );
}
