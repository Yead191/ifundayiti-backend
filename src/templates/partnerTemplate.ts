import {
  IPartnerApplicationUserConfirmation,
  IPartnerApplicationAdminNotification,
  IPartnerStatusUpdate,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const partnerApplicationUserConfirmation = (
  values: IPartnerApplicationUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: `Partner Application Received - IFundAyiti`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 100px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Partner Application Received
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you for applying to become an official partner of <strong>IFundAyiti</strong> on behalf of <strong>${values.partnerName}</strong>. We have received your application and our team is currently reviewing the details.
              </p>
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 10px; padding: 20px 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">Current Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 16px; font-weight: bold; border-radius: 50px; background-color: #fef3c7; color: #92400e;">
                  Under Review
                </span>
              </div>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Our partnership team evaluates every application to ensure mutual value for the Haitian diaspora community and our ecosystem. You will receive an email update once your application status is finalized.
              </p>
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
                Warm regards,<br />
                <strong style="color: #0033A0;">The IFundAyiti Team</strong>
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

export const partnerApplicationAdminNotification = (
  values: IPartnerApplicationAdminNotification,
) => {
  const logoUrl = getLogoUrl();
  const offersHtml =
    values.offers && values.offers.length > 0
      ? `
        <div style="margin-top: 16px;">
          <strong style="color: #1f2937; font-size: 14px;">Key Offers / Services:</strong>
          <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #4b5563; font-size: 14px; line-height: 1.6;">
            ${values.offers.map(offer => `<li>${offer}</li>`).join('')}
          </ul>
        </div>
      `
      : '';

  return {
    to: values.adminEmail,
    subject: `New Partner Application: ${values.partnerName} - IFundAyiti`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 100px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                New Partner Application
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello <strong>Admin</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A new partnership application has been submitted on the IFundAyiti platform. Here are the submission details:
              </p>
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 10px; padding: 20px 24px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #374151;">
                  <tr>
                    <td style="font-weight: 600; width: 40%; color: #1f2937;">Partner / Org Name:</td>
                    <td style="color: #0033A0; font-weight: 700;">${values.partnerName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #1f2937;">Applicant Name:</td>
                    <td>${values.applicantName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #1f2937;">Applicant Email:</td>
                    <td><a href="mailto:${values.applicantEmail}" style="color: #0033A0; text-decoration: none;">${values.applicantEmail}</a></td>
                  </tr>
                  ${
                    values.contactEmail
                      ? `
                  <tr>
                    <td style="font-weight: 600; color: #1f2937;">Contact Email:</td>
                    <td><a href="mailto:${values.contactEmail}" style="color: #0033A0; text-decoration: none;">${values.contactEmail}</a></td>
                  </tr>`
                      : ''
                  }
                  ${
                    values.contactPhone
                      ? `
                  <tr>
                    <td style="font-weight: 600; color: #1f2937;">Contact Phone:</td>
                    <td>${values.contactPhone}</td>
                  </tr>`
                      : ''
                  }
                  ${
                    values.website
                      ? `
                  <tr>
                    <td style="font-weight: 600; color: #1f2937;">Website:</td>
                    <td><a href="${values.website}" target="_blank" style="color: #0033A0; text-decoration: underline;">${values.website}</a></td>
                  </tr>`
                      : ''
                  }
                </table>
                ${offersHtml}
              </div>
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
                Please visit the Admin Dashboard under <strong>Partners</strong> to review, approve, or reject this application.
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

export const partnerStatusUpdate = (values: IPartnerStatusUpdate) => {
  const logoUrl = getLogoUrl();
  let statusText = values.status;
  let statusStyle = 'background-color: #e5e7eb; color: #374151;';
  let message = `This email is to notify you that your partner application status for <strong>${values.partnerName}</strong> has been updated.`;
  let rejectionReasonHtml = '';

  const normalizedStatus = values.status?.toUpperCase();

  if (normalizedStatus === 'APPROVED') {
    statusText = 'Approved';
    statusStyle = 'background-color: #d1fae5; color: #065f46;';
    message = `Congratulations! Your partner application for <strong>${values.partnerName}</strong> has been officially <strong>Approved</strong>. Your profile and logos are now showcased to our vibrant community across IFundAyiti.`;
  } else if (normalizedStatus === 'REJECTED') {
    statusText = 'Rejected';
    statusStyle = 'background-color: #fee2e2; color: #991b1b;';
    message = `Thank you for your interest in partnering with IFundAyiti. After careful review, we regret to inform you that your partner application for <strong>${values.partnerName}</strong> was not approved at this time.`;
    if (values.rejectionReason) {
      rejectionReasonHtml = `
        <div style="margin-top: 16px; padding: 14px 18px; background-color: #fff5f5; border-left: 4px solid #ef4444; text-align: left; border-radius: 6px;">
          <strong style="color: #991b1b; font-size: 14px; display: block; margin-bottom: 4px;">Reason / Feedback:</strong>
          <p style="color: #b91c1c; font-size: 14px; margin: 0; line-height: 1.4;">${values.rejectionReason}</p>
        </div>
      `;
    }
  } else if (normalizedStatus === 'PENDING') {
    statusText = 'Under Review';
    statusStyle = 'background-color: #fef3c7; color: #92400e;';
    message = `Your partner application for <strong>${values.partnerName}</strong> has been set to <strong>Under Review</strong>.`;
  }

  return {
    to: values.email,
    subject: `Partner Application ${statusText} - IFundAyiti`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 100px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Partner Application Status Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                ${message}
              </p>
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 10px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">Updated Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${statusStyle}">
                  ${statusText}
                </span>
                ${rejectionReasonHtml}
              </div>
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
                Best regards,<br />
                <strong style="color: #0033A0;">The IFundAyiti Team</strong>
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
