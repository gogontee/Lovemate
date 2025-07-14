// components/TopFansCarousel.js
import { User } from "lucide-react";

export default function TopFansCarousel({ fans }) {
  return (
    <section className="bg-white py-16 px-4">
      <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Top Fans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {fans.map((fan, i) => (
          <div
            key={i}
            className="bg-rose-50 rounded-xl p-6 shadow hover:shadow-md transition text-center"
          >
            <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center border-2 border-rose-600">
              <User className="text-rose-600 w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800">{fan.name}</h3>
            <p className="text-sm text-gray-500">Votes: <span className="font-bold text-rose-600">{fan.votes}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
}
