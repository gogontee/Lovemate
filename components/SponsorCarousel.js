// components/SponsorCarousel.js
import Image from "next/image";

export default function SponsorCarousel({ sponsors }) {
  return (
    <section className="bg-rose-50 py-12 px-4 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Our Sponsors</h2>

      {/* Mobile: horizontal scroll | Desktop: normal flex wrap */}
      <div className="max-w-4xl mx-auto">
        <div className="flex sm:flex-wrap sm:justify-center sm:items-center gap-6 overflow-x-auto sm:overflow-visible scrollbar-hide">
          {sponsors.map((logo, i) => (
            <div
              key={i}
              className="w-32 h-14 sm:w-40 sm:h-16 relative flex-shrink-0 grayscale hover:grayscale-0 transition"
            >
              <Image
                src={logo}
                alt={`Sponsor ${i + 1}`}
                fill
                className="object-contain"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
