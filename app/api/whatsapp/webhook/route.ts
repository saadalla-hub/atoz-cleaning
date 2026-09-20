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

function detectLanguage(text?: string): "ar" | "en" {
  return /[\u0600-\u06FF]/.test(text || "") ? "ar" : "en";
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
  if (price == null) return t(language, "سيتم تحديده من فريق العمل", "To be confirmed by our team");
  return language === "en" ? `${price.toLocaleString("en-US")} EGP` : formatPrice(price);
}

async function sendWhatsAppWelcome(to: string, language: "ar" | "en") {
  const imageUrl = "https://atoz-cleaning-6tahy444p-saadodunia-1178s-projects.vercel.app/images/whatsapp/welcome.png";
  try { await sendWhatsAppMessage(to, { type: "image", image: { link: imageUrl } }); }
  catch (error) { console.error("WhatsApp welcome image error:", error); }
  await sendButtons(to, t(language,
    "👋 أهلاً وسهلاً بك في A to Z Cleaning Services\n\nجاهزون لخدمتك من A إلى Z.\n\nاختر كيف تحب تتابع معنا 👇",
    "👋 Welcome to A to Z Cleaning Services\n\nWe are ready to help you from A to Z.\n\nHow would you like to continue? 👇"
  ), [
    { id: "already_booked", title: t(language, "✅ لدي حجز", "✅ I have a booking") },
    { id: "new_booking", title: t(language, "🆕 حجز جديد", "🆕 New booking") },
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
  await sendText(to, t(language, "🆕 ممتاز! خلينا نبدأ بحجزك الجديد.\n\n👤 اكتب اسمك الكامل:", "🆕 Great! Let’s start your new booking.\n\n👤 Please enter your full name:"));
}

async function startExistingBooking(to: string, language: "ar" | "en" = "ar") {
  await saveContact(to, { flow_step: "existing_booking_phone", flow_data: { language } });
  await sendText(to, t(language, "✅ تمام! رح نبحث عن حجزك الموجود.\n\n📞 أرسل رقم الهاتف المستخدم عند الحجز:", "✅ Sure! We’ll look for your existing booking.\n\n📞 Send the phone number used for the booking:"));
}

async function showExistingBooking(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "existing_booking_actions",
    flow_data: data,
  });

  const text =
    "📋 *وجدنا حجزك الموجود*\n\n" +
    `👤 الاسم: ${data.name || "-"}\n` +
    `🧹 الخدمة: ${serviceDisplayLabel(data.service)}\n` +
    `📅 التاريخ: ${formatDateForDisplay(data.date)}\n` +
    `🕐 الوقت: ${data.time || "-"}\n` +
    `📍 المنطقة: ${areaLabel(data.area)}\n` +
    `🏠 العنوان: ${data.address || "-"}\n` +
    `💰 السعر التقديري: ${formatPrice(data.estimatedPrice)}\n\n` +
    "ماذا تريد أن تفعل؟";

  await sendButtons(to, text, [
    {
      id: "existing_booking_edit",
      title: "🔧 تعديل الحجز",
    },
    {
      id: "existing_booking_cancel",
      title: "❌ إلغاء الحجز",
    },
  ]);
}
async function showServiceOptions(to: string, data: FlowData) {
  const language = getLanguage(data);

  await saveContact(to, {
    flow_step: data.existingBooking ? "existing_booking_service" : "new_booking_service",
    flow_data: data,
  });

  await sendList(
    to,
    t(language, "🧹 اختر الخدمة:", "🧹 Choose the service:"),
    t(language, "الخدمة", "Service"),
    [
      {
        title: t(language, "الخيارات", "Options"),
        rows: [
          { id: "service_apartment", title: t(language, "🏠 تنظيف سكني", "🏠 Residential Cleaning") },
          { id: "service_malls", title: t(language, "🏬 خدمات المولات", "🏬 Mall Services") },
          { id: "service_commercial", title: t(language, "🏢 تنظيف الشركات", "🏢 Corporate Cleaning") },
        ],
      },
    ]
  );
}

async function askArea(to: string, step: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: step, flow_data: data });
  await sendButtons(to, t(language, "📍 اختر المنطقة:", "📍 Choose the area:"), [
    { id: "area_madinaty", title: t(language, "مدينتي", "Madinaty") },
    { id: "area_shorouk", title: t(language, "الشروق", "El Shorouk") },
  ]);
}

async function askAppointment(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "booking_date", flow_data: data });

  const base = getCairoTodayUtc();
  const date = new Date(base);
  const rows: { id: string; title: string; description?: string }[] = [];

  while (rows.length < 9) {
    date.setUTCDate(date.getUTCDate() + 1);
    if (date.getUTCDay() === 5) continue;

    const iso = date.toISOString().slice(0, 10);
    const title = new Intl.DateTimeFormat(
      language === "en" ? "en-US" : "ar-EG",
      {
        timeZone: "Africa/Cairo",
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      }
    ).format(date);

    rows.push({
      id: `appointment_date_${iso}`,
      title,
      description: iso,
    });
  }

  rows.push({
    id: "appointment_other",
    title: t(language, "📅 تاريخ آخر", "📅 Other date"),
    description: t(language, "أدخل التاريخ لاحقًا", "Enter another date"),
  });

  await sendList(
    to,
    t(language, "📅 اختر التاريخ:", "📅 Choose the date:"),
    t(language, "اختيار التاريخ", "Choose date"),
    [
      {
        title: t(language, "المواعيد المتاحة", "Available dates"),
        rows,
      },
    ]
  );
}

async function askAppointmentTime(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "booking_time", flow_data: data });

  const rows = [9, 10, 11, 12, 13, 14, 15].map((hour) => {
    const hour12 = hour > 12 ? hour - 12 : hour;
    const time24 = `${String(hour).padStart(2, "0")}:00`;
    const title = `${String(hour12).padStart(2, "0")}:00 ${hour < 12 ? "AM" : "PM"}`;
    return { id: `appointment_time_${time24}`, title, description: time24 };
  });

  await sendList(
    to,
    t(language, "🕐 اختر وقت الموعد:", "🕐 Choose the appointment time:"),
    t(language, "اختيار الوقت", "Choose time"),
    [
      {
        title: t(language, "الأوقات المتاحة", "Available times"),
        rows,
      },
    ]
  );
}

async function askCustomAppointmentTime(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "booking_custom_time", flow_data: data });
  const rows = [9,10,11,12,13,14,15].map(hour => {
    const hour12 = hour > 12 ? hour - 12 : hour;
    const time24 = `${String(hour).padStart(2,"0")}:00`;
    return { id: `custom_time_${time24}`, title: `${String(hour12).padStart(2,"0")}:00 ${hour < 12 ? "AM" : "PM"}`, description: time24 };
  });
  await sendList(to, t(language, "🕐 اختر وقت الموعد:", "🕐 Choose the appointment time:"), t(language, "اختيار الوقت", "Choose time"), [{ title: t(language, "الأوقات المتاحة", "Available times"), rows }]);
}

async function askAddress(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, {
    flow_step: "booking_address",
    flow_data: data,
  });

  await sendText(to, t(language, "🏠 اكتب عنوان الشقة بالتفصيل:", "🏠 Please enter the property address:"));
}

async function askNotes(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_notes",
    flow_data: data,
  });

  const language = getLanguage(data);
  await sendButtons(to, t(language, "📝 هل لديك أي ملاحظات إضافية؟", "📝 Do you have any additional notes?"), [
    { id: "notes_none", title: t(language, "لا يوجد", "No") },
    { id: "notes_write", title: t(language, "نعم، سأكتبها", "Yes, I will write them") },
  ]);
}

function propertyTypeLabel(propertyType?: string) {
  const labels: Record<string, string> = {
    Apartment: "شقة",
    Villa: "فيلا",
    Shop: "متجر",
    Cafe: "كافيه",
  };

  return labels[propertyType || ""] || propertyType || "-";
}

function propertySizeLabel(size?: string) {
  const labels: Record<string, string> = {
    "Under 70 m²": "أقل من 70 م²",
    "70–100 m²": "70–100 م²",
    "100–150 m²": "100–150 م²",
    "150–200 m²": "150–200 م²",
    "200+ m²": "أكثر من 200 م²",
  };

  return labels[size || ""] || size || "-";
}

function cleaningTypeLabel(type?: string) {
  const labels: Record<string, string> = {
    "Regular Cleaning": "تنظيف عادي",
    "Deep Cleaning": "تنظيف عميق",
    "Post-Construction Cleaning": "تنظيف بعد الإنشاء",
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

async function showPropertyTypeOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: data.existingBooking ? "existing_booking_property_type" : "new_booking_property_type", flow_data: data });
  await sendList(to, t(language, "🏠 اختر نوع العقار:", "🏠 Choose property type:"), t(language, "العقار", "Property"), [{ title: t(language, "الخيارات", "Options"), rows: [
    { id: "property_apartment", title: t(language, "🏠 شقة", "🏠 Apartment") },
    { id: "property_villa", title: t(language, "🏡 فيلا", "🏡 Villa") },
    { id: "property_shop", title: t(language, "🏪 متجر", "🏪 Shop") },
    { id: "property_cafe", title: t(language, "☕ كافيه", "☕ Cafe") },
  ] }]);
}
async function showPropertySizeOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: data.existingBooking ? "existing_booking_property_size" : "new_booking_property_size", flow_data: data });
  await sendList(to, t(language, "📐 اختر المساحة:", "📐 Choose property size:"), t(language, "المساحة", "Size"), [{ title: t(language, "الخيارات", "Options"), rows: [
    { id: "size_under_70", title: t(language, "أقل من 70 م²", "Under 70 m²") }, { id: "size_70_100", title: "70–100 m²" }, { id: "size_100_150", title: "100–150 m²" }, { id: "size_150_200", title: "150–200 m²" }, { id: "size_200_plus", title: t(language, "أكثر من 200 م²", "Over 200 m²") },
  ] }]);
}
async function showCleaningTypeOptions(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: data.existingBooking ? "existing_booking_cleaning_type" : "new_booking_cleaning_type", flow_data: data });
  await sendList(to, t(language, "🧹 اختر نوع التنظيف:", "🧹 Choose cleaning type:"), t(language, "التنظيف", "Cleaning"), [{ title: t(language, "الخيارات", "Options"), rows: [
    { id: "clean_regular", title: t(language, "تنظيف عادي", "Regular Cleaning") }, { id: "clean_deep", title: t(language, "تنظيف عميق", "Deep Cleaning") }, { id: "clean_post", title: t(language, "بعد الإنشاء", "Post-Construction") },
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
    service_apartment: "تنظيف الشقق",
    "Apartment Cleaning": "تنظيف الشقق",
    "Residential Cleaning": "تنظيف الشقق",
    service_malls: "تنظيف المولات",
    "Mall Services": "تنظيف المولات",
    service_commercial: "المحلات التجارية",
    "Corporate Cleaning": "المحلات التجارية",
  };

  return labels[service || ""] || service || "-";
}

function areaLabel(area?: string) {
  return area === "El Shorouk"
    ? "الشروق"
    : area === "Madinaty"
      ? "مدينتي"
      : area || "-";
}

function formatPrice(price?: number | null) {
  if (price == null) {
    return "سيتم تحديده من فريق العمل";
  }

  return `${price.toLocaleString("en-US")} جنيه`;
}

function buildSummary(data: FlowData) {
  const language = getLanguage(data);
  if (language === "en") {
    return `📋 *Booking summary*\n\n👤 Name: ${data.name || "-"}\n📞 Phone: ${data.phone || "-"}\n🧹 Service: ${serviceLabel(data.service)}\n🏠 Property: ${data.propertyType || "-"}\n📐 Size: ${data.propertySize || "-"}\n🧽 Cleaning: ${data.cleaningType || "-"}\n💰 Estimated price: ${formatPriceLang(data.estimatedPrice, language)}\n📅 Appointment: ${formatDateForLanguage(data.date, language)} — ${data.time || "-"}\n📍 Area: ${data.area || "-"}\n🏠 Address: ${data.address || "-"}\n📝 Notes: ${data.notes || "None"}\n\nConfirm your booking?`;
  }
  return `📋 *ملخص الحجز*\n\n👤 الاسم: ${data.name || "-"}\n📞 الهاتف: ${data.phone || "-"}\n🧹 الخدمة: ${serviceDisplayLabel(data.service)}\n🏠 العقار: ${propertyTypeLabel(data.propertyType)}\n📐 المساحة: ${propertySizeLabel(data.propertySize)}\n🧽 التنظيف: ${cleaningTypeLabel(data.cleaningType)}\n💰 السعر التقديري: ${formatPrice(data.estimatedPrice)}\n📅 الموعد: ${formatDateForDisplay(data.date)} — ${data.time || "-"}\n📍 المنطقة: ${areaLabel(data.area)}\n🏠 العنوان: ${data.address || "-"}\n📝 الملاحظات: ${data.notes || "لا يوجد"}\n\nهل تريد تأكيد الحجز؟`;
}

async function showSummary(to: string, data: FlowData) {
  const language = getLanguage(data);
  await saveContact(to, { flow_step: "booking_confirmation", flow_data: data });
  await sendButtons(to, buildSummary(data), [
    { id: "confirm_booking", title: t(language, "✅ تأكيد", "✅ Confirm") },
    { id: "cancel_booking", title: t(language, "❌ إلغاء", "❌ Cancel") },
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
    console.log("Incomplete booking data:", JSON.stringify(data, null, 2));
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

  const language = getLanguage(data);
  await sendText(
    to,
    t(
      language,
      "🎉 تم تأكيد طلبك بنجاح!\n\nتم تسجيل الحجز لدينا، وسيظهر الآن ضمن نظام الحجوزات.\n\nشكرًا لاختيارك A to Z Cleaning Services 🌿✨",
      "🎉 Your booking has been confirmed!\n\nYour booking has been registered successfully.\n\nThank you for choosing A to Z Cleaning Services 🌿✨"
    )
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
    "🎉 تم تحديث حجزك بنجاح!\n\n" +
      "تم حفظ المعلومات الجديدة في نظام A to Z Cleaning Services."
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
    "✅ تم إلغاء حجزك بنجاح.\n\n" +
      "إذا احتجت إلى حجز جديد، يمكنك البدء من جديد في أي وقت."
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
      await sendText(to, "❗ لم نتمكن من تحديد الحجز.");
      return;
    }

    await askArea(to, "existing_booking_area", data);
    return;
  }

  if (buttonId === "existing_booking_cancel") {
    if (!data.bookingId) {
      await sendText(to, "❗ لم نتمكن من تحديد الحجز.");
      return;
    }

    await sendButtons(
      to,
      "⚠️ هل أنت متأكد أنك تريد إلغاء هذا الحجز؟",
      [
        {
          id: "existing_booking_cancel_confirm",
          title: "نعم، إلغاء الحجز",
        },
        {
          id: "existing_booking_cancel_back",
          title: "رجوع",
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
    await showPropertyTypeOptions(to, {
      ...data,
      service:
        buttonId === "service_malls"
          ? "Mall Services"
          : "Corporate Cleaning",
    });
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

    await showPropertySizeOptions(to, nextData);
    return;
  }

  if (buttonId === "price_continue") {
    await askAppointment(to, data);
    return;
  }

  if (buttonId === "notes_none") {
    await showSummary(to, {
      ...data,
      notes: "لا يوجد",
    });
    return;
  }

  if (buttonId === "notes_write") {
    await saveContact(to, {
      flow_step: "booking_notes_text",
      flow_data: data,
    });

    await sendText(to, t(language, "📝 اكتب ملاحظاتك الإضافية:", "📝 Please enter your additional notes:"));
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
      "تم إلغاء الطلب. 👍\n\n" +
        "إذا أردت البدء من جديد، اختر حجز جديد من القائمة."
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

  if (step === "new_booking_service" || step === "existing_booking_service") {
    const serviceMap: Record<string, string> = {
      service_apartment: "Residential Cleaning",
      service_malls: "Mall Services",
      service_commercial: "Corporate Cleaning",
    };

    const service = serviceMap[replyId];
    if (!service) {
      await sendText(to, t(language, "يرجى اختيار الخدمة من القائمة.", "Please choose a service from the list."));
      return;
    }

    await showPropertyTypeOptions(to, {
      ...data,
      service,
    });
    return;
  }

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
        "❗ لم نتمكن من العثور على الحجز المختار."
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
    if (!selected) { await sendText(to, t(language, "يرجى اختيار خيار من القائمة.", "Please choose an option from the list.")); return; }
    if (!selected.propertyType) {
      await saveContact(to, { flow_step: "team_contact", flow_data: { ...data, ...selected } });
      await sendText(to, t(language, "🏬 هذه الخدمة يتم تنسيقها مباشرة مع فريق العمل.\n\n📞 00201214290073", "🏬 This service is coordinated directly with our team.\n\n📞 00201214290073"));
      return;
    }
    await showPropertySizeOptions(to, { ...data, ...selected });
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
      await sendText(to, "يرجى اختيار نوع العقار من القائمة.");
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
      size_under_70: "Under 70 m²",
      size_70_100: "70–100 m²",
      size_100_150: "100–150 m²",
      size_150_200: "150–200 m²",
      size_200_plus: "200+ m²",
    };

    const propertySize = sizeMap[replyId];

    if (!propertySize) {
      await sendText(to, "يرجى اختيار المساحة من القائمة.");
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
      await sendText(to, "يرجى اختيار نوع التنظيف من القائمة.");
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
        "📐 للمساحات التي تتجاوز 200 م²، السعر لا يظهر تلقائيًا.\n\n" +
          "سيتواصل معك فريق العمل لتحديد السعر المناسب.\n\n" +
          "📞 00201214290073"
      );
      return;
    }

    await sendButtons(to, t(language, `💰 السعر التقديري: ${formatPriceLang(estimatedPrice, language)}\n\nتابع لاختيار الموعد.`, `💰 Estimated price: ${formatPriceLang(estimatedPrice, language)}\n\nContinue to choose your appointment.`), [
      { id: "price_continue", title: t(language, "✅ متابعة", "✅ Continue") },
      { id: "cancel_booking", title: t(language, "❌ إلغاء", "❌ Cancel") },
    ]);

    return;
  }

  if (step === "booking_date") {
    if (replyId === "appointment_other") {
      await saveContact(to, { flow_step: "booking_custom_date", flow_data: data });
      await sendText(to, t(language, "📅 اكتب التاريخ مثل: 18/09/2026", "📅 Enter the date like: 18/09/2026"));
      return;
    }

    if (!replyId.startsWith("appointment_date_")) {
      await sendText(to, t(language, "يرجى اختيار التاريخ من القائمة.", "Please choose a date from the list."));
      return;
    }

    const date = replyId.replace("appointment_date_", "");
    await askAppointmentTime(to, { ...data, date });
    return;
  }

  if (step === "booking_time") {
    if (!replyId.startsWith("appointment_time_")) {
      await sendText(to, t(language, "يرجى اختيار الوقت من القائمة.", "Please choose a time from the list."));
      return;
    }

    const time24 = replyId.replace("appointment_time_", "");
    const hour = Number(time24.split(":")[0]);
    const hour12 = hour > 12 ? hour - 12 : hour;
    const time = `${String(hour12).padStart(2, "0")}:00 ${hour < 12 ? "AM" : "PM"}`;

    await askAddress(to, { ...data, time });
    return;
  }

  if (step === "booking_custom_time") {
    if (!replyId.startsWith("custom_time_")) { await sendText(to, t(language, "يرجى اختيار الوقت من القائمة.", "Please choose a time from the list.")); return; }
    const time24 = replyId.replace("custom_time_", "");
    const hour = Number(time24.split(":")[0]);
    const hour12 = hour > 12 ? hour - 12 : hour;
    const nextData = { ...data, time: `${String(hour12).padStart(2,"0")}:00 ${hour < 12 ? "AM" : "PM"}` };
    await askAddress(to, nextData);
    return;
  }

  await sendText(
    to,
    "يرجى اختيار أحد الخيارات الظاهرة أمامك."
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

  if (step === "new_booking_name") {
    const name = text.trim();

    if (!name) {
      await sendText(to, t(language, "👤 اكتب اسمك الكامل:", "👤 Please enter your full name:"));
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
      t(language, "📞 أرسل رقم الهاتف الذي تريد استخدامه للحجز:", "📞 Send the phone number you want to use for the booking:")
    );

    return;
  }

  if (step === "new_booking_phone") {
    const phone = normalizePhone(text);

    if (!isValidPhone(phone)) {
      await sendText(
        to,
        "📞 يبدو أن رقم الهاتف غير صحيح.\n\nأرسل رقم الهاتف مرة أخرى، مثل: 01012345678"
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
      t(language, "📞 أرسل رقم الهاتف المستخدم عند الحجز بشكل صحيح:", "📞 Please send the booking phone number:")
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
      "❗ لم نجد حجزًا مرتبطًا بهذا الرقم.\n\nهل تريد إنشاء حجز جديد؟",
      [
        {
          id: "new_booking",
          title: "🆕 حجز جديد",
        },
        {
          id: "cancel_booking",
          title: "❌ إلغاء",
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
    "📋 وجدنا أكثر من حجز مرتبط بهذا الرقم.\n\nاختر الحجز الذي تريد التعامل معه:",
    "اختيار الحجز",
    [
      {
        title: "الحجوزات",
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
    if (!match) { await sendText(to, t(language, "📅 أرسل التاريخ مثل: 18/09/2026", "📅 Enter the date like: 18/09/2026")); return; }
    const day = Number(match[1]), month = Number(match[2]), year = Number(match[3]);
    const selected = new Date(Date.UTC(year, month - 1, day));
    if (selected.getUTCFullYear() !== year || selected.getUTCMonth() !== month - 1 || selected.getUTCDate() !== day) { await sendText(to, t(language, "📅 التاريخ غير صحيح.", "📅 That date is not valid.")); return; }
    if (selected <= getCairoTodayUtc()) { await sendText(to, t(language, "📅 يجب أن يكون الموعد من اليوم التالي على الأقل.", "📅 The appointment must be at least tomorrow.")); return; }
    if (selected.getUTCDay() === 5) { await sendText(to, t(language, "📅 يوم الجمعة غير متاح للحجز.", "📅 Fridays are unavailable for bookings.")); return; }
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
    step === "new_booking_service" ||
    step === "existing_booking_service" ||
    step === "booking_date" ||
    step === "booking_time" ||
    step === "booking_custom_date" ||
    step === "booking_custom_time" ||
    step === "new_booking_area" ||
    step === "existing_booking_area" ||
    step === "price_review"
  ) {
    await sendText(
      to,
      t(language, "يرجى استخدام الخيارات الظاهرة أمامك.", "Please use the options shown in the chat.")
    );
    return;
  }

  if (step === "booking_address") {
    const address = text.trim();

    if (!address) {
      await sendText(to, t(language, "🏠 اكتب عنوان الشقة بالتفصيل:", "🏠 Please enter the property address:"));
      return;
    }

    await askNotes(to, {
      ...data,
      address,
    });

    return;
  }
if (step === "booking_notes_text") {
  const finalData = {
    ...data,
    notes: text.trim() || "لا يوجد",
  };

  console.log("FINAL BOOKING DATA:", JSON.stringify(finalData, null, 2));

  await showSummary(to, finalData);
  return;
}
  if (
    step === "welcome" ||
    step === "completed" ||
    step === "cancelled" ||
    step === "no_booking_found" ||
    step === "team_contact"
  ) {
    const selectedLanguage = detectLanguage(text);
    const nextData = { ...data, language: selectedLanguage };

    await saveContact(to, {
      flow_step: "welcome",
      flow_data: nextData,
    });

    await sendButtons(to, t(selectedLanguage, "👋 اختر ماذا تريد أن تفعل:", "👋 What would you like to do?"), [
      { id: "new_booking", title: t(selectedLanguage, "🆕 حجز جديد", "🆕 New booking") },
      { id: "already_booked", title: t(selectedLanguage, "✅ لدي حجز", "✅ I have a booking") },
    ]);
    return;
  }

  await sendText(
    to,
    "عذرًا، لم أفهم الرسالة.\n\nيرجى اتباع الخيارات التي تظهر لك في المحادثة."
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
        incomingText.includes("أرغب في حجز خدمة تنظيف") ||
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
            t(
              detectLanguage(incomingText),
              "🎉 تم تأكيد طلبك بنجاح!\n\nتم تسجيل الحجز لدينا، وسيظهر الآن ضمن نظام الحجوزات.\n\nشكرًا لاختيارك A to Z Cleaning Services 🌿✨",
              "🎉 Your booking has been confirmed!\n\nYour booking has been registered successfully.\n\nThank you for choosing A to Z Cleaning Services 🌿✨"
            )
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