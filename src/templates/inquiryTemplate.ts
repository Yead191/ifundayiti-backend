import config from '../config';
import {
  IInquiryUserConfirmation,
  IInquiryAdminNotification,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const inquiryUserConfirmation = (values: IInquiryUserConfirmation) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: 'We Received Your Project Inquiry - IFundAyiti',
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0033A0 0%, #001f6b 100%); padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
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
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Thank You for Reaching Out!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you for submitting your project inquiry to IFundAyiti. Our team will review your details and get back to you as soon as possible.
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #0033A0; border-bottom: 1px solid #dce8ff; padding-bottom: 8px;">Inquiry Details</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%; border-bottom: 1px solid #eef1f8;">Name:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.name}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Email:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.email}</td>
                  </tr>
                  ${
                    values.phone
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Phone:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.phone}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.company
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Company:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.company}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Budget:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.budget}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; vertical-align: top;">Project Description:</td>
                    <td style="line-height: 1.5;">${values.projectDescription}</td>
                  </tr>
                </table>
              </div>

              <!-- Haitian flag accent divider -->
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 0 0;">
                Best regards,<br />
                <strong style="color: #0033A0;">The IFundAyiti Team</strong><br />
                <span style="font-size: 13px; color: #6b7280; font-style: italic;">Invest. Build. Change Haiti.</span>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8faff; padding: 28px 20px; border-top: 1px solid #dce8ff; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0; line-height: 1.5;">
                This is an automated confirmation email. Please do not reply directly to this email.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
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

export const inquiryAdminNotification = (values: IInquiryAdminNotification) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.adminEmail,
    subject: `New Project Inquiry from ${values.name}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0033A0 0%, #001f6b 100%); padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                New Project Inquiry Received
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello Admin,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A new project inquiry has been submitted by <strong>${values.name}</strong>. Here are the details:
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #0033A0; border-bottom: 1px solid #dce8ff; padding-bottom: 8px;">Inquiry Information</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%; border-bottom: 1px solid #eef1f8;">Client Name:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.name}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Client Email:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.email}</td>
                  </tr>
                  ${
                    values.phone
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Phone:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.phone}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.company
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Company:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.company}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Budget Range:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.budget}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; vertical-align: top;">Project Description:</td>
                    <td style="line-height: 1.5;">${values.projectDescription}</td>
                  </tr>
                </table>
              </div>

              <!-- Haitian flag accent divider -->
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 0 0;">
                Best regards,<br />
                <strong style="color: #0033A0;">IFundAyiti System Notification</strong><br />
                <span style="font-size: 13px; color: #6b7280; font-style: italic;">Invest. Build. Change Haiti.</span>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8faff; padding: 28px 20px; border-top: 1px solid #dce8ff; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 8px 0; line-height: 1.5;">
                This is an automated admin notification email.
              </p>
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.5;">
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
