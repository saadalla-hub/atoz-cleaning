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
  sizes="100vw"
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
          <svg className="inline-block w-4 h-4 sm:w-5 sm:h-5 mr-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="9"/><path strokeLinecap="round" d="M12 7v5l3 2"/></svg>{t.hero.bookNow}
        </Button>
      </div>

      {/* CALL US */}

      <a
  href={`tel:+${PHONE_NUMBER}`}
  className="hero-button inline-flex items-center justify-center gap-1 sm:gap-2 px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg border border-white/30 bg-white/10 backdrop-blur-md text-white text-[11px] sm:text-base font-semibold hover:bg-white/20 hover:border-white/50 whitespace-nowrap"
>
        <span aria-hidden="true" className="inline-flex items-center justify-center"><svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 3.08 5.18 2 2 0 0 1 5.06 3h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L9 10.73a16 16 0 0 0 4.27 4.27l1.27-1.23a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 21 15.92z"/></svg></span><span className="sm:hidden">Call</span>
        <span className="hidden sm:inline">Call Us</span>
      </a>

      {/* WHATSAPP */}

      <a
  href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    language === "ar"
      ? "Ù…Ø±Ø­Ø¨Ù‹Ø§ØŒ Ø£ÙˆØ¯ Ø­Ø¬Ø² Ø®Ø¯Ù…Ø© ØªÙ†Ø¸ÙŠÙ."
      : "Hello, I would like to book a cleaning service."
  )}`}
  target="_blank"
  rel="noopener noreferrer"
  className="hero-button w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 sm:px-8 py-3 rounded-lg border border-white/30 bg-white/10 backdrop-blur-md text-white text-sm sm:text-base font-semibold hover:bg-white/20 hover:border-white/50"
>
  <span aria-hidden="true" className="inline-flex items-center justify-center"><svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M20.5 3.5A11.9 11.9 0 0 0 12.02 0C5.43 0 .07 5.36.07 11.95c0 2.1.55 4.15 1.6 5.96L.0 24l6.25-1.64a11.9 11.9 0 0 0 5.77 1.48h.01c6.59 0 11.95-5.36 11.95-11.95 0-3.19-1.24-6.19-3.48-8.39ZM12.03 21.8a9.85 9.85 0 0 1-5.03-1.38l-.36-.21-3.71.97.99-3.62-.24-.37a9.85 9.85 0 0 1-1.52-5.24c0-5.44 4.43-9.87 9.88-9.87 2.63 0 5.1 1.03 6.96 2.9a9.82 9.82 0 0 1 2.9 6.97c0 5.44-4.43 9.87-9.87 9.87Zm5.41-7.39c-.3-.15-1.77-.87-2.05-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.38-1.47-.88-.78-1.47-1.74-1.64-2.04-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.49.71.31 1.27.5 1.7.64.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.12-.27-.2-.57-.35Z"/></svg></span>WhatsApp
</a>

    </div>

    {/* APP DOWNLOAD BUTTONS */}
    <div className="hero-app-buttons flex flex-row items-center justify-center gap-3 sm:gap-5 w-full mt-4 -translate-y-2">

      {/* GOOGLE PLAY */}
      <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-black/45 border border-white/15 backdrop-blur-md text-white shadow-lg cursor-pointer transition-all duration-200 hover:bg-black/60 hover:border-white/35 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">

        <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 48 48" fill="none">
          <path d="M7 6.5L28 24 7 41.5C6.4 40.7 6 39.7 6 38.5V9.5C6 8.3 6.4 7.3 7 6.5Z" fill="#34A853"/>
          <path d="M28 24L34.5 18.5L10.8 5.2C9.4 4.4 8 5 7 6.5L28 24Z" fill="#4285F4"/>
          <path d="M28 24L34.5 29.5L10.8 42.8C9.4 43.6 8 43 7 41.5L28 24Z" fill="#FBBC04"/>
          <path d="M34.5 18.5L40.5 21.8C42.5 22.9 42.5 25.1 40.5 26.2L34.5 29.5L28 24L34.5 18.5Z" fill="#EA4335"/>
        </svg>

        <span className="flex flex-col text-left leading-tight">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-300">
            Get it on
          </span>
          <span className="text-sm sm:text-base font-semibold">
            Google Play
          </span>
        </span>

      </div>

      {/* APP STORE */}
      <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-black/45 border border-white/15 backdrop-blur-md text-white shadow-lg cursor-pointer transition-all duration-200 hover:bg-black/60 hover:border-white/35 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0">

        <svg className="w-7 h-7 sm:w-8 sm:h-8 shrink-0" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 12.54C17.03 10.07 19.07 8.87 19.16 8.81C18.01 7.13 16.22 6.9 15.59 6.88C14.08 6.72 12.62 7.79 11.85 7.79C11.06 7.79 9.89 6.9 8.61 6.93C6.96 6.96 5.42 7.89 4.57 9.34C2.82 12.37 4.13 16.82 5.91 19.27C6.8 20.47 7.84 21.81 9.21 21.76C10.55 21.7 11.05 20.96 12.67 20.96C14.28 20.96 14.74 21.76 16.14 21.73C17.58 21.7 18.48 20.53 19.24 19.32C20.15 17.94 20.51 16.6 20.53 16.53C20.5 16.52 17.08 15.21 17.05 12.54ZM14.55 5.25C15.23 4.4 15.69 3.24 15.57 2.05C14.58 2.09 13.38 2.7 12.67 3.53C12.05 4.25 11.5 5.46 11.64 6.58C12.75 6.67 13.8 6.1 14.55 5.25Z"/>
        </svg>

        <span className="flex flex-col text-left leading-tight">
          <span className="text-[9px] sm:text-[10px] uppercase tracking-wide text-gray-300">
            Download on the
          </span>
          <span className="text-sm sm:text-base font-semibold">
            App Store
          </span>
        </span>

      </div>

    </div>
  </div>

  {/* ===================================================== */}
  {/* SCROLL INDICATOR */}
  {/* ===================================================== */}

  <div className="hero-scroll absolute bottom-1 sm:bottom-2 left-[52%] -translate-x-1/2 z-20">

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









