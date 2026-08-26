import config from '../config';
import {
  IVendorStatusUpdate,
  IVendorCredentials,
  IVendorProfileVisibilityUpdate,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const vendorStatusUpdate = (values: IVendorStatusUpdate) => {
  const logoUrl = getLogoUrl();
  const statusUpper = values.status ? values.status.toUpperCase() : '';
  let statusBadgeStyle = 'background-color: #f3f4f6; color: #374151;';
  let messageDetailHtml = '';

  if (values.status === 'approved' || values.status === 'active') {
    statusBadgeStyle = 'background-color: #d1fae5; color: #065f46;';
    messageDetailHtml = `
      <div style="margin-top: 20px; padding: 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
        <p style="font-size: 15px; color: #065f46; margin: 0; line-height: 1.5; text-align: center;">
          🎉 <strong>Congratulations!</strong> Your vendor status has been updated to <strong>${statusUpper}</strong>. You can now access all vendor features.
        </p>
      </div>
    `;
  } else if (values.status === 'rejected') {
    statusBadgeStyle = 'background-color: #fee2e2; color: #991b1b;';
    if (values.rejectionReason) {
      messageDetailHtml = `
        <div style="margin-top: 20px; padding: 16px; background-color: #fff5f5; border-left: 4px solid #ef4444; border-radius: 4px; text-align: left;">
          <strong style="color: #991b1b; font-size: 14px; display: block; margin-bottom: 4px;">Reason for Rejection:</strong>
          <p style="color: #b91c1c; font-size: 14px; margin: 0; line-height: 1.4;">${values.rejectionReason}</p>
        </div>
      `;
    }
  } else if (values.status === 'blocked' || values.status === 'delete') {
    statusBadgeStyle = 'background-color: #fee2e2; color: #991b1b;';
  }

  return {
    to: values.email,
    subject: `Vendor Account Status Updated: ${statusUpper}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Vendor Account Status Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                The status of your vendor account has been updated by the administrator:
              </p>
              
              <!-- Status Badge Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">New Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${statusBadgeStyle}">
                  ${statusUpper}
                </span>
              </div>

              ${messageDetailHtml}

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
                This is an automated administrative email. Please do not reply directly to this email.
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

export const vendorCredentials = (values: IVendorCredentials) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: 'Your IFundAyiti Vendor Account Credentials',
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #d1fae5; color: #065f46; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Vendor Account Created ✓
                </span>
              </div>
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Welcome to IFundAyiti Vendor Portal
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                An administrator has created a Vendor account for you on IFundAyiti. Here are your login credentials:
              </p>
              
              <!-- Credentials Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="8" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 35%; border-bottom: 1px solid #eef1f8;">Email:</td>
                    <td style="border-bottom: 1px solid #eef1f8; font-weight: 600; color: #0033A0;">${values.email}</td>
                  </tr>
                  ${
                    values.password
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Password:</td>
                    <td style="font-family: monospace; font-size: 15px; font-weight: 600; color: #0033A0;">${values.password}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>

              <!-- Login Button CTA -->
              <div style="text-align: center; margin: 28px 0 16px 0;">
                <a href="${config.frontend_url}/login" style="background: linear-gradient(135deg, #0033A0 0%, #001f6b 100%); color: #ffffff; border-bottom: 3px solid #E4002B; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; display: inline-block;">
                  Log In to Vendor Portal
                </a>
              </div>
              <p style="font-size: 13px; text-align: center; color: #6b7280; margin: 0 0 24px 0;">
                Or copy and paste this link into your browser: <br />
                <a href="${config.frontend_url}/login" style="color: #0033A0; word-break: break-all;">${config.frontend_url}/login</a>
              </p>

              <p style="font-size: 14px; line-height: 1.5; color: #6b7280; margin: 20px 0 0 0;">
                Please log in to your vendor dashboard and change your password after your initial sign in.
              </p>

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
                This is an automated vendor account creation email. Please do not reply directly to this email.
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

export const vendorProfileVisibilityUpdate = (
  values: IVendorProfileVisibilityUpdate,
) => {
  const logoUrl = getLogoUrl();
  const visibilityText = values.isProfileVisible ? 'Visible' : 'Hidden';
  const badgeStyle = values.isProfileVisible
    ? 'background-color: #d1fae5; color: #065f46;'
    : 'background-color: #fef3c7; color: #92400e;';

  const detailMessage = values.isProfileVisible
    ? 'Your vendor profile has been made <strong>visible</strong> on the public directory by the administrator. Clients can now view your services and profile details.'
    : 'Your vendor profile visibility has been set to <strong>hidden</strong> by the administrator. Your profile will temporarily not appear in public vendor listings.';

  return {
    to: values.email,
    subject: `Vendor Profile Visibility Updated: ${visibilityText}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Profile Visibility Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                ${detailMessage}
              </p>
              
              <!-- Visibility Status Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">Current Directory Visibility</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${badgeStyle}">
                  ${visibilityText}
                </span>
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
                This is an automated administrative notification. Please do not reply directly to this email.
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
