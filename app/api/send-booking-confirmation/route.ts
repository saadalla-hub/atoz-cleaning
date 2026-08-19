
import nodemailer from 'nodemailer';

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
      return Response.json(
        {
          error: 'Customer email is required.',
        },
        {
          status: 400,
        }
      );
    }

    const gmailUser = process.env.GMAIL_USER;
    const gmailAppPassword =
      process.env.GMAIL_APP_PASSWORD;

    if (!gmailUser || !gmailAppPassword) {
      console.error(
        'Gmail environment variables are missing.'
      );

      return Response.json(
        {
          error: 'Email service is not configured.',
        },
        {
          status: 500,
        }
      );
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailAppPassword,
      },
    });

    await transporter.sendMail({
      from: `"A to Z Cleaning Services" <${gmailUser}>`,
      to: email,
      subject: 'Booking Confirmed - A to Z Cleaning Services',
      text: `
Hello ${customerName || 'Customer'},

Your booking has been confirmed.

Service: ${service || '-'}
Property Type: ${propertyType || '-'}
Area: ${area || '-'}
Address: ${address || '-'}
Date: ${bookingDate || '-'}
Time: ${bookingTime || '-'}

Thank you for choosing A to Z Cleaning Services.

Best regards,
A to Z Cleaning Services
      `.trim(),
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Booking Confirmed</h2>

          <p>Hello ${customerName || 'Customer'},</p>

          <p>
            Your booking has been confirmed successfully.
          </p>

          <hr />

          <p>
            <strong>Service:</strong>
            ${service || '-'}
          </p>

          <p>
            <strong>Property Type:</strong>
            ${propertyType || '-'}
          </p>

          <p>
            <strong>Area:</strong>
            ${area || '-'}
          </p>

          <p>
            <strong>Address:</strong>
            ${address || '-'}
          </p>

          <p>
            <strong>Date:</strong>
            ${bookingDate || '-'}
          </p>

          <p>
            <strong>Time:</strong>
            ${bookingTime || '-'}
          </p>

          <hr />

          <p>
            Thank you for choosing
            <strong>A to Z Cleaning Services</strong>.
          </p>
        </div>
      `,
    });

    console.log(
      `Booking confirmation email sent to ${email}`
    );

    return Response.json({
      success: true,
      message: 'Confirmation email sent successfully.',
    });

  } catch (error) {
    console.error(
      'Gmail email error:',
      error
    );

    return Response.json(
      {
        error: 'Failed to send confirmation email.',
      },
      {
        status: 500,
      }
    );
  }
}
