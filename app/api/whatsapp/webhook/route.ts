import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

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
  date?: string;
  time?: string;
  address?: string;
  notes?: string;
  userId?: string;
  bookingId?: string;
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
  const { data, error } = await supabase
    .from("users")
    .select("id, full_name, phone")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    throw new Error(`User lookup error: ${error.message}`);
  }

  return data;
}

async function createUser(
  fullName: string,
  phone: string
): Promise<string> {
  const existing = await findUserByPhone(phone);

  if (existing?.id) {
    return existing.id;
  }

  const userId = crypto.randomUUID();

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
    throw new Error(
      `User registration failed: ${data?.message || "Unknown error"}`
    );
  }

  return userId;
}

async function findBookingByPhone(phone: string) {
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
    .eq("customer_phone", phone)
    .neq("status", "cancelled")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(`Booking lookup error: ${error.message}`);
  }

  return data as BookingRow | null;
}

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").replace(/^00/, "+");
}

function normalizeDate(value: string) {
  return value.trim();
}

function normalizeTime(value: string) {
  return value.trim();
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

async function showServiceOptions(to: string) {
  await sendList(
    to,
    "🧹 اختر نوع الخدمة التي تريدها:",
    "اختيار الخدمة",
    [
      {
        title: "الخدمات",
        rows: [
          {
            id: "service_home",
            title: "تنظيف منازل",
          },
          {
            id: "service_corporate",
            title: "تنظيف شركات",
          },
          {
            id: "service_carpet",
            title: "تنظيف سجاد",
          },
          {
            id: "service_sofa",
            title: "تنظيف كنب",
          },
          {
            id: "service_pest",
            title: "مكافحة حشرات",
          },
          {
            id: "service_other",
            title: "أخرى",
          },
        ],
      },
    ]
  );
}

async function askArea(to: string, step: string, data: FlowData) {
  await saveContact(to, {
    flow_step: step,
    flow_data: data,
  });

  await sendButtons(
    to,
    "📍 اختر المنطقة:",
    [
      {
        id: "area_madinaty",
        title: "مدينتي",
      },
      {
        id: "area_shorouk",
        title: "الشروق",
      },
    ]
  );
}

async function askDate(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_date",
    flow_data: data,
  });

  await sendText(
    to,
    "📅 ما هو التاريخ المفضل للخدمة؟\n\nمثال: 15/09/2026"
  );
}

async function askTime(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_time",
    flow_data: data,
  });

  await sendText(
    to,
    "🕐 ما هو الوقت المفضل؟\n\nساعات العمل من 08:00 صباحًا حتى 03:00 مساءً.\nمثال: 10:00 AM"
  );
}

async function askAddress(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_address",
    flow_data: data,
  });

  await sendText(to, "🏠 اكتب عنوان الخدمة بالتفصيل من فضلك:");
}

async function askNotes(to: string, data: FlowData) {
  await saveContact(to, {
    flow_step: "booking_notes",
    flow_data: data,
  });

  await sendButtons(
    to,
    "📝 هل لديك أي ملاحظات إضافية؟",
    [
      {
        id: "notes_none",
        title: "لا يوجد",
      },
      {
        id: "notes_write",
        title: "نعم، سأكتبها",
      },
    ]
  );
}

function serviceLabel(service?: string) {
  const labels: Record<string, string> = {
    service_home: "تنظيف منازل",
    service_corporate: "تنظيف شركات",
    service_carpet: "تنظيف سجاد",
    service_sofa: "تنظيف كنب",
    service_pest: "مكافحة حشرات",
    service_other: "أخرى",
  };

  return labels[service || ""] || service || "-";
}

function areaLabel(area?: string) {
  return area === "El Shorouk" ? "الشروق" : area === "Madinaty" ? "مدينتي" : area || "-";
}

function buildSummary(data: FlowData) {
  return (
    "📋 *ملخص طلبك*\n\n" +
    `👤 الاسم: ${data.name || "-"}\n` +
    `📞 الهاتف: ${data.phone || "-"}\n` +
    `📍 المنطقة: ${areaLabel(data.area)}\n` +
    `🧹 الخدمة: ${serviceLabel(data.service)}\n` +
    `📅 التاريخ: ${data.date || "-"}\n` +
    `🕐 الوقت: ${data.time || "-"}\n` +
    `🏠 العنوان: ${data.address || "-"}\n` +
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
  if (!data.name || !data.phone || !data.service || !data.userId) {
    throw new Error("Incomplete booking data");
  }

  const { error } = await supabase.from("bookings").insert({
    user_id: data.userId,
    service: serviceLabel(data.service),
    area: data.area || null,
    address: data.address || null,
    booking_date: data.date || null,
    booking_time: data.time || null,
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
    flow_data: data,
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
      area: data.area || null,
      address: data.address || null,
      booking_date: data.date || null,
      booking_time: data.time || null,
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

  if (buttonId === "area_madinaty" || buttonId === "area_shorouk") {
    const area =
      buttonId === "area_madinaty" ? "Madinaty" : "El Shorouk";

    const nextData = {
      ...data,
      area,
    };

    if (contact.flow_step === "existing_booking_area") {
      await showServiceOptions(to);

      await saveContact(to, {
        flow_step: "existing_booking_service",
        flow_data: nextData,
      });

      return;
    }

    await showServiceOptions(to);

    await saveContact(to, {
      flow_step: "new_booking_service",
      flow_data: nextData,
    });

    return;
  }

  if (buttonId === "notes_none") {
    const nextData = {
      ...data,
      notes: "لا يوجد",
    };

    await showSummary(to, nextData);
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
    if (contact.flow_step === "existing_booking_confirmation") {
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
      "تم إلغاء الطلب. 👍\n\nإذا أردت البدء من جديد، أرسل أي رسالة."
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

  if (replyId.startsWith("service_")) {
    const nextData = {
      ...data,
      service: replyId,
    };

    await askDate(to, nextData);
    return;
  }
}

async function handleText(
  to: string,
  text: string,
  contact: ContactRow
) {
  const step = contact.flow_step;
  const data: FlowData = contact.flow_data || {};

  if (step === "new_booking_name") {
    const nextData = {
      ...data,
      name: text.trim(),
    };

    await saveContact(to, {
      flow_step: "new_booking_phone",
      flow_data: nextData,
    });

    await sendText(
      to,
      "📞 الآن أرسل رقم الهاتف الذي تريد استخدامه للحجز:"
    );

    return;
  }

  if (step === "new_booking_phone") {
    const phone = normalizePhone(text);

    const existingUser = await findUserByPhone(phone);

    const nextData = {
      ...data,
      phone,
      userId: existingUser?.id,
    };

    if (existingUser?.id) {
      await askArea(to, "new_booking_area", nextData);
      return;
    }

    const userId = await createUser(data.name || "", phone);

    await askArea(to, "new_booking_area", {
      ...nextData,
      userId,
    });

    return;
  }

  if (step === "existing_booking_phone") {
    const phone = normalizePhone(text);
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
      service: booking.service || undefined,
      area: booking.area || undefined,
      address: booking.address || undefined,
      date: booking.booking_date || undefined,
      time: booking.booking_time || undefined,
      notes: booking.notes || undefined,
    };

    await saveContact(to, {
      flow_step: "existing_booking_found",
      flow_data: nextData,
    });

    await sendButtons(
      to,
      "✅ وجدنا حجزك بنجاح.\n\n" +
        `🧹 الخدمة: ${booking.service || "-"}\n` +
        `📍 المنطقة: ${areaLabel(booking.area || undefined)}\n` +
        `📅 التاريخ: ${booking.booking_date || "-"}\n` +
        `🕐 الوقت: ${booking.booking_time || "-"}\n\n` +
        "هل تريد متابعة هذا الحجز وتحديث بياناته؟",
      [
        {
          id: "existing_booking_use",
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
    const nextData = {
      ...data,
      date: normalizeDate(text),
    };

    await askTime(to, nextData);
    return;
  }

  if (step === "booking_time") {
    const nextData = {
      ...data,
      time: normalizeTime(text),
    };

    await askAddress(to, nextData);
    return;
  }

  if (step === "booking_address") {
    const nextData = {
      ...data,
      address: text.trim(),
    };

    await askNotes(to, nextData);
    return;
  }

  if (step === "booking_notes_text") {
    const nextData = {
      ...data,
      notes: text.trim(),
    };

    await showSummary(to, nextData);
    return;
  }

  if (
    step === "welcome" ||
    step === "completed" ||
    step === "cancelled" ||
    step === "no_booking_found"
  ) {
    await sendText(
      to,
      "👋 إذا كنت تريد حجز خدمة، أرسل أي رسالة وسأساعدك بالخطوات."
    );

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