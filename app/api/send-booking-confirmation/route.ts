import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      email,
      customerName,
      service,
      propertyType,
      area,
      address,
      bookingDate,
      bookingTime,
    } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Customer email is required.' },
        { status: 400 }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #143640;">
          Booking Confirmed
        </h2>

        <p>
          Hello ${customerName || 'Customer'},
        </p>

        <p>
          Your A to Z Cleaning booking has been confirmed.
        </p>

        <div style="background:#f5f7f8; padding:20px; border-radius:12px; margin:20px 0;">
          <p><strong>Service:</strong> ${service || '-'}</p>
          <p><strong>Property:</strong> ${propertyType || '-'}</p>
          <p><strong>Area:</strong> ${area || '-'}</p>
          <p><strong>Address:</strong> ${address || '-'}</p>
          <p><strong>Date:</strong> ${bookingDate || '-'}</p>
          <p><strong>Time:</strong> ${bookingTime || '-'}</p>
        </div>

        <p>
          Thank you for choosing A to Z Cleaning Services.
        </p>
      </div>
    `;

    const { data, error } = await resend.emails.send({
      from: 'A to Z Cleaning <onboarding@resend.dev>',
      to: email,
      subject: 'Your A to Z Cleaning Booking is Confirmed',
      html,
    });

    if (error) {
      console.error('Resend email error:', error);

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id ?? null,
    });

  } catch (error) {
    console.error(
      'Booking confirmation email error:',
      error
    );

    return NextResponse.json(
      { error: 'Failed to send confirmation email.' },
      { status: 500 }
    );
  }
}
