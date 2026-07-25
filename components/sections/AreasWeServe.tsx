"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { AREAS } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLanguage } from "@/app/components/LanguageProvider";

const AREA_IMAGES = {
  Madinaty: "/images/areas/madinaty.jpg",
  "El Shorouk": "/images/areas/shorouk.jpg",
} as const;

export default function AreasWeServe() {
  const { t, language } = useLanguage();

  const isArabic = language === "ar";

  return (
    <section
      id="areas"
      dir={isArabic ? "rtl" : "ltr"}
      className="relative py-16 sm:py-20 lg:py-28 bg-[#0F2B34]/50 overflow-hidden"
    >
      {/* ========================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ========================================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Main Golden Glow */}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[700px] h-[450px] sm:h-[700px] rounded-full bg-[#E7B548]/10 blur-[140px]" />

        {/* Top Glow */}

        <div className="absolute -top-40 -left-40 w-[350px] h-[350px] rounded-full bg-[#E7B548]/5 blur-[120px]" />

        {/* Bottom Glow */}

        <div className="absolute -bottom-40 -right-40 w-[350px] h-[350px] rounded-full bg-[#E7B548]/5 blur-[120px]" />

      </div>


      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ========================================= */}
        {/* SECTION HEADING */}
        {/* ========================================= */}

        <SectionHeading
          label={t.areas.label}
          title={t.areas.title}
          description={t.areas.description}
        />


        {/* ========================================= */}
        {/* AREAS GRID */}
        {/* ========================================= */}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{
            once: true,
            margin: "-80px",
          }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto"
        >

          {AREAS.map((area, index) => {

            const areaName =
              area === "Madinaty"
                ? t.common.madinaty
                : t.common.elShorouk;

            return (

              <motion.article
                key={area}
                variants={staggerItem}
                whileHover={{
                  y: -10,
                }}
                transition={{
                  duration: 0.4,
                  ease: "easeOut",
                }}
                className="group relative min-h-[390px] sm:min-h-[440px] lg:min-h-[480px] overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 hover:border-[#E7B548]/50 hover:shadow-[0_25px_70px_rgba(231,181,72,0.15)] transition-all duration-500"
              >

                {/* ========================================= */}
                {/* BACKGROUND IMAGE */}
                {/* ========================================= */}

                <Image
                  src={AREA_IMAGES[area]}
                  alt={areaName}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
                />


                {/* ========================================= */}
                {/* CINEMATIC OVERLAY */}
                {/* ========================================= */}

                <div className="absolute inset-0 bg-gradient-to-t from-[#0F2B34] via-[#0F2B34]/55 to-black/10" />


                {/* ========================================= */}
                {/* GOLDEN HOVER OVERLAY */}
                {/* ========================================= */}

                <div className="absolute inset-0 bg-[#E7B548]/0 group-hover:bg-[#E7B548]/10 transition-colors duration-700" />


                {/* ========================================= */}
                {/* AREA NUMBER */}
                {/* ========================================= */}

                <div
                  className={`absolute top-5 sm:top-7 text-6xl sm:text-7xl lg:text-8xl font-black text-white/15 group-hover:text-[#E7B548]/30 transition-all duration-500 ${
                    isArabic
                      ? "left-5 sm:left-7"
                      : "right-5 sm:right-7"
                  }`}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>


                {/* ========================================= */}
                {/* CONTENT */}
                {/* ========================================= */}

                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">

                  {/* Service Area Label */}

                  <motion.p
                    initial={{
                      opacity: 0.7,
                    }}
                    whileHover={{
                      opacity: 1,
                    }}
                    className="text-xs sm:text-sm uppercase tracking-[0.2em] text-[#E7B548] mb-3"
                  >
                    {t.areas.serviceArea}
                  </motion.p>


                  {/* Area Name */}

                  <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 group-hover:text-[#F4C95D] transition-colors duration-300">
                    {areaName}
                  </h3>


                  {/* Description */}

                  <p className="text-gray-200 text-sm sm:text-base leading-relaxed max-w-lg">
                    {t.areas.description}
                  </p>


                  {/* Explore Indicator */}

                  <div
                    className={`mt-6 flex items-center gap-3 text-[#E7B548] font-semibold text-sm transition-all duration-500 ${
                      isArabic
                        ? "group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  >

                    <span>
                      {t.areas.freeQuote}
                    </span>

                    <span
                      className={`text-lg ${
                        isArabic ? "rotate-180" : ""
                      }`}
                    >
                      →
                    </span>

                  </div>

                </div>


                {/* ========================================= */}
                {/* GOLD BOTTOM ACCENT */}
                {/* ========================================= */}

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E7B548] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              </motion.article>

            );

          })}

        </motion.div>


        {/* ========================================= */}
        {/* BOTTOM MESSAGE */}
        {/* ========================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-50px",
          }}
          transition={{
            duration: 0.7,
            delay: 0.3,
          }}
          className="mt-10 sm:mt-14 text-center"
        >

          <p className="text-gray-400 text-sm sm:text-base">
            {t.areas.bottomText}
          </p>


          {/* Free Quote Button */}

          <motion.a
            href="#contact"
            whileHover={{
              scale: 1.03,
            }}
            whileTap={{
              scale: 0.97,
            }}
            className="inline-flex items-center gap-3 mt-5 px-6 py-3 rounded-xl bg-[#E7B548] text-[#143640] font-bold text-sm sm:text-base shadow-lg shadow-[#E7B548]/10 hover:bg-[#F4C95D] transition-colors duration-300"
          >

            {t.areas.freeQuote}

            <span
              className={`text-lg ${
                isArabic ? "rotate-180" : ""
              }`}
            >
              →
            </span>

          </motion.a>

        </motion.div>

      </div>
    </section>
  );
}