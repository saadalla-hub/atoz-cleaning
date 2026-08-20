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
      subject: 'Booking Confirmation - A to Z Cleaning Services',
      text: `
A TO Z CLEANING SERVICES
Booking Confirmed | تأكيد الحجز

Hello ${customerName || 'Customer'},
مرحبًا ${customerName || 'بالعميل الكريم'}،

Your booking has been confirmed successfully.
تم تأكيد حجزكم بنجاح.

BOOKING DETAILS | تفاصيل الحجز

🧹 Service | الخدمة:
${service || '-'}

🏠 Property | العقار:
${propertyType || '-'}

📍 Area | المنطقة:
${area || '-'}

🏡 Address | العنوان:
${address || '-'}

📅 Date | التاريخ:
${bookingDate || '-'}

🕐 Time | الوقت:
${bookingTime || '-'}

Thank you for choosing A to Z Cleaning Services.
شكرًا لاختياركم خدمات A to Z للتنظيف.

Please keep this email for your records.
يرجى الاحتفاظ بهذا البريد الإلكتروني للرجوع إليه.

Best regards | مع أطيب التحيات،
A to Z Cleaning Services
      `.trim(),

           html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmation - A to Z Cleaning Services</title>
</head>

<body style="margin:0; padding:0; background-color:#f4f6f7; font-family:Arial, Helvetica, sans-serif; color:#24343a;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f6f7; padding:35px 15px;">
    <tr>
      <td align="center">

        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:620px; background-color:#ffffff; border-radius:14px; overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background-color:#143640; padding:30px 35px; text-align:center;">

              <div style="font-size:25px; font-weight:bold; color:#ffffff;">
                A to Z Cleaning Services
              </div>

              <div style="margin-top:8px; font-size:12px; color:#E7B548; letter-spacing:1.2px;">
                PROFESSIONAL CLEANING SERVICES
              </div>

            </td>
          </tr>

          <!-- TITLE -->
          <tr>
            <td style="padding:35px 35px 10px 35px;">

              <div style="font-size:24px; font-weight:bold; color:#143640;">
                Booking Confirmed
              </div>

              <div style="font-size:20px; font-weight:bold; color:#143640; margin-top:5px; direction:rtl; text-align:left;">
                تم تأكيد الحجز
              </div>

              <div style="width:45px; height:3px; background-color:#E7B548; margin-top:15px;"></div>

            </td>
          </tr>

          <!-- GREETING -->
          <tr>
            <td style="padding:15px 35px 25px 35px;">

              <p style="margin:0 0 10px 0; font-size:16px; color:#24343a;">
                Hello <strong>${customerName || 'Customer'}</strong>,
              </p>

              <p style="margin:0 0 16px 0; font-size:15px; line-height:1.7; color:#66747a;">
                Your booking has been confirmed successfully.
              </p>

              <p style="margin:0; font-size:15px; line-height:1.8; color:#66747a; direction:rtl; text-align:left;">
                تم تأكيد حجزكم بنجاح.
              </p>

            </td>
          </tr>

          <!-- BOOKING DETAILS -->
          <tr>
            <td style="padding:0 35px 30px 35px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="border:1px solid #e5eaec; border-radius:12px; overflow:hidden;">

                <tr>
                  <td colspan="2" style="background-color:#f7f9fa; padding:17px 18px; border-bottom:1px solid #e5eaec;">

                    <div style="font-size:14px; font-weight:bold; color:#143640; letter-spacing:0.5px;">
                      BOOKING DETAILS
                    </div>

                    <div style="font-size:13px; font-weight:bold; color:#66747a; margin-top:3px; direction:rtl; text-align:left;">
                      تفاصيل الحجز
                    </div>

                  </td>
                </tr>

                <!-- SERVICE -->
                <tr>
                  <td style="padding:15px 18px; width:42%; border-bottom:1px solid #edf0f1; vertical-align:middle;">

                    <div style="font-size:13px; color:#7a878c;">
                      🧹 Service
                    </div>

                    <div style="font-size:12px; color:#9aa5a9; margin-top:3px; direction:rtl; text-align:left;">
                      الخدمة
                    </div>

                  </td>

                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; color:#143640; font-size:14px; font-weight:bold;">
                    ${service || '-'}
                  </td>
                </tr>

                <!-- PROPERTY -->
                <tr>
                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; vertical-align:middle;">

                    <div style="font-size:13px; color:#7a878c;">
                      🏠 Property
                    </div>

                    <div style="font-size:12px; color:#9aa5a9; margin-top:3px; direction:rtl; text-align:left;">
                      العقار
                    </div>

                  </td>

                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; color:#143640; font-size:14px;">
                    ${propertyType || '-'}
                  </td>
                </tr>

                <!-- AREA -->
                <tr>
                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; vertical-align:middle;">

                    <div style="font-size:13px; color:#7a878c;">
                      📍 Area
                    </div>

                    <div style="font-size:12px; color:#9aa5a9; margin-top:3px; direction:rtl; text-align:left;">
                      المنطقة
                    </div>

                  </td>

                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; color:#143640; font-size:14px;">
                    ${area || '-'}
                  </td>
                </tr>

                <!-- ADDRESS -->
                <tr>
                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; vertical-align:middle;">

                    <div style="font-size:13px; color:#7a878c;">
                      🏡 Address
                    </div>

                    <div style="font-size:12px; color:#9aa5a9; margin-top:3px; direction:rtl; text-align:left;">
                      العنوان
                    </div>

                  </td>

                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; color:#143640; font-size:14px;">
                    ${address || '-'}
                  </td>
                </tr>

                <!-- DATE -->
                <tr>
                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; vertical-align:middle;">

                    <div style="font-size:13px; color:#7a878c;">
                      📅 Date
                    </div>

                    <div style="font-size:12px; color:#9aa5a9; margin-top:3px; direction:rtl; text-align:left;">
                      التاريخ
                    </div>

                  </td>

                  <td style="padding:15px 18px; border-bottom:1px solid #edf0f1; color:#143640; font-size:14px; font-weight:bold;">
                    ${bookingDate || '-'}
                  </td>
                </tr>

                <!-- TIME -->
                <tr>
                  <td style="padding:15px 18px; vertical-align:middle;">

                    <div style="font-size:13px; color:#7a878c;">
                      🕐 Time
                    </div>

                    <div style="font-size:12px; color:#9aa5a9; margin-top:3px; direction:rtl; text-align:left;">
                      الوقت
                    </div>

                  </td>

                  <td style="padding:15px 18px; color:#143640; font-size:14px; font-weight:bold;">
                    ${bookingTime || '-'}
                  </td>
                </tr>

              </table>

            </td>
          </tr>

          <!-- MESSAGE -->
          <tr>
            <td style="padding:0 35px 30px 35px;">

              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background-color:#fffaf0; border-left:4px solid #E7B548; padding:16px 17px;">

                    <p style="margin:0; font-size:14px; line-height:1.7; color:#5f6669;">
                      Please keep this email for your records.
                    </p>

                    <p style="margin:5px 0 0 0; font-size:13px; line-height:1.7; color:#7a878c; direction:rtl; text-align:left;">
                      يرجى الاحتفاظ بهذا البريد الإلكتروني للرجوع إليه.
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- CLOSING -->
          <tr>
            <td style="padding:0 35px 35px 35px;">

              <p style="margin:0 0 5px 0; font-size:14px; color:#66747a;">
                Best regards,
              </p>

              <p style="margin:0 0 4px 0; font-size:14px; color:#66747a; direction:rtl; text-align:left;">
                مع أطيب التحيات،
              </p>

              <p style="margin:0; font-size:15px; font-weight:bold; color:#143640;">
                A to Z Cleaning Services
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color:#143640; padding:22px 30px; text-align:center;">

              <div style="font-size:12px; color:#ffffff;">
                A to Z Cleaning Services
              </div>

              <div style="margin-top:6px; font-size:11px; color:#b8c4c8;">
                Professional cleaning services from A to Z
              </div>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
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





