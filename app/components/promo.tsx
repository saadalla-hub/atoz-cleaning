"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

export default function Promo() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <motion.div
          {...fadeInUp}
          className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/20 shadow-2xl"
        >
          {/* Video */}
          <video
            className="w-full h-auto aspect-video object-cover"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
          >
            <source src="/images/atoz-promo.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F2B34]/50 via-transparent to-transparent pointer-events-none" />

        </motion.div>

      </div>
    </section>
  );
}