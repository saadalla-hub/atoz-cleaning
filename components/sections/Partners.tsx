
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Partners() {
  const { t, language } = useLanguage();

  const isArabic = language === "ar";

  return (
    <section
      id="partners"
      dir={isArabic ? "rtl" : "ltr"}
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
    >
      {/* ========================================= */}
      {/* BACKGROUND GLOW */}
      {/* ========================================= */}

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] lg:w-[650px] h-[400px] sm:h-[500px] lg:h-[650px] bg-[#E7B548]/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ========================================= */}
      {/* DECORATIVE LIGHT */}
      {/* ========================================= */}

      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] max-w-5xl h-px bg-gradient-to-r from-transparent via-[#E7B548]/40 to-transparent"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ========================================= */}
        {/* MAIN CONTENT */}
        {/* ========================================= */}

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className="mx-auto max-w-6xl text-center"
        >

          {/* LABEL */}

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="mb-4 text-xs sm:text-sm font-semibold uppercase tracking-[0.28em] text-[#E7B548]"
          >
            {t.partners.label}
          </motion.p>


          {/* HEADING */}

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.15,
            }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white"
          >
            {t.partners.title}
          </motion.h2>


          {/* DESCRIPTION */}

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              delay: 0.25,
            }}
            className="mx-auto mt-5 sm:mt-6 max-w-3xl text-sm sm:text-base lg:text-lg leading-7 sm:leading-8 text-gray-400"
          >
            {t.partners.description}
          </motion.p>


          {/* ========================================= */}
          {/* ORION LOGO */}
          {/* ========================================= */}

          <motion.div
            initial={{
              opacity: 0,
              scale: 0.9,
              y: 25,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            viewport={{
              once: true,
              margin: "-50px",
            }}
            transition={{
              duration: 0.9,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="mt-10 sm:mt-14 flex justify-center"
          >

            <motion.div
              whileHover={{
                scale: 1.04,
              }}
              transition={{
                duration: 0.3,
                ease: "easeOut",
              }}
              className="relative h-44 w-full max-w-[28rem] sm:h-56 sm:max-w-[42rem] lg:h-72 lg:max-w-[58rem]"
            >

              <Image
                src="/images/orion.png"
                alt="ORION"
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 900px"
                className="object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.35)]"
              />

            </motion.div>

          </motion.div>

        </motion.div>

      </div>
    </section>
  );
}
