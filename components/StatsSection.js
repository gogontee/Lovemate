import { Heart, Users, Briefcase, Hourglass } from "lucide-react";
import RegistrationCountdown from "./VotingCountdown"; // ✅ new countdown component

const stats = [
  { icon: <Users className="w-8 h-8 text-rose-600" />, label: "Candidates", value: 24 },
  { icon: <Heart className="w-8 h-8 text-rose-600" />, label: "Hours of Intrigues", value: 360 },
  { icon: <Briefcase className="w-8 h-8 text-rose-600" />, label: "Winner Takes It All", value: "MONEY BAG" },
  {
    icon: <Hourglass className="w-8 h-8 text-rose-600" />,
    label: "Registration Starts In",
    value: <RegistrationCountdown startDate="2025-09-01T00:00:00" endDate="2025-09-30T23:59:59" />
  },
];

export default function StatsSection() {
  return (
    <section className="bg-rose-100 py-12 px-4">
      <div className="max-w-6xl mx-auto grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-rose-50 p-6 rounded-xl text-center shadow hover:shadow-md transition"
          >
            <div className="flex justify-center mb-3">{stat.icon}</div>
            <h3 className="text-2xl font-bold text-gray-800">
              {stat.value}
            </h3>
            <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
