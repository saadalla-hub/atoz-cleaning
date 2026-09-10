import { createClient } from "@supabase/supabase-js";
import { createHmac, randomUUID, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { PRICES } from "../../../../lib/prices";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

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
  existingBooking?: boolean;
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

async function sendWhatsAppWelcome(to: string) {
  const imageUrl =
    "https://atoz-cleaning-6tahy444p-saadodunia-1178s-projects.vercel.app/images/whatsapp/welcome.png";

  try {
    await sendWhatsAppMessage(to, {
      type: "image",
      image: {
        link: imageUrl,
      },
    });
  } catch (error) {
    console.error("WhatsApp welcome image error:", error);
  }

  await sendButtons(
    to,
    "👋 أهلاً وسهلاً بك في A to Z Cleaning Services\n\n" +
      "لأن النظافة مو بس شكل… هي راحة، انتعاش، وإحساس أجمل بالمكان 🌿✨\n" +
      "نحن هنا لنساعدك نخلي مساحتك أنظف وأريح، من A إلى Z.\n\n" +
      "يرجى اختيار أحد الخيارات التالية:",
    [
      {
        id: "already_booked",
        title: "✅ لقد حجزت خدمة",
      },
      {
        id: "new_booking",
        title: "🆕 لم أحجز خدمة بعد",
      },
    ]
  );

  console.log("WhatsApp welcome sent:", to);
}

async function getContact(phone: string): Promise<ContactRow | null> {
  const { data, error } = await supabase
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
  const { error } = await supabase
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
  customerName: string | null
): Promise<boolean> {
  const existing = await getContact(phone);

  if (existing) {
    return false;
  }

  await saveContact(phone, {
    customer_name: customerName,
    welcome_sent: true,
    flow_step: "welcome",
    flow_data: {},
  });

  return true;
}

async function findUserByPhone(phone: string) {
  const variants = phoneVariants(phone);

  for (const variant of variants) {
    const { data, error } = await supabase
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

  const { data, error } = await supabase.rpc(
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
    const { data, error } = await supabase
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

async function startNewBooking(to: string) {
  await saveContact(to, {
    flow_step: "new_booking_name",
    flow_data: {},
  });

  await sendText(
    to,
    "🆕 ممتاز! خلينا نبدأ بحجزك الجديد.\n\n👤 اكتب اسمك الكامل من فضلك:"
  );
}

async function startExistingBooking(to: string) {
  await saveContact(to, {
    flow_step: "existing_booking_phone",
    flow_data: {},
  });

  await sendText(
    to,
    "✅ تمام! رح نبحث عن حجزك الموجود.\n\n📞 أرسل رقم الهاتف المستخدم عند الحجز:"
  );
}

async function showServiceOptions(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: data.existingBooking
      ? "existing_booking_service"
      : "new_booking_service",
    flow_data: data,
  });

  await sendButtons(to, "🧹 اختر الخدمة التي تريدها:", [
    {
      id: "service_apartment",
      title: "🏠 تنظيف الشقق",
    },
    {
      id: "service_malls",
      title: "🏢 تنظيف المولات",
    },
    {
      id: "service_commercial",
      title: "🏪 المحلات التجارية",
    },
  ]);
}

async function askArea(to: string, step: string, data: FlowData) {
  await saveContact(to, {
    flow_step: step,
    flow_data: data,
  });

  await sendButtons(to, "📍 اختر المنطقة:", [
    {
      id: "area_madinaty",
      title: "مدينتي",
    },
    {
      id: "area_shorouk",
      title: "الشروق",
    },
  ]);
}

async function askDate(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_date",
    flow_data: data,
  });

  const base = getCairoTodayUtc();
  const rows = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(base);
    date.setUTCDate(date.getUTCDate() + index + 1);

    const iso = date.toISOString().slice(0, 10);
    const title = new Intl.DateTimeFormat("ar-EG", {
      timeZone: "Africa/Cairo",
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    }).format(date);

    return {
      id: `date_${iso}`,
      title,
      description: iso,
    };
  });

  await sendList(
    to,
    "📅 اختر التاريخ المناسب للخدمة:",
    "اختيار التاريخ",
    [
      {
        title: "المواعيد المتاحة",
        rows,
      },
    ]
  );
}

async function askTime(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_time_period",
    flow_data: data,
  });

  await sendButtons(to, "🕐 اختر الفترة المناسبة:", [
    {
      id: "time_period_morning",
      title: "🌅 09:00–12:30",
    },
    {
      id: "time_period_afternoon",
      title: "☀️ 01:00–03:00",
    },
  ]);
}

async function showTimeOptions(
  to: string,
  data: FlowData,
  period: "morning" | "afternoon"
) {
  await saveContact(to, {
    flow_step: "booking_time",
    flow_data: data,
  });

  const hours =
    period === "morning"
      ? [9, 10, 11, 12]
      : [13, 14, 15];

  const rows = hours.flatMap((hour) => {
    const values = [0, 30].filter(
      (minute) => !(hour === 15 && minute === 30)
    );

    return values.map((minute) => {
      const hour12 = hour > 12 ? hour - 12 : hour;
      const periodLabel = hour < 12 ? "صباحًا" : "مساءً";
      const time24 = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
      const time12 = `${String(hour12).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${periodLabel}`;

      return {
        id: `time_${time24}`,
        title: time12,
        description: time24,
      };
    });
  });

  await sendList(
    to,
    "🕐 اختر الوقت المناسب:",
    "اختيار الوقت",
    [
      {
        title: "المواعيد",
        rows,
      },
    ]
  );
}

async function askAddress(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_address",
    flow_data: data,
  });

  await sendText(to, "🏠 اكتب عنوان الشقة المراد تنظيفها بالتفصيل من فضلك:");
}

async function askNotes(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_notes",
    flow_data: data,
  });

  await sendButtons(to, "📝 هل لديك أي ملاحظات إضافية؟", [
    {
      id: "notes_none",
      title: "لا يوجد",
    },
    {
      id: "notes_write",
      title: "نعم، سأكتبها",
    },
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
  await saveContact(to, {
    flow_step: data.existingBooking
      ? "existing_booking_property_type"
      : "new_booking_property_type",
    flow_data: data,
  });

  await sendList(
    to,
    "🏠 اختر نوع العقار:",
    "اختيار العقار",
    [
      {
        title: "نوع العقار",
        rows: [
          {
            id: "property_apartment",
            title: "🏠 شقة",
          },
          {
            id: "property_villa",
            title: "🏡 فيلا",
          },
          {
            id: "property_shop",
            title: "🏪 متجر",
          },
          {
            id: "property_cafe",
            title: "☕ كافيه",
          },
        ],
      },
    ]
  );
}

async function showPropertySizeOptions(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: data.existingBooking
      ? "existing_booking_property_size"
      : "new_booking_property_size",
    flow_data: data,
  });

  await sendList(
    to,
    "📐 اختر مساحة العقار:",
    "اختيار المساحة",
    [
      {
        title: "المساحة",
        rows: [
          {
            id: "size_under_70",
            title: "أقل من 70 م²",
          },
          {
            id: "size_70_100",
            title: "70–100 م²",
          },
          {
            id: "size_100_150",
            title: "100–150 م²",
          },
          {
            id: "size_150_200",
            title: "150–200 م²",
          },
          {
            id: "size_200_plus",
            title: "أكثر من 200 م²",
          },
        ],
      },
    ]
  );
}

async function showCleaningTypeOptions(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: data.existingBooking
      ? "existing_booking_cleaning_type"
      : "new_booking_cleaning_type",
    flow_data: data,
  });

  await sendList(
    to,
    "🧹 اختر نوع التنظيف:",
    "اختيار التنظيف",
    [
      {
        title: "نوع التنظيف",
        rows: [
          {
            id: "clean_regular",
            title: "تنظيف عادي",
          },
          {
            id: "clean_deep",
            title: "تنظيف عميق",
          },
          {
            id: "clean_post",
            title: "بعد الإنشاء",
          },
        ],
      },
    ]
  );
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
  return (
    "📋 *ملخص طلبك*\n\n" +
    `👤 الاسم: ${data.name || "-"}\n` +
    `📞 الهاتف: ${data.phone || "-"}\n` +
    `🧹 الخدمة: ${serviceDisplayLabel(data.service)}\n` +
    `🏠 نوع العقار: ${propertyTypeLabel(data.propertyType)}\n` +
    `📐 المساحة: ${propertySizeLabel(data.propertySize)}\n` +
    `🧽 نوع التنظيف: ${cleaningTypeLabel(data.cleaningType)}\n` +
    `💰 السعر التقديري: ${formatPrice(data.estimatedPrice)}\n` +
    `📅 التاريخ: ${formatDateForDisplay(data.date)}\n` +
    `🕐 الوقت: ${data.time || "-"}\n` +
    `📍 المنطقة: ${areaLabel(data.area)}\n` +
    `🏠 عنوان الشقة المراد تنظيفها: ${data.address || "-"}\n` +
    `📝 الملاحظات: ${data.notes || "لا يوجد"}\n\n` +
    "هل تريد تأكيد الطلب؟"
  );
}

async function showSummary(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_confirmation",
    flow_data: data,
  });

  await sendButtons(to, buildSummary(data), [
    {
      id: "confirm_booking",
      title: "✅ تأكيد",
    },
    {
      id: "cancel_booking",
      title: "❌ إلغاء",
    },
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

  const { error } = await supabase.from("bookings").insert({
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
    status: "pending",
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
    "🎉 تم تأكيد طلبك بنجاح!\n\n" +
      "تم تسجيل الحجز لدينا، وسيظهر الآن ضمن نظام الحجوزات.\n\n" +
      "شكرًا لاختيارك A to Z Cleaning Services 🌿✨"
  );
}

async function updateExistingBooking(to: string, data: FlowData) {
  if (!data.bookingId) {
    throw new Error("Missing booking ID");
  }

  const { error } = await supabase
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

async function handleButton(
  to: string,
  buttonId: string,
  contact: ContactRow
) {
  const data: FlowData = contact.flow_data || {};

  if (buttonId === "new_booking") {
    await startNewBooking(to);
    return;
  }

  if (buttonId === "already_booked") {
    await startExistingBooking(to);
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
      "شكرًا لاختيارك A to Z Cleaning Services 🌿\n\n" +
        "هذه الخدمة يتم تنسيقها مباشرة مع فريق العمل المختص.\n\n" +
        "📞 يرجى التواصل معنا على:\n" +
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
      await showServiceOptions(to, nextData);
      return;
    }

    await askAddress(to, nextData);
    return;
  }

  if (
    buttonId === "time_period_morning" ||
    buttonId === "time_period_afternoon"
  ) {
    await showTimeOptions(
      to,
      data,
      buttonId === "time_period_morning" ? "morning" : "afternoon"
    );
    return;
  }

  if (buttonId === "price_continue") {
    await askDate(to, data);
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

    await sendText(to, "📝 اكتب ملاحظاتك الإضافية:");
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
  const step = contact.flow_step;

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

    await showPropertySizeOptions(to, {
      ...data,
      propertyType,
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
      propertyType: "Apartment",
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

    await sendButtons(
      to,
      "💰 السعر التقديري حسب اختياراتك:\n\n" +
        `🏠 المساحة: ${propertySizeLabel(nextData.propertySize)}\n` +
        `🧽 نوع التنظيف: ${cleaningTypeLabel(nextData.cleaningType)}\n` +
        `💰 السعر: ${formatPrice(estimatedPrice)}\n\n` +
        "إذا كان مناسبًا لك، تابع لاختيار التاريخ والوقت.",
      [
        {
          id: "price_continue",
          title: "✅ متابعة",
        },
        {
          id: "cancel_booking",
          title: "❌ إلغاء",
        },
      ]
    );

    return;
  }

  if (step === "booking_date") {
    if (!replyId.startsWith("date_")) {
      await sendText(to, "يرجى اختيار التاريخ من القائمة.");
      return;
    }

    const date = replyId.replace("date_", "");

    await askTime(to, {
      ...data,
      date,
    });

    return;
  }

  if (step === "booking_time") {
    if (!replyId.startsWith("time_")) {
      await sendText(to, "يرجى اختيار الوقت من القائمة.");
      return;
    }

    const time24 = replyId.replace("time_", "");
    const [hourText] = time24.split(":");
    const hour = Number(hourText);
    const hour12 = hour > 12 ? hour - 12 : hour;
    const period = hour < 12 ? "AM" : "PM";
    const time = `${String(hour12).padStart(2, "0")}:00 ${period}`;

    const nextData = {
      ...data,
      time,
    };

    if (data.existingBooking) {
      await askAddress(to, nextData);
    } else {
      await askArea(to, "new_booking_area", nextData);
    }

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

  if (step === "new_booking_name") {
    const name = text.trim();

    if (!name) {
      await sendText(to, "👤 اكتب اسمك الكامل من فضلك:");
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
      "📞 الآن أرسل رقم الهاتف الذي تريد استخدامه للحجز:"
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
        "📞 أرسل رقم الهاتف المستخدم عند الحجز بشكل صحيح:"
      );
      return;
    }

    const booking = await findBookingByPhone(phone);

    if (!booking) {
      await saveContact(to, {
        flow_step: "no_booking_found",
        flow_data: {
          phone,
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

    await saveContact(to, {
      flow_step: "existing_booking_area",
      flow_data: nextData,
    });

    await askArea(to, "existing_booking_area", nextData);
    return;
  }

  if (
    step === "new_booking_property_type" ||
    step === "new_booking_property_size" ||
    step === "new_booking_cleaning_type" ||
    step === "existing_booking_property_type" ||
    step === "existing_booking_property_size" ||
    step === "existing_booking_cleaning_type" ||
    step === "booking_date" ||
    step === "booking_time_period" ||
    step === "booking_time" ||
    step === "new_booking_area" ||
    step === "existing_booking_area" ||
    step === "price_review"
  ) {
    await sendText(
      to,
      "يرجى استخدام الخيارات الظاهرة أمامك في المحادثة."
    );
    return;
  }

  if (step === "booking_address") {
    const address = text.trim();

    if (!address) {
      await sendText(to, "🏠 اكتب عنوان الشقة المراد تنظيفها بالتفصيل من فضلك:");
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
      notes: text.trim() || "لا يوجد",
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
    await sendButtons(to, "👋 اختر ماذا تريد أن تفعل:", [
      {
        id: "new_booking",
        title: "🆕 حجز جديد",
      },
      {
        id: "already_booked",
        title: "✅ لدي حجز",
      },
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

    let whatsappContact = await getContact(from);

    // First normal message = welcome.
    if (!whatsappContact && messageType === "text") {
      const sendWelcome = await shouldSendWelcome(from, customerName);

      if (sendWelcome) {
        await sendWhatsAppWelcome(from);
      }

      return NextResponse.json({ received: true }, { status: 200 });
    }

    if (!whatsappContact) {
      await saveContact(from, {
        customer_name: customerName,
        welcome_sent: true,
        flow_step: "welcome",
        flow_data: {},
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