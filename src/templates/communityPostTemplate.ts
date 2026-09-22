import config from '../config';

const getLogoUrl = () => {
  return 'https://res.cloudinary.com/dknmebeee/image/upload/v1787648884/ifundayiti-logo_pxyeoe.png';
};

export interface ICommunityPostEmailData {
  userName: string;
  userEmail: string;
  postTitle?: string;
  postContent: string;
  authorName: string;
  postId: string;
}

export const communityPostTemplate = (data: ICommunityPostEmailData) => {
  const logoUrl = getLogoUrl();
  const discussionUrl = `${config.frontend_url || 'https://ifundayiti.com'}/community/${data.postId}`;
  const displayTitle = data.postTitle || 'New Community Discussion';

  // Sanitize and create excerpt for content
  const plainText = data.postContent.replace(/<[^>]*>?/gm, '').trim();
  const excerpt =
    plainText.length > 200 ? `${plainText.substring(0, 200)}...` : plainText;

  return {
    to: data.userEmail,
    subject: `💬 New Forum Discussion: ${displayTitle}`,
    html: `
<body style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f4f8; margin: 0; padding: 40px 0; color: #333333; -webkit-font-smoothing: antialiased;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f0f4f8;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 30px rgba(0,51,160,0.10); margin: 30px auto;">
          <!-- Header/Logo Section -->
          <tr>
            <td align="center" style="background-color: #EDE0CB; padding: 36px 20px 28px 20px; border-bottom: 4px solid #E4002B;">
              <img src="${logoUrl}" alt="IFundAyiti Logo" style="display: block; width: 110px; height: auto; margin: 0 auto;" />
            </td>
          </tr>
          <!-- Body Content -->
          <tr>
            <td style="padding: 40px 40px 30px 40px;">
              <span style="display: inline-block; background-color: #f0f4ff; color: #0033A0; border: 1px solid #c7d7fe; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; padding: 4px 12px; border-radius: 9999px; margin-bottom: 16px;">
                Community Forum Announcement
              </span>
              <h1 style="color: #0033A0; font-size: 22px; font-weight: 700; line-height: 1.35; margin: 0 0 16px 0;">
                ${displayTitle}
              </h1>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 16px 0;">
                Hello <strong>${data.userName}</strong>,
              </p>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                A new topic has been posted by <strong>${data.authorName}</strong> on the iFundAyiti Community Forum:
              </p>
              
              <!-- Post Card Quote -->
              <div style="background-color: #fafbfc; border-left: 4px solid #0033A0; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                <p style="font-size: 14px; line-height: 1.6; color: #2d3748; margin: 0; font-style: italic;">
                  "${excerpt}"
                </p>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${discussionUrl}" style="display: inline-block; background: linear-gradient(135deg, #0033A0 0%, #002270 100%); color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 10px; border-bottom: 3px solid #E4002B; box-shadow: 0 4px 14px rgba(0,51,160,0.25);">
                  Join the Discussion &rarr;
                </a>
              </div>

              <p style="font-size: 13px; line-height: 1.5; color: #6b7280; text-align: center; margin: 0 0 24px 0;">
                Connect with our team, share your perspective, and engage with fellow community members.
              </p>

              <!-- Haitian Flag Accent Divider -->
              <div style="height: 4px; background: linear-gradient(90deg, #0033A0 50%, #E4002B 50%); border-radius: 2px; margin: 24px 0;"></div>

              <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0;">
                Warm regards,<br />
                <strong style="color: #0033A0;">The iFundAyiti Team</strong><br />
                <a href="${config.frontend_url || 'https://ifundayiti.com'}" style="color: #6b7280; font-size: 13px; text-decoration: none;">ifundayiti.com</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="background-color: #fafafa; padding: 20px 40px; border-top: 1px solid #e5e7eb;">
              <p style="font-size: 12px; color: #9ca3af; margin: 0; line-height: 1.4;">
                You are receiving this email because you have an active account on iFundAyiti.<br />
                © ${new Date().getFullYear()} iFundAyiti. All rights reserved.
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
