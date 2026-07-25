"use client";

import Image from "next/image";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Hero() {
  const { t } = useLanguage();

  return (
    <section
      id="home"
      className="relative min-h-[560px] lg:min-h-[720px] flex items-center justify-center overflow-hidden pt-16 pb-10"
    >

      {/* ========================================= */}
      {/* DESKTOP BACKGROUND - LAPTOP */}
      {/* ========================================= */}

      <div className="absolute inset-0 hidden sm:block">
        <Image
          src="/images/hero/hero-cleaning.jpg"
          alt="Professional A to Z Cleaning Services"
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-[#143640]/75" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-[#143640]" />
      </div>


      {/* ========================================= */}
      {/* MOBILE VIDEO */}
      {/* ========================================= */}

      <div className="absolute inset-0 block sm:hidden">

        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="/images/hero/hero-mobile.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-[#143640]/45" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-[#143640]" />

      </div>


      {/* ========================================= */}
      {/* MOBILE LOGO */}
      {/* ========================================= */}

      <div className="absolute inset-0 z-10 flex sm:hidden items-center justify-center">
  <Image
    src="/images/logo/atoz-logo.png"
    alt="A to Z Cleaning Services"
    width={500}
    height={300}
    priority
    className="w-[300px] h-auto object-contain"
  />
</div>


      {/* ========================================= */}
      {/* DESKTOP CONTENT */}
      {/* ========================================= */}

      <div className="relative z-10 hidden sm:block w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

        {/* Badge */}

        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-white/5 border border-white/10 text-xs sm:text-sm text-gray-300 mb-4 backdrop-blur-sm">

          <span className="w-2 h-2 rounded-full bg-[#E7B548] animate-pulse" />

          {t.hero.badge}

        </div>


        {/* Heading */}

        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-extrabold text-white leading-[1.05] tracking-tight mb-4">

          {t.hero.title}

          <span className="block text-[#F4C95D] mt-1">
            {t.hero.titleHighlight}
          </span>

        </h1>


        {/* Description */}

        <p className="text-base sm:text-lg lg:text-xl text-gray-300 max-w-2xl mx-auto mb-6 leading-relaxed">

          {t.hero.description}

        </p>


        {/* Buttons */}

        <div className="flex flex-row items-center justify-center gap-3">

          <Button
            href="#contact"
            size="md"
            className="text-sm sm:text-base px-5 sm:px-7 py-3"
          >
            {t.hero.bookNow}
          </Button>

          <Button
            href="#services"
            variant="outline"
            size="md"
            className="text-sm sm:text-base px-5 sm:px-7 py-3"
          >
            {t.hero.viewServices}
          </Button>

        </div>

      </div>


      {/* ========================================= */}
      {/* SCROLL INDICATOR */}
      {/* ========================================= */}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">

        <a
          href="#services"
          className="flex flex-col items-center gap-1 text-gray-300 hover:text-[#E7B548] transition-colors"
        >

          <span className="text-[10px] uppercase tracking-widest">
            {t.hero.scroll}
          </span>

          <svg
            className="w-4 h-4"
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


      {/* ========================================= */}
      {/* MOBILE LOGO ANIMATION */}
      {/* ========================================= */}

      <style jsx>{`

        .mobile-logo {
          opacity: 0;
          transform: scale(0.7);
          filter: blur(10px);

          animation: logoAppear 1.8s ease-out 0.5s forwards;
        }


        @keyframes logoAppear {

          0% {
            opacity: 0;
            transform: scale(0.7);
            filter: blur(10px);
          }

          60% {
            opacity: 1;
            transform: scale(1.08);
            filter: blur(0);
          }

          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }

        }

      `}</style>

    </section>
  );
}