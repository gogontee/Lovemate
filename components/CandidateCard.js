// components/CandidateCard.js
import Image from "next/image";
import Link from "next/link";

export default function CandidateCard({ id, name, country, votes, imageUrl }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden text-center p-4 border border-gray-100">

      {/* Candidate Image */}
      <div className="w-full aspect-square relative overflow-hidden rounded-xl border-2 border-rose-500">
        <Image
          src={imageUrl}
          alt={name}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>

      {/* Candidate Info */}
      <h3 className="mt-4 text-lg font-semibold text-gray-800">{name}</h3>
      <p className="text-sm text-gray-500">{country}</p>
      <p className="text-sm text-gray-600 mt-1">
        Votes: <span className="font-bold text-rose-600">{votes}</span>
      </p>

      {/* Action Buttons */}
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href={`/candidate/${id}#vote`}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-full text-sm font-semibold transition duration-300 shadow"
        >
          Vote
        </Link>

        <Link
          href={`/candidate/${id}`}
          className="px-4 py-2 border border-rose-600 text-rose-600 hover:bg-rose-50 rounded-full text-sm font-semibold transition duration-300"
        >
          View
        </Link>

        <Link
          href={`/candidate/${id}#gift`}
          className="px-4 py-2 bg-yellow-400 text-yellow-900 hover:bg-yellow-500 rounded-full text-sm font-semibold transition duration-300"
        >
          🎁 Gift
        </Link>
      </div>
    </div>
  );
}
