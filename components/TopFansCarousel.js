// components/TopFansCarousel.js
import { User } from "lucide-react";

export default function TopFansCarousel({ fans }) {
  return (
    <section className="bg-white pt-8 md:pt-16 pb-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-10">
        <span className="text-gray-900">Top</span>{" "}
        <span className="text-red-700">Fans</span>
      </h2>
      <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-6 max-w-6xl mx-auto">
        {fans.map((fan, i) => (
          <div
            key={i}
            className="bg-rose-100 rounded-xl p-2 md:p-6 shadow hover:shadow-md transition text-center"
          >
            <div className="w-10 h-10 md:w-16 md:h-16 mx-auto mb-1 md:mb-4 bg-rose-200 rounded-full flex items-center justify-center border-2 border-rose-600">
              <User className="text-rose-700 w-5 h-5 md:w-8 md:h-8" />
            </div>
            <h3 className="text-xs md:text-lg font-semibold text-gray-800 truncate">{fan.name}</h3>
            <p className="text-[10px] md:text-sm text-gray-500">
              Votes: <span className="font-bold text-rose-700 text-[10px] md:text-sm">{fan.votes}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}