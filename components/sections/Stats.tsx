"use client";

import { motion } from "framer-motion";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Stats() {
  const { t } = useLanguage();

  const stats = [
    {
      number: "2",
      label: t.stats.serviceAreas,
    },
    {
      number: "7",
      label: t.stats.availableEveryWeek,
    },
    {
      number: "A–Z",
      label: t.stats.completeCleaningService,
    },
    {
      number: "100%",
      label: t.stats.commitmentToQuality,
    },
  ];

  return (
    <section
      className="relative py-10 sm:py-12 lg:py-20 bg-[#0F2B34] border-y border-white/5"
      dir="inherit"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-8">
          {stats.map((item, index) => (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
              }}
              className="text-center p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:border-[#E7B548]/30 hover:bg-white/[0.07] transition-all duration-300"
            >
              {/* Number */}
              <div className="text-2xl sm:text-4xl lg:text-5xl font-bold text-[#E7B548]">
                {item.number}
              </div>

              {/* Label */}
              <p className="text-gray-300 text-xs sm:text-sm lg:text-base mt-2 sm:mt-3 leading-snug">
                {item.label}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}