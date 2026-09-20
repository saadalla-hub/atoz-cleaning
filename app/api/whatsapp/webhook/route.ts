import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PRICES } from "../../../../lib/prices";
function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

const WHATSAPP_API_VERSION = "v26.0";

type FlowData = {
  name?: string;
  phone?: string;
  area?: string;
  service?: string;
  propertyType?: string;
  propertySize?: string;
  cleaningType?: string;
  estimatedPrice?: number | null;
  date?: string;
  time?: string;
  address?: string;
  notes?: string;
  userId?: string;
  bookingId?: string;
  bookingOptions?: {
  id: string;
  date?: string | null;
  time?: string | null;
  service?: string | null;
  area?: string | null;
}[];
  existingBooking?: boolean;
  language?: "ar" | "en";
};

type ContactRow = {
  phone: string;
  customer_name?: string | null;
  welcome_sent?: boolean;
  flow_step?: string | null;
  flow_data?: FlowData | null;
};

type BookingRow = {
  id: string;
  user_id: string;
  service?: string | null;
  property_type?: string | null;
  property_size?: string | null;
  cleaning_type?: string | null;
  area?: string | null;
  address?: string | null;
  booking_date?: string | null;
  booking_time?: string | null;
  status?: string | null;
  notes?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  estimated_price?: number | null;
};

function getWhatsAppConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp API environment variables are not configured");
  }

  return { accessToken, phoneNumberId };
}

async function sendWhatsAppMessage(
  to: string,
  payload: Record<string, unknown>
) {
  const { accessToken, phoneNumberId } = getWhatsAppConfig();

  const response = await fetch(
    `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to,
        ...payload,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("WhatsApp send error:", JSON.stringify(data));
    throw new Error(`WhatsApp API error: ${response.status}`);
  }

  return data;
}

async function sendText(to: string, text: string) {
  return sendWhatsAppMessage(to, {
    type: "text",
    text: {
      body: text,
    },
  });
}

async function sendButtons(
  to: string,
  bodyText: string,
  buttons: { id: string; title: string }[]
) {
  return sendWhatsAppMessage(to, {
    type: "interactive",
    interactive: {
      type: "button",
      body: {
        text: bodyText,
      },
      action: {
        buttons: buttons.slice(0, 3).map((button) => ({
          type: "reply",
          reply: {
            id: button.id,
            title: button.title,
          },
        })),
      },
    },
  });
}

async function sendList(
  to: string,
  bodyText: string,
  buttonText: string,
  sections: {
    title?: string;
    rows: {
      id: string;
      title: string;
      description?: string;
    }[];
  }[]
) {
  return sendWhatsAppMessage(to, {
    type: "interactive",
    interactive: {
      type: "list",
      body: {
        text: bodyText,
      },
      action: {
        button: buttonText,
        sections,
      },
    },
  });
}

function detectLanguage(text?: string, fallback: "ar" | "en" = "ar"): "ar" | "en" {
  const value = text || "";
  if (/[\u0600-\u06FF]/.test(value)) return "ar";
  if (/[A-Za-z]/.test(value)) return "en";
  return fallback;
}

function getLanguage(data?: FlowData): "ar" | "en" {
  return data?.language === "en" ? "en" : "ar";
}

function t(language: "ar" | "en", ar: string, en: string) {
  return language === "en" ? en : ar;
}

function formatDateForLanguage(date?: string, language: "ar" | "en" = "ar") {
  if (!date) return "-";
  const value = new Date(`${date}T12:00:00Z`);
  return new Intl.DateTimeFormat(language === "en" ? "en-US" : "ar-EG", { timeZone: "Africa/Cairo", weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" }).format(value);
}

function formatPriceLang(price?: number | null, language: "ar" | "en" = "ar") {
  if (price == null) return t(language, "Ø³ÙŠØªÙ… ØªØ­Ø¯ÙŠØ¯Ù‡ Ù…Ù† ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„", "To be confirmed by our team");
  return language === "en" ? `${price.toLocaleString("en-US")} EGP` : formatPrice(price);
}

async function sendWhatsAppWelcome(to: string, language: "ar" | "en") {
  const imageUrl = "https://atoz-cleaning-6tahy444p-saadodunia-1178s-projects.vercel.app/images/whatsapp/welcome.png";
  try { await sendWhatsAppMessage(to, { type: "image", image: { link: imageUrl } }); }
  catch (error) { console.error("WhatsApp welcome image error:", error); }
  await sendButtons(to, t(language,
    "ðŸ‘‹ Ø£Ù‡Ù„Ø§Ù‹ ÙˆØ³Ù‡Ù„Ø§Ù‹ Ø¨Ùƒ ÙÙŠ A to Z Cleaning Services\n\nØ¬Ø§Ù‡Ø²ÙˆÙ† Ù„Ø®Ø¯Ù…ØªÙƒ Ù…Ù† A Ø¥Ù„Ù‰ Z.\n\nØ§Ø®ØªØ± ÙƒÙŠÙ ØªØ­Ø¨ ØªØªØ§Ø¨Ø¹ Ù…Ø¹Ù†Ø§ ðŸ‘‡",
    "ðŸ‘‹ Welcome to A to Z Cleaning Services\n\nWe are ready to help you from A to Z.\n\nHow would you like to continue? ðŸ‘‡"
  ), [
    { id: "already_booked", title: t(language, "âœ… Ù„Ø¯ÙŠ Ø­Ø¬Ø²", "âœ… I have a booking") },
    { id: "new_booking", title: t(language, "ðŸ†• Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯", "ðŸ†• New booking") },
  ]);
}

async function getContact(phone: string): Promise<ContactRow | null> {
  const { data, error } = await getSupabase()
    .from("whatsapp_contacts")
    .select("*")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    throw new Error(`WhatsApp contact lookup error: ${error.message}`);
  }

  return data as ContactRow | null;
}

async function saveContact(
  phone: string,
  updates: {
    customer_name?: string | null;
    welcome_sent?: boolean;
    flow_step?: string | null;
    flow_data?: FlowData;
  }
) {
  const { error } = await getSupabase()
    .from("whatsapp_contacts")
    .upsert(
      {
        phone,
        ...updates,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "phone",
      }
    );

  if (error) {
    throw new Error(`WhatsApp contact save error: ${error.message}`);
  }
}

async function shouldSendWelcome(
  phone: string,
  customerName: string | null,
  language: "ar" | "en"
): Promise<boolean> {
  const existing = await getContact(phone);

  if (existing) {
    return false;
  }

  await saveContact(phone, {
    customer_name: customerName,
    welcome_sent: true,
    flow_step: "welcome",
    flow_data: { language },
  });

  return true;
}

async function findUserByPhone(phone: string) {
  const variants = phoneVariants(phone);

  for (const variant of variants) {
    const { data, error } = await getSupabase()
      .from("users")
      .select("id, full_name, phone")
      .eq("phone", variant)
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`User lookup error: ${error.message}`);
    }

    if (data) {
      return data;
    }
  }

  return null;
}

async function createUser(
  fullName: string,
  phone: string
): Promise<string> {
  const existing = await findUserByPhone(phone);

  if (existing?.id) {
    return existing.id;
  }

  const userId = randomUUID();

  const { data, error } = await getSupabase().rpc(
    "register_user_with_referral",
    {
      p_user_id: userId,
      p_full_name: fullName,
      p_phone: phone,
      p_email: "",
      p_referral_code: null,
    }
  );

  if (error) {
    throw new Error(`User registration error: ${error.message}`);
  }

  if (!data?.success) {
    const existingAfter = await findUserByPhone(phone);

    if (existingAfter?.id) {
      return existingAfter.id;
    }

    throw new Error(
      `User registration failed: ${data?.message || "Unknown error"}`
    );
  }

  return userId;
}

async function findBookingByPhone(phone: string) {
  const variants = phoneVariants(phone);

  for (const variant of variants) {
    const { data, error } = await getSupabase()
      .from("bookings")
      .select(
        `
        id,
        user_id,
        service,
        property_type,
        property_size,
        cleaning_type,
        area,
        address,
        booking_date,
        booking_time,
        status,
        notes,
        customer_name,
        customer_phone,
        estimated_price
        `
      )
      .eq("customer_phone", variant)
      .neq("status", "cancelled")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(`Booking lookup error: ${error.message}`);
    }

    if (data) {
      return data as BookingRow;
    }
  }

  return null;
}
async function findBookingsByPhone(phone: string) {
  const variants = phoneVariants(phone);

  for (const variant of variants) {
    const { data, error } = await getSupabase()
      .from("bookings")
      .select(
        `
        id,
        user_id,
        service,
        property_type,
        property_size,
        cleaning_type,
        area,
        address,
        booking_date,
        booking_time,
        status,
        notes,
        customer_name,
        customer_phone,
        estimated_price
        `
      )
      .eq("customer_phone", variant)
      .neq("status", "cancelled")
      .order("booking_date", { ascending: true })
      .order("booking_time", { ascending: true });

    if (error) {
      throw new Error(`Bookings lookup error: ${error.message}`);
    }

    if (data && data.length > 0) {
      return data as BookingRow[];
    }
  }

  return [];
}
function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("00")) {
    return `+${digits.slice(2)}`;
  }

  if (digits.startsWith("20")) {
    return `+${digits}`;
  }

  if (digits.startsWith("0")) {
    return `+20${digits.slice(1)}`;
  }

  return `+${digits}`;
}

function phoneVariants(phone: string) {
  const digits = phone.replace(/\D/g, "");
  const variants = new Set<string>();

  if (phone.trim()) {
    variants.add(phone.trim());
  }

  if (digits) {
    variants.add(digits);
  }
if (digits.startsWith("00")) {
  const international = digits.slice(2);

  variants.add(international);
  variants.add(`+${international}`);
}

if (
  digits &&
  !digits.startsWith("0") &&
  !digits.startsWith("20")
) {
  variants.add(`00${digits}`);
  variants.add(`+${digits}`);
}
  if (digits.startsWith("20")) {
    variants.add(`+${digits}`);
    variants.add(`0${digits.slice(2)}`);
  }

  if (digits.startsWith("0")) {
    variants.add(`+20${digits.slice(1)}`);
    variants.add(`20${digits.slice(1)}`);
  }

  return [...variants];
}

function isValidPhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.length >= 10 && digits.length <= 15;
}

function formatDateForDisplay(date?: string) {
  if (!date) {
    return "-";
  }

  const value = new Date(`${date}T12:00:00Z`);

  return new Intl.DateTimeFormat("ar-EG", {
    timeZone: "Africa/Cairo",
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(value);
}

function getCairoTodayUtc() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day));
}

async function startNewBooking(to: string, language: "ar" | "en" = "ar") {
  await saveContact(to, { flow_step: "new_booking_name", flow_data: { language } });
  await sendText(to, t(language, "ðŸ†• Ù…Ù…ØªØ§Ø²! Ø®Ù„ÙŠÙ†Ø§ Ù†Ø¨Ø¯Ø£ Ø¨Ø­Ø¬Ø²Ùƒ Ø§Ù„Ø¬Ø¯ÙŠØ¯.\n\nðŸ‘¤ Ø§ÙƒØªØ¨ Ø§Ø³Ù…Ùƒ Ø§Ù„ÙƒØ§Ù…Ù„:", "ðŸ†• Great! Letâ€™s start your new booking.\n\nðŸ‘¤ Please enter your full name:"));
}

async function startExistingBooking(to: string, language: "ar" | "en" = "ar") {
  await saveContact(to, { flow_step: "existing_booking_phone", flow_data: { language } });
  await sendText(to, t(language, "âœ… ØªÙ…Ø§Ù…! Ø±Ø­ Ù†Ø¨Ø­Ø« Ø¹Ù† Ø­Ø¬Ø²Ùƒ Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯.\n\nðŸ“ž Ø£Ø±Ø³Ù„ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø¬Ø²:", "âœ… Sure! Weâ€™ll look for your existing booking.\n\nðŸ“ž Send the phone number used for the booking:"));
}

async function showExistingBooking(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "existing_booking_actions",
    flow_data: data,
  });

  const text =
    "ðŸ“‹ *ÙˆØ¬Ø¯Ù†Ø§ Ø­Ø¬Ø²Ùƒ Ø§Ù„Ù…ÙˆØ¬ÙˆØ¯*\n\n" +
    `ðŸ‘¤ Ø§Ù„Ø§Ø³Ù…: ${data.name || "-"}\n` +
    `ðŸ§¹ Ø§Ù„Ø®Ø¯Ù…Ø©: ${serviceDisplayLabel(data.service)}\n` +
    `ðŸ“… Ø§Ù„ØªØ§Ø±ÙŠØ®: ${formatDateForDisplay(data.date)}\n` +
    `ðŸ• Ø§Ù„ÙˆÙ‚Øª: ${data.time || "-"}\n` +
    `ðŸ“ Ø§Ù„Ù…Ù†Ø·Ù‚Ø©: ${areaLabel(data.area)}\n` +
    `ðŸ  Ø§Ù„Ø¹Ù†ÙˆØ§Ù†: ${data.address || "-"}\n` +
    `ðŸ’° Ø§Ù„Ø³Ø¹Ø± Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ: ${formatPrice(data.estimatedPrice)}\n\n` +
    "Ù…Ø§Ø°Ø§ ØªØ±ÙŠØ¯ Ø£Ù† ØªÙØ¹Ù„ØŸ";

  await sendButtons(to, text, [
    {
      id: "existing_booking_edit",
      title: "ðŸ”§ ØªØ¹Ø¯ÙŠÙ„ Ø§Ù„Ø­Ø¬Ø²",
    },
    {
      id: "existing_booking_cancel",
      title: "âŒ Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¬Ø²",
    },
  ]);
}
async function showServicePropertyOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "new_booking_service_property", flow_data: data });
  await sendList(to, t(language, "ðŸ§¹ Ø§Ø®ØªØ± Ø§Ù„Ø®Ø¯Ù…Ø© ÙˆØ§Ù„Ø¹Ù‚Ø§Ø±:", "ðŸ§¹ Choose service & property:"), t(language, "Ø§Ù„Ø®Ø¯Ù…Ø© ÙˆØ§Ù„Ø¹Ù‚Ø§Ø±", "Service & property"), [{ title: t(language, "Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª", "Options"), rows: [
    { id: "combo_res_apartment", title: t(language, "ðŸ§¹ ØªÙ†Ø¸ÙŠÙ Ø´Ù‚Ù‚ â€” ðŸ  Ø´Ù‚Ø©", "ðŸ§¹ Residential â€” ðŸ  Apartment") },
    { id: "combo_res_villa", title: t(language, "ðŸ§¹ ØªÙ†Ø¸ÙŠÙ Ø´Ù‚Ù‚ â€” ðŸ¡ ÙÙŠÙ„Ø§", "ðŸ§¹ Residential â€” ðŸ¡ Villa") },
    { id: "combo_mall", title: t(language, "ðŸ¬ ØªÙ†Ø¸ÙŠÙ Ù…ÙˆÙ„Ø§Øª", "ðŸ¬ Mall Services") },
    { id: "combo_corp_shop", title: t(language, "ðŸ¢ Ø´Ø±ÙƒØ§Øª â€” ðŸª Ù…ØªØ¬Ø±", "ðŸ¢ Corporate â€” ðŸª Shop") },
    { id: "combo_corp_cafe", title: t(language, "ðŸ¢ Ø´Ø±ÙƒØ§Øª â€” â˜• ÙƒØ§ÙÙŠÙ‡", "ðŸ¢ Corporate â€” â˜• Cafe") },
  ] }]);
}

async function showServiceOptions(to: string, data: FlowData) {
  await showServicePropertyOptions(to, data);
}

async function askArea(to: string, step: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: step, flow_data: data });
  await sendButtons(to, t(language, "ðŸ“ Ø§Ø®ØªØ± Ø§Ù„Ù…Ù†Ø·Ù‚Ø©:", "ðŸ“ Choose the area:"), [
    { id: "area_madinaty", title: "Ù…Ø¯ÙŠÙ†ØªÙŠ / Madinaty" },
    { id: "area_shorouk", title: "Ø§Ù„Ø´Ø±ÙˆÙ‚ / El Shorouk" },
  ]);
}

async function askAppointment(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "booking_appointment", flow_data: data });
  const base = getCairoTodayUtc();
  const date = new Date(base);
  const rows: { id: string; title: string; description?: string }[] = [];
  const hours = [9, 10, 11];
  while (rows.length < 9) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() === 5) continue;
    const iso = date.toISOString().slice(0, 10);
    for (const hour of hours) {
      const hour12 = hour > 12 ? hour - 12 : hour;
      const time = `${String(hour12).padStart(2, "0")}:00 ${hour < 12 ? "AM" : "PM"}`;
      const dateLabel = new Intl.DateTimeFormat(language === "en" ? "en-US" : "ar-EG", { timeZone: "Africa/Cairo", weekday: "short", day: "2-digit", month: "2-digit" }).format(date);
      rows.push({ id: `appointment_${iso}_${String(hour).padStart(2, "0")}`, title: `${dateLabel} â€” ${time}`, description: iso });
    }
  }
  rows.push({ id: "appointment_other", title: t(language, "ðŸ“… ØªØ§Ø±ÙŠØ® Ø¢Ø®Ø±", "ðŸ“… Other date"), description: t(language, "Ø£Ø¯Ø®Ù„ Ø§Ù„ØªØ§Ø±ÙŠØ® Ù„Ø§Ø­Ù‚Ù‹Ø§", "Enter another date") });
  await sendList(to, t(language, "ðŸ“… Ø§Ø®ØªØ± Ø§Ù„Ù…ÙˆØ¹Ø¯ (Ø§Ù„ØªØ§Ø±ÙŠØ® + Ø§Ù„ÙˆÙ‚Øª):", "ðŸ“… Choose your appointment (date + time):"), t(language, "Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…ÙˆØ¹Ø¯", "Choose appointment"), [{ title: t(language, "Ø§Ù„Ù…ÙˆØ§Ø¹ÙŠØ¯ Ø§Ù„Ù…ØªØ§Ø­Ø©", "Available appointments"), rows }]);
}

async function askCustomAppointmentTime(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "booking_custom_time", flow_data: data });
  const rows = [9,10,11,12,13,14,15].map(hour => {
    const hour12 = hour > 12 ? hour - 12 : hour;
    const time24 = `${String(hour).padStart(2,"0")}:00`;
    return { id: `custom_time_${time24}`, title: `${String(hour12).padStart(2,"0")}:00 ${hour < 12 ? "AM" : "PM"}`, description: time24 };
  });
  await sendList(to, t(language, "ðŸ• Ø§Ø®ØªØ± ÙˆÙ‚Øª Ø§Ù„Ù…ÙˆØ¹Ø¯:", "ðŸ• Choose the appointment time:"), t(language, "Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ÙˆÙ‚Øª", "Choose time"), [{ title: t(language, "Ø§Ù„Ø£ÙˆÙ‚Ø§Øª Ø§Ù„Ù…ØªØ§Ø­Ø©", "Available times"), rows }]);
}

async function askAddress(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, {
    flow_step: "booking_address",
    flow_data: data,
  });

  await sendText(to, t(language, "ðŸ  Ø§ÙƒØªØ¨ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø´Ù‚Ø© Ø¨Ø§Ù„ØªÙØµÙŠÙ„:", "ðŸ  Please enter the property address:"));
}

async function askNotes(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_notes",
    flow_data: data,
  });

  await sendButtons(to, "ðŸ“ Ù‡Ù„ Ù„Ø¯ÙŠÙƒ Ø£ÙŠ Ù…Ù„Ø§Ø­Ø¸Ø§Øª Ø¥Ø¶Ø§ÙÙŠØ©ØŸ", [
    {
      id: "notes_none",
      title: "Ù„Ø§ ÙŠÙˆØ¬Ø¯",
    },
    {
      id: "notes_write",
      title: "Ù†Ø¹Ù…ØŒ Ø³Ø£ÙƒØªØ¨Ù‡Ø§",
    },
  ]);
}

function propertyTypeLabel(propertyType?: string) {
  const labels: Record<string, string> = {
    Apartment: "Ø´Ù‚Ø©",
    Villa: "ÙÙŠÙ„Ø§",
    Shop: "Ù…ØªØ¬Ø±",
    Cafe: "ÙƒØ§ÙÙŠÙ‡",
  };

  return labels[propertyType || ""] || propertyType || "-";
}

function propertySizeLabel(size?: string) {
  const labels: Record<string, string> = {
    "Under 70 mÂ²": "Ø£Ù‚Ù„ Ù…Ù† 70 Ù…Â²",
    "70â€“100 mÂ²": "70â€“100 Ù…Â²",
    "100â€“150 mÂ²": "100â€“150 Ù…Â²",
    "150â€“200 mÂ²": "150â€“200 Ù…Â²",
    "200+ mÂ²": "Ø£ÙƒØ«Ø± Ù…Ù† 200 Ù…Â²",
  };

  return labels[size || ""] || size || "-";
}

function cleaningTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    "Regular Cleaning": "ØªÙ†Ø¸ÙŠÙ Ø¹Ø§Ø¯ÙŠ",
    "Deep Cleaning": "ØªÙ†Ø¸ÙŠÙ Ø¹Ù…ÙŠÙ‚",
    "Post-Construction Cleaning": "ØªÙ†Ø¸ÙŠÙ Ø¨Ø¹Ø¯ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡",
  };

  return labels[type || ""] || type || "-";
}

function calculatePropertyPrice(
  propertyType?: string,
  propertySize?: string,
  cleaningType?: string
): number | null {
  if (!propertyType || !propertySize || !cleaningType) {
    return null;
  }

  const typePrices = PRICES[propertyType as keyof typeof PRICES];
  if (!typePrices) {
    return null;
  }

  const sizePrices = typePrices[propertySize as keyof typeof typePrices];
  if (!sizePrices) {
    return null;
  }

  return sizePrices[cleaningType as keyof typeof sizePrices] ?? null;
}

async function showBookingDetailsOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  const rows = [
    ["1", "Under 70 mÂ²", "Regular Cleaning"],
    ["2", "Under 70 mÂ²", "Deep Cleaning"],
    ["3", "Under 70 mÂ²", "Post-Construction Cleaning"],
    ["4", "70â€“100 mÂ²", "Regular Cleaning"],
    ["5", "70â€“100 mÂ²", "Deep Cleaning"],
    ["6", "70â€“100 mÂ²", "Post-Construction Cleaning"],
    ["7", "100â€“150 mÂ²", "Regular Cleaning"],
    ["8", "100â€“150 mÂ²", "Deep Cleaning"],
    ["9", "100â€“150 mÂ²", "Post-Construction Cleaning"],
    ["10", "150â€“200 mÂ²", "Regular Cleaning"],
    ["11", "150â€“200 mÂ²", "Deep Cleaning"],
    ["12", "150â€“200 mÂ²", "Post-Construction Cleaning"],
    ["13", "200+ mÂ²", "Regular Cleaning"],
    ["14", "200+ mÂ²", "Deep Cleaning"],
    ["15", "200+ mÂ²", "Post-Construction Cleaning"],
  ];
  await saveContact(to, {
    flow_step: data.existingBooking ? "existing_booking_details_combo" : "new_booking_details_combo",
    flow_data: data,
  });
  const arSize: Record<string,string> = {"Under 70 mÂ²":"Ø£Ù‚Ù„ Ù…Ù† 70 Ù…Â²","70â€“100 mÂ²":"70â€“100 Ù…Â²","100â€“150 mÂ²":"100â€“150 Ù…Â²","150â€“200 mÂ²":"150â€“200 Ù…Â²","200+ mÂ²":"Ø£ÙƒØ«Ø± Ù…Ù† 200 Ù…Â²"};
  const arClean: Record<string,string> = {"Regular Cleaning":"ØªÙ†Ø¸ÙŠÙ Ø¹Ø§Ø¯ÙŠ","Deep Cleaning":"ØªÙ†Ø¸ÙŠÙ Ø¹Ù…ÙŠÙ‚","Post-Construction Cleaning":"Ø¨Ø¹Ø¯ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡"};
  const lines = rows.map(([n,size,clean]) => `${n}. ${language === "en" ? size : arSize[size]} â€” ${language === "en" ? clean : arClean[clean]}`).join("\n");
  await sendText(to, t(language, `ðŸ“ðŸ§¹ Ø§Ø®ØªØ± Ø§Ù„Ù…Ø³Ø§Ø­Ø© ÙˆÙ†ÙˆØ¹ Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ù…Ø¹Ù‹Ø§:\n\n${lines}\n\nØ§ÙƒØªØ¨ Ø±Ù‚Ù… Ø§Ù„Ø®ÙŠØ§Ø± ÙÙ‚Ø·.`, `ðŸ“ðŸ§¹ Choose property size + cleaning type together:\n\n${lines}\n\nReply with the option number only.`));
}

async function showPropertyTypeOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: data.existingBooking ? "existing_booking_property_type" : "new_booking_property_type", flow_data: data });
  await sendList(to, t(language, "ðŸ  Ø§Ø®ØªØ± Ù†ÙˆØ¹ Ø§Ù„Ø¹Ù‚Ø§Ø±:", "ðŸ  Choose property type:"), t(language, "Ø§Ù„Ø¹Ù‚Ø§Ø±", "Property"), [{ title: t(language, "Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª", "Options"), rows: [
    { id: "property_apartment", title: t(language, "ðŸ  Ø´Ù‚Ø©", "ðŸ  Apartment") },
    { id: "property_villa", title: t(language, "ðŸ¡ ÙÙŠÙ„Ø§", "ðŸ¡ Villa") },
    { id: "property_shop", title: t(language, "ðŸª Ù…ØªØ¬Ø±", "ðŸª Shop") },
    { id: "property_cafe", title: t(language, "â˜• ÙƒØ§ÙÙŠÙ‡", "â˜• Cafe") },
  ] }]);
}
async function showPropertySizeOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: data.existingBooking ? "existing_booking_property_size" : "new_booking_property_size", flow_data: data });
  await sendList(to, t(language, "ðŸ“ Ø§Ø®ØªØ± Ø§Ù„Ù…Ø³Ø§Ø­Ø©:", "ðŸ“ Choose property size:"), t(language, "Ø§Ù„Ù…Ø³Ø§Ø­Ø©", "Size"), [{ title: t(language, "Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª", "Options"), rows: [
    { id: "size_under_70", title: t(language, "Ø£Ù‚Ù„ Ù…Ù† 70 Ù…Â²", "Under 70 mÂ²") }, { id: "size_70_100", title: "70â€“100 mÂ²" }, { id: "size_100_150", title: "100â€“150 mÂ²" }, { id: "size_150_200", title: "150â€“200 mÂ²" }, { id: "size_200_plus", title: t(language, "Ø£ÙƒØ«Ø± Ù…Ù† 200 Ù…Â²", "Over 200 mÂ²") },
  ] }]);
}
async function showCleaningTypeOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: data.existingBooking ? "existing_booking_cleaning_type" : "new_booking_cleaning_type", flow_data: data });
  await sendList(to, t(language, "ðŸ§¹ Ø§Ø®ØªØ± Ù†ÙˆØ¹ Ø§Ù„ØªÙ†Ø¸ÙŠÙ:", "ðŸ§¹ Choose cleaning type:"), t(language, "Ø§Ù„ØªÙ†Ø¸ÙŠÙ", "Cleaning"), [{ title: t(language, "Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª", "Options"), rows: [
    { id: "clean_regular", title: t(language, "ØªÙ†Ø¸ÙŠÙ Ø¹Ø§Ø¯ÙŠ", "Regular Cleaning") }, { id: "clean_deep", title: t(language, "ØªÙ†Ø¸ÙŠÙ Ø¹Ù…ÙŠÙ‚", "Deep Cleaning") }, { id: "clean_post", title: t(language, "Ø¨Ø¹Ø¯ Ø§Ù„Ø¥Ù†Ø´Ø§Ø¡", "Post-Construction") },
  ] }]);
}
function serviceLabel(service?: string) {
  const labels: Record<string, string> = {
    service_apartment: "Residential Cleaning",
    service_malls: "Mall Services",
    service_commercial: "Corporate Cleaning",
    "Apartment Cleaning": "Residential Cleaning",
    "Residential Cleaning": "Residential Cleaning",
  };

  return labels[service || ""] || service || "-";
}

function serviceDisplayLabel(service?: string) {
  const labels: Record<string, string> = {
    service_apartment: "ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø´Ù‚Ù‚",
    "Apartment Cleaning": "ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø´Ù‚Ù‚",
    "Residential Cleaning": "ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ø´Ù‚Ù‚",
    service_malls: "ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ù…ÙˆÙ„Ø§Øª",
    "Mall Services": "ØªÙ†Ø¸ÙŠÙ Ø§Ù„Ù…ÙˆÙ„Ø§Øª",
    service_commercial: "Ø§Ù„Ù…Ø­Ù„Ø§Øª Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©",
    "Corporate Cleaning": "Ø§Ù„Ù…Ø­Ù„Ø§Øª Ø§Ù„ØªØ¬Ø§Ø±ÙŠØ©",
  };

  return labels[service || ""] || service || "-";
}

function areaLabel(area?: string) {
  return area === "El Shorouk"
    ? "Ø§Ù„Ø´Ø±ÙˆÙ‚"
    : area === "Madinaty"
      ? "Ù…Ø¯ÙŠÙ†ØªÙŠ"
      : area || "-";
}

function formatPrice(price?: number | null) {
  if (price == null) {
    return "Ø³ÙŠØªÙ… ØªØ­Ø¯ÙŠØ¯Ù‡ Ù…Ù† ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„";
  }

  return `${price.toLocaleString("en-US")} Ø¬Ù†ÙŠÙ‡`;
}

function buildSummary(data: FlowData) {
  const language = getLanguage(data);
  if (language === "en") {
    return `ðŸ“‹ *Booking summary*\n\nðŸ‘¤ Name: ${data.name || "-"}\nðŸ“ž Phone: ${data.phone || "-"}\nðŸ§¹ Service: ${serviceLabel(data.service)}\nðŸ  Property: ${data.propertyType || "-"}\nðŸ“ Size: ${data.propertySize || "-"}\nðŸ§½ Cleaning: ${data.cleaningType || "-"}\nðŸ’° Estimated price: ${formatPriceLang(data.estimatedPrice, language)}\nðŸ“… Appointment: ${formatDateForLanguage(data.date, language)} â€” ${data.time || "-"}\nðŸ“ Area: ${data.area || "-"}\nðŸ  Address: ${data.address || "-"}\nðŸ“ Notes: ${data.notes || "None"}\n\nConfirm your booking?`;
  }
  return `ðŸ“‹ *Ù…Ù„Ø®Øµ Ø§Ù„Ø­Ø¬Ø²*\n\nðŸ‘¤ Ø§Ù„Ø§Ø³Ù…: ${data.name || "-"}\nðŸ“ž Ø§Ù„Ù‡Ø§ØªÙ: ${data.phone || "-"}\nðŸ§¹ Ø§Ù„Ø®Ø¯Ù…Ø©: ${serviceDisplayLabel(data.service)}\nðŸ  Ø§Ù„Ø¹Ù‚Ø§Ø±: ${propertyTypeLabel(data.propertyType)}\nðŸ“ Ø§Ù„Ù…Ø³Ø§Ø­Ø©: ${propertySizeLabel(data.propertySize)}\nðŸ§½ Ø§Ù„ØªÙ†Ø¸ÙŠÙ: ${cleaningTypeLabel(data.cleaningType)}\nðŸ’° Ø§Ù„Ø³Ø¹Ø± Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ: ${formatPrice(data.estimatedPrice)}\nðŸ“… Ø§Ù„Ù…ÙˆØ¹Ø¯: ${formatDateForDisplay(data.date)} â€” ${data.time || "-"}\nðŸ“ Ø§Ù„Ù…Ù†Ø·Ù‚Ø©: ${areaLabel(data.area)}\nðŸ  Ø§Ù„Ø¹Ù†ÙˆØ§Ù†: ${data.address || "-"}\nðŸ“ Ø§Ù„Ù…Ù„Ø§Ø­Ø¸Ø§Øª: ${data.notes || "Ù„Ø§ ÙŠÙˆØ¬Ø¯"}\n\nÙ‡Ù„ ØªØ±ÙŠØ¯ ØªØ£ÙƒÙŠØ¯ Ø§Ù„Ø­Ø¬Ø²ØŸ`;
}

async function showSummary(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "booking_confirmation", flow_data: data });
  await sendButtons(to, buildSummary(data), [
    { id: "confirm_booking", title: t(language, "âœ… ØªØ£ÙƒÙŠØ¯", "âœ… Confirm") },
    { id: "cancel_booking", title: t(language, "âŒ Ø¥Ù„ØºØ§Ø¡", "âŒ Cancel") },
  ]);
}

async function createBookingFromFlow(to: string, data: FlowData) {
  if (
    !data.name ||
    !data.phone ||
    !data.service ||
    !data.area ||
    !data.date ||
    !data.time ||
    !data.address ||
    !data.propertyType ||
    !data.propertySize ||
    !data.cleaningType ||
    data.estimatedPrice == null
  ) {
    throw new Error("Incomplete booking data");
  }

  let userId = data.userId;

  if (!userId) {
    const existingUser = await findUserByPhone(data.phone);
    userId =
      existingUser?.id ||
      (await createUser(data.name, data.phone));
  }

  const { error } = await getSupabase().from("bookings").insert({
    user_id: userId,
    service: serviceLabel(data.service),
    property_type: data.propertyType,
    property_size: data.propertySize,
    cleaning_type: data.cleaningType,
    area: data.area,
    address: data.address,
    booking_date: data.date,
    booking_time: data.time,
    estimated_price: data.estimatedPrice,
    notes: data.notes || null,
    customer_name: data.name,
    customer_phone: data.phone,
    status: "confirmed",
    confirmation_email_sent: false,
  });

  if (error) {
    throw new Error(`Booking creation error: ${error.message}`);
  }

  await saveContact(to, {
    flow_step: "completed",
    flow_data: {
      ...data,
      userId,
    },
  });

  await sendText(
    to,
    "ðŸŽ‰ ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø·Ù„Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­!\n\n" +
      "ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø­Ø¬Ø² Ù„Ø¯ÙŠÙ†Ø§ØŒ ÙˆØ³ÙŠØ¸Ù‡Ø± Ø§Ù„Ø¢Ù† Ø¶Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª.\n\n" +
      "Ø´ÙƒØ±Ù‹Ø§ Ù„Ø§Ø®ØªÙŠØ§Ø±Ùƒ A to Z Cleaning Services ðŸŒ¿âœ¨"
  );
}

async function updateExistingBooking(to: string, data: FlowData) {
  if (!data.bookingId) {
    throw new Error("Missing booking ID");
  }

  const { error } = await getSupabase()
    .from("bookings")
    .update({
      service: serviceLabel(data.service),
      property_type: data.propertyType || null,
      property_size: data.propertySize || null,
      cleaning_type: data.cleaningType || null,
      area: data.area || null,
      address: data.address || null,
      booking_date: data.date || null,
      booking_time: data.time || null,
      estimated_price: data.estimatedPrice ?? null,
      notes: data.notes || null,
      customer_name: data.name || null,
      customer_phone: data.phone || null,
    })
    .eq("id", data.bookingId);

  if (error) {
    throw new Error(`Booking update error: ${error.message}`);
  }

  await saveContact(to, {
    flow_step: "completed",
    flow_data: data,
  });

  await sendText(
    to,
    "ðŸŽ‰ ØªÙ… ØªØ­Ø¯ÙŠØ« Ø­Ø¬Ø²Ùƒ Ø¨Ù†Ø¬Ø§Ø­!\n\n" +
      "ØªÙ… Ø­ÙØ¸ Ø§Ù„Ù…Ø¹Ù„ÙˆÙ…Ø§Øª Ø§Ù„Ø¬Ø¯ÙŠØ¯Ø© ÙÙŠ Ù†Ø¸Ø§Ù… A to Z Cleaning Services."
  );
}
async function cancelExistingBooking(to: string, data: FlowData) {
  if (!data.bookingId) {
    throw new Error("Missing booking ID");
  }

  const { error } = await getSupabase()
    .from("bookings")
    .update({
      status: "cancelled",
    })
    .eq("id", data.bookingId);

  if (error) {
    throw new Error(`Booking cancellation error: ${error.message}`);
  }

  await saveContact(to, {
    flow_step: "completed",
    flow_data: data,
  });

  await sendText(
    to,
    "âœ… ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø­Ø¬Ø²Ùƒ Ø¨Ù†Ø¬Ø§Ø­.\n\n" +
      "Ø¥Ø°Ø§ Ø§Ø­ØªØ¬Øª Ø¥Ù„Ù‰ Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯ØŒ ÙŠÙ…ÙƒÙ†Ùƒ Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø¬Ø¯ÙŠØ¯ ÙÙŠ Ø£ÙŠ ÙˆÙ‚Øª."
  );
}

async function handleButton(
  to: string,
  buttonId: string,
  contact: ContactRow
) {
  const data: FlowData = contact.flow_data || {};
  const language = getLanguage(data);

  if (buttonId === "new_booking") {
    await startNewBooking(to, language);
    return;
  }

  if (buttonId === "already_booked") {
    await startExistingBooking(to, language);
    return;
  }
  if (buttonId === "existing_booking_edit") {
    if (!data.bookingId) {
      await sendText(to, "â— Ù„Ù… Ù†ØªÙ…ÙƒÙ† Ù…Ù† ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø­Ø¬Ø².");
      return;
    }

    await askArea(to, "existing_booking_area", data);
    return;
  }

  if (buttonId === "existing_booking_cancel") {
    if (!data.bookingId) {
      await sendText(to, "â— Ù„Ù… Ù†ØªÙ…ÙƒÙ† Ù…Ù† ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø­Ø¬Ø².");
      return;
    }

    await sendButtons(
      to,
      "âš ï¸ Ù‡Ù„ Ø£Ù†Øª Ù…ØªØ£ÙƒØ¯ Ø£Ù†Ùƒ ØªØ±ÙŠØ¯ Ø¥Ù„ØºØ§Ø¡ Ù‡Ø°Ø§ Ø§Ù„Ø­Ø¬Ø²ØŸ",
      [
        {
          id: "existing_booking_cancel_confirm",
          title: "Ù†Ø¹Ù…ØŒ Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø­Ø¬Ø²",
        },
        {
          id: "existing_booking_cancel_back",
          title: "Ø±Ø¬ÙˆØ¹",
        },
      ]
    );
    return;
  }
    if (buttonId === "existing_booking_cancel_confirm") {
    await cancelExistingBooking(to, data);
    return;
  }

  if (buttonId === "existing_booking_cancel_back") {
    await showExistingBooking(to, data);
    return;
  }
  if (
    buttonId === "service_malls" ||
    buttonId === "service_commercial"
  ) {
    await saveContact(to, {
      flow_step: "team_contact",
      flow_data: {
        ...data,
        service:
          buttonId === "service_malls"
            ? "Mall Services"
            : "Corporate Cleaning",
      },
    });

    await sendText(
      to,
      "Ø´ÙƒØ±Ù‹Ø§ Ù„Ø§Ø®ØªÙŠØ§Ø±Ùƒ A to Z Cleaning Services ðŸŒ¿\n\n" +
        "Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø¯Ù…Ø© ÙŠØªÙ… ØªÙ†Ø³ÙŠÙ‚Ù‡Ø§ Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ Ø§Ù„Ù…Ø®ØªØµ.\n\n" +
        "ðŸ“ž ÙŠØ±Ø¬Ù‰ Ø§Ù„ØªÙˆØ§ØµÙ„ Ù…Ø¹Ù†Ø§ Ø¹Ù„Ù‰:\n" +
        "00201214290073"
    );

    return;
  }

  if (buttonId === "service_apartment") {
    await showPropertyTypeOptions(to, {
      ...data,
      service: "Residential Cleaning",
    });
    return;
  }

  if (buttonId === "area_madinaty" || buttonId === "area_shorouk") {
    const area =
      buttonId === "area_madinaty"
        ? "Madinaty"
        : "El Shorouk";

    const nextData = {
      ...data,
      area,
    };

    if (contact.flow_step === "existing_booking_area") {
      await showPropertyTypeOptions(to, nextData);
      return;
    }

    await askAddress(to, nextData);
    return;
  }

  if (buttonId === "price_continue") {
    await askAppointment(to, data);
    return;
  }

  if (buttonId === "notes_none") {
    await showSummary(to, {
      ...data,
      notes: "Ù„Ø§ ÙŠÙˆØ¬Ø¯",
    });
    return;
  }

  if (buttonId === "notes_write") {
    await saveContact(to, {
      flow_step: "booking_notes_text",
      flow_data: data,
    });

    await sendText(to, t(language, "ðŸ“ Ø§ÙƒØªØ¨ Ù…Ù„Ø§Ø­Ø¸Ø§ØªÙƒ Ø§Ù„Ø¥Ø¶Ø§ÙÙŠØ©:", "ðŸ“ Please enter your additional notes:"));
    return;
  }

  if (buttonId === "confirm_booking") {
    if (data.existingBooking) {
      await updateExistingBooking(to, data);
    } else {
      await createBookingFromFlow(to, data);
    }

    return;
  }

  if (buttonId === "cancel_booking") {
    await saveContact(to, {
      flow_step: "cancelled",
      flow_data: {},
    });

    await sendText(
      to,
      "ØªÙ… Ø¥Ù„ØºØ§Ø¡ Ø§Ù„Ø·Ù„Ø¨. ðŸ‘\n\n" +
        "Ø¥Ø°Ø§ Ø£Ø±Ø¯Øª Ø§Ù„Ø¨Ø¯Ø¡ Ù…Ù† Ø¬Ø¯ÙŠØ¯ØŒ Ø§Ø®ØªØ± Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯ Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©."
    );

    return;
  }

  if (buttonId === "existing_booking_use") {
    await askArea(to, "existing_booking_area", data);
    return;
  }
}

async function handleListReply(
  to: string,
  replyId: string,
  contact: ContactRow
) {
  const data: FlowData = contact.flow_data || {};
  const language = getLanguage(data);
  const step = contact.flow_step;
  if (step === "existing_booking_select") {
    const selectedBookingId = replyId;

    const { data: booking, error } = await getSupabase()
      .from("bookings")
      .select(
        `
        id,
        user_id,
        service,
        property_type,
        property_size,
        cleaning_type,
        area,
        address,
        booking_date,
        booking_time,
        status,
        notes,
        customer_name,
        customer_phone,
        estimated_price
        `
      )
      .eq("id", selectedBookingId)
      .neq("status", "cancelled")
      .maybeSingle();

    if (error) {
      throw new Error(`Selected booking lookup error: ${error.message}`);
    }

    if (!booking) {
      await sendText(
        to,
        "â— Ù„Ù… Ù†ØªÙ…ÙƒÙ† Ù…Ù† Ø§Ù„Ø¹Ø«ÙˆØ± Ø¹Ù„Ù‰ Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ù…Ø®ØªØ§Ø±."
      );
      return;
    }

    const nextData: FlowData = {
      ...data,
      bookingId: booking.id,
      userId: booking.user_id,
      phone: data.phone || booking.customer_phone || undefined,
      name: booking.customer_name || undefined,
      service: booking.service || "Residential Cleaning",
      area: booking.area || undefined,
      address: booking.address || undefined,
      date: booking.booking_date || undefined,
      time: booking.booking_time || undefined,
      notes: booking.notes || undefined,
      propertyType: booking.property_type || undefined,
      propertySize: booking.property_size || undefined,
      cleaningType: booking.cleaning_type || undefined,
      estimatedPrice: booking.estimated_price ?? null,
      existingBooking: true,
    };

    await showExistingBooking(to, nextData);
    return;
  }
  if (step === "new_booking_service_property") {
    const comboMap: Record<string, { service: string; propertyType?: string }> = {
      combo_res_apartment: { service: "Residential Cleaning", propertyType: "Apartment" },
      combo_res_villa: { service: "Residential Cleaning", propertyType: "Villa" },
      combo_mall: { service: "Mall Services" },
      combo_corp_shop: { service: "Corporate Cleaning", propertyType: "Shop" },
      combo_corp_cafe: { service: "Corporate Cleaning", propertyType: "Cafe" },
    };
    const selected = comboMap[replyId];
    if (!selected) { await sendText(to, t(language, "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø®ÙŠØ§Ø± Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©.", "Please choose an option from the list.")); return; }
    if (!selected.propertyType) {
      await saveContact(to, { flow_step: "team_contact", flow_data: { ...data, ...selected } });
      await sendText(to, t(language, "ðŸ¬ Ù‡Ø°Ù‡ Ø§Ù„Ø®Ø¯Ù…Ø© ÙŠØªÙ… ØªÙ†Ø³ÙŠÙ‚Ù‡Ø§ Ù…Ø¨Ø§Ø´Ø±Ø© Ù…Ø¹ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„.\n\nðŸ“ž 00201214290073", "ðŸ¬ This service is coordinated directly with our team.\n\nðŸ“ž 00201214290073"));
      return;
    }
    await showBookingDetailsOptions(to, { ...data, ...selected });
    return;
  }

  if (step === "new_booking_details_combo" || step === "existing_booking_details_combo") {
    const reply = String(replyId ?? "").trim();
    const valid = /^(?:[1-9]|1[0-5])$/.test(reply);
    if (!valid) {
      await sendText(to, t(language, "ÙŠØ±Ø¬Ù‰ Ø¥Ø±Ø³Ø§Ù„ Ø±Ù‚Ù… Ø®ÙŠØ§Ø± ØµØ­ÙŠØ­ Ù…Ù† 1 Ø¥Ù„Ù‰ 15.", "Please send a valid option number from 1 to 15."));
      return;
    }
    const comboMap: Record<string, { propertySize: string; cleaningType: string }> = {
      "1": { propertySize: "Under 70 mÂ²", cleaningType: "Regular Cleaning" }, "2": { propertySize: "Under 70 mÂ²", cleaningType: "Deep Cleaning" }, "3": { propertySize: "Under 70 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "4": { propertySize: "70â€“100 mÂ²", cleaningType: "Regular Cleaning" }, "5": { propertySize: "70â€“100 mÂ²", cleaningType: "Deep Cleaning" }, "6": { propertySize: "70â€“100 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "7": { propertySize: "100â€“150 mÂ²", cleaningType: "Regular Cleaning" }, "8": { propertySize: "100â€“150 mÂ²", cleaningType: "Deep Cleaning" }, "9": { propertySize: "100â€“150 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "10": { propertySize: "150â€“200 mÂ²", cleaningType: "Regular Cleaning" }, "11": { propertySize: "150â€“200 mÂ²", cleaningType: "Deep Cleaning" }, "12": { propertySize: "150â€“200 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "13": { propertySize: "200+ mÂ²", cleaningType: "Regular Cleaning" }, "14": { propertySize: "200+ mÂ²", cleaningType: "Deep Cleaning" }, "15": { propertySize: "200+ mÂ²", cleaningType: "Post-Construction Cleaning" },
    };
    const selected = comboMap[reply];
    const estimatedPrice = calculatePropertyPrice(data.propertyType, selected.propertySize, selected.cleaningType);
    const nextData = { ...data, ...selected, estimatedPrice };
    await saveContact(to, { flow_step: estimatedPrice == null ? "team_contact" : "price_review", flow_data: nextData });
    if (estimatedPrice == null) {
      await sendText(to, t(language, "ðŸ“ Ù„Ù„Ù…Ø³Ø§Ø­Ø§Øª Ø§Ù„ØªÙŠ ØªØªØ¬Ø§ÙˆØ² 200 Ù…Â²ØŒ Ø§Ù„Ø³Ø¹Ø± Ù„Ø§ ÙŠØ¸Ù‡Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§.\n\nØ³ÙŠØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ù†Ø§Ø³Ø¨.\n\nðŸ“ž 00201214290073", "ðŸ“ For properties over 200 mÂ², the price is not calculated automatically.\n\nOur team will contact you to confirm the price.\n\nðŸ“ž 00201214290073"));
      return;
    }
    await sendButtons(to, t(language, `ðŸ’° Ø§Ù„Ø³Ø¹Ø± Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ: ${formatPriceLang(estimatedPrice, language)}\n\nØªØ§Ø¨Ø¹ Ù„Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…ÙˆØ¹Ø¯.`, `ðŸ’° Estimated price: ${formatPriceLang(estimatedPrice, language)}\n\nContinue to choose your appointment.`), [
      { id: "price_continue", title: t(language, "âœ… Ù…ØªØ§Ø¨Ø¹Ø©", "âœ… Continue") }, { id: "cancel_booking", title: t(language, "âŒ Ø¥Ù„ØºØ§Ø¡", "âŒ Cancel") },
    ]);
    return;
  }

  if (
    step === "new_booking_property_type" ||
    step === "existing_booking_property_type"
  ) {
    const propertyTypeMap: Record<string, string> = {
      property_apartment: "Apartment",
      property_villa: "Villa",
      property_shop: "Shop",
      property_cafe: "Cafe",
    };

    const propertyType = propertyTypeMap[replyId];

    if (!propertyType) {
      await sendText(to, "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù†ÙˆØ¹ Ø§Ù„Ø¹Ù‚Ø§Ø± Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©.");
      return;
    }

    const service =
      propertyType === "Shop" || propertyType === "Cafe"
        ? "Corporate Cleaning"
        : "Residential Cleaning";

    await showPropertySizeOptions(to, {
      ...data,
      propertyType,
      service: data.service || service,
    });

    return;
  }

  if (step === "new_booking_property_size" || step === "existing_booking_property_size") {
    const sizeMap: Record<string, string> = {
      size_under_70: "Under 70 mÂ²",
      size_70_100: "70â€“100 mÂ²",
      size_100_150: "100â€“150 mÂ²",
      size_150_200: "150â€“200 mÂ²",
      size_200_plus: "200+ mÂ²",
    };

    const propertySize = sizeMap[replyId];

    if (!propertySize) {
      await sendText(to, "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…Ø³Ø§Ø­Ø© Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©.");
      return;
    }

    await showCleaningTypeOptions(to, {
      ...data,
      propertySize,
    });

    return;
  }

  if (
    step === "new_booking_cleaning_type" ||
    step === "existing_booking_cleaning_type"
  ) {
    const cleaningMap: Record<string, string> = {
      clean_regular: "Regular Cleaning",
      clean_deep: "Deep Cleaning",
      clean_post: "Post-Construction Cleaning",
    };

    const cleaningType = cleaningMap[replyId];

    if (!cleaningType) {
      await sendText(to, "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù†ÙˆØ¹ Ø§Ù„ØªÙ†Ø¸ÙŠÙ Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©.");
      return;
    }

    const estimatedPrice = calculatePropertyPrice(
      data.propertyType,
      data.propertySize,
      cleaningType
    );

    const nextData = {
      ...data,
      propertyType: data.propertyType,
      propertySize: data.propertySize,
      cleaningType,
      estimatedPrice,
    };

    await saveContact(to, {
      flow_step: estimatedPrice == null ? "team_contact" : "price_review",
      flow_data: nextData,
    });

    if (estimatedPrice == null) {
      await sendText(
        to,
        "ðŸ“ Ù„Ù„Ù…Ø³Ø§Ø­Ø§Øª Ø§Ù„ØªÙŠ ØªØªØ¬Ø§ÙˆØ² 200 Ù…Â²ØŒ Ø§Ù„Ø³Ø¹Ø± Ù„Ø§ ÙŠØ¸Ù‡Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§.\n\n" +
          "Ø³ÙŠØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ù†Ø§Ø³Ø¨.\n\n" +
          "ðŸ“ž 00201214290073"
      );
      return;
    }

    await sendButtons(to, t(language, `ðŸ’° Ø§Ù„Ø³Ø¹Ø± Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ: ${formatPriceLang(estimatedPrice, language)}\n\nØªØ§Ø¨Ø¹ Ù„Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…ÙˆØ¹Ø¯.`, `ðŸ’° Estimated price: ${formatPriceLang(estimatedPrice, language)}\n\nContinue to choose your appointment.`), [
      { id: "price_continue", title: t(language, "âœ… Ù…ØªØ§Ø¨Ø¹Ø©", "âœ… Continue") },
      { id: "cancel_booking", title: t(language, "âŒ Ø¥Ù„ØºØ§Ø¡", "âŒ Cancel") },
    ]);

    return;
  }

  if (step === "booking_appointment") {
    if (replyId === "appointment_other") {
      await saveContact(to, { flow_step: "booking_custom_date", flow_data: data });
      await sendText(to, t(language, "ðŸ“… Ø§ÙƒØªØ¨ Ø§Ù„ØªØ§Ø±ÙŠØ® Ù…Ø«Ù„: 18/09/2026", "ðŸ“… Enter the date like: 18/09/2026"));
      return;
    }
    const match = replyId.match(/^appointment_(\d{4}-\d{2}-\d{2})_(\d{2})$/);
    if (!match) { await sendText(to, t(language, "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ù…ÙˆØ¹Ø¯ Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©.", "Please choose an appointment from the list.")); return; }
    const [, date, hourText] = match;
    const hour = Number(hourText);
    const hour12 = hour > 12 ? hour - 12 : hour;
    const nextData = { ...data, date, time: `${String(hour12).padStart(2,"0")}:00 ${hour < 12 ? "AM" : "PM"}` };
    if (data.existingBooking) await askAddress(to, nextData); else await askArea(to, "new_booking_area", nextData);
    return;
  }

  if (step === "booking_custom_time") {
    if (!replyId.startsWith("custom_time_")) { await sendText(to, t(language, "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„ÙˆÙ‚Øª Ù…Ù† Ø§Ù„Ù‚Ø§Ø¦Ù…Ø©.", "Please choose a time from the list.")); return; }
    const time24 = replyId.replace("custom_time_", "");
    const hour = Number(time24.split(":")[0]);
    const hour12 = hour > 12 ? hour - 12 : hour;
    const nextData = { ...data, time: `${String(hour12).padStart(2,"0")}:00 ${hour < 12 ? "AM" : "PM"}` };
    if (data.existingBooking) await askAddress(to, nextData); else await askArea(to, "new_booking_area", nextData);
    return;
  }

  await sendText(
    to,
    "ÙŠØ±Ø¬Ù‰ Ø§Ø®ØªÙŠØ§Ø± Ø£Ø­Ø¯ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¸Ø§Ù‡Ø±Ø© Ø£Ù…Ø§Ù…Ùƒ."
  );
}

async function handleText(
  to: string,
  text: string,
  contact: ContactRow
) {
  const step = contact.flow_step;
  const data: FlowData = contact.flow_data || {};
  const language = getLanguage(data);

  if (step === "new_booking_details_combo" || step === "existing_booking_details_combo") {
    const reply = text.trim();
    const comboMap: Record<string, { propertySize: string; cleaningType: string }> = {
      "1": { propertySize: "Under 70 mÂ²", cleaningType: "Regular Cleaning" },
      "2": { propertySize: "Under 70 mÂ²", cleaningType: "Deep Cleaning" },
      "3": { propertySize: "Under 70 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "4": { propertySize: "70â€“100 mÂ²", cleaningType: "Regular Cleaning" },
      "5": { propertySize: "70â€“100 mÂ²", cleaningType: "Deep Cleaning" },
      "6": { propertySize: "70â€“100 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "7": { propertySize: "100â€“150 mÂ²", cleaningType: "Regular Cleaning" },
      "8": { propertySize: "100â€“150 mÂ²", cleaningType: "Deep Cleaning" },
      "9": { propertySize: "100â€“150 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "10": { propertySize: "150â€“200 mÂ²", cleaningType: "Regular Cleaning" },
      "11": { propertySize: "150â€“200 mÂ²", cleaningType: "Deep Cleaning" },
      "12": { propertySize: "150â€“200 mÂ²", cleaningType: "Post-Construction Cleaning" },
      "13": { propertySize: "200+ mÂ²", cleaningType: "Regular Cleaning" },
      "14": { propertySize: "200+ mÂ²", cleaningType: "Deep Cleaning" },
      "15": { propertySize: "200+ mÂ²", cleaningType: "Post-Construction Cleaning" },
    };
    const selected = comboMap[reply];
    if (!selected) {
      await sendText(to, t(language, "ÙŠØ±Ø¬Ù‰ Ø¥Ø±Ø³Ø§Ù„ Ø±Ù‚Ù… Ø®ÙŠØ§Ø± ØµØ­ÙŠØ­ Ù…Ù† 1 Ø¥Ù„Ù‰ 15.", "Please send a valid option number from 1 to 15."));
      return;
    }
    const estimatedPrice = calculatePropertyPrice(data.propertyType, selected.propertySize, selected.cleaningType);
    const nextData = { ...data, ...selected, estimatedPrice };
    await saveContact(to, {
      flow_step: estimatedPrice == null ? "team_contact" : "price_review",
      flow_data: nextData,
    });
    if (estimatedPrice == null) {
      await sendText(to, t(language, "ðŸ“ Ù„Ù„Ù…Ø³Ø§Ø­Ø§Øª Ø§Ù„ØªÙŠ ØªØªØ¬Ø§ÙˆØ² 200 Ù…Â²ØŒ Ø§Ù„Ø³Ø¹Ø± Ù„Ø§ ÙŠØ¸Ù‡Ø± ØªÙ„Ù‚Ø§Ø¦ÙŠÙ‹Ø§.\n\nØ³ÙŠØªÙˆØ§ØµÙ„ Ù…Ø¹Ùƒ ÙØ±ÙŠÙ‚ Ø§Ù„Ø¹Ù…Ù„ Ù„ØªØ­Ø¯ÙŠØ¯ Ø§Ù„Ø³Ø¹Ø± Ø§Ù„Ù…Ù†Ø§Ø³Ø¨.\n\nðŸ“ž 00201214290073", "ðŸ“ For properties over 200 mÂ², the price is not calculated automatically.\n\nOur team will contact you to confirm the price.\n\nðŸ“ž 00201214290073"));
      return;
    }
    await sendButtons(to, t(language, `ðŸ’° Ø§Ù„Ø³Ø¹Ø± Ø§Ù„ØªÙ‚Ø¯ÙŠØ±ÙŠ: ${formatPriceLang(estimatedPrice, language)}\n\nØªØ§Ø¨Ø¹ Ù„Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ù…ÙˆØ¹Ø¯.`, `ðŸ’° Estimated price: ${formatPriceLang(estimatedPrice, language)}\n\nContinue to choose your appointment.`), [
      { id: "price_continue", title: t(language, "âœ… Ù…ØªØ§Ø¨Ø¹Ø©", "âœ… Continue") },
      { id: "cancel_booking", title: t(language, "âŒ Ø¥Ù„ØºØ§Ø¡", "âŒ Cancel") },
    ]);
    return;
  }

  if (step === "price_review" && /^(Ù…ØªØ§Ø¨Ø¹Ø©|ØªØ§Ø¨Ø¹|continue|proceed)$/i.test(text.trim())) {
    await askAppointment(to, data);
    return;
  }

  if (step === "new_booking_name") {
    const name = text.trim();

    if (!name) {
      await sendText(to, t(language, "ðŸ‘¤ Ø§ÙƒØªØ¨ Ø§Ø³Ù…Ùƒ Ø§Ù„ÙƒØ§Ù…Ù„:", "ðŸ‘¤ Please enter your full name:"));
      return;
    }

    await saveContact(to, {
      flow_step: "new_booking_phone",
      flow_data: {
        ...data,
        name,
      },
    });

    await sendText(
      to,
      t(language, "ðŸ“ž Ø£Ø±Ø³Ù„ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ø°ÙŠ ØªØ±ÙŠØ¯ Ø§Ø³ØªØ®Ø¯Ø§Ù…Ù‡ Ù„Ù„Ø­Ø¬Ø²:", "ðŸ“ž Send the phone number you want to use for the booking:")
    );

    return;
  }

  if (step === "new_booking_phone") {
    const phone = normalizePhone(text);

    if (!isValidPhone(phone)) {
      await sendText(
        to,
        "ðŸ“ž ÙŠØ¨Ø¯Ùˆ Ø£Ù† Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ ØºÙŠØ± ØµØ­ÙŠØ­.\n\nØ£Ø±Ø³Ù„ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ù…Ø±Ø© Ø£Ø®Ø±Ù‰ØŒ Ù…Ø«Ù„: 01012345678"
      );
      return;
    }

    await showServiceOptions(to, {
      ...data,
      phone,
    });

    return;
  }
if (step === "existing_booking_phone") {
  const phone = normalizePhone(text);

  if (!isValidPhone(phone)) {
    await sendText(
      to,
      t(language, "ðŸ“ž Ø£Ø±Ø³Ù„ Ø±Ù‚Ù… Ø§Ù„Ù‡Ø§ØªÙ Ø§Ù„Ù…Ø³ØªØ®Ø¯Ù… Ø¹Ù†Ø¯ Ø§Ù„Ø­Ø¬Ø² Ø¨Ø´ÙƒÙ„ ØµØ­ÙŠØ­:", "ðŸ“ž Please send the booking phone number:")
    );
    return;
  }

  const bookings = await findBookingsByPhone(phone);

  if (bookings.length === 0) {
    await saveContact(to, {
      flow_step: "no_booking_found",
      flow_data: {
        phone,
        language,
      },
    });

    await sendButtons(
      to,
      "â— Ù„Ù… Ù†Ø¬Ø¯ Ø­Ø¬Ø²Ù‹Ø§ Ù…Ø±ØªØ¨Ø·Ù‹Ø§ Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø±Ù‚Ù….\n\nÙ‡Ù„ ØªØ±ÙŠØ¯ Ø¥Ù†Ø´Ø§Ø¡ Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯ØŸ",
      [
        {
          id: "new_booking",
          title: "ðŸ†• Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯",
        },
        {
          id: "cancel_booking",
          title: "âŒ Ø¥Ù„ØºØ§Ø¡",
        },
      ]
    );

    return;
  }

  if (bookings.length === 1) {
    const booking = bookings[0];

    const nextData: FlowData = {
      ...data,
      bookingId: booking.id,
      userId: booking.user_id,
      phone,
      name: booking.customer_name || undefined,
      service: booking.service || "Residential Cleaning",
      area: booking.area || undefined,
      address: booking.address || undefined,
      date: booking.booking_date || undefined,
      time: booking.booking_time || undefined,
      notes: booking.notes || undefined,
      propertyType: booking.property_type || undefined,
      propertySize: booking.property_size || undefined,
      cleaningType: booking.cleaning_type || undefined,
      estimatedPrice: booking.estimated_price ?? null,
      existingBooking: true,
    };

    await showExistingBooking(to, nextData);
    return;
  }

  await saveContact(to, {
    flow_step: "existing_booking_select",
    flow_data: {
      phone,
      language,
      bookingOptions: bookings.map((booking) => ({
        id: booking.id,
        date: booking.booking_date,
        time: booking.booking_time,
        service: booking.service,
        area: booking.area,
      })),
    },
  });

  await sendList(
    to,
    "ðŸ“‹ ÙˆØ¬Ø¯Ù†Ø§ Ø£ÙƒØ«Ø± Ù…Ù† Ø­Ø¬Ø² Ù…Ø±ØªØ¨Ø· Ø¨Ù‡Ø°Ø§ Ø§Ù„Ø±Ù‚Ù….\n\nØ§Ø®ØªØ± Ø§Ù„Ø­Ø¬Ø² Ø§Ù„Ø°ÙŠ ØªØ±ÙŠØ¯ Ø§Ù„ØªØ¹Ø§Ù…Ù„ Ù…Ø¹Ù‡:",
    "Ø§Ø®ØªÙŠØ§Ø± Ø§Ù„Ø­Ø¬Ø²",
    [
      {
        title: "Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª",
        rows: bookings.map((booking, index) => ({
          id: booking.id,
          title: `${booking.booking_date?.slice(8, 10)}/${booking.booking_date?.slice(5, 7)} - ${(booking.booking_time || "-").slice(0, 8)}`,
description: `${serviceDisplayLabel(booking.service || undefined)} - ${areaLabel(booking.area || undefined)}`,
        })),
      },
    ]
  );

  return;
}
  if (step === "booking_custom_date") {
    const match = text.trim().match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
    if (!match) { await sendText(to, t(language, "ðŸ“… Ø£Ø±Ø³Ù„ Ø§Ù„ØªØ§Ø±ÙŠØ® Ù…Ø«Ù„: 18/09/2026", "ðŸ“… Enter the date like: 18/09/2026")); return; }
    const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
    const selected = new Date(Date.UTC(year, month - 1, day));
    if (selected.getUTCFullYear() !== year || selected.getUTCMonth() !== month - 1 || selected.getUTCDate() !== day) { await sendText(to, t(language, "ðŸ“… Ø§Ù„ØªØ§Ø±ÙŠØ® ØºÙŠØ± ØµØ­ÙŠØ­.", "ðŸ“… That date is not valid.")); return; }
    if (selected <= getCairoTodayUtc()) { await sendText(to, t(language, "ðŸ“… ÙŠØ¬Ø¨ Ø£Ù† ÙŠÙƒÙˆÙ† Ø§Ù„Ù…ÙˆØ¹Ø¯ Ù…Ù† Ø§Ù„ÙŠÙˆÙ… Ø§Ù„ØªØ§Ù„ÙŠ Ø¹Ù„Ù‰ Ø§Ù„Ø£Ù‚Ù„.", "ðŸ“… The appointment must be at least tomorrow.")); return; }
    if (selected.getUTCDay() === 5) { await sendText(to, t(language, "ðŸ“… ÙŠÙˆÙ… Ø§Ù„Ø¬Ù…Ø¹Ø© ØºÙŠØ± Ù…ØªØ§Ø­ Ù„Ù„Ø­Ø¬Ø².", "ðŸ“… Fridays are unavailable for bookings.")); return; }
    await askCustomAppointmentTime(to, { ...data, date: selected.toISOString().slice(0,10) });
    return;
  }

  if (
    step === "new_booking_property_type" ||
    step === "new_booking_property_size" ||
    step === "new_booking_cleaning_type" ||
    step === "existing_booking_property_type" ||
    step === "existing_booking_property_size" ||
    step === "existing_booking_cleaning_type" ||
    step === "new_booking_service_property" ||
    step === "booking_appointment" ||
    step === "booking_custom_date" ||
    step === "booking_custom_time" ||
    step === "new_booking_area" ||
    step === "existing_booking_area" ||
    step === "price_review"
  ) {
    await sendText(
      to,
      t(language, "ÙŠØ±Ø¬Ù‰ Ø§Ø³ØªØ®Ø¯Ø§Ù… Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„Ø¸Ø§Ù‡Ø±Ø© Ø£Ù…Ø§Ù…Ùƒ.", "Please use the options shown in the chat.")
    );
    return;
  }

  if (step === "booking_address") {
    const address = text.trim();

    if (!address) {
      await sendText(to, t(language, "ðŸ  Ø§ÙƒØªØ¨ Ø¹Ù†ÙˆØ§Ù† Ø§Ù„Ø´Ù‚Ø© Ø¨Ø§Ù„ØªÙØµÙŠÙ„:", "ðŸ  Please enter the property address:"));
      return;
    }

    await askNotes(to, {
      ...data,
      address,
    });

    return;
  }

  if (step === "booking_notes_text") {
    await showSummary(to, {
      ...data,
      notes: text.trim() || "Ù„Ø§ ÙŠÙˆØ¬Ø¯",
    });
    return;
  }

  if (
    step === "welcome" ||
    step === "completed" ||
    step === "cancelled" ||
    step === "no_booking_found" ||
    step === "team_contact"
  ) {
    await sendButtons(to, "ðŸ‘‹ Ø§Ø®ØªØ± Ù…Ø§Ø°Ø§ ØªØ±ÙŠØ¯ Ø£Ù† ØªÙØ¹Ù„:", [
      {
        id: "new_booking",
        title: "ðŸ†• Ø­Ø¬Ø² Ø¬Ø¯ÙŠØ¯",
      },
      {
        id: "already_booked",
        title: "âœ… Ù„Ø¯ÙŠ Ø­Ø¬Ø²",
      },
    ]);
    return;
  }

  await sendText(
    to,
    "Ø¹Ø°Ø±Ù‹Ø§ØŒ Ù„Ù… Ø£ÙÙ‡Ù… Ø§Ù„Ø±Ø³Ø§Ù„Ø©.\n\nÙŠØ±Ø¬Ù‰ Ø§ØªØ¨Ø§Ø¹ Ø§Ù„Ø®ÙŠØ§Ø±Ø§Øª Ø§Ù„ØªÙŠ ØªØ¸Ù‡Ø± Ù„Ùƒ ÙÙŠ Ø§Ù„Ù…Ø­Ø§Ø¯Ø«Ø©."
  );
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;

  if (mode === "subscribe" && token === verifyToken && challenge) {
    return new NextResponse(challenge, { status: 200 });
  }

  return new NextResponse("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const appSecret = process.env.META_APP_SECRET;

    if (!appSecret) {
      return new NextResponse("Webhook secret not configured", {
        status: 500,
      });
    }

    const signature = request.headers.get("x-hub-signature-256");

    if (!signature || !signature.startsWith("sha256=")) {
      return new NextResponse("Missing signature", { status: 401 });
    }

    const rawBody = await request.text();

    const expectedSignature =
      "sha256=" +
      createHmac("sha256", appSecret)
        .update(rawBody, "utf8")
        .digest("hex");

    const signatureBuffer = Buffer.from(signature, "utf8");
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");

    if (
      signatureBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(signatureBuffer, expectedBuffer)
    ) {
      return new NextResponse("Invalid signature", { status: 401 });
    }

    const body = JSON.parse(rawBody);
    const value = body?.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    const contact = value?.contacts?.[0];

    if (!message) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    const from = message.from ?? null;
    const messageType = message.type ?? null;
    const customerName = contact?.profile?.name ?? null;

    if (!from) {
      return NextResponse.json({ received: true }, { status: 200 });
    }

    console.log(
      "WhatsApp incoming message:",
      JSON.stringify({
        from,
        customerName,
        type: messageType,
      })
    );
    // Website/App booking message
    if (messageType === "text") {
      const incomingText = message.text?.body?.trim() ?? "";

      const isWebsiteBooking =
        incomingText.includes("Ø£Ø±ØºØ¨ ÙÙŠ Ø­Ø¬Ø² Ø®Ø¯Ù…Ø© ØªÙ†Ø¸ÙŠÙ") ||
        incomingText.includes("I would like to book a cleaning service.");

      if (isWebsiteBooking) {
        console.log("Website/App booking message detected:", from);

        const booking = await findBookingByPhone(from);

        if (booking) {
          await saveContact(from, {
            customer_name: booking.customer_name || customerName,
            welcome_sent: true,
            flow_step: "completed",
            flow_data: {
              userId: booking.user_id,
              bookingId: booking.id,
              name: booking.customer_name || customerName || undefined,
              phone: booking.customer_phone || from,
              service: booking.service || undefined,
              area: booking.area || undefined,
              address: booking.address || undefined,
              date: booking.booking_date || undefined,
              time: booking.booking_time || undefined,
              notes: booking.notes || undefined,
              propertyType: booking.property_type || undefined,
              propertySize: booking.property_size || undefined,
              cleaningType: booking.cleaning_type || undefined,
              estimatedPrice: booking.estimated_price ?? null,
              language: detectLanguage(incomingText),
            },
          });

          await sendText(
            from,
            "ðŸŽ‰ ØªÙ… ØªØ£ÙƒÙŠØ¯ Ø·Ù„Ø¨Ùƒ Ø¨Ù†Ø¬Ø§Ø­!\n\n" +
              "ØªÙ… ØªØ³Ø¬ÙŠÙ„ Ø§Ù„Ø­Ø¬Ø² Ù„Ø¯ÙŠÙ†Ø§ØŒ ÙˆØ³ÙŠØ¸Ù‡Ø± Ø§Ù„Ø¢Ù† Ø¶Ù…Ù† Ù†Ø¸Ø§Ù… Ø§Ù„Ø­Ø¬ÙˆØ²Ø§Øª.\n\n" +
              "Ø´ÙƒØ±Ù‹Ø§ Ù„Ø§Ø®ØªÙŠØ§Ø±Ùƒ A to Z Cleaning Services ðŸŒ¿âœ¨"
          );

          return NextResponse.json(
            { received: true },
            { status: 200 }
          );
        }

        console.warn(
          "Website/App booking message received, but no booking was found:",
          from
        );
      }
    }
    let whatsappContact = await getContact(from);

    // First normal message = welcome.
    if (!whatsappContact && messageType === "text") {
      const incomingText = message.text?.body?.trim() ?? "";
      const language = detectLanguage(incomingText);
      const sendWelcome = await shouldSendWelcome(from, customerName, language);

      if (sendWelcome) {
        await sendWhatsAppWelcome(from, language);
      }

      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!whatsappContact) {
      await saveContact(from, {
        customer_name: customerName,
        welcome_sent: true,
        flow_step: "welcome",
        flow_data: { language: "ar" },
      });

      whatsappContact = await getContact(from);
    }

    if (!whatsappContact) {
      throw new Error("Unable to load WhatsApp contact");
    }

    if (messageType === "text") {
      const incomingText = message.text?.body?.trim() ?? "";
      const currentData = whatsappContact.flow_data || {};
      const currentLanguage = getLanguage(currentData);
      const detectedLanguage = detectLanguage(incomingText, currentLanguage);
      if (/[A-Za-z\u0600-\u06FF]/.test(incomingText) && detectedLanguage !== currentLanguage) {
        await saveContact(from, { flow_data: { ...currentData, language: detectedLanguage } });
        whatsappContact = await getContact(from);
      }
    }

    if (!whatsappContact) {
      console.error("WhatsApp contact not found:", from);
      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (messageType === "interactive") {
      const buttonReply =
        message.interactive?.button_reply?.id ?? null;

      const listReply =
        message.interactive?.list_reply?.id ?? null;

      if (buttonReply) {
        console.log(
          "WhatsApp button selected:",
          JSON.stringify({
            from,
            buttonId: buttonReply,
            step: whatsappContact.flow_step,
          })
        );

        await handleButton(from, buttonReply, whatsappContact);
      } else if (listReply) {
        console.log(
          "WhatsApp list selected:",
          JSON.stringify({
            from,
            listId: listReply,
            step: whatsappContact.flow_step,
          })
        );

        await handleListReply(from, listReply, whatsappContact);
      }
    }

    if (messageType === "text") {
      const messageText = message.text?.body?.trim() ?? "";

      if (messageText) {
        await handleText(from, messageText, whatsappContact);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);

    return new NextResponse("Webhook error", {
      status: 500,
    });
  }
}
