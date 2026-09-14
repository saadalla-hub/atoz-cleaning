"use client";
import { supabase } from "@/lib/supabase";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { PRICES } from "@/lib/prices";
const WHATSAPP_NUMBER = "201214290075";
const BUSINESS_EMAIL = "[atoz.cleaningservice3@gmail.com](mailto:atoz.cleaningservice3@gmail.com)";

export default function Contact() {
const { t, language } = useLanguage();
const router = useRouter();

useEffect(() => {
  const saved = sessionStorage.getItem("atoz-pending-booking");
  if (!saved) return;

  try {
    const booking = JSON.parse(saved);

    if (booking.service) setService(booking.service);
    if (booking.propertyType) setPropertyType(booking.propertyType);
    if (booking.propertySize) setPropertySize(booking.propertySize);
    if (booking.cleaningType) setCleaningType(booking.cleaningType);
    if (booking.bookingDate) setBookingDate(booking.bookingDate);
    if (booking.bookingTime) setBookingTime(booking.bookingTime);
    if (booking.location) setLocation(booking.location);

    const form = document.querySelector("form");
    if (form) {
      const setInput = (name: string, value: string) => {
        const input = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
        if (input) input.value = value || "";
      };

      setInput("name", booking.name);
      setInput("email", booking.email);
      setInput("phone", booking.phone);
      setInput("area", booking.area);
      setInput("address", booking.address);
    }
  } catch (error) {
    console.error("Could not restore pending booking:", error);
  }
}, []);
const isArabic = language === "ar";
const [service, setService] = useState("Home Cleaning");

const [propertyType, setPropertyType] =
  useState("Apartment");

const [propertySize, setPropertySize] =
  useState("Under 70 m²");

const [cleaningType, setCleaningType] =
  useState("Regular Cleaning");
  const [bookingDate, setBookingDate] = useState("");
const [bookingTime, setBookingTime] = useState("");
  const estimatedPrice = useMemo(() => {
  if (service !== "Home Cleaning") {
    return null;
  }

  return (
    PRICES[
      propertyType as keyof typeof PRICES
    ]?.[
      propertySize as keyof typeof PRICES[keyof typeof PRICES]
    ]?.[
      cleaningType as keyof typeof PRICES[keyof typeof PRICES][keyof typeof PRICES[keyof typeof PRICES]]
    ] ?? null
  );

}, [
  service,
  propertyType,
  propertySize,
  cleaningType,
]);
const [location, setLocation] = useState("");
const [locationStatus, setLocationStatus] = useState("");

function getMyLocation() {
  if (!navigator.geolocation) {
    setLocationStatus(
      isArabic
        ? String.fromCodePoint(
            0x0627,0x0644,0x0645,0x0648,0x0642,0x0639,
            0x0020,
            0x0627,0x0644,0x062C,0x063A,0x0631,0x0627,0x0641,0x064A,
            0x0020,
            0x063A,0x064A,0x0631,
            0x0020,
            0x0645,0x062F,0x0639,0x0648,0x0645,
            0x0020,
            0x0641,0x064A,
            0x0020,
            0x0647,0x0630,0x0627,
            0x0020,
            0x0627,0x0644,0x0645,0x062A,0x0635,0x0641,0x062D
          )
        : "Geolocation is not supported by this browser."
    );
    return;
  }

  setLocationStatus(
    isArabic
      ? String.fromCodePoint(
          0x062C,0x0627,0x0631,0x064A,
          0x0020,
          0x062A,0x062D,0x062F,0x064A,0x062F,
          0x0020,
          0x0645,0x0648,0x0642,0x0639,0x0643,
          0x002E
        )
      : "Getting your location..."
  );

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;

      const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

      setLocation(mapsLink);

      setLocationStatus(
        isArabic
          ? String.fromCodePoint(
              0x062A,0x0645,
              0x0020,
              0x062A,0x062D,0x062F,0x064A,0x062F,
              0x0020,
              0x0645,0x0648,0x0642,0x0639,0x0643,
              0x0020,
              0x0628,0x0646,0x062C,0x0627,0x062D,
              0x002E
            )
          : "Your location has been added successfully."
      );
    },

    (error) => {
      console.error("Geolocation error:", error);

      let message = "";

      if (error.code === error.PERMISSION_DENIED) {
        message = isArabic
          ? String.fromCodePoint(
              0x062A,0x0645,
              0x0020,
              0x0631,0x0641,0x0636,
              0x0020,
              0x0627,0x0644,0x0648,0x0635,0x0648,0x0644,
              0x0020,
              0x0625,0x0644,0x0649,
              0x0020,
              0x0627,0x0644,0x0645,0x0648,0x0642,0x0639,
              0x002E
            )
          : "Location access was denied. Please allow location access in your browser settings.";
      } else if (error.code === error.POSITION_UNAVAILABLE) {
        message = isArabic
          ? String.fromCodePoint(
              0x062A,0x0639,0x0630,0x0631,
              0x0020,
              0x062A,0x062D,0x062F,0x064A,0x062F,
              0x0020,
              0x0645,0x0648,0x0642,0x0639,0x0643,
              0x002E
            )
          : "Your location could not be determined. Please make sure location services are enabled.";
      } else if (error.code === error.TIMEOUT) {
        message = isArabic
          ? String.fromCodePoint(
              0x0627,0x0646,0x062A,0x0647,0x0649,
              0x0020,
              0x0648,0x0642,0x062A,
              0x0020,
              0x062A,0x062D,0x062F,0x064A,0x062F,
              0x0020,
              0x0627,0x0644,0x0645,0x0648,0x0642,0x0639,
              0x002E
            )
          : "Location request timed out. Please try again.";
      } else {
        message = isArabic
          ? String.fromCodePoint(
              0x062D,0x062F,0x062B,
              0x0020,
              0x062E,0x0637,0x0623,
              0x0020,
              0x0623,0x062B,0x0646,0x0627,0x0621,
              0x0020,
              0x062A,0x062D,0x062F,0x064A,0x062F,
              0x0020,
              0x0645,0x0648,0x0642,0x0639,0x0643,
              0x002E
            )
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
async function handleSubmit(e: FormEvent<HTMLFormElement>) {
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


  const {
  data: {
    user
  },
  error: authError,
} = await supabase.auth.getUser();

console.log("===== WEB BOOKING AUTH =====");
console.log("USER:", user);
console.log("USER ID:", user?.id);
console.log("AUTH ERROR:", authError);

  if (!user) {
    sessionStorage.setItem("atoz-pending-booking", JSON.stringify({name,email,phone,area,address,service,propertyType,propertySize,cleaningType,bookingDate,bookingTime,estimatedPrice,location,savedAt:Date.now()})); router.push("/register?returnTo=booking"); return;
    alert(
      isArabic
        ? "ÙŠØ±Ø¬Ù‰ ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø¯Ø®ÙˆÙ„ Ø£ÙˆÙ„Ø§Ù‹"
        : "Please login first"
    );
    return;
  }


  // Find the user's pending referral that has not been used by a booking yet.
  // This allows web bookings to carry the referral code
  // even when the user never opens the mobile app.
  const {
    data: referralData,
    error: referralError,
  } = await supabase
    .from("referrals")
    .select("referral_code")
    .eq("referred_user_id", user.id)
    .eq("status", "pending")
    .is("booking_id", null)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  console.log("===== WEB REFERRAL LOOKUP =====");
  console.log("REFERRAL DATA:", referralData);
  console.log("REFERRAL ERROR:", referralError);

  const referralCodeUsed =
    referralData?.referral_code?.trim().toUpperCase() || null;

  const {
    error: bookingError,
  } = await supabase
    .from("bookings")
    .insert({
      user_id: user.id,
      service,
      property_type: propertyType,
        property_size: propertySize,
      cleaning_type: cleaningType,
      area,
      address,
      booking_date: bookingDate,
      booking_time: bookingTime,
      estimated_price: estimatedPrice,
      customer_name: name,
      customer_phone: phone,
      referral_code_used: referralCodeUsed,
      status: "pending",
    });

console.log("===== WEB BOOKING INSERT =====");
console.log("BOOKING ERROR:", bookingError);
  if (bookingError) {
    console.error(
      "Booking creation error:",
      bookingError
    );

    alert(
      isArabic
        ? "Ø­Ø¯Ø« Ø®Ø·Ø£ Ø£Ø«Ù†Ø§Ø¡ Ø¥Ù†Ø´Ø§Ø¡ Ø§Ù„Ø­Ø¬Ø²"
        : "Could not create booking"
    );

    return;
  }



  const englishMessage = `

*New Cleaning Service Booking*

*Customer Information*
Name: ${name}
Email: ${email}
Phone: ${phone}

*Service Details*
Service Area: ${area}
Detailed Address: ${address}
Property Type: ${propertyType}
Property Size: ${propertySize}
Cleaning Type: ${cleaningType}
Estimated Price: ${
    estimatedPrice
      ? `${estimatedPrice.toLocaleString("en-US")} EGP`
      : "Contact us"
}

Booking Date: ${bookingDate}
Booking Time: ${bookingTime}

*Customer Location*
${location || "Location not provided"}

I would like to book a cleaning service.

Thank you.
`.trim();



  const arabicArea = area === "El Shorouk" ? "الشروق" : area

  try {
    const emailResponse = await fetch("/api/send-booking-confirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim(),
        customerName: name.trim(),
        service,
        propertyType,
        area,
        address: address.trim(),
        bookingDate,
        bookingTime,
        estimatedPrice,
      }),
    });

    if (!emailResponse.ok) {
      console.error("Booking confirmation email failed:", await emailResponse.text());
    }
  } catch (emailError) {
    console.error("Booking confirmation email error:", emailError);
  }

  const arabicMessage = `
*طلب حجز خدمة تنظيف جديدة*

*معلومات العميل*
الاسم: ${name}
البريد الإلكتروني: ${email}
رقم الهاتف: ${phone}

*تفاصيل الخدمة*
منطقة الخدمة: ${arabicArea}
العنوان بالتفصيل: ${address}
نوع العقار: ${propertyType}
مساحة العقار: ${propertySize}
نوع التنظيف: ${cleaningType}
السعر التقريبي: ${
  estimatedPrice
    ? `${estimatedPrice.toLocaleString("en-US")} جنيه`
    : "سيتم التواصل معكم"
}

تاريخ الحجز: ${bookingDate}
وقت الحجز: ${bookingTime}

*موقع العميل*
${location || "لم يتم تحديد الموقع"}

أرغب في حجز خدمة تنظيف.

شكرًا لكم.
`.trim();;
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
{/* Service Calculator */}

<div className="mb-6 p-5 rounded-2xl bg-[#143640]/60 border border-[#E7B548]/20">

  <h3 className="text-lg font-bold text-white mb-4">
    Cleaning Details
  </h3>


  <div className="grid sm:grid-cols-2 gap-5">


    {/* Service */}

    <div>

      <label className="block text-sm text-gray-400 mb-2">
        Service
      </label>

      <select
        value={service}
        onChange={(e) => setService(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white"
      >

       <option className="bg-[#143640]" value="Home Cleaning">
  {isArabic
    ? String.fromCodePoint(
        0x062A, 0x0646, 0x0638, 0x064A, 0x0641,
        0x0020,
        0x0627, 0x0644, 0x0645, 0x0646, 0x0627, 0x0632, 0x0644
      )
    : "Home Cleaning"}
</option>

      </select>

    </div>



    {/* Property Type / Business Type */}

    <div>

      <label className="block text-sm text-gray-400 mb-2">
        {t.contact.form.propertyType}
      </label>

      <select
        value={propertyType}
        onChange={(e) => setPropertyType(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white"
      >

        <option value="Apartment">
          {isArabic ? String.fromCodePoint(0x0634,0x0642,0x0629) : "Apartment"}
        </option>

        <option value="Villa" className="bg-[#143640]">
          {isArabic ? String.fromCodePoint(0x0641,0x064A,0x0644,0x0627) : "Villa"}
        </option>

        <option value="Cafe" className="bg-[#143640]">
          {isArabic ? String.fromCodePoint(0x0645,0x0642,0x0647,0x0649) : "Cafe"}
        </option>

        <option value="Shop" className="bg-[#143640]">
          {isArabic ? String.fromCodePoint(0x0645,0x062A,0x062C,0x0631) : "Shop"}
        </option>

      </select>

    </div>


    {/* Size */}

    <div>

      <label className="block text-sm text-gray-400 mb-2">
        {t.contact.form.propertySize}
      </label>

      <select
        value={propertySize}
        onChange={(e) => setPropertySize(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white"
      >

        <option value="Under 70 m²" className="bg-[#143640]">
          {isArabic
            ? String.fromCodePoint(
                0x0623,0x0642,0x0644,0x0020,
                0x0645,0x0646,0x0020,
                0x0037,0x0030,0x0020,
                0x0645,0x00B2
              )
            : "Under 70 m²"}
        </option>

        <option value="70–100 m²" className="bg-[#143640]">
          {isArabic
            ? "70-100 " + String.fromCodePoint(0x0645,0x00B2)
            : "70–100 m²"}
        </option>

        <option value="100–150 m²" className="bg-[#143640]">
          {isArabic
            ? "100-150 " + String.fromCodePoint(0x0645,0x00B2)
            : "100–150 m²"}
        </option>

        <option value="150–200 m²" className="bg-[#143640]">
          {isArabic
            ? "150-200 " + String.fromCodePoint(0x0645,0x00B2)
            : "150–200 m²"}
        </option>

        <option value="200+ m²" className="bg-[#143640]">
          {isArabic
            ? "200+ " + String.fromCodePoint(0x0645,0x00B2)
            : "200+ m²"}
        </option>

      </select>

    </div>

    {/* Cleaning Type */}

    <div>

      <label className="block text-sm text-gray-400 mb-2">
        {t.contact.form.cleaningType}
      </label>

      <select
        value={cleaningType}
        onChange={(e) => setCleaningType(e.target.value)}
        className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white"
      >

        <option value="Regular Cleaning" className="bg-[#143640]">
          {isArabic
            ? String.fromCodePoint(
                0x062A,0x0646,0x0638,0x064A,0x0641,
                0x0020,
                0x062F,0x0648,0x0631,0x064A
              )
            : "Regular Cleaning"}
        </option>

        <option value="Deep Cleaning" className="bg-[#143640]">
          {isArabic
            ? String.fromCodePoint(
                0x062A,0x0646,0x0638,0x064A,0x0641,
                0x0020,
                0x0639,0x0645,0x064A,0x0642
              )
            : "Deep Cleaning"}
        </option>

        <option value="Post-Construction Cleaning" className="bg-[#143640]">
          {isArabic
            ? String.fromCodePoint(
                0x062A,0x0646,0x0638,0x064A,0x0641,
                0x0020,
                0x0628,0x0639,0x062F,
                0x0020,
                0x0627,0x0644,0x0625,0x0646,0x0634,0x0627,0x0621
              )
            : "Post-Construction Cleaning"}
        </option>

      </select>

    </div>
  </div>

  {propertyType === "Villa" || propertySize === "200+ m²" ? (

  <div className="mt-5 p-4 rounded-xl bg-[#E7B548]/10 border border-[#E7B548]/30">

    <p className="text-lg font-bold text-[#E7B548]">
      {t.contact.form.contactVillaPrices}
    </p>

  </div>

) : estimatedPrice && (

  <div className="mt-5 p-4 rounded-xl bg-[#E7B548]/10 border border-[#E7B548]/30">

    <p className="text-sm text-gray-400">
      {t.contact.form.estimatedPrice}
    </p>

    <p className="text-2xl font-bold text-[#E7B548]">
      {estimatedPrice.toLocaleString("en-US")} EGP
    </p>

  </div>

)}

</div>
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
                  value="El Shorouk"
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
{/* Booking Date & Time */}

<div className="grid sm:grid-cols-2 gap-5 mt-5">

  <div>
    <label className="block text-sm text-gray-400 mb-2">
      {t.contact.form.preferredDate}
    </label>

    <input
  type="date"
  min={new Date().toISOString().split("T")[0]}
  value={bookingDate}
  onChange={(e) => setBookingDate(e.target.value)}
  required
  className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white"
/>

  </div>


  <div>
    <label className="block text-sm text-gray-400 mb-2">
      {t.contact.form.preferredTime}
    </label>

    <select
      value={bookingTime}
      onChange={(e) => setBookingTime(e.target.value)}
      required
      className="w-full px-4 py-3.5 rounded-xl bg-black/20 border border-white/10 text-white"
    >

      <option value="" className="bg-[#143640]">
        {t.contact.form.selectTime}
      </option>

      {[
       "08:00 AM",
  "08:30 AM",
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "12:00 PM",
  "12:30 PM",
  "01:00 PM",
  "01:30 PM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
      ].map((time) => (
        <option
          key={time}
          value={time}
          className="bg-[#143640]"
        >
          {time}
        </option>
      ))}

    </select>

  </div>

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



































