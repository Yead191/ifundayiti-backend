import config from '../config';
import { IApplicationStatusUpdate } from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const applicationStatusUpdate = (values: IApplicationStatusUpdate) => {
  const logoUrl = getLogoUrl();
  let statusText = values.status;
  let statusStyle = 'background-color: #e5e7eb; color: #374151;';
  let messageDetailHtml = '';
  let rejectionReasonHtml = '';

  if (values.status === 'submitted') {
    statusText = 'Submitted';
    statusStyle = 'background-color: #f3f4f6; color: #374151;';
  } else if (values.status === 'underReview') {
    statusText = 'Under Review';
    statusStyle = 'background-color: #dbeafe; color: #1e40af;';
  } else if (values.status === 'approved') {
    statusText = 'Approved';
    statusStyle = 'background-color: #d1fae5; color: #065f46;';
    messageDetailHtml = `
      <div style="margin-top: 24px; padding: 16px; background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px;">
        <p style="font-size: 15px; color: #065f46; margin: 0; line-height: 1.5; text-align: center;">
          🎉 <strong>Congratulations!</strong> Your application has been approved. The team will contact you soon with the next steps.
        </p>
      </div>
    `;
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
  } else if (values.status === 'finalist') {
    statusText = 'Finalist';
    statusStyle = 'background-color: #fef3c7; color: #92400e;';
    messageDetailHtml = `
      <div style="margin-top: 24px; padding: 16px; background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 8px;">
        <p style="font-size: 15px; color: #92400e; margin: 0; line-height: 1.5; text-align: center;">
          ✨ <strong>Exciting News!</strong> Your application has progressed to the <strong>Finalist</strong> stage. Congratulations on making it this far!
        </p>
      </div>
    `;
  } else if (values.status === 'winner') {
    statusText = 'Winner';
    statusStyle =
      'background-color: #fefce8; color: #713f12; border: 1px solid #ca8a04;';
    messageDetailHtml = `
      <div style="margin-top: 24px; padding: 16px; background-color: #fefce8; border: 1px solid #fef08a; border-radius: 8px;">
        <p style="font-size: 15px; color: #713f12; margin: 0; line-height: 1.5; text-align: center;">
          🏆 <strong>Phenomenal!</strong> Your application has been selected as a <strong>Winner</strong>! We are absolutely thrilled to support your project.
        </p>
      </div>
    `;
  } else if (values.status === 'archived') {
    statusText = 'Archived';
    statusStyle = 'background-color: #f3f4f6; color: #374151;';
  }

  const data = {
    to: values.email,
    subject: `IFundAyiti Application Status Update: ${statusText}`,
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
                Application Status Update
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you for applying to the <strong>IFundAyiti</strong> grant program. We are writing to notify you that the status of your application for the project <strong>"${values.projectName}"</strong> has been updated.
              </p>
              
              <!-- Status Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 13px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">Current Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${statusStyle}">
                  ${statusText}
                </span>
                
                ${rejectionReasonHtml}
              </div>
              
              ${messageDetailHtml}

              <!-- Haitian flag accent divider -->
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>
              
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 24px 0 0 0;">
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
                This is an automated email notification regarding your application status. Please do not reply directly to this email.
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
  return data;
};
