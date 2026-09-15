import config from '../config';
import {
  IEventBookingUserConfirmation,
  IEventBookingAdminNotification,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1789453331/logo-ifundayiti-nav_ea5qml.png';
};

export const eventBookingUserConfirmation = (
  values: IEventBookingUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  const isVirtual = values.eventType === 'virtual';
  const hasTicket =
    values.eventType === 'physical' || values.eventType === 'hybrid';

  const formattedStartDate = new Date(values.startDate).toLocaleDateString(
    'en-US',
    {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  );

  const formattedStartTime = new Date(values.startDate).toLocaleTimeString(
    'en-US',
    {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    },
  );

  const ticketTargetUrl =
    values.ticketUrl ||
    `${config.backend_url || 'http://10.10.26.173:5004'}/api/v1/booking/ticket/${values.bookingId}`;

  // Encode the unique ticket code into the QR code for door staff scanning
  const qrImageUrl = values.ticketCode
    ? `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(values.ticketCode)}`
    : '';

  return {
    to: values.email,
    subject: `Event Registration Confirmed: ${values.eventTitle}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- System Clean Header -->
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 32px 20px 26px 20px; border-bottom: 4px solid #0033A0;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; max-width: 200px; height: auto; margin: 0 auto;" />
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 36px 30px 36px;">
              <div style="text-align: center; margin-bottom: 20px;">
                <span style="background-color: #d1fae5; color: #065f46; padding: 6px 18px; border-radius: 50px; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase;">
                  Registration Confirmed ✓
                </span>
              </div>

              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 14px 0; text-align: center; line-height: 1.3;">
                ${values.eventTitle}
              </h1>

              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0; text-align: center;">
                Dear <strong>${values.name}</strong>, your spot is officially secured! We look forward to welcoming you to this impactful gathering.
              </p>

              ${
                hasTicket && values.ticketCode
                  ? `
              <!-- Ticket Spotlight Card with QR Code -->
              <div style="background-color: #f8faff; border: 2px solid #D4AF37; border-radius: 12px; padding: 24px; margin-bottom: 26px; text-align: center; box-shadow: 0 4px 15px rgba(212,175,55,0.12);">
                <div style="color: #AA771C; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; font-weight: 700; margin-bottom: 6px;">
                  Your Digital Admission Pass
                </div>
                <div style="color: #0033A0; font-size: 24px; font-family: monospace; font-weight: 800; letter-spacing: 3px; margin-bottom: 16px;">
                  ${values.ticketCode}
                </div>

                ${
                  qrImageUrl
                    ? `
                <div style="background: #ffffff; display: inline-block; padding: 12px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
                  <img src="${qrImageUrl}" alt="Ticket QR Code" width="150" height="150" style="display: block; width: 150px; height: 150px; margin: 0 auto; border: none;" />
                </div>
                <p style="color: #6b7280; font-size: 12px; margin: 0 0 16px 0;">
                  Present this QR code or Ticket ID at the entrance for staff check-in.
                </p>
                `
                    : ''
                }

                <div>
                  <a href="${ticketTargetUrl}" target="_blank" style="display: inline-block; background-color: #0033A0; color: #ffffff; font-weight: 700; font-size: 13px; text-decoration: none; padding: 12px 26px; border-radius: 6px; letter-spacing: 0.5px; text-transform: uppercase;">
                    View &amp; Print Official Ticket &rarr;
                  </a>
                </div>
              </div>
              `
                  : ''
              }



              ${
                isVirtual && values.virtualLink
                  ? `
              <!-- Virtual Access Banner -->
              <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-left: 5px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px; text-align: center;">
                <div style="color: #0033A0; font-size: 16px; font-weight: 700; margin-bottom: 8px;">
                  Online Stream / Virtual Meeting
                </div>
                <p style="color: #4b5563; font-size: 14px; margin: 0 0 16px 0;">
                  This is a virtual event. No physical ticket is required. Join directly via the link below:
                </p>
                <a href="${values.virtualLink}" target="_blank" style="display: inline-block; background-color: #0033A0; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 6px;">
                  Join Virtual Event
                </a>
              </div>
              `
                  : ''
              }

              <!-- Event Details Table -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%; border-bottom: 1px solid #eef1f8;">Event:</td>
                    <td style="font-weight: 600; color: #0033A0; border-bottom: 1px solid #eef1f8;">${values.eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Date &amp; Time:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${formattedStartDate} at ${formattedStartTime}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Format:</td>
                    <td style="text-transform: capitalize; border-bottom: 1px solid #eef1f8;">${values.eventType} Event</td>
                  </tr>
                  ${
                    values.location || values.venueAddress
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Location:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">
                      ${values.location ? `<strong>${values.location}</strong><br/>` : ''}
                      ${values.venueAddress || ''}
                    </td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.dressCode
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Dress Code:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.dressCode}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Price:</td>
                    <td style="border-bottom: 1px solid #eef1f8; font-weight: 700; color: #0033A0;">
                      ${values.price > 0 ? `$${values.price.toFixed(2)} USD` : 'FREE'}
                    </td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Quantity / Passes:</td>
                    <td style="border-bottom: 1px solid #eef1f8; font-weight: 600; color: #333333;">
                      ${values.quantity || 1} Ticket(s) (Admit ${values.quantity || 1})
                    </td>
                  </tr>
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Transaction ID:</td>
                    <td style="font-family: monospace; border-bottom: 1px solid #eef1f8;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold;">Booking Reference:</td>
                    <td style="font-family: monospace;">${values.bookingId}</td>
                  </tr>
                </table>
              </div>

              <!-- Haitian Flag divider -->
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>

              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0;">
                Best regards,<br />
                <strong style="color: #0033A0;">The IFundAyiti Team</strong><br />
                <span style="font-size: 13px; color: #6b7280; font-style: italic;">Support &bull; Empower &bull; Build</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8faff; padding: 24px 20px; border-top: 1px solid #dce8ff; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 6px 0;">
                Questions or ticket assistance? Contact us at info@ifundayiti.org
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                &copy; ${new Date().getFullYear()} IFundAyiti. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    `,
  };
};

export const eventBookingAdminNotification = (
  values: IEventBookingAdminNotification,
) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.adminEmail,
    subject: `New Event Registration: ${values.eventTitle}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- Header -->
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 32px 20px 24px 20px; border-bottom: 4px solid #0033A0;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; max-width: 200px; height: auto; margin: 0 auto 8px auto;" />
              <div style="font-size: 11px; letter-spacing: 3px; color: #0033A0; text-transform: uppercase; font-weight: 700;">
                Admin Notification
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="color: #0033A0; font-size: 20px; font-weight: 700; margin: 0 0 16px 0; text-align: center;">
                New Event Registration Received
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                A new attendee has registered for <strong>${values.eventTitle}</strong>.
              </p>

              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 38%; border-bottom: 1px solid #eef1f8;">Attendee Name:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.customerName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Attendee Email:</td>
                    <td style="border-bottom: 1px solid #eef1f8;"><a href="mailto:${values.customerEmail}" style="color: #0033A0;">${values.customerEmail}</a></td>
                  </tr>
                  ${
                    values.customerPhone
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Phone:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.customerPhone}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Event:</td>
                    <td style="font-weight: 600; color: #0033A0; border-bottom: 1px solid #eef1f8;">${values.eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Event Format:</td>
                    <td style="text-transform: capitalize; border-bottom: 1px solid #eef1f8;">${values.eventType}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Pricing:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.eventPricingType.toUpperCase()} (${values.price > 0 ? `$${values.price.toFixed(2)}` : 'FREE'})</td>
                  </tr>
                  ${
                    values.ticketCode
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Ticket Code:</td>
                    <td style="font-family: monospace; font-weight: 700; border-bottom: 1px solid #eef1f8;">${values.ticketCode}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Transaction ID:</td>
                    <td style="font-family: monospace; border-bottom: 1px solid #eef1f8;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold;">Booking ID:</td>
                    <td style="font-family: monospace;">${values.bookingId}</td>
                  </tr>
                </table>
              </div>

              <!-- Haitian flag accent divider -->
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>

              <p style="font-size: 14px; line-height: 1.6; color: #6b7280; margin: 0;">
                IFundAyiti Automated Admin Dispatch
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8faff; padding: 20px; border-top: 1px solid #dce8ff; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                &copy; ${new Date().getFullYear()} IFundAyiti. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
    `,
  };
};
