import config from '../config';
import {
  IOrderConfirmation,
  IAdminOrderNotification,
  IOrderStatusUpdate,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const orderConfirmation = (values: IOrderConfirmation) => {
  const logoUrl = getLogoUrl();
  const itemsHtml = values.items
    .map(
      item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #eef1f8; color: #374151; font-weight: 500;">
        ${item.title}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eef1f8; color: #6b7280; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #eef1f8; color: #0033A0; text-align: right; font-weight: 600;">
        $${item.total_price.toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join('');

  return {
    to: values.email,
    subject: `Order Confirmation - #${values.orderId}`,
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
                  Order Confirmed ✓
                </span>
              </div>
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; margin: 0 0 20px 0; text-align: center;">
                Thank You for Your Order!
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                We have received your payment and your order is currently being processed. Here are your order details:
              </p>
              
              <!-- Order Summary Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #0033A0;">#${values.orderId}</td>
                  </tr>
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
                  <tr>
                    <td style="font-weight: bold;">Delivery Address:</td>
                    <td>${values.formattedAddress}</td>
                  </tr>
                  ${
                    values.contactNumber
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Contact Number:</td>
                    <td>${values.contactNumber}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
              </div>

              <!-- Items Table -->
              <h3 style="color: #0033A0; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #dce8ff; padding-bottom: 8px;">
                Ordered Items
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 15px; margin-bottom: 24px;">
                <thead>
                  <tr style="color: #9ca3af; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                    <th align="left" style="padding-bottom: 8px;">Item</th>
                    <th align="center" style="padding-bottom: 8px;">Qty</th>
                    <th align="right" style="padding-bottom: 8px;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Total Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  ${
                    values.productsPrice !== undefined
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Items Subtotal:</td>
                    <td align="right" style="font-weight: 600;">$${values.productsPrice.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.deliveryCharge !== undefined && values.deliveryCharge > 0
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Delivery Charge:</td>
                    <td align="right" style="font-weight: 600;">$${values.deliveryCharge.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.serviceFee !== undefined && values.serviceFee > 0
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Service Fee:</td>
                    <td align="right" style="font-weight: 600;">$${values.serviceFee.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.tax !== undefined && values.tax > 0
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Tax:</td>
                    <td align="right" style="font-weight: 600;">$${values.tax.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.couponCode || values.discountAmount
                      ? `
                  <tr>
                    <td style="font-weight: 500; color: #E4002B;">Discount${values.couponCode ? ` (${values.couponCode})` : ''}:</td>
                    <td align="right" style="color: #E4002B; font-weight: 600;">-${values.discountAmount ? `$${values.discountAmount.toFixed(2)}` : 'Applied'}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-size: 16px; font-weight: bold; color: #0033A0; padding-top: 8px; border-top: 2px solid #dce8ff;">Total Amount Paid:</td>
                    <td align="right" style="font-size: 20px; font-weight: bold; color: #0033A0; padding-top: 8px; border-top: 2px solid #dce8ff;">$${values.totalPrice.toFixed(2)}</td>
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
                This is an automated order confirmation email. Please do not reply directly to this email.
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

export const adminOrderNotification = (values: IAdminOrderNotification) => {
  const logoUrl = getLogoUrl();
  const itemsHtml = values.items
    .map(
      item => `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid #eef1f8; color: #374151;">
        ${item.title}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eef1f8; color: #6b7280; text-align: center;">
        x${item.quantity}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid #eef1f8; color: #374151; text-align: right; font-weight: 600;">
        $${item.total_price.toFixed(2)}
      </td>
    </tr>
  `,
    )
    .join('');

  return {
    to: values.adminEmail,
    subject: `[New Order] #${values.orderId} - $${values.totalPrice.toFixed(2)}`,
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
                New Order Received 🛒
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Hello <strong>${values.adminName}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A new order has been placed on the platform. Please review the details below:
              </p>
              
              <!-- Customer & Order Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <h3 style="margin-top: 0; color: #0033A0; font-size: 15px; border-bottom: 1px solid #dce8ff; padding-bottom: 8px;">Customer &amp; Order Info</h3>
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #0033A0;">#${values.orderId}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Customer Name:</td>
                    <td>${values.customerName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: bold;">Customer Email:</td>
                    <td>${values.customerEmail}</td>
                  </tr>
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
                  <tr>
                    <td style="font-weight: bold;">Shipping Address:</td>
                    <td>${values.formattedAddress}</td>
                  </tr>
                </table>
              </div>

              <!-- Items Table -->
              <h3 style="color: #0033A0; font-size: 16px; margin: 0 0 12px 0; border-bottom: 2px solid #dce8ff; padding-bottom: 8px;">
                Order Items
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="font-size: 14px; margin-bottom: 24px;">
                <thead>
                  <tr style="color: #9ca3af; font-size: 12px; text-transform: uppercase;">
                    <th align="left" style="padding-bottom: 8px;">Item</th>
                    <th align="center" style="padding-bottom: 8px;">Qty</th>
                    <th align="right" style="padding-bottom: 8px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #065f46;">
                  ${
                    values.productsPrice !== undefined
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Items Subtotal:</td>
                    <td align="right" style="font-weight: 600;">$${values.productsPrice.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.deliveryCharge !== undefined && values.deliveryCharge > 0
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Delivery Charge:</td>
                    <td align="right" style="font-weight: 600;">$${values.deliveryCharge.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.serviceFee !== undefined && values.serviceFee > 0
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Service Fee:</td>
                    <td align="right" style="font-weight: 600;">$${values.serviceFee.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.tax !== undefined && values.tax > 0
                      ? `
                  <tr>
                    <td style="font-weight: 500;">Tax:</td>
                    <td align="right" style="font-weight: 600;">$${values.tax.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.couponCode || values.discountAmount
                      ? `
                  <tr>
                    <td style="font-weight: 500; color: #dc2626;">Discount${values.couponCode ? ` (${values.couponCode})` : ''}:</td>
                    <td align="right" style="color: #dc2626; font-weight: 600;">-${values.discountAmount ? `$${values.discountAmount.toFixed(2)}` : 'Applied'}</td>
                  </tr>
                  `
                      : ''
                  }
                  <tr>
                    <td style="font-size: 16px; font-weight: bold; color: #065f46; padding-top: 8px; border-top: 2px solid #a7f3d0;">Total Revenue:</td>
                    <td align="right" style="font-size: 20px; font-weight: bold; color: #065f46; padding-top: 8px; border-top: 2px solid #a7f3d0;">$${values.totalPrice.toFixed(2)}</td>
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
              <p style="font-size: 12px; color: #9ca3af; margin: 0;">
                This is an automated administrative notification from IFundAyiti.
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

export const orderStatusUpdate = (values: IOrderStatusUpdate) => {
  const logoUrl = getLogoUrl();
  let statusBadgeStyle = 'background-color: #dbeafe; color: #1e40af;'; // Default Blue (Processing)
  const statusUpper = values.status.toUpperCase();

  if (statusUpper.includes('DELIVER') || statusUpper.includes('SUCCESS')) {
    statusBadgeStyle = 'background-color: #d1fae5; color: #065f46;';
  } else if (statusUpper.includes('CANCEL')) {
    statusBadgeStyle = 'background-color: #fee2e2; color: #991b1b;';
  } else if (statusUpper.includes('PENDING')) {
    statusBadgeStyle = 'background-color: #fef3c7; color: #92400e;';
  }

  return {
    to: values.email,
    subject: `Order Status Update: #${values.orderId} - ${values.status}`,
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
                Order Status Updated
              </h1>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Dear <strong>${values.name}</strong>,
              </p>
              <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                The status of your order <strong>#${values.orderId}</strong> has been updated to:
              </p>
              
              <!-- Status Badge Box -->
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-radius: 8px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #6b7280; margin: 0 0 10px 0;">New Status</p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 18px; font-weight: bold; border-radius: 50px; ${statusBadgeStyle}">
                  ${values.status}
                </span>
              </div>

              ${
                values.formattedAddress || values.totalPrice !== undefined
                  ? `
              <div style="background-color: #f8faff; border: 1px solid #dce8ff; border-left: 4px solid #0033A0; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 14px; color: #4b5563;">
                  <tr>
                    <td style="font-weight: bold; width: 40%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: bold; color: #0033A0;">#${values.orderId}</td>
                  </tr>
                  ${
                    values.totalPrice !== undefined
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Total Amount:</td>
                    <td style="font-weight: bold;">$${values.totalPrice.toFixed(2)}</td>
                  </tr>
                  `
                      : ''
                  }
                  ${
                    values.formattedAddress
                      ? `
                  <tr>
                    <td style="font-weight: bold;">Shipping Address:</td>
                    <td>${values.formattedAddress}</td>
                  </tr>
                  `
                      : ''
                  }
                </table>
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
                This is an automated status update email. Please do not reply directly to this email.
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
