"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/app/components/LanguageProvider";

const PHONE_NUMBER = "201214290075";
const WHATSAPP_NUMBER = "201214290075";

export default function Hero() {
const { t, language } = useLanguage();

return ( <section
   id="home"
   className="relative min-h-[560px] sm:min-h-[620px] lg:min-h-[720px] flex items-center justify-center overflow-hidden pt-16 pb-10"
 >
{/* ===================================================== */}
{/* DESKTOP BACKGROUND IMAGE */}
{/* ===================================================== */}

```
  <div className="absolute inset-0 hidden sm:block">
    <div className="hero-desktop-image absolute inset-0">
      <Image
        src="/images/hero/hero-cleaning.jpg"
        alt="Professional A to Z Cleaning Services"
        fill
        priority
        className="object-cover"
      />
    </div>

    <div className="absolute inset-0 bg-[#143640]/70" />

    <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#143640]/20 to-[#143640]" />

    <div className="hero-glow absolute -top-40 left-1/2 w-[600px] h-[600px] -translate-x-1/2 rounded-full bg-[#E7B548]/10 blur-3xl" />
  </div>

  {/* ===================================================== */}
  {/* MOBILE VIDEO BACKGROUND */}
  {/* ===================================================== */}

  <div className="absolute inset-0 block sm:hidden">
    <video
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      className="hero-mobile-video absolute inset-0 w-full h-full object-cover"
    >
      <source
        src="/images/hero/hero-mobile.mp4"
        type="video/mp4"
      />
    </video>

    <div className="absolute inset-0 bg-[#143640]/40" />

    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#143640]/95" />

    <div className="hero-mobile-glow absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#143640]/80 to-transparent" />
  </div>

  {/* ===================================================== */}
  {/* HERO CONTENT */}
  {/* ===================================================== */}

  <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

    {/* LOGO */}

<div className="hero-logo-animation mb-3 sm:mb-6">
  <Image
    src="/images/logo/atoz-logo-new.png"
    alt="A to Z Cleaning Services"
    width={500}
    height={300}
    priority
    className="w-[275px] sm:w-[390px] lg:w-[450px] h-auto object-contain"
  />
</div>

    {/* BADGE */}

    <div className="hero-item hero-badge inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[10px] sm:text-sm text-gray-200 shadow-lg">

      <span className="hero-status-dot w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#E7B548]" />

      {t.hero.badge}

    </div>

    {/* MAIN TITLE */}

    <h1 className="hero-item hero-title text-3xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.02] tracking-tight mt-3 sm:mt-5 mb-3 sm:mb-5">

      {t.hero.title}

      <span className="hero-title-highlight block text-[#F4C95D] mt-1 sm:mt-2">

        {t.hero.titleHighlight}

      </span>

    </h1>

    {/* DESCRIPTION */}

    <p className="hero-item hero-description text-xs sm:text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto mb-4 sm:mb-7 leading-relaxed">

      {t.hero.description}

    </p>

    {/* ===================================================== */}
    {/* COMPACT ACTION BUTTONS */}
    {/* ===================================================== */}

    <div className="hero-item hero-buttons flex flex-row items-center justify-center gap-2 sm:gap-3 w-full">

      {/* BOOK NOW */}

      <div className="hero-button">
        <Button
          href="#contact"
          size="md"
         className="text-xs sm:text-base px-5 sm:px-7 py-3 sm:py-3.5 whitespace-nowrap shadow-xl shadow-black/20"
        >
          📅 {t.hero.bookNow}
        </Button>
      </div>

      {/* CALL US */}

      <a
  href={`tel:+${PHONE_NUMBER}`}
  className="hero-button inline-flex items-center justify-center gap-1 sm:gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg border border-white/30 bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-base font-semibold hover:bg-white/20 hover:border-white/50 whitespace-nowrap"
>
        <span aria-hidden="true">☎</span>
        <span className="sm:hidden">Call</span>
        <span className="hidden sm:inline">Call Us</span>
      </a>

      {/* WHATSAPP */}

      <a
  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    language === "ar"
      ? "مرحبًا، أود حجز خدمة تنظيف."
      : "Hello, I would like to book a cleaning service."
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="hero-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-md text-white text-sm sm:text-base font-semibold hover:bg-white/20 hover:border-white/50"
>
  <span aria-hidden="true">💬</span>
  WhatsApp
</a>

    </div>

  </div>

  {/* ===================================================== */}
  {/* SCROLL INDICATOR */}
  {/* ===================================================== */}

  <div className="hero-scroll absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20">

    <a
      href="#services"
      className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#E7B548] transition-colors"
    >

      <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.2em]">
        {t.hero.scroll}
      </span>

      <svg
        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 14l-7 7m0 0l-7-7m7 7V3"
        />
      </svg>

    </a>

  </div>

  {/* DECORATIVE PARTICLES */}

  <div className="absolute inset-0 pointer-events-none z-[5] hidden lg:block">

    <span className="hero-particle particle-one" />

    <span className="hero-particle particle-two" />

    <span className="hero-particle particle-three" />

  </div>
<style jsx>{`
  .hero-logo-animation {
    opacity: 0;
    transform: translateX(45px) scale(0.96);
    filter: blur(8px);
    animation: heroLogoCinematic 1.5s cubic-bezier(0.22, 1, 0.36, 1) 0.2s forwards;
  }

  @keyframes heroLogoCinematic {
    0% {
      opacity: 0;
      transform: translateX(45px) scale(0.96);
      filter: blur(8px);
    }

    40% {
      opacity: 0.5;
      transform: translateX(20px) scale(0.98);
      filter: blur(5px);
    }

    70% {
      opacity: 0.9;
      transform: translateX(-4px) scale(1.01);
      filter: blur(1px);
    }

    100% {
      opacity: 1;
      transform: translateX(0) scale(1);
      filter: blur(0);
    }
  }
`}</style>
</section>


);
}
