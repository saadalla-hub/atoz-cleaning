"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import { useLanguage } from "@/app/components/LanguageProvider";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();

      if (data.user) {
        console.log("LOGIN USER:", data.user.id, data.user.email);
        const { data: profile } = await supabase
          .from("users")
          .select("full_name")
          .eq("id", data.user.id)
          .single();

        console.log("PROFILE RESULT:", profile);

        setUserName(profile?.full_name || data.user.user_metadata?.full_name || data.user.email || null);
      }
    }

    loadUser();
  }, []);

  const isArabic = language === "ar";

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

 function toggleLanguage() {
  setLanguage(isArabic ? "en" : "ar");
}

function closeMobileMenu() {
  setIsOpen(false);
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
            <div className="flex items-center justify-center w-11 h-11 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-white shadow-md shrink-0">
              <img
                src="/images/logo/atoz-logo-new.png"
                alt="A to Z Cleaning Services"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="flex flex-col">
              <span className="text-[#E7B548] font-bold text-sm sm:text-lg leading-tight">
                A to Z Cleaning
              </span>

              <span className="text-[9px] sm:text-xs text-gray-400 tracking-widest uppercase">
                Services
              </span>

              {userName && (
                <span className="text-[10px] sm:text-xs text-[#E7B548] font-bold mt-1">
                  Welcome {userName} 👋
                </span>
              )}
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

          {/* User Actions */}
          {userName && (
            <button
              type="button"
              onClick={signOut}
              className="hidden lg:block text-sm text-gray-300 hover:text-[#E7B548] transition"
            >
              Sign Out
            </button>
          )}

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
              onClick={() => setIsOpen((current) => !current)}
              whileTap={{ scale: 0.92 }}
              className="relative z-[60] w-11 h-11 flex items-center justify-center rounded-xl border border-white/20 bg-white/10 cursor-pointer"
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
            >
              <div className="relative w-6 h-6">

                {/* Top Line */}
                <motion.span
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 7 : 0,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-2.5 w-6 h-0.5 bg-[#E7B548] rounded-full origin-center"
                />

                {/* Middle Line */}
                <motion.span
                  animate={{
                    opacity: isOpen ? 0 : 1,
                    scaleX: isOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 top-2.5 w-6 h-0.5 bg-[#E7B548] rounded-full"
                />

                {/* Bottom Line */}
                <motion.span
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? 7 : 12,
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 top-2.5 w-6 h-0.5 bg-[#E7B548] rounded-full origin-center"
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
                  onClick={closeMobileMenu}
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
                  onClick={closeMobileMenu}
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
















