
"use client";

import { CONTACT_INFO } from "@/lib/constants";
import { PhoneIcon, MailIcon, MapPinIcon } from "@/components/ui/Icons";
import { useLanguage } from "@/app/components/LanguageProvider";

const WHATSAPP_NUMBER = "201214290075";

export default function Footer() {
  const { t, language } = useLanguage();
  const year = new Date().getFullYear();

  const isArabic = language === "ar";

  const whatsappMessage = isArabic
    ? "مرحباً، أريد حجز خدمة تنظيف. أود معرفة المزيد عن خدماتكم."
    : "Hello, I would like to book a cleaning service. I would like to know more about your services.";

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    whatsappMessage
  )}`;

  return (
    <footer
      dir={isArabic ? "rtl" : "ltr"}
      className="bg-[#0F2B34] border-t border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

          {/* ========================= */}
          {/* BRAND */}
          {/* ========================= */}

          <div>
            <a
              href="#home"
              className="inline-flex items-center gap-3 mb-5 group"
            >
              <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#E7B548] text-[#0F2B34] font-extrabold text-lg">
                AZ
              </span>

              <div>
                <span className="block text-[#E7B548] font-bold text-lg">
                  A to Z Cleaning
                </span>

                <span className="block text-xs text-gray-400 tracking-[0.2em] uppercase mt-1">
                  Services
                </span>
              </div>
            </a>

            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              {t.footer.description}
            </p>

            {/* WhatsApp */}

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 mt-6 px-5 py-3 rounded-xl bg-[#E7B548] text-[#0F2B34] text-sm font-semibold hover:bg-[#F4C95D] hover:scale-[1.02] transition-all duration-300"
            >
              {t.footer.whatsapp}
            </a>
          </div>


          {/* ========================= */}
          {/* QUICK LINKS */}
          {/* ========================= */}

          <div>
            <h3 className="text-white font-semibold mb-5">
              {t.footer.quickLinks}
            </h3>

            <ul className="space-y-3">

              <li>
                <a
                  href="#home"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.nav.home}
                </a>
              </li>

              <li>
                <a
                  href="#services"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.nav.services}
                </a>
              </li>

              <li>
                <a
                  href="#why-us"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.nav.whyUs}
                </a>
              </li>

              <li>
                <a
                  href="#areas"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.nav.areas}
                </a>
              </li>

              <li>
                <a
                  href="#contact"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.nav.contact}
                </a>
              </li>

            </ul>
          </div>


          {/* ========================= */}
          {/* SERVICES */}
          {/* ========================= */}

          <div>
            <h3 className="text-white font-semibold mb-5">
              {t.footer.ourServices}
            </h3>

            <ul className="space-y-3">

              <li>
                <a
                  href="#services"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.footer.residential}
                </a>
              </li>

              <li>
                <a
                  href="#services"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.footer.retail}
                </a>
              </li>

              <li>
                <a
                  href="#services"
                  className="text-gray-400 text-sm hover:text-[#E7B548] transition-colors"
                >
                  {t.footer.corporate}
                </a>
              </li>

            </ul>
          </div>


          {/* ========================= */}
          {/* CONTACT */}
          {/* ========================= */}

          <div>
            <h3 className="text-white font-semibold mb-5">
              {t.footer.contactUs}
            </h3>

            <ul className="space-y-4">

              {/* Phone */}

              <li>
                <a
                  href={`tel:${CONTACT_INFO.phone.replace(/\D/g, "")}`}
                  className="flex items-start gap-3 text-gray-400 text-sm hover:text-white transition-colors"
                >
                  <PhoneIcon className="w-4 h-4 text-[#E7B548] shrink-0 mt-0.5" />

                  <span>
                    {CONTACT_INFO.phone}
                  </span>
                </a>
              </li>


              {/* Email */}

              <li>
                <a
                  href={`mailto:${CONTACT_INFO.email}`}
                  className="flex items-start gap-3 text-gray-400 text-sm break-all hover:text-white transition-colors"
                >
                  <MailIcon className="w-4 h-4 text-[#E7B548] shrink-0 mt-0.5" />

                  <span>
                    {CONTACT_INFO.email}
                  </span>
                </a>
              </li>


              {/* Location */}

              <li className="flex items-start gap-3 text-gray-400 text-sm">

                <MapPinIcon className="w-4 h-4 text-[#E7B548] shrink-0 mt-0.5" />

                <span>
                  {t.common.madinaty} & {t.common.elShorouk}
                  {isArabic
                    ? "، القاهرة، مصر"
                    : ", Cairo, Egypt"}
                </span>

              </li>

            </ul>
          </div>

        </div>


        {/* ========================= */}
        {/* BOTTOM */}
        {/* ========================= */}

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">

          <p className="text-gray-500 text-sm text-center sm:text-left">
            © {year} A to Z Cleaning Services. {t.footer.rights}
          </p>

          <p className="text-gray-500 text-sm">
            {t.common.madinaty} & {t.common.elShorouk}
            {isArabic
              ? "، القاهرة، مصر"
              : ", Cairo, Egypt"}
          </p>

        </div>

      </div>
    </footer>
  );
}

