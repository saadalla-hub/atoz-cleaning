'use client';

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";

export default function WelcomePage() {
  const [isArabic, setIsArabic] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("language");
    setIsArabic(savedLanguage === "ar");
  }, []);

  function toggleLanguage() {
    const nextLanguage = isArabic ? "en" : "ar";
    localStorage.setItem("language", nextLanguage);
    setIsArabic(nextLanguage === "ar");
  }

  const t = isArabic
    ? {
        welcome: "مرحباً بك في A to Z",
        professional: "خدمات تنظيف احترافية",
        location: "في مدينتي و الشروق",
        tagline: "نظيف. احترافي. من A إلى Z.",
        welcomeBack: "مرحباً بعودتك",
        access: "سجّل الدخول أو أنشئ حساب العميل الخاص بك",
        signIn: "تسجيل الدخول",
        createAccount: "إنشاء حساب",
        continueAsGuest: "المتابعة كضيف",
        customerAccess: "دخول العملاء",
        description: "احجز خدمات التنظيف، وأدر حجوزاتك،",
        description2: "واكسب Green Points.",
      }
    : {
        welcome: "Welcome to A to Z",
        professional: "Professional Cleaning Services",
        location: "in Madinaty & El Shorouk",
        tagline: "Clean. Professional. From A to Z.",
        welcomeBack: "Welcome Back",
        access: "Sign in or create your customer account",
        signIn: "Sign In",
        createAccount: "Create Account",
        continueAsGuest: "Continue as Guest",
        customerAccess: "Customer Access",
        description: "Book cleaning services, manage your bookings,",
        description2: "and earn Green Points.",
      };

  return (
    <main className="min-h-screen bg-[#143640] text-white relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#E7B548]/10 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-[#E7B548]/10 blur-3xl" />
      </div>

      {/* Language Switcher */}
      <button
        type="button"
        onClick={toggleLanguage}
        className="absolute top-5 right-5 z-20 bg-[#E7B548] text-[#143640] font-extrabold px-4 py-2 rounded-xl hover:brightness-95 transition"
      >
        {isArabic ? "EN" : "عربي"}
      </button>

      {/* Welcome */}
      <div className="relative min-h-screen flex items-center justify-center px-5 py-10">

        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-10 items-center">

          {/* LEFT — Welcome */}
          <div className="flex flex-col items-center justify-center text-center px-4 lg:px-8">

            {/* Logo */}
            <motion.div
              animate={{
                scale: [1, 1.035, 0.995, 1.02, 1],
              }}
              transition={{
                duration: 2.1,
                repeat: Infinity,
                repeatDelay: 1.1,
                ease: "easeInOut",
              }}
              className="relative w-80 h-48 flex items-center justify-center"
            >

              <Image
                src="/images/logo/atoz-logo-new.png"
                alt="A to Z Cleaning Services"
                width={260}
                height={130}
                className="object-contain relative z-10"
                priority
              />

              {/* Orbit stars */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{
                  duration: 5.2,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="absolute inset-0"
              >

                <span className="absolute top-2 left-1/2 
-translate-x-1/2 text-[#E7B548] text-2xl">
                  ✦
                </span>

                <span className="absolute right-1 top-1/2 
-translate-y-1/2 text-[#E7B548] text-2xl">
                  ✦
                </span>

                <span className="absolute bottom-2 left-3 
text-[#E7B548] text-2xl">
                  ✦
                </span>

              </motion.div>

            </motion.div>
            <h1 className="text-4xl sm:text-5xl font-extrabold mt-5">
              {t.welcome}
            </h1>

            <p className="text-[#C7D0D2] text-lg mt-4">
              {t.professional}
            </p>

            <p className="text-[#C7D0D2] text-lg">
              {t.location}
            </p>

            <p className="text-[#8A9A9E] text-sm mt-7">
              {t.tagline}
            </p>

          </div>


          {/* RIGHT — Customer Entry */}
          <div className="w-full max-w-md mx-auto">

            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">

              {/* Gold line */}
              <div className="h-1.5 bg-[#E7B548]" />

              <div className="p-7 sm:p-9">

                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-6">
                  <Image
                    src="/images/logo/atoz-logo-new.png"
                    alt="A to Z Cleaning Services"
                    width={210}
                    height={105}
                    className="object-contain"
                    priority
                  />
                </div>

                <div className="text-center mb-8">

                  <h2 className="text-3xl font-extrabold text-[#143640]">
                    {t.welcomeBack}
                  </h2>

                  <p className="text-gray-500 mt-2">
                    {t.access}
                  </p>

                </div>


                {/* Sign In */}
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center bg-[#E7B548] text-[#143640] font-extrabold py-4 rounded-xl hover:brightness-95 active:scale-[0.99] transition"
                >
                  {t.signIn}
                </Link>


                {/* Create Account */}
                <Link
                  href="/register"
                  className="w-full flex items-center justify-center border-2 border-[#143640] text-[#143640] font-extrabold py-4 rounded-xl hover:bg-[#143640] hover:text-white transition mt-4"
                >
                  {t.createAccount}
                </Link>


                {/* Continue as Guest */}
                <Link
                  href="/home#contact"
                  className="w-full flex items-center justify-center border-2 border-gray-300 text-[#143640] font-extrabold py-4 rounded-xl hover:border-[#E7B548] hover:bg-[#E7B548]/10 transition mt-4"
                >
                  {t.continueAsGuest}
                </Link>

                <div className="flex items-center gap-3 my-7">
                  <div className="h-px bg-gray-200 flex-1" />
                  <span className="text-xs text-gray-400 uppercase tracking-wider">
                    {t.customerAccess}
                  </span>
                  <div className="h-px bg-gray-200 flex-1" />
                </div>


                <p className="text-center text-gray-400 text-sm leading-relaxed">
                  {t.description}
                  <br />
                  {t.description2}
                </p>

              </div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}






