"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
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
const [userName, setUserName] = useState<string | null>(null);

useEffect(() => {
  const loadUserName = async () => {
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;

    const { data: profile } = await supabase
      .from("users")
      .select("full_name")
      .eq("id", data.user.id)
      .single();

    setUserName(profile?.full_name || data.user.user_metadata?.full_name || data.user.email || null);
  };

  loadUserName();
}, []);

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
                          ? userName ? `مرحبًا، أنا ${userName}، وأود حجز خدمة تنظيف ${translatedService.title}.` : `مرحبًا، أود حجز خدمة تنظيف ${translatedService.title}.`
                          : userName ? `Hello, my name is ${userName}. I would like to book ${translatedService.title}.` : `Hello, I would like to book ${translatedService.title}.`
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
        {/* ========================================= */}
        {/* REFERRAL / GREEN POINTS */}
        {/* ========================================= */}

        <motion.div
          initial={{
            opacity: 0,
            y: 30,
          }}
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            margin: "-80px",
          }}
          transition={{
            duration: 0.6,
          }}
          className="mt-10 sm:mt-12"
        >
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-[#E7B548]/30 bg-[#143640] shadow-[0_20px_60px_rgba(20,54,64,0.20)]">

            {/* Decorative glow */}

            <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-[#E7B548]/10 blur-3xl pointer-events-none" />

            <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-[#E7B548]/10 blur-3xl pointer-events-none" />

            <div className="relative p-6 sm:p-8 lg:p-10">

              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7">

                {/* Referral Message */}

                <div className={`flex items-start gap-4 sm:gap-5 ${isArabic ? "text-right" : "text-left"}`}>

                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-[#E7B548]/15 border border-[#E7B548]/30 flex items-center justify-center text-2xl sm:text-3xl shrink-0">
                    🎁
                  </div>

                  <div>

                    <p className="text-[#E7B548] text-xs sm:text-sm font-bold uppercase tracking-[0.16em] mb-2">
                      {isArabic
                        ? "برنامج الإحالة والمكافآت"
                        : "Referral & Rewards"}
                    </p>

                    <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                      {isArabic
                        ? "أحِل أصدقاءك واكسب نقاط خضراء"
                        : "Refer Friends. Earn Green Points."}
                    </h3>

                    <p className="mt-3 text-gray-300 text-sm sm:text-base leading-relaxed max-w-2xl">
                      {isArabic
                        ? "إذا أحلت اليوم أصدقاءك وحجزوا خدمة تنظيف، تحصل على نقاط خضراء. تابع نقاطك وإحالاتك ومكافآتك بسهولة من لوحة التحكم."
                        : "Refer your friends and earn Green Points when they book a cleaning service. Track your points, referrals, and rewards from your dashboard."}
                    </p>

                  </div>

                </div>

                {/* Dashboard Button */}

                <Link
                  href="/dashboard"
                  className="group w-full lg:w-auto inline-flex items-center justify-center gap-3 shrink-0 rounded-xl bg-[#E7B548] px-6 sm:px-8 py-3.5 sm:py-4 text-sm sm:text-base font-bold text-[#143640] shadow-lg shadow-[#E7B548]/10 hover:bg-[#F4C95D] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >

                  <span>
                    {isArabic
                      ? "لوحة الإحالات والمكافآت"
                      : "Open Referral Dashboard"}
                  </span>

                  <span
                    className={`text-lg transition-transform duration-300 ${
                      isArabic
                        ? "group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  >
                    {isArabic ? "←" : "→"}
                  </span>

                </Link>

              </div>

              {/* Small benefit row */}

              <div className="relative mt-7 pt-5 border-t border-white/10 flex flex-wrap items-center gap-x-6 gap-y-3">

                <div className="flex items-center gap-2 text-sm text-white/75">
                  <span className="w-2 h-2 rounded-full bg-[#E7B548]" />
                  {isArabic ? "تابع نقاطك الخضراء" : "Track Green Points"}
                </div>

                <div className="flex items-center gap-2 text-sm text-white/75">
                  <span className="w-2 h-2 rounded-full bg-[#E7B548]" />
                  {isArabic ? "شاهد إحالاتك" : "View Referrals"}
                </div>

                <div className="flex items-center gap-2 text-sm text-white/75">
                  <span className="w-2 h-2 rounded-full bg-[#E7B548]" />
                  {isArabic ? "اطلب مكافآتك" : "Claim Rewards"}
                </div>

              </div>

            </div>

          </div>
        </motion.div>
</div>
    </section>
  );
}







