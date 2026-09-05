import config from '../config';
import {
  IOrderConfirmation,
  IAdminOrderNotification,
  IOrderStatusUpdate,
  IPreOrderReady,
} from '../types/emailTamplate';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export const orderConfirmation = (values: IOrderConfirmation) => {
  const logoUrl = getLogoUrl();
  const subtotal =
    values.subtotal !== undefined
      ? values.subtotal
      : values.productsPrice !== undefined
        ? values.productsPrice
        : values.totalPrice;

  const itemsHtml = values.items
    .map(item => {
      const title = item.name || item.title || 'Apparel Item';
      const variantDesc = [item.size, item.color].filter(Boolean).join(' / ');
      const unitPrice = item.price ?? item.unit_price ?? (item.total_price / (item.quantity || 1));

      return `
    <tr>
      <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
        <div style="font-size: 14px; font-weight: 700; color: #05281d; line-height: 1.3;">
          ${title}
        </div>
        ${
          variantDesc
            ? `<div style="font-size: 12px; color: #64748b; margin-top: 3px;">
                Variant: <strong style="color: #334155;">${variantDesc}</strong>
              </div>`
            : ''
        }
        ${
          item.isPreOrder
            ? `<span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 10px; font-weight: 700; text-transform: uppercase; padding: 2px 8px; border-radius: 4px; margin-top: 4px;">
                Pre-Order
              </span>`
            : ''
        }
        <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
          $${Number(unitPrice).toFixed(2)} each
        </div>
      </td>
      <td style="padding: 14px 12px; border-bottom: 1px solid #f1f5f9; text-align: center; vertical-align: middle; color: #05281d; font-weight: 600; font-size: 14px;">
        x${item.quantity}
      </td>
      <td style="padding: 14px 0; border-bottom: 1px solid #f1f5f9; text-align: right; vertical-align: middle; color: #05281d; font-weight: 700; font-size: 14px;">
        $${Number(item.total_price).toFixed(2)}
      </td>
    </tr>
  `;
    })
    .join('');

  return {
    to: values.email,
    subject: `Order Confirmation #${values.orderId} - IFundAyiti`,
    html: `
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 12px; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(5, 40, 29, 0.08); border: 1px solid #e2e8f0; margin: 0 auto;">
          
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #05281d 0%, #0b3d2e 50%, #041c15 100%); padding: 36px 24px; text-align: center;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 170px; height: auto; margin: 0 auto;" />
              <div style="margin-top: 14px;">
                <span style="display: inline-block; background-color: rgba(237, 224, 203, 0.2); border: 1px solid rgba(237, 224, 203, 0.4); color: #ede0cb; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 14px; border-radius: 50px;">
                  Order Confirmed
                </span>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="color: #05281d; font-size: 22px; font-weight: 800; margin: 0 0 10px 0; text-align: center; letter-spacing: -0.5px;">
                Thank You for Your Order!
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0; text-align: center;">
                Dear <strong>${values.name}</strong>, we have received your payment and your order is currently being processed.
              </p>

              <!-- Order Overview Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="font-weight: 600; color: #64748b; width: 40%;">Order Number:</td>
                    <td style="font-family: monospace; font-weight: 700; color: #05281d;">#${values.orderId}</td>
                  </tr>
                  ${
                    values.transactionId
                      ? `<tr>
                          <td style="font-weight: 600; color: #64748b;">Transaction:</td>
                          <td style="font-family: monospace; color: #475569;">${values.transactionId}</td>
                        </tr>`
                      : ''
                  }
                  <tr>
                    <td style="font-weight: 600; color: #64748b;">Shipping Address:</td>
                    <td style="font-weight: 500; color: #05281d;">${values.formattedAddress}</td>
                  </tr>
                  ${
                    values.contactNumber
                      ? `<tr>
                          <td style="font-weight: 600; color: #64748b;">Contact Phone:</td>
                          <td style="font-weight: 500; color: #05281d;">${values.contactNumber}</td>
                        </tr>`
                      : ''
                  }
                </table>
              </div>

              <!-- Items Table -->
              <div style="margin-bottom: 24px;">
                <div style="border-bottom: 2px solid #05281d; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #05281d;">
                    Items Ordered
                  </span>
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <thead>
                    <tr style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0;">
                      <th align="left" style="padding-bottom: 8px;">Product</th>
                      <th align="center" style="padding-bottom: 8px;">Qty</th>
                      <th align="right" style="padding-bottom: 8px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <!-- Price Breakdown Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 28px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="5" style="font-size: 13px; color: #475569;">
                  <tr>
                    <td style="font-weight: 500;">Products Subtotal:</td>
                    <td align="right" style="font-weight: 600; color: #05281d;">$${Number(subtotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Delivery Charge:</td>
                    <td align="right" style="font-weight: 600; color: #05281d;">
                      ${
                        values.deliveryCharge !== undefined && values.deliveryCharge > 0
                          ? `$${Number(values.deliveryCharge).toFixed(2)}`
                          : '<strong style="color: #059669;">Free</strong>'
                      }
                    </td>
                  </tr>
                  ${
                    values.serviceFee !== undefined && values.serviceFee > 0
                      ? `<tr>
                          <td style="font-weight: 500;">Service Fee:</td>
                          <td align="right" style="font-weight: 600; color: #05281d;">$${Number(values.serviceFee).toFixed(2)}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    values.tax !== undefined && values.tax > 0
                      ? `<tr>
                          <td style="font-weight: 500;">Estimated Tax (8.875%):</td>
                          <td align="right" style="font-weight: 600; color: #05281d;">$${Number(values.tax).toFixed(2)}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    values.discountAmount && values.discountAmount > 0
                      ? `<tr>
                          <td style="font-weight: 500; color: #dc2626;">Discount Applied${values.couponCode ? ` (${values.couponCode})` : ''}:</td>
                          <td align="right" style="font-weight: 700; color: #dc2626;">-$${Number(values.discountAmount).toFixed(2)}</td>
                        </tr>`
                      : ''
                  }
                  <tr>
                    <td style="font-size: 15px; font-weight: 800; color: #05281d; padding-top: 12px; border-top: 2px solid #e2e8f0;">
                      Total Paid:
                    </td>
                    <td align="right" style="font-size: 18px; font-weight: 800; color: #05281d; padding-top: 12px; border-top: 2px solid #e2e8f0;">
                      $${Number(values.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>

              <!-- Community Impact Note -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 14px 16px; margin-bottom: 24px; text-align: center;">
                <p style="margin: 0; font-size: 12px; color: #166534; line-height: 1.5; font-weight: 500;">
                  🌿 <strong>100% Impact:</strong> Every purchase directly funds equity-free micro-grants for Haitian entrepreneurs and community innovators.
                </p>
              </div>

              <div style="height: 2px; background-color: #f1f5f9; margin: 24px 0;"></div>

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                Warm regards,<br />
                <strong style="color: #05281d;">The IFundAyiti Team</strong><br />
                <span style="font-size: 12px; color: #94a3b8; font-style: italic;">Invest. Build. Change Haiti.</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 24px 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.5;">
                Need help with your order? Contact us at support@ifundayiti.com.
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
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
  const subtotal =
    values.subtotal !== undefined
      ? values.subtotal
      : values.productsPrice !== undefined
        ? values.productsPrice
        : values.totalPrice;

  const itemsHtml = values.items
    .map(item => {
      const title = item.name || item.title || 'Apparel Item';
      const variantDesc = [item.size, item.color].filter(Boolean).join(' / ');
      const unitPrice =
        item.price ??
        item.unit_price ??
        item.total_price / (item.quantity || 1);

      return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top;">
        <div style="font-size: 13px; font-weight: 700; color: #05281d;">
          ${title}
        </div>
        ${
          variantDesc
            ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">
                Variant: <strong style="color: #334155;">${variantDesc}</strong>
              </div>`
            : ''
        }
        ${
          item.isPreOrder
            ? `<span style="display: inline-block; background-color: #fef3c7; color: #92400e; font-size: 9px; font-weight: 700; text-transform: uppercase; padding: 2px 6px; border-radius: 4px; margin-top: 2px;">
                Pre-Order
              </span>`
            : ''
        }
        <div style="font-size: 11px; color: #94a3b8;">
          $${Number(unitPrice).toFixed(2)} each
        </div>
      </td>
      <td style="padding: 12px 8px; border-bottom: 1px solid #f1f5f9; text-align: center; vertical-align: middle; color: #05281d; font-weight: 600; font-size: 13px;">
        x${item.quantity}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #f1f5f9; text-align: right; vertical-align: middle; color: #05281d; font-weight: 700; font-size: 13px;">
        $${Number(item.total_price).toFixed(2)}
      </td>
    </tr>
  `;
    })
    .join('');

  return {
    to: values.adminEmail,
    subject: `[New Store Order] #${values.orderId} - $${Number(values.totalPrice).toFixed(2)} (${values.customerName})`,
    html: `
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 12px; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(5, 40, 29, 0.08); border: 1px solid #e2e8f0; margin: 0 auto;">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #05281d 0%, #0b3d2e 50%, #041c15 100%); padding: 32px 24px; text-align: center;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 160px; height: auto; margin: 0 auto;" />
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(237, 224, 203, 0.2); border: 1px solid rgba(237, 224, 203, 0.4); color: #ede0cb; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 14px; border-radius: 50px;">
                  New Order Notification
                </span>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px 24px 30px;">
              <h1 style="color: #05281d; font-size: 20px; font-weight: 800; margin: 0 0 8px 0; text-align: center;">
                New Order Received 🛒
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 20px 0; text-align: center;">
                Hello <strong>${values.adminName}</strong>, a new order has been paid and confirmed on the platform.
              </p>

              <!-- Customer & Order Summary Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #05281d; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 12px;">
                  Customer & Shipping Information
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="font-weight: 600; color: #64748b; width: 38%;">Order ID:</td>
                    <td style="font-family: monospace; font-weight: 700; color: #05281d;">#${values.orderId}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #64748b;">Customer Name:</td>
                    <td style="font-weight: 700; color: #05281d;">${values.customerName}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 600; color: #64748b;">Customer Email:</td>
                    <td style="color: #05281d;">${values.customerEmail}</td>
                  </tr>
                  ${
                    values.customerPhone
                      ? `<tr>
                          <td style="font-weight: 600; color: #64748b;">Customer Phone:</td>
                          <td style="color: #05281d;">${values.customerPhone}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    values.transactionId
                      ? `<tr>
                          <td style="font-weight: 600; color: #64748b;">Transaction ID:</td>
                          <td style="font-family: monospace; color: #475569;">${values.transactionId}</td>
                        </tr>`
                      : ''
                  }
                  <tr>
                    <td style="font-weight: 600; color: #64748b;">Delivery Address:</td>
                    <td style="color: #05281d;">${values.formattedAddress}</td>
                  </tr>
                </table>
              </div>

              <!-- Items Table -->
              <div style="margin-bottom: 24px;">
                <div style="border-bottom: 2px solid #05281d; padding-bottom: 8px; margin-bottom: 12px;">
                  <span style="font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #05281d;">
                    Order Items
                  </span>
                </div>
                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                  <thead>
                    <tr style="color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #e2e8f0;">
                      <th align="left" style="padding-bottom: 8px;">Product</th>
                      <th align="center" style="padding-bottom: 8px;">Qty</th>
                      <th align="right" style="padding-bottom: 8px;">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${itemsHtml}
                  </tbody>
                </table>
              </div>

              <!-- Price Breakdown Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #475569;">
                  <tr>
                    <td style="font-weight: 500;">Items Subtotal:</td>
                    <td align="right" style="font-weight: 600; color: #05281d;">$${Number(subtotal).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td style="font-weight: 500;">Delivery Fee:</td>
                    <td align="right" style="font-weight: 600; color: #05281d;">
                      ${
                        values.deliveryCharge !== undefined && values.deliveryCharge > 0
                          ? `$${Number(values.deliveryCharge).toFixed(2)}`
                          : '<strong style="color: #059669;">Free</strong>'
                      }
                    </td>
                  </tr>
                  ${
                    values.serviceFee !== undefined && values.serviceFee > 0
                      ? `<tr>
                          <td style="font-weight: 500;">Service Fee:</td>
                          <td align="right" style="font-weight: 600; color: #05281d;">$${Number(values.serviceFee).toFixed(2)}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    values.tax !== undefined && values.tax > 0
                      ? `<tr>
                          <td style="font-weight: 500;">Tax (8.875%):</td>
                          <td align="right" style="font-weight: 600; color: #05281d;">$${Number(values.tax).toFixed(2)}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    values.discountAmount && values.discountAmount > 0
                      ? `<tr>
                          <td style="font-weight: 500; color: #dc2626;">Discount Applied:</td>
                          <td align="right" style="font-weight: 700; color: #dc2626;">-$${Number(values.discountAmount).toFixed(2)}</td>
                        </tr>`
                      : ''
                  }
                  <tr>
                    <td style="font-size: 15px; font-weight: 800; color: #05281d; padding-top: 10px; border-top: 2px solid #e2e8f0;">
                      Total Revenue:
                    </td>
                    <td align="right" style="font-size: 18px; font-weight: 800; color: #05281d; padding-top: 10px; border-top: 2px solid #e2e8f0;">
                      $${Number(values.totalPrice).toFixed(2)}
                    </td>
                  </tr>
                </table>
              </div>

              <p style="font-size: 13px; line-height: 1.6; color: #64748b; margin: 0;">
                Best regards,<br />
                <strong style="color: #05281d;">IFundAyiti System Notification</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0;">
                This is an automated administrative alert from IFundAyiti.
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
  const statusUpper = values.status.toUpperCase();

  let badgeBg = '#dbeafe';
  let badgeText = '#1e40af';

  if (statusUpper.includes('DELIVER') || statusUpper.includes('SUCCESS') || statusUpper.includes('CONFIRM')) {
    badgeBg = '#d1fae5';
    badgeText = '#065f46';
  } else if (statusUpper.includes('CANCEL')) {
    badgeBg = '#fee2e2';
    badgeText = '#991b1b';
  } else if (statusUpper.includes('PENDING')) {
    badgeBg = '#fef3c7';
    badgeText = '#92400e';
  } else if (statusUpper.includes('SHIP')) {
    badgeBg = '#e0e7ff';
    badgeText = '#3730a3';
  }

  const itemsHtml = values.items && values.items.length > 0
    ? values.items
        .map(item => {
          const title = item.name || item.title || 'Apparel Item';
          const variantDesc = [item.size, item.color].filter(Boolean).join(' / ');
          return `
            <tr>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-size: 13px; color: #05281d;">
                <strong>${title}</strong> ${variantDesc ? `<span style="color: #64748b;">(${variantDesc})</span>` : ''}
              </td>
              <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; text-align: right; font-size: 13px; color: #64748b;">
                x${item.quantity} · $${Number(item.total_price).toFixed(2)}
              </td>
            </tr>
          `;
        })
        .join('')
    : '';

  return {
    to: values.email,
    subject: `Order Status Update: #${values.orderId} is now ${values.status.toUpperCase()}`,
    html: `
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 12px; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(5, 40, 29, 0.08); border: 1px solid #e2e8f0; margin: 0 auto;">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #05281d 0%, #0b3d2e 50%, #041c15 100%); padding: 32px 24px; text-align: center;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 160px; height: auto; margin: 0 auto;" />
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(237, 224, 203, 0.2); border: 1px solid rgba(237, 224, 203, 0.4); color: #ede0cb; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 14px; border-radius: 50px;">
                  Status Update
                </span>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="color: #05281d; font-size: 22px; font-weight: 800; margin: 0 0 10px 0; text-align: center;">
                Order Status Updated
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0; text-align: center;">
                Dear <strong>${values.name}</strong>, the status of your order <strong>#${values.orderId}</strong> has been updated.
              </p>

              <!-- Status Badge Box -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 24px;">
                <p style="font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; margin: 0 0 8px 0; font-weight: 600;">
                  Current Status
                </p>
                <span style="display: inline-block; padding: 8px 24px; font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; border-radius: 50px; background-color: ${badgeBg}; color: ${badgeText};">
                  ${values.status}
                </span>
              </div>

              <!-- Order Summary Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="font-weight: 600; color: #64748b; width: 40%;">Order Number:</td>
                    <td style="font-family: monospace; font-weight: 700; color: #05281d;">#${values.orderId}</td>
                  </tr>
                  ${
                    values.totalPrice !== undefined
                      ? `<tr>
                          <td style="font-weight: 600; color: #64748b;">Order Total:</td>
                          <td style="font-weight: 700; color: #05281d;">$${Number(values.totalPrice).toFixed(2)}</td>
                        </tr>`
                      : ''
                  }
                  ${
                    values.formattedAddress
                      ? `<tr>
                          <td style="font-weight: 600; color: #64748b;">Delivery Destination:</td>
                          <td style="color: #05281d;">${values.formattedAddress}</td>
                        </tr>`
                      : ''
                  }
                </table>

                ${
                  itemsHtml
                    ? `
                  <div style="border-top: 1px solid #e2e8f0; margin-top: 12px; padding-top: 12px;">
                    <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 8px;">
                      Items Summary
                    </div>
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      ${itemsHtml}
                    </table>
                  </div>
                `
                    : ''
                }
              </div>

              <div style="height: 2px; background-color: #f1f5f9; margin: 24px 0;"></div>

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                Warm regards,<br />
                <strong style="color: #05281d;">The IFundAyiti Team</strong><br />
                <span style="font-size: 12px; color: #94a3b8; font-style: italic;">Invest. Build. Change Haiti.</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 24px 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.5;">
                Need help with your order? Contact us at support@ifundayiti.com.
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
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

export const preOrderReady = (values: IPreOrderReady) => {
  const logoUrl = getLogoUrl();

  return {
    to: values.email,
    subject: `Your Pre-Ordered Item is Ready! #${values.orderId} - IFundAyiti`,
    html: `
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 32px 12px; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc;">
    <tr>
      <td align="center">
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(5, 40, 29, 0.08); border: 1px solid #e2e8f0; margin: 0 auto;">
          <!-- Header Banner -->
          <tr>
            <td align="center" style="background: linear-gradient(135deg, #05281d 0%, #0b3d2e 50%, #041c15 100%); padding: 32px 24px; text-align: center;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 160px; height: auto; margin: 0 auto;" />
              <div style="margin-top: 12px;">
                <span style="display: inline-block; background-color: rgba(237, 224, 203, 0.2); border: 1px solid rgba(237, 224, 203, 0.4); color: #ede0cb; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 4px 14px; border-radius: 50px;">
                  Pre-Order Arrival
                </span>
              </div>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <h1 style="color: #05281d; font-size: 22px; font-weight: 800; margin: 0 0 10px 0; text-align: center;">
                Great News! Your Pre-Order is Ready 🎉
              </h1>
              <p style="font-size: 14px; line-height: 1.6; color: #64748b; margin: 0 0 24px 0; text-align: center;">
                Dear <strong>${values.name}</strong>, your pre-ordered merchandise has completed production, arrived at our facility, and is now prepared for shipping.
              </p>

              <!-- Ready Item Box -->
              <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 16px; padding: 20px; margin-bottom: 24px;">
                <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #166534; margin-bottom: 8px;">
                  Item Prepared for Dispatch
                </div>
                <div style="font-size: 16px; font-weight: 800; color: #05281d; margin-bottom: 6px;">
                  ${values.productName}
                </div>
                <div style="font-size: 13px; color: #166534; font-weight: 600;">
                  Size: <strong>${values.size}</strong> &nbsp;·&nbsp; Color: <strong>${values.color}</strong> &nbsp;·&nbsp; Quantity: <strong>${values.quantity}</strong>
                </div>
              </div>

              <!-- Order Summary Card -->
              <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; margin-bottom: 24px;">
                <table width="100%" border="0" cellspacing="0" cellpadding="4" style="font-size: 13px; color: #334155;">
                  <tr>
                    <td style="font-weight: 600; color: #64748b; width: 40%;">Order Number:</td>
                    <td style="font-family: monospace; font-weight: 700; color: #05281d;">#${values.orderId}</td>
                  </tr>
                  ${
                    values.formattedAddress
                      ? `<tr>
                          <td style="font-weight: 600; color: #64748b;">Delivery Address:</td>
                          <td style="color: #05281d;">${values.formattedAddress}</td>
                        </tr>`
                      : ''
                  }
                </table>
              </div>

              <div style="height: 2px; background-color: #f1f5f9; margin: 24px 0;"></div>

              <p style="font-size: 14px; line-height: 1.6; color: #475569; margin: 0;">
                Warm regards,<br />
                <strong style="color: #05281d;">The IFundAyiti Team</strong><br />
                <span style="font-size: 12px; color: #94a3b8; font-style: italic;">Invest. Build. Change Haiti.</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #f8fafc; padding: 24px 20px; border-top: 1px solid #e2e8f0; text-align: center;">
              <p style="font-size: 11px; color: #94a3b8; margin: 0 0 6px 0; line-height: 1.5;">
                Need help with your order? Contact us at support@ifundayiti.com.
              </p>
              <p style="font-size: 11px; color: #94a3b8; margin: 0; line-height: 1.5;">
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
