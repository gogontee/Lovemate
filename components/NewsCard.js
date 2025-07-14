import Image from "next/image";
import Link from "next/link";

export default function NewsCard({ image, title, summary, views, link }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden">
      <div className="relative w-full h-48">
        <Image src={image} alt={title} fill className="object-cover" priority />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">{summary}</p>
        <p className="text-xs text-gray-400">👁️ {views.toLocaleString()} views</p>
        {link && (
          <Link href={link} className="text-rose-600 hover:underline text-xs font-medium">
            Read More
          </Link>
        )}
      </div>
    </div>
  );
}
