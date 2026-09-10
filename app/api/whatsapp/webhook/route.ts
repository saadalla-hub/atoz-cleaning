import { createClient } from "@supabase/supabase-js";
import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

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

async function sendWhatsAppWelcome(to: string) {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!accessToken || !phoneNumberId) {
    throw new Error("WhatsApp API environment variables are not configured");
  }

  const imageUrl =
    "https://atoz-cleaning-6tahy444p-saadodunia-1178s-projects.vercel.app/images/whatsapp/welcome.png";

  // 1. Send welcome image
  const imageResponse = await fetch(
    `https://graph.facebook.com/v26.0/${phoneNumberId}/messages`,
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
        type: "image",
        image: {
          link: imageUrl,
        },
      }),
    }
  );

  const imageData = await imageResponse.json();

  if (!imageResponse.ok) {
    console.error(
      "WhatsApp welcome image error:",
      JSON.stringify(imageData)
    );
    throw new Error(`WhatsApp image API error: ${imageResponse.status}`);
  }

  // 2. Send welcome text + buttons
  const buttonResponse = await fetch(
    `https://graph.facebook.com/v26.0/${phoneNumberId}/messages`,
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
        type: "interactive",
        interactive: {
          type: "button",
          body: {
            text:
              "👋 أهلاً وسهلاً بك في A to Z Cleaning Services\n\n" +
              "لأن النظافة مو بس شكل… هي راحة، انتعاش، وإحساس أجمل بالمكان 🌿✨\n" +
              "نحن هنا لنساعدك نخلي مساحتك أنظف وأريح، من A إلى Z.\n\n" +
              "يرجى اختيار أحد الخيارات التالية:",
          },
          action: {
            buttons: [
              {
                type: "reply",
                reply: {
                  id: "already_booked",
                  title: "✅ لقد حجزت خدمة",
                },
              },
              {
                type: "reply",
                reply: {
                  id: "new_booking",
                  title: "🆕 لم أحجز خدمة بعد",
                },
              },
            ],
          },
        },
      }),
    }
  );

  const buttonData = await buttonResponse.json();

  if (!buttonResponse.ok) {
    console.error(
      "WhatsApp welcome buttons error:",
      JSON.stringify(buttonData)
    );
    throw new Error(`WhatsApp buttons API error: ${buttonResponse.status}`);
  }

  console.log(
    "WhatsApp welcome sent:",
    JSON.stringify({
      image: imageData,
      buttons: buttonData,
    })
  );
}

async function shouldSendWelcome(
  phone: string,
  customerName: string | null
): Promise<boolean> {
  // Try to create the contact.
  // Because phone is the primary key, a duplicate means
  // this customer has already entered the welcome flow.
  const { error } = await supabase
    .from("whatsapp_contacts")
    .insert({
      phone,
      customer_name: customerName,
      welcome_sent: true,
    });

  if (!error) {
    return true;
  }

  // PostgreSQL duplicate-key error = contact already exists.
  if (error.code === "23505") {
    return false;
  }

  console.error("WhatsApp contact database error:", error);
  throw new Error(`WhatsApp contact database error: ${error.message}`);
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

    if (message) {
      const from = message.from ?? null;
      const messageId = message.id ?? null;
      const customerName = contact?.profile?.name ?? null;
      const messageType = message.type ?? null;

      let messageText: string | null = null;
      let buttonId: string | null = null;

      if (messageType === "text") {
        messageText = message.text?.body ?? null;
      }

      if (messageType === "interactive") {
        buttonId =
          message.interactive?.button_reply?.id ??
          null;
      }

      console.log(
        "WhatsApp incoming message:",
        JSON.stringify({
          from,
          customerName,
          messageId,
          type: messageType,
          messageText,
          buttonId,
        })
      );

      // Only the first normal text message starts the welcome flow.
      if (from && messageType === "text" && messageText) {
        const sendWelcome = await shouldSendWelcome(from, customerName);

        if (sendWelcome) {
          await sendWhatsAppWelcome(from);
        } else {
          console.log(
            "WhatsApp welcome skipped - customer already welcomed:",
            from
          );
        }
      }

      // Button responses are received without restarting the welcome flow.
      if (from && messageType === "interactive" && buttonId) {
        console.log(
          "WhatsApp button selected:",
          JSON.stringify({
            from,
            buttonId,
          })
        );
      }
    } else {
      console.log(
        "WhatsApp webhook event:",
        JSON.stringify({
          field: body?.entry?.[0]?.changes?.[0]?.field ?? null,
          event: body,
        })
      );
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error("WhatsApp webhook error:", error);
    return new NextResponse("Webhook error", { status: 500 });
  }
}