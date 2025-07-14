// components/VideoCarousel.js

export default function VideoCarousel({ videos = [] }) {
  return (
    <section className="bg-rose-100 py-12 px-4">
      <h2 className="text-2xl font-bold text-center text-gray-700 mb-6">Top Videos</h2>

      <div className="overflow-x-auto scrollbar-hide">
        <div className="inline-flex space-x-6 px-2">
          {videos.map((video, index) => (
            <div
              key={index}
              className="min-w-[400px] w-[400px] h-[220px] bg-black rounded-xl overflow-hidden shadow-md"
            >
              <iframe
                src={video.url}
                title={`Video ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
                className="w-full h-full"
              ></iframe>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
