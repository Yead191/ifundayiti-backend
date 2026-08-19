import config from '../config';
import {
  IInquiryUserConfirmation,
  IInquiryAdminNotification,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  const host =
    config.ip_address === '0.0.0.0' ? 'localhost' : config.ip_address;
  const base =
    host && (host.startsWith('http://') || host.startsWith('https://'))
      ? host
      : `http://${host}`;
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1785305810/logo-hubology_1x_tnmfnk.png';
};

export const inquiryUserConfirmation = (values: IInquiryUserConfirmation) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: 'We Received Your Project Inquiry - Hubology',
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #0D1026; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #d1fae5; color: #065f46; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Inquiry Received ✓
                </span>
              </div>
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Thank You for Reaching Out!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you for submitting your project inquiry to Hubology. Our team will review your details and get back to you as soon as possible.
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #173616; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Inquiry Details</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%; border-bottom: 1px solid #f3f4f6;">Name:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.name}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Email:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.email}</td>
                  </tr>
                  ${
                    values.phone
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Phone:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.phone}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.company
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Company:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.company}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Budget:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.budget}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; vertical-align: top;">Project Description:</td>
                    <td style="line-height: 1.5;">${values.projectDescription}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated confirmation email. Please do not reply directly to this email.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Hubology. All rights reserved.
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

export const inquiryAdminNotification = (values: IInquiryAdminNotification) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.adminEmail,
    subject: `New Project Inquiry from ${values.name}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f6f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f4f6f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #0D1026; padding: 35px 20px; border-bottom: 4px solid #bba15c;">
              <img src="${logoUrl}" alt="Hubology Logo" style="display: block; width: 180px; height: auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #173616; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                New Project Inquiry Received
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello Admin,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A new project inquiry has been submitted by <strong>${values.name}</strong>. Here are the details:
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #173616; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Inquiry Information</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%; border-bottom: 1px solid #f3f4f6;">Client Name:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.name}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Client Email:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.email}</td>
                  </tr>
                  ${
                    values.phone
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Phone:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.phone}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.company
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Company:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.company}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6;">Budget Range:</td>
                    <td style="border-bottom: 1px solid #f3f4f6;">${values.budget}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; vertical-align: top;">Project Description:</td>
                    <td style="line-height: 1.5;">${values.projectDescription}</td>
                  </tr>
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>Hubology System Notification</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated admin notification email.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
                &copy; ${new Date().getFullYear()} Hubology. All rights reserved.
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
