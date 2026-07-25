"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { WHY_CHOOSE_US } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLanguage } from "@/app/components/LanguageProvider";

const imageMap = {
  users: "/images/services/professional-team.jpg",
  leaf: "/images/services/eco-friendly.jpg",
  clock: "/images/services/on-time-service.jpg",
  star: "/images/services/quality-service.jpg",
  shield: "/images/services/trusted-service.jpg",
  dollar: "/images/services/competitive-prices.jpg",
} as const;

const translationKeyMap = {
  users: "professionalTeam",
  leaf: "ecoFriendly",
  clock: "onTime",
  star: "qualityService",
  shield: "trustedService",
  dollar: "competitivePrices",
} as const;

export default function WhyChooseUs() {
  const { t, language } = useLanguage();

  const isArabic = language === "ar";

  return (
    <section
      id="why-us"
      dir={isArabic ? "rtl" : "ltr"}
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden"
    >
      {/* ========================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ========================================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">

        {/* Main Golden Glow */}

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[600px] h-[400px] sm:h-[600px] rounded-full bg-[#E7B548]/10 blur-[140px]" />

        {/* Top Glow */}

        <div className="absolute -top-40 left-1/4 w-[300px] h-[300px] rounded-full bg-[#E7B548]/5 blur-[120px]" />

        {/* Bottom Glow */}

        <div className="absolute -bottom-40 right-1/4 w-[300px] h-[300px] rounded-full bg-[#E7B548]/5 blur-[120px]" />

      </div>


      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ========================================= */}
        {/* SECTION HEADING */}
        {/* ========================================= */}

        <SectionHeading
          label={t.whyUs.label}
          title={t.whyUs.title}
          description={t.whyUs.description}
        />


        {/* ========================================= */}
        {/* FEATURES GRID */}
        {/* ========================================= */}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{
            once: true,
            margin: "-80px",
          }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >

          {WHY_CHOOSE_US.map((item, index) => {

            const translationKey =
              translationKeyMap[item.icon];

            const translatedItem =
              t.common[translationKey];

            return (

              <motion.article
                key={item.icon}
                variants={staggerItem}
                whileHover={{
                  y: -10,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="group relative overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0F2B34]/60 border border-white/10 backdrop-blur-sm hover:border-[#E7B548]/40 hover:bg-[#0F2B34]/80 hover:shadow-[0_20px_60px_rgba(231,181,72,0.12)] transition-all duration-500"
              >

                {/* ========================================= */}
                {/* IMAGE */}
                {/* ========================================= */}

                <div className="relative h-48 sm:h-52 lg:h-56 w-full overflow-hidden">

                  <Image
                    src={imageMap[item.icon]}
                    alt={translatedItem}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Cinematic Overlay */}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2B34] via-[#0F2B34]/30 to-black/10" />

                  {/* Golden Hover Overlay */}

                  <div className="absolute inset-0 bg-[#E7B548]/0 group-hover:bg-[#E7B548]/10 transition-colors duration-500" />


                  {/* ========================================= */}
                  {/* NUMBER */}
                  {/* ========================================= */}

                  <div
                    className={`absolute top-5 sm:top-6 text-5xl sm:text-6xl font-black text-white/20 group-hover:text-[#E7B548]/40 transition-all duration-500 ${
                      isArabic
                        ? "left-5 sm:left-6"
                        : "right-5 sm:right-6"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>


                  {/* Small Gold Line */}

                  <div
                    className={`absolute bottom-0 ${
                      isArabic ? "right-0" : "left-0"
                    } h-1 w-0 bg-[#E7B548] group-hover:w-1/3 transition-all duration-500`}
                  />

                </div>


                {/* ========================================= */}
                {/* CONTENT */}
                {/* ========================================= */}

                <div className="relative p-6 sm:p-7 lg:p-8">

                  {/* Icon / Number Indicator */}

                  <motion.div
                    whileHover={{
                      scale: 1.08,
                      rotate: [0, -6, 6, 0],
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className={`absolute -top-7 ${
                      isArabic
                        ? "left-6 sm:left-7"
                        : "right-6 sm:right-7"
                    } w-14 h-14 rounded-2xl bg-[#143640] border border-[#E7B548]/30 flex items-center justify-center shadow-lg shadow-black/20 group-hover:border-[#E7B548]/60 group-hover:bg-[#E7B548]/10 transition-all duration-300`}
                  >

                    <span className="text-[#E7B548] text-sm font-bold">
                      {String(index + 1).padStart(2, "0")}
                    </span>

                  </motion.div>


                  {/* Title */}

                  <h3
                    className={`text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#F4C95D] transition-colors duration-300 ${
                      isArabic
                        ? "pl-16"
                        : "pr-16"
                    }`}
                  >
                    {translatedItem}
                  </h3>


                  {/* Description */}

                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed">
                    {item.description}
                  </p>

                </div>


                {/* ========================================= */}
                {/* BOTTOM GOLD ACCENT */}
                {/* ========================================= */}

                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E7B548] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              </motion.article>

            );

          })}

        </motion.div>


        {/* ========================================= */}
        {/* BOTTOM STATEMENT */}
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
            delay: 0.25,
          }}
          className="mt-12 sm:mt-16 text-center"
        >

          <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-sm">

            <span className="w-2 h-2 rounded-full bg-[#E7B548] animate-pulse" />

            <span className="text-sm text-gray-300">
              {isArabic
                ? "جودة واحترافية في كل خدمة"
                : "Quality and professionalism in every service"}
            </span>

          </div>

        </motion.div>

      </div>
    </section>
  );
}