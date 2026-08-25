import config from '../config';
import {
  IMembershipSubscriptionUserConfirmation,
  IAdminMembershipNotification,
  ISubscriptionPaymentSuccess,
  ISubscriptionPaymentFailed,
  ISubscriptionCancelled,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const membershipSubscriptionUserConfirmation = (
  values: IMembershipSubscriptionUserConfirmation,
) => {
  const logoUrl = getLogoUrl();
  const statusLabel = values.isTrial
    ? `Active (${values.trialPeriodDays || 0}-Day Free Trial)`
    : 'Active Subscription ✓';

  return {
    to: values.email,
    subject: `Membership Subscribed: ${values.membershipName}`,
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
                <span style="background-color: ${values.isTrial ? '#dbeafe' : '#d1fae5'}; color: ${values.isTrial ? '#1e40af' : '#065f46'}; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  ${statusLabel}
                </span>
              </div>
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Welcome to ${values.membershipName}!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                ${
                  values.isTrial
                    ? `Your free trial for <strong>${values.membershipName}</strong> is now active for <strong>${values.trialPeriodDays} days</strong>${values.trialEndDate ? ` (ends on <strong>${values.trialEndDate}</strong>)` : ''}.`
                    : `Your subscription to <strong>${values.membershipName}</strong> has been successfully activated.`
                } Here are your membership details:
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%; border-bottom: 1px solid #eef1f8;">Membership Plan:</td>
                    <td style="font-weight: bold; color: #0033A0; border-bottom: 1px solid #eef1f8;">${values.membershipName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Billing Cycle:</td>
                    <td style="border-bottom: 1px solid #eef1f8; text-transform: capitalize;">${values.recurring}ly</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Price:</td>
                    <td style="font-weight: bold; color: #0033A0; border-bottom: 1px solid #eef1f8;">$${values.price.toFixed(2)} / ${values.recurring}</td>
                  </tr>
                  ${
                    values.isTrial
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Trial Status:</td>
                    <td style="color: #1e40af; font-weight: bold; border-bottom: 1px solid #eef1f8;">${values.trialPeriodDays}-Day Free Trial ${values.trialEndDate ? `(Ends ${values.trialEndDate})` : ''}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.startDate
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Start Date:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.startDate}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.endDate
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">${values.isTrial ? 'Trial End Date' : 'Subscription End Date'}:</td>
                    <td style="font-weight: bold; color: ${values.isTrial ? '#1e40af' : '#0033A0'}; border-bottom: 1px solid #eef1f8;">${values.endDate}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Auto Renew:</td>
                    <td style="font-weight: bold; color: ${values.autoRenew !== false ? '#166534' : '#b45309'}; border-bottom: 1px solid #eef1f8;">${values.autoRenew !== false ? 'Enabled (Auto-charge)' : 'Disabled (Expires at end of cycle)'}</td>
                  </tr>
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Subscription ID:</td>
                    <td style="font-family: monospace;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>

              ${
                values.features && values.features.length > 0
                  ? `
              <!-- Features Section -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="font-size: 15px; font-weight: 700; color: #166534; margin: 0 0 12px 0;">Included Features:</h3>
                <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #15803d; line-height: 1.8;">
                  ${values.features.map((feature: any) => `<li>${typeof feature === 'object' ? feature.name || JSON.stringify(feature) : feature}</li>`).join('')}
                </ul>
              </div>
              `
                  : ''
              }

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
                This is an automated subscription confirmation email.
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

export const adminMembershipNotification = (
  values: IAdminMembershipNotification,
) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.adminEmail,
    subject: `New Subscription: ${values.membershipName}`,
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
                New Membership Subscription
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello Administrator,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                <strong>${values.customerName}</strong> (${values.customerEmail}) has subscribed to the <strong>${values.membershipName}</strong> plan.
              </p>
              
              <!-- Details Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%; border-bottom: 1px solid #eef1f8;">Customer:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.customerName} (${values.customerEmail})</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Plan:</td>
                    <td style="font-weight: bold; color: #0033A0; border-bottom: 1px solid #eef1f8;">${values.membershipName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Price:</td>
                    <td style="font-weight: bold; color: #0033A0; border-bottom: 1px solid #eef1f8;">$${values.price.toFixed(2)} / ${values.recurring}</td>
                  </tr>
                  ${
                    values.isTrial
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Trial Status:</td>
                    <td style="color: #1e40af; font-weight: bold; border-bottom: 1px solid #eef1f8;">${values.trialPeriodDays}-Day Free Trial ${values.trialEndDate ? `(Ends ${values.trialEndDate})` : ''}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.startDate
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Start Date:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.startDate}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.endDate
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">${values.isTrial ? 'Trial End Date' : 'Subscription End Date'}:</td>
                    <td style="font-weight: bold; color: ${values.isTrial ? '#1e40af' : '#0033A0'}; border-bottom: 1px solid #eef1f8;">${values.endDate}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Auto Renew:</td>
                    <td style="font-weight: bold; color: ${values.autoRenew !== false ? '#166534' : '#b45309'}; border-bottom: 1px solid #eef1f8;">${values.autoRenew !== false ? 'Enabled (Auto-charge)' : 'Disabled (Expires at end of cycle)'}</td>
                  </tr>
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Subscription ID:</td>
                    <td style="font-family: monospace;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
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
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This is an automated administrative subscription notification.
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

export const subscriptionPaymentSuccess = (
  values: ISubscriptionPaymentSuccess,
) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.email,
    subject: `Subscription Payment Received: ${values.membershipName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0033A0 0%, #001f6b 100%); padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #d1fae5; color: #065f46; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Payment Successful ✓
                </span>
              </div>
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Payment Receipt for ${values.membershipName}
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We have successfully received your recurring membership payment for <strong>${values.membershipName}</strong>. Your subscription is active and up to date!
              </p>
              
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%; border-bottom: 1px solid #eef1f8;">Plan:</td>
                    <td style="font-weight: bold; color: #0033A0; border-bottom: 1px solid #eef1f8;">${values.membershipName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Amount Paid:</td>
                    <td style="font-weight: bold; color: #0033A0; border-bottom: 1px solid #eef1f8;">$${values.amountPaid.toFixed(2)}</td>
                  </tr>
                  ${
                    values.nextBillingDate
                      ? `
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Next Billing Date:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${values.nextBillingDate}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.transactionId
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Transaction ID:</td>
                    <td style="font-family: monospace;">${values.transactionId}</td>
                  </tr>
                  `
                      : ''
                  }
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
          <tr>
            <td align="center" style="background-color: #f8faff; padding: 28px 20px; border-top: 1px solid #dce8ff; text-align: center;">
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

export const subscriptionPaymentFailed = (
  values: ISubscriptionPaymentFailed,
) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.email,
    subject: `Payment Failed: ${values.membershipName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0033A0 0%, #001f6b 100%); padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #fee2e2; color: #dc2626; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  Action Required: Payment Failed
                </span>
              </div>
              <h1 style="color: #dc2626; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Payment Failed for ${values.membershipName}
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We were unable to process your recurring subscription payment of <strong>$${values.amountDue.toFixed(2)}</strong> for your <strong>${values.membershipName}</strong> plan.
              </p>
              ${
                values.reason
                  ? `<p style="font-size: 14px; color: #dc2626; background-color: #fef2f2; padding: 12px; border-radius: 6px; margin-bottom: 24px;">Reason: ${values.reason}</p>`
                  : ''
              }
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Please log in to your account and update your payment method to avoid any interruption to your membership services.
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
          <tr>
            <td align="center" style="background-color: #f8faff; padding: 28px 20px; border-top: 1px solid #dce8ff; text-align: center;">
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

export const subscriptionCancelled = (values: ISubscriptionCancelled) => {
  const logoUrl = getLogoUrl();
  const isImmediate = values.cancelType === 'immediate';

  return {
    to: values.email,
    subject: `Subscription Canceled: ${values.membershipName}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #0033A0 0%, #001f6b 100%); padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="background-color: #fef3c7; color: #92400e; padding: 6px 16px; border-radius: 50px; font-size: 14px; font-weight: 600;">
                  ${isImmediate ? 'Subscription Canceled' : 'Auto-Renew Canceled'}
                </span>
              </div>
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Subscription Cancellation Notice
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                ${
                  isImmediate
                    ? `Your subscription for <strong>${values.membershipName}</strong> has been canceled immediately.`
                    : `Auto-renew for your <strong>${values.membershipName}</strong> subscription has been turned off. You will retain access until <strong>${values.endDate || 'the end of your current billing cycle'}</strong>.`
                }
              </p>
              
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="6" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%; border-bottom: 1px solid #eef1f8;">Membership Plan:</td>
                    <td style="font-weight: bold; color: #0033A0; border-bottom: 1px solid #eef1f8;">${values.membershipName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold; border-bottom: 1px solid #eef1f8;">Cancellation Type:</td>
                    <td style="border-bottom: 1px solid #eef1f8;">${isImmediate ? 'Immediate Revocation' : 'Cancel at Period End'}</td>
                  </tr>
                  ${
                    values.endDate && !isImmediate
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Access Valid Until:</td>
                    <td style="font-weight: bold; color: #b45309;">${values.endDate}</td>
                  </tr>
                  `
                      : ''
                  }
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
          <tr>
            <td align="center" style="background-color: #f8faff; padding: 28px 20px; border-top: 1px solid #dce8ff; text-align: center;">
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
