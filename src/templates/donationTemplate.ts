import config from '../config';
import { IDonationReceipt, IDonationReceived } from '../types/emailTamplate';

const getLogoUrl = () => {
  const host =
    config.ip_address === '0.0.0.0' ? 'localhost' : config.ip_address;
  const base =
    host && (host.startsWith('http://') || host.startsWith('https://'))
      ? host
      : `http://${host}`;
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1785305810/logo-hubology_1x_tnmfnk.png';
};

export const donationReceipt = (values: IDonationReceipt) => {
  const logoUrl = getLogoUrl();
  const data = {
    to: values.donorEmail,
    subject: `Thank you for your donation to iFundAyiti!`,
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
                Thank You for Your Donation!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.donorName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you so much for your generous support. Your contribution to the <strong>iFundAyiti</strong> program fund helps us continue our mission and support impactful projects. We truly appreciate your generosity.
              </p>
              
              <!-- Donation Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #173616; border-bottom: 1px solid #e5e7eb; padding-bottom: 8px;">Donation Receipt</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 15px; color: #4b5563;">
                  <tr>
                    <td width="40%" style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Name:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Email:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Amount Contributed:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0; font-size: 18px; color: #173616; font-weight: bold;">$${values.amount.toFixed(2)}</td>
                  </tr>
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold; padding-left: 0;">Transaction ID:</td>
                    <td style="word-break: break-all; padding-right: 0; font-family: monospace; font-size: 13px;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology & iFundAyiti Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated receipt for your records. Please do not reply directly to this email.
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
  return data;
};

export const donationReceived = (values: IDonationReceived) => {
  const logoUrl = getLogoUrl();
  const data = {
    to: values.adminEmail,
    subject: `New Donation Received: $${values.amount} from ${values.donorName}`,
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
                New Donation Received!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.adminName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Great news! A new donation has been received for the <strong>iFundAyiti</strong> program fund.
              </p>
              
              <!-- Donation Details Box -->
              <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 15px; color: #4b5563;">
                  <tr>
                    <td width="40%" style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Name:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donor Email:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0;">${values.donorEmail}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #f3f4f6; padding-left: 0;">Donation Amount:</td>
                    <td style="border-bottom: 1px solid #f3f4f6; padding-right: 0; font-size: 18px; color: #173616; font-weight: bold;">$${values.amount.toFixed(2)}</td>
                  </tr>
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold; padding-left: 0;">Transaction ID:</td>
                    <td style="word-break: break-all; padding-right: 0; font-family: monospace; font-size: 13px;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 28px 0 0 0;">
                Best regards,<br />
                <strong>The Hubology & iFundAyiti Team</strong>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f9fafb; padding: 30px 20px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0 0 10px 0; line-height: 1.5;">
                This is an automated administrative notification. Please do not reply directly to this email.
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
  return data;
};
