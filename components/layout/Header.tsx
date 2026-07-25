"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/app/components/LanguageProvider";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const { language, setLanguage, t } = useLanguage();

  const isArabic = language === "ar";

  function toggleLanguage() {
    setLanguage(isArabic ? "en" : "ar");
  }

  const navLinks = [
    { label: t.nav.home, href: "#home" },
    { label: t.nav.services, href: "#services" },
    { label: t.nav.whyUs, href: "#why-us" },
    { label: t.nav.areas, href: "#areas" },
    { label: t.nav.contact, href: "#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#143640]/95 backdrop-blur-xl border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-20 flex items-center justify-between gap-4">

          {/* Logo */}
          <a
            href="#home"
            className="flex items-center gap-3 shrink-0"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#E7B548] text-[#0F2B34] font-extrabold">
              AZ
            </div>

            <div className="flex flex-col">
              <span className="text-[#E7B548] font-bold text-sm sm:text-lg leading-tight">
                A to Z Cleaning
              </span>

              <span className="text-[9px] sm:text-xs text-gray-400 tracking-widest uppercase">
                Services
              </span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-gray-300 hover:text-[#E7B548] transition-colors text-sm font-medium"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">

            {/* Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="relative flex items-center w-[92px] h-10 rounded-full bg-[#0F2B34] border border-white/15 p-1 cursor-pointer"
            >
              {/* Sliding Indicator */}
              <motion.div
                animate={{
                  x: isArabic ? 46 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                className="absolute left-1 top-1 w-11 h-8 rounded-full bg-[#E7B548]"
              />

              {/* English */}
              <span
                className={`relative z-10 w-1/2 text-xs font-bold transition-colors duration-300 ${
                  !isArabic
                    ? "text-[#0F2B34]"
                    : "text-gray-400"
                }`}
              >
                EN
              </span>

              {/* Arabic */}
              <span
                className={`relative z-10 w-1/2 text-xs font-bold transition-colors duration-300 ${
                  isArabic
                    ? "text-[#0F2B34]"
                    : "text-gray-400"
                }`}
              >
                عربي
              </span>
            </button>

            <Button href="#contact" size="md">
              {t.nav.freeQuote}
            </Button>

          </div>

          {/* Mobile Actions */}
          <div className="flex lg:hidden items-center gap-2">

            {/* Mobile Language Toggle */}
            <button
              type="button"
              onClick={toggleLanguage}
              aria-label="Toggle language"
              className="relative flex items-center w-[82px] h-9 rounded-full bg-[#0F2B34] border border-white/15 p-1"
            >
              {/* Sliding Indicator */}
              <motion.div
                animate={{
                  x: isArabic ? 40 : 0,
                }}
                transition={{
                  type: "spring",
                  stiffness: 400,
                  damping: 25,
                }}
                className="absolute left-1 top-1 w-[38px] h-7 rounded-full bg-[#E7B548]"
              />

              {/* English */}
              <span
                className={`relative z-10 w-1/2 text-[10px] font-bold transition-colors duration-300 ${
                  !isArabic
                    ? "text-[#0F2B34]"
                    : "text-gray-400"
                }`}
              >
                EN
              </span>

              {/* Arabic */}
              <span
                className={`relative z-10 w-1/2 text-[10px] font-bold transition-colors duration-300 ${
                  isArabic
                    ? "text-[#0F2B34]"
                    : "text-gray-400"
                }`}
              >
                عربي
              </span>
            </button>

            {/* Mobile Menu Button */}
            <motion.button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.9 }}
              className="relative w-11 h-11 flex items-center justify-center rounded-xl border border-white/20 bg-white/10"
              aria-label="Open menu"
            >
              <div className="relative w-6 h-6">

                {/* Top Line */}
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 8 : 3,
                  }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-0 w-6 h-0.5 bg-[#E7B548] rounded-full"
                />

                {/* Middle Line */}
                <motion.span
                  animate={{
                    opacity: isOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-2.5 w-6 h-0.5 bg-[#E7B548] rounded-full"
                />

                {/* Bottom Line */}
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? 8 : 17,
                  }}
                  transition={{ duration: 0.25 }}
                  className="absolute left-0 w-6 h-0.5 bg-[#E7B548] rounded-full"
                />

              </div>
            </motion.button>

          </div>

        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            transition={{
              duration: 0.3,
            }}
            className="lg:hidden overflow-hidden bg-[#0F2B34] border-t border-white/10"
          >
            <nav className="flex flex-col px-4 py-5 gap-1">

              {navLinks.map((link, index) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  initial={{
                    opacity: 0,
                    x: -15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.25,
                    delay: index * 0.05,
                  }}
                  className="text-gray-200 hover:text-[#E7B548] py-3 px-4 rounded-xl hover:bg-white/5 transition-all font-medium"
                >
                  {link.label}
                </motion.a>
              ))}

              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.25,
                }}
                className="pt-4 px-4"
              >
                <Button
                  href="#contact"
                  size="md"
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  {t.nav.freeQuote}
                </Button>
              </motion.div>

            </nav>
          </motion.div>
        )}
      </AnimatePresence>

    </header>
  );
}