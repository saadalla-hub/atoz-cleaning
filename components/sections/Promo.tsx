"use client";

export default function Promo() {
  return (
    <section className="relative py-10 sm:py-14 lg:py-16 bg-[#143640]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Promo Video */}
        <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10">

          <video
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="block w-full h-auto object-cover"
          >
            <source
              src="/images/atoz-promo.mp4"
              type="video/mp4"
            />

            Your browser does not support the video tag.
          </video>

        </div>

      </div>
    </section>
  );
}