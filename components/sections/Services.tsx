"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SERVICES } from "@/lib/constants";
import { staggerContainer, staggerItem } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import { useLanguage } from "@/app/components/LanguageProvider";

import {
  HomeIcon,
  StoreIcon,
  BuildingIcon,
  CheckIcon,
} from "@/components/ui/Icons";

const WHATSAPP_NUMBER = "201214290075";

const iconMap = {
  home: HomeIcon,
  store: StoreIcon,
  building: BuildingIcon,
} as const;

export default function Services() {
  const { t, language } = useLanguage();

  const isArabic = language === "ar";

  return (
    <section
      id="services"
      dir={isArabic ? "rtl" : "ltr"}
      className="relative py-16 sm:py-20 lg:py-28 overflow-hidden"
    >
      {/* ========================================= */}
      {/* BACKGROUND DECORATION */}
      {/* ========================================= */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] sm:w-[700px] h-[500px] sm:h-[700px] rounded-full bg-[#E7B548]/5 blur-[140px]" />

        <div className="absolute top-1/2 -left-40 w-[300px] h-[300px] rounded-full bg-[#E7B548]/5 blur-[120px]" />

        <div className="absolute bottom-0 -right-40 w-[300px] h-[300px] rounded-full bg-[#E7B548]/5 blur-[120px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ========================================= */}
        {/* SECTION HEADING */}
        {/* ========================================= */}

        <SectionHeading
          label={t.services.label}
          title={t.services.title}
          description={t.services.description}
        />

        {/* ========================================= */}
        {/* SERVICES GRID */}
        {/* ========================================= */}

        <motion.div
          variants={staggerContainer}
          initial="initial"
          whileInView="whileInView"
          viewport={{
            once: true,
            margin: "-80px",
          }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8"
        >
          {SERVICES.map((service, index) => {
            const Icon = iconMap[service.icon];

            const translatedService =
              t.serviceCards[
                service.id as keyof typeof t.serviceCards
              ];

            return (
              <motion.article
                key={service.id}
                variants={staggerItem}
                whileHover={{
                  y: -10,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
                className="group relative flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-[#0F2B34]/70 border border-white/10 backdrop-blur-sm hover:border-[#E7B548]/40 hover:shadow-[0_20px_60px_rgba(231,181,72,0.12)] transition-all duration-500"
              >

                {/* ========================================= */}
                {/* IMAGE */}
                {/* ========================================= */}

                <div className="relative h-52 sm:h-56 lg:h-60 w-full overflow-hidden">

                  <Image
                    src={service.image}
                    alt={translatedService.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />

                  {/* Dark cinematic overlay */}

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F2B34] via-[#0F2B34]/20 to-transparent" />

                  {/* Gold hover overlay */}

                  <div className="absolute inset-0 bg-[#E7B548]/0 group-hover:bg-[#E7B548]/10 transition-colors duration-500" />

                  {/* Service Number */}

                  <div
                    className={`absolute top-5 text-5xl font-black text-white/20 transition-all duration-500 group-hover:text-[#E7B548]/40 ${
                      isArabic ? "left-5" : "right-5"
                    }`}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </div>

                </div>

                {/* ========================================= */}
                {/* CONTENT */}
                {/* ========================================= */}

                <div className="relative flex flex-col flex-1 p-6 sm:p-7 lg:p-8">

                  {/* Icon */}

                  <motion.div
                    whileHover={{
                      rotate: [0, -8, 8, 0],
                      scale: 1.08,
                    }}
                    transition={{
                      duration: 0.4,
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E7B548]/10 border border-[#E7B548]/20 flex items-center justify-center text-[#E7B548] mb-5 group-hover:bg-[#E7B548]/20 group-hover:border-[#E7B548]/40 transition-all duration-300 ${
                      isArabic ? "ml-auto" : ""
                    }`}
                  >
                    <Icon />
                  </motion.div>

                  {/* Title */}

                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 group-hover:text-[#F4C95D] transition-colors duration-300">
                    {translatedService.title}
                  </h3>

                  {/* Description */}

                  <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6">
                    {translatedService.description}
                  </p>

                  {/* Features */}

                  <ul className="space-y-3 mb-8">

                    {translatedService.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-3 text-sm text-gray-300"
                      >
                        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#E7B548]/10 shrink-0 mt-0.5">
                          <CheckIcon className="w-3.5 h-3.5 text-[#E7B548]" />
                        </span>

                        <span>{feature}</span>
                      </li>
                    ))}

                  </ul>

                  {/* ========================================= */}
                  {/* BUTTONS */}
                  {/* ========================================= */}

                  <div className="mt-auto pt-2 flex flex-col gap-3">

                    {/* Request Quote */}

                    <motion.a
                      href="#contact"
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      className="w-full text-center py-3.5 rounded-xl bg-[#E7B548] text-[#143640] font-bold text-sm sm:text-base shadow-lg shadow-[#E7B548]/10 hover:bg-[#F4C95D] transition-colors duration-300"
                    >
                      {t.services.requestQuote}
                    </motion.a>

                    {/* WhatsApp */}

                    <motion.a
                      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                        isArabic
                          ? `مرحبًا، أود حجز خدمة ${translatedService.title}.`
                          : `Hello, I would like to book ${translatedService.title}.`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{
                        scale: 1.02,
                      }}
                      whileTap={{
                        scale: 0.98,
                      }}
                      className="w-full text-center py-3.5 rounded-xl border border-[#E7B548]/60 text-[#E7B548] font-semibold text-sm sm:text-base hover:bg-[#E7B548] hover:text-[#143640] hover:border-[#E7B548] transition-all duration-300"
                    >
                      {t.services.whatsapp}
                    </motion.a>

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

      </div>
    </section>
  );
}