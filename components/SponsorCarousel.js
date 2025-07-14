// components/SponsorCarousel.js
import Image from "next/image";

export default function SponsorCarousel({ sponsors }) {
  return (
    <section className="bg-rose-50 py-12 px-4 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Sponsors</h2>
      <div className="flex flex-wrap justify-center items-center gap-6 max-w-4xl mx-auto">
        {sponsors.map((logo, i) => (
          <div key={i} className="w-40 h-16 relative grayscale hover:grayscale-0 transition">
            <Image
              src={logo}
              alt={`Sponsor ${i + 1}`}
              fill
              className="object-contain"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
