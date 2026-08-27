import { ITeamMemberCreated, ITeamStatusUpdate, IVolunteerApplicationAdminNotification } from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const teamMemberCreated = (values: ITeamMemberCreated) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.email,
    subject: `Welcome to the IFundAyiti Team!`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Welcome to the Team!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We are thrilled to welcome you to the IFundAyiti team as a <strong>${values.category}</strong>! Your account and profile have been successfully set up by our administration.
              </p>
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
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

export const teamStatusUpdate = (values: ITeamStatusUpdate) => {
  const logoUrl = getLogoUrl();
  let statusText = values.status;
  let statusStyle = 'background-color: #e5e7eb; color: #374151;';
  let rejectionReasonHtml = '';

  if (values.status === 'active') {
    statusText = 'Active';
    statusStyle = 'background-color: #d1fae5; color: #065f46;';
  } else if (values.status === 'rejected') {
    statusText = 'Rejected';
    statusStyle = 'background-color: #fee2e2; color: #991b1b;';
    if (values.rejectionReason) {
      rejectionReasonHtml = `
        <div style="margin-top: 16px; padding: 12px 16px; background-color: #fff5f5; border-left: 4px solid #ef4444; text-align: left; border-radius: 4px;">
          <strong style="color: #991b1b; font-size: 14px; display: block; margin-bottom: 4px;">Reason for Rejection:</strong>
          <p style="color: #b91c1c; font-size: 14px; margin: 0; line-height: 1.4;">${values.rejectionReason}</p>
        </div>
      `;
    }
  } else if (values.status === 'blocked') {
    statusText = 'Blocked';
    statusStyle = 'background-color: #fef3c7; color: #92400e;';
  }

  return {
    to: values.email,
    subject: `Team Status Update: ${statusText} - IFundAyiti`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Account Status Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                This email is to notify you that your status as a team member on IFundAyiti has been updated.
              </p>
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">Current Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${statusStyle}">
                  ${statusText}
                </span>
                ${rejectionReasonHtml}
              </div>
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
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

export const volunteerApplicationAdminNotification = (values: IVolunteerApplicationAdminNotification) => {
  const logoUrl = getLogoUrl();
  return {
    to: values.adminEmail,
    subject: `New Volunteer Application: ${values.applicantName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                New Volunteer Application
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello <strong>${values.adminName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A new user has submitted an application to join the IFundAyiti team as a volunteer.
              </p>
              <ul style="font-size: 16px; color: #4b5563; margin: 0 0 20px 0; line-height: 1.6; text-align: left;">
                <li><strong>Name:</strong> ${values.applicantName}</li>
                <li><strong>Email:</strong> ${values.applicantEmail}</li>
                <li><strong>Location:</strong> ${values.location}</li>
              </ul>
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
                Please log in to the admin dashboard to review their application.
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
