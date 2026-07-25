"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";
import { CONTACT_INFO } from "@/lib/constants";
import { fadeInUp } from "@/lib/animations";
import SectionHeading from "@/components/ui/SectionHeading";
import Button from "@/components/ui/Button";
import {
PhoneIcon,
MailIcon,
MapPinIcon,
} from "@/components/ui/Icons";
import { useLanguage } from "@/app/components/LanguageProvider";

const WHATSAPP_NUMBER = "201214290075";
const BUSINESS_EMAIL = "[atoz.cleaningservice3@gmail.com](mailto:atoz.cleaningservice3@gmail.com)";

export default function Contact() {
const { t, language } = useLanguage();
const isArabic = language === "ar";

const [location, setLocation] = useState("");
const [locationStatus, setLocationStatus] = useState("");

function getMyLocation() {
  if (!navigator.geolocation) {
    setLocationStatus(
      isArabic
        ? "الموقع الجغرافي غير مدعوم في هذا المتصفح."
        : "Geolocation is not supported by this browser."
    );
    return;
  }

  setLocationStatus(
    isArabic
      ? "جارٍ تحديد موقعك..."
      : "Getting your location..."
  );

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      setLocation(mapsLink);

      setLocationStatus(
        isArabic
          ? "تم تحديد موقعك بنجاح."
          : "Your location has been added successfully."
      );
    },

    (error) => {
      console.error("Geolocation error:", error);

      let message = "";

      if (error.code === error.PERMISSION_DENIED) {
        message = isArabic
          ? "تم رفض الوصول إلى الموقع. يرجى السماح للموقع بالوصول إلى موقعك من إعدادات المتصفح."
          : "Location access was denied. Please allow location access in your browser settings.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = isArabic
          ? "تعذر تحديد موقعك حاليًا. يرجى التأكد من تشغيل خدمة الموقع."
          : "Your location could not be determined. Please make sure location services are enabled.";
      } else if (error.code === error.TIMEOUT) {
        message = isArabic
          ? "انتهى وقت تحديد الموقع. يرجى المحاولة مرة أخرى."
          : "Location request timed out. Please try again.";
      } else {
        message = isArabic
          ? "حدث خطأ أثناء تحديد موقعك. يرجى المحاولة مرة أخرى."
          : "An error occurred while getting your location. Please try again.";
      }

      setLocationStatus(message);
    },

    {
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 60000,
    }
  );
}

function handleSubmit(e: FormEvent<HTMLFormElement>) {
e.preventDefault();


const formData = new FormData(e.currentTarget);

const name =
  formData.get("name")?.toString().trim() || "";

const email =
  formData.get("email")?.toString().trim() || "";

const phone =
  formData.get("phone")?.toString().trim() || "";

const area =
  formData.get("area")?.toString().trim() || "";

const address =
  formData.get("address")?.toString().trim() || "";

const englishMessage = `


*New Cleaning Service Booking*

*Customer Information*
Name: ${name}
Email: ${email}
Phone: ${phone}

*Service Details*
Service Area: ${area}
Detailed Address: ${address}

*Customer Location*
${location || "Location not provided"}

I would like to book a cleaning service.

Thank you.
`.trim();


const arabicMessage = `


*طلب حجز خدمة تنظيف جديدة*

*معلومات العميل*
الاسم: ${name}
البريد الإلكتروني: ${email}
رقم الهاتف: ${phone}

*تفاصيل الخدمة*
منطقة الخدمة: ${area}
العنوان بالتفصيل: ${address}

*موقع العميل*
${location || "لم يتم تحديد الموقع"}

أرغب في حجز خدمة تنظيف.

شكرًا لكم.
`.trim();

const whatsappMessage = isArabic
  ? arabicMessage
  : englishMessage;

const whatsappUrl =
  `https://wa.me/${WHATSAPP_NUMBER}?text=` +
  encodeURIComponent(whatsappMessage);

window.open(
  whatsappUrl,
  "_blank",
  "noopener,noreferrer"
);


}

return (
<section
id="contact"
dir={isArabic ? "rtl" : "ltr"}
className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
>
{/* Background Glow */}

```
  <div className="absolute top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-[#E7B548]/10 rounded-full blur-[140px] pointer-events-none" />

  <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-[#E7B548]/5 rounded-full blur-[120px] pointer-events-none" />

  <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

    {/* Section Heading */}

    <SectionHeading
      label={t.contact.label}
      title={t.contact.title}
      description={t.contact.description}
    />

    <div className="grid lg:grid-cols-5 gap-10 lg:gap-16">

      {/* Contact Information */}

      <motion.div
        {...fadeInUp}
        className="lg:col-span-2"
      >
        <div className="mb-8">

          <p className="text-[#E7B548] text-sm uppercase tracking-[0.2em] mb-3">
            {t.contact.getInTouch}
          </p>

          <h3 className="text-2xl sm:text-3xl font-bold text-white">
            {t.contact.shineTitle}
          </h3>

          <p className="text-gray-400 mt-4 leading-relaxed">
            {t.contact.shineDescription}
          </p>

        </div>

        {/* Contact Cards */}

        <div className="space-y-4">

          {/* Phone */}

          <a
            href={`tel:${CONTACT_INFO.phone.replace(/\D/g, "")}`}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#E7B548]/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E7B548]/10 flex items-center justify-center shrink-0">
              <PhoneIcon className="text-[#E7B548]" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                {t.contact.phone}
              </p>

              <p className="text-white font-medium">
                {CONTACT_INFO.phone}
              </p>
            </div>
          </a>

          {/* Email */}

          <a
            href={`mailto:${BUSINESS_EMAIL}`}
            className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10 hover:border-[#E7B548]/40 hover:bg-white/[0.07] hover:-translate-y-1 transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-xl bg-[#E7B548]/10 flex items-center justify-center shrink-0">
              <MailIcon className="text-[#E7B548]" />
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                {t.contact.email}
              </p>

              <p className="text-white font-medium break-all">
                {BUSINESS_EMAIL}
              </p>
            </div>
          </a>

          {/* Service Area */}

          <div className="group flex items-center gap-4 p-5 rounded-2xl bg-white/[0.04] border border-white/10">

            <div className="w-12 h-12 rounded-xl bg-[#E7B548]/10 flex items-center justify-center shrink-0">
              <MapPinIcon className="text-[#E7B548]" />
            </div>

            <div>

              <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                {t.contact.serviceArea}
              </p>

              <p className="text-white font-medium">
                {CONTACT_INFO.address}
              </p>

            </div>

          </div>

        </div>

        {/* Business Hours */}

        <div className="mt-6 p-6 rounded-2xl bg-[#E7B548]/10 border border-[#E7B548]/20">

          <p className="text-sm text-gray-400 mb-2">
            {t.contact.businessHours}
          </p>

          <p className="text-white font-semibold">
            {t.contact.hours}
          </p>

        </div>

      </motion.div>

      {/* Contact Form */}

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{
          once: true,
          margin: "-60px",
        }}
        transition={{
          duration: 0.6,
          delay: 0.15,
        }}
        className="lg:col-span-3"
      >

        <form
          onSubmit={handleSubmit}
          className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-white/[0.04] border border-white/10 backdrop-blur-sm"
        >

          {/* Form Top Line */}

          <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#E7B548] to-transparent" />

          {/* Name + Email */}

          <div className="grid sm:grid-cols-2 gap-5">

            <div>

              <label
                htmlFor="name"
                className="block text-sm text-gray-400 mb-2"
              >
                {t.contact.form.fullName}
              </label>

              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E7B548]/60 focus:ring-1 focus:ring-[#E7B548]/30 transition-all"
                placeholder={t.contact.form.yourName}
              />

            </div>

            <div>

              <label
                htmlFor="email"
                className="block text-sm text-gray-400 mb-2"
              >
                {t.contact.form.email}
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E7B548]/60 focus:ring-1 focus:ring-[#E7B548]/30 transition-all"
                placeholder={t.contact.form.emailPlaceholder}
              />

            </div>

          </div>

          {/* Phone + Area */}

          <div className="grid sm:grid-cols-2 gap-5 mt-5">

            <div>

              <label
                htmlFor="phone"
                className="block text-sm text-gray-400 mb-2"
              >
                {t.contact.form.phone}
              </label>

              <input
                id="phone"
                name="phone"
                type="tel"
                required
                autoComplete="tel"
                className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E7B548]/60 focus:ring-1 focus:ring-[#E7B548]/30 transition-all"
                placeholder={t.contact.form.phonePlaceholder}
              />

            </div>

            <div>

              <label
                htmlFor="area"
                className="block text-sm text-gray-400 mb-2"
              >
                {t.contact.form.serviceArea}
              </label>

              <select
                id="area"
                name="area"
                required
                className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white focus:outline-none focus:border-[#E7B548]/60 focus:ring-1 focus:ring-[#E7B548]/30 transition-all"
              >

                <option
                  value=""
                  className="bg-[#143640]"
                >
                  {t.contact.form.selectArea}
                </option>

                <option
                  value={isArabic ? "مدينتي" : "Madinaty"}
                  className="bg-[#143640]"
                >
                  {t.contact.form.madinaty}
                </option>

                <option
                  value={isArabic ? "الشروق" : "El Shorouk"}
                  className="bg-[#143640]"
                >
                  {t.contact.form.elShorouk}
                </option>

              </select>

            </div>

          </div>

          {/* Detailed Address */}

          <div className="mt-5">

            <label
              htmlFor="address"
              className="block text-sm text-gray-400 mb-2"
            >
              {t.contact.form.detailedAddress}
            </label>

            <input
              id="address"
              name="address"
              type="text"
              required
              autoComplete="street-address"
              className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E7B548]/60 focus:ring-1 focus:ring-[#E7B548]/30 transition-all"
              placeholder={t.contact.form.addressPlaceholder}
            />

          </div>

          {/* Location */}

          <div className="mt-5">

            <label
              htmlFor="location"
              className="block text-sm text-gray-400 mb-2"
            >
              {t.contact.form.yourLocation}
            </label>

            <div className="flex flex-col sm:flex-row gap-3">

              <input
                id="location"
                name="location"
                type="text"
                value={location}
                placeholder={t.contact.form.locationPlaceholder}
                className="flex-1 px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-[#E7B548]/60 focus:ring-1 focus:ring-[#E7B548]/30 transition-all"
                readOnly
              />

              <button
                type="button"
                onClick={getMyLocation}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#E7B548] text-[#143640] font-semibold hover:bg-[#F4C95D] hover:-translate-y-0.5 transition-all duration-300 whitespace-nowrap"
              >
                <MapPinIcon className="w-5 h-5" />
                {t.contact.form.getMyLocation}
              </button>

            </div>

            {locationStatus && (
              <p className="mt-2 text-sm text-[#E7B548]">
                {locationStatus}
              </p>
            )}

          </div>

          {/* Submit */}

          <div className="mt-6">

            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
            >
              {t.contact.form.requestQuote}
            </Button>

          </div>

        </form>

      </motion.div>

    </div>

  </div>

</section>


);
}
