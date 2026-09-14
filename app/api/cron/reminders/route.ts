import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const WHATSAPP_API_VERSION = "v26.0";
const REMINDER_MINUTES = 45;
const REMINDER_WINDOW_MINUTES = 10;

function getSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase environment variables are not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

function getWhatsAppConfig() {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

  if (!phoneNumberId || !accessToken) {
    throw new Error("WhatsApp environment variables are not configured");
  }

  return {
    phoneNumberId,
    accessToken,
  };
}

function parseBookingTime(time: string) {
  const match = time.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);

  if (!match) {
    return null;
  }

  let hour = Number(match[1]);
  const minute = Number(match[2]);
  const period = match[3].toUpperCase();

  if (minute < 0 || minute > 59 || hour < 1 || hour > 12) {
    return null;
  }

  if (period === "AM") {
    if (hour === 12) {
      hour = 0;
    }
  } else {
    if (hour !== 12) {
      hour += 12;
    }
  }

  return {
    hour,
    minute,
  };
}

function getCairoNow() {
  return new Date(
    new Date().toLocaleString("en-US", {
      timeZone: "Africa/Cairo",
    })
  );
}

function getCairoDateString() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return formatter.format(new Date());
}

function normalizePhone(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) {
    return cleaned.substring(1);
  }

  if (cleaned.startsWith("00")) {
    return cleaned.substring(2);
  }

  if (cleaned.startsWith("0")) {
    return `20${cleaned.substring(1)}`;
  }

  return cleaned;
}

async function sendReminderTemplate(
  phone: string,
  customerName: string,
  bookingTime: string
) {
  const { phoneNumberId, accessToken } = getWhatsAppConfig();

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${phoneNumberId}/messages`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: normalizePhone(phone),
      type: "template",
      template: {
        name: "cleaning_service_reminder",
        language: {
          code: "ar",
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: customerName || "عميلنا العزيز",
              },
              {
                type: "text",
                text: bookingTime,
              },
            ],
          },
        ],
      },
    }),
  });

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(
      `WhatsApp reminder failed (${response.status}): ${responseText}`
    );
  }

  return responseText;
}

export async function GET(request: NextRequest) {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (!cronSecret) {
      console.error("CRON_SECRET is not configured");

      return NextResponse.json(
        {
          success: false,
          error: "CRON_SECRET is not configured",
        },
        { status: 500 }
      );
    }

    const authorization = request.headers.get("authorization");

    if (authorization !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
        },
        { status: 401 }
      );
    }

    const cairoNow = getCairoNow();
    const today = getCairoDateString();

    const supabase = getSupabase();

    const { data: bookings, error } = await supabase
      .from("bookings")
      .select(
        `
          id,
          customer_name,
          customer_phone,
          booking_date,
          booking_time,
          status,
          reminder_sent
        `
      )
      .eq("booking_date", today)
      .eq("status", "confirmed")
      .eq("reminder_sent", false);

    if (error) {
      throw new Error(`Booking query failed: ${error.message}`);
    }

    if (!bookings || bookings.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No reminders to send",
        checkedAt: cairoNow.toISOString(),
        sent: 0,
      });
    }

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    const results: Array<{
      bookingId: string;
      status: string;
      message?: string;
    }> = [];

    for (const booking of bookings) {
      if (!booking.customer_phone || !booking.booking_time) {
        skipped++;

        results.push({
          bookingId: booking.id,
          status: "skipped",
          message: "Missing customer phone or booking time",
        });

        continue;
      }

      const parsedTime = parseBookingTime(booking.booking_time);

      if (!parsedTime) {
        skipped++;

        results.push({
          bookingId: booking.id,
          status: "skipped",
          message: `Invalid booking time: ${booking.booking_time}`,
        });

        continue;
      }

      const bookingDateTime = new Date(cairoNow);

      bookingDateTime.setHours(
        parsedTime.hour,
        parsedTime.minute,
        0,
        0
      );

      const reminderTime = new Date(
        bookingDateTime.getTime() - REMINDER_MINUTES * 60 * 1000
      );

      const windowEnd = new Date(
        reminderTime.getTime() +
          REMINDER_WINDOW_MINUTES * 60 * 1000
      );

      if (cairoNow < reminderTime || cairoNow > windowEnd) {
        skipped++;

        continue;
      }

      try {
        await sendReminderTemplate(
          booking.customer_phone,
          booking.customer_name || "عميلنا العزيز",
          booking.booking_time
        );

        const { error: updateError } = await supabase
          .from("bookings")
          .update({
            reminder_sent: true,
            reminder_sent_at: new Date().toISOString(),
          })
          .eq("id", booking.id)
          .eq("reminder_sent", false);

        if (updateError) {
          throw new Error(
            `Reminder sent but database update failed: ${updateError.message}`
          );
        }

        sent++;

        results.push({
          bookingId: booking.id,
          status: "sent",
        });
      } catch (sendError) {
        failed++;

        results.push({
          bookingId: booking.id,
          status: "failed",
          message:
            sendError instanceof Error
              ? sendError.message
              : String(sendError),
        });
      }
    }

    return NextResponse.json({
      success: true,
      checkedAt: cairoNow.toISOString(),
      bookingDate: today,
      totalBookings: bookings.length,
      sent,
      skipped,
      failed,
      results,
    });
  } catch (error) {
    console.error("Reminder cron error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}