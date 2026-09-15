export interface IEventTicketData {
  eventTitle: string;
  eventSubtitle?: string;
  category?: string;
  formattedDate: string;
  formattedTime: string;
  location: string;
  venueAddress?: string;
  dressCode?: string;
  ticketType?: string;
  customerName: string;
  customerEmail: string;
  ticketCode: string;
  qrCodeDataUrl?: string;
  ticketUrl?: string;
  quantity?: number;
}


export const generateEventTicketHtml = (data: IEventTicketData): string => {
  const {
    eventTitle,
    eventSubtitle = 'FOR A BRIGHTER HAITI',
    formattedDate,
    formattedTime,
    location,
    venueAddress = '',
    dressCode = 'Formal Attire',
    ticketType = 'General Admission',
    customerName,
    ticketCode,
    qrCodeDataUrl,
    quantity = 1,
  } = data;

  const fullLocation = venueAddress
    ? `${location}, ${venueAddress}`
    : location || 'Venue Details Provided Upon RSVP';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Ticket - ${ticketCode}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;800&family=Montserrat:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,600;0,800;1,400&display=swap" rel="stylesheet">
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      background-color: #070708;
      font-family: 'Montserrat', sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      color: #FFFFFF;
      -webkit-font-smoothing: antialiased;
    }
    
    /* Action Bar (Only on web view, hidden on print) */
    .action-bar {
      display: flex;
      gap: 12px;
      margin-bottom: 24px;
      z-index: 10;
    }
    .btn {
      padding: 10px 24px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.2s ease;
      text-decoration: none;
      border: none;
    }
    .btn-gold {
      background: linear-gradient(135deg, #D4AF37 0%, #AA771C 100%);
      color: #0c0c0d;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }
    .btn-gold:hover {
      background: linear-gradient(135deg, #F3E098 0%, #D4AF37 100%);
      transform: translateY(-1px);
    }

    /* Ticket Canvas */
    .ticket-wrapper {
      width: 100%;
      max-width: 900px;
      position: relative;
      filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.8));
    }
    .ticket-container {
      display: flex;
      width: 100%;
      min-height: 420px;
      border-radius: 16px;
      overflow: hidden;
      background: #0E0E10;
      border: 1px solid rgba(212, 175, 55, 0.35);
      position: relative;
    }

    /* Main Left Section */
    .ticket-main {
      flex: 1 1 68%;
      background: radial-gradient(circle at 10% 20%, #17171A 0%, #0c0c0e 85%);
      padding: 32px 36px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      overflow: hidden;
    }

    /* Botanical & Map watermark silhouettes */
    .watermark-map {
      position: absolute;
      top: 24px;
      right: 28px;
      width: 130px;
      height: 90px;
      opacity: 0.18;
      pointer-events: none;
    }
    .watermark-floral {
      position: absolute;
      bottom: -15px;
      left: -20px;
      width: 220px;
      height: 220px;
      opacity: 0.15;
      pointer-events: none;
    }

    /* Header brand */
    .ticket-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      z-index: 2;
    }
    .brand-logo-img {
      height: 38px;
      max-width: 170px;
      object-fit: contain;
      display: block;
    }


    /* Center Headline Area */
    .headline-area {
      margin: 20px 0 18px 0;
      z-index: 2;
    }
    .headline-invite {
      font-size: 10px;
      letter-spacing: 3.5px;
      text-transform: uppercase;
      color: #C0C0C0;
      font-weight: 500;
      margin-bottom: 6px;
    }
    .event-title {
      font-family: 'Cinzel', 'Playfair Display', serif;
      font-size: 38px;
      line-height: 1.1;
      font-weight: 800;
      letter-spacing: 2px;
      text-transform: uppercase;
      background: linear-gradient(135deg, #FFF1CA 0%, #E2BA55 45%, #9E741A 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      text-shadow: 0 2px 10px rgba(212, 175, 55, 0.2);
    }
    .event-subtitle {
      font-family: 'Montserrat', sans-serif;
      font-size: 11px;
      letter-spacing: 4px;
      text-transform: uppercase;
      color: #E2BA55;
      font-weight: 600;
      margin-top: 6px;
    }
    .gold-divider {
      width: 140px;
      height: 1px;
      background: linear-gradient(90deg, #D4AF37 0%, rgba(212, 175, 55, 0) 100%);
      margin: 12px 0;
    }
    .event-tagline {
      font-family: 'Playfair Display', serif;
      font-style: italic;
      font-size: 13px;
      color: #A3A3A8;
      max-width: 440px;
    }

    /* Details Grid */
    .details-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px 24px;
      background: rgba(255, 255, 255, 0.02);
      border-radius: 12px;
      padding: 14px 18px;
      border: 1px solid rgba(212, 175, 55, 0.15);
      z-index: 2;
    }
    .detail-item {
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .detail-icon {
      width: 26px;
      height: 26px;
      border-radius: 50%;
      border: 1px solid #D4AF37;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #E2BA55;
      font-size: 11px;
      flex-shrink: 0;
      margin-top: 1px;
      background: rgba(212, 175, 55, 0.08);
    }
    .detail-content .label {
      font-size: 9px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #9CA3AF;
      font-weight: 600;
    }
    .detail-content .value {
      font-size: 12px;
      color: #F9FAFB;
      font-weight: 600;
      margin-top: 1px;
      line-height: 1.3;
    }
    .customer-badge {
      grid-column: span 2;
      border-top: 1px dashed rgba(212, 175, 55, 0.2);
      padding-top: 8px;
      margin-top: 2px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .customer-name {
      font-size: 12px;
      color: #ECC870;
      font-weight: 700;
    }
    .admit-count {
      font-size: 10px;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      background: rgba(212, 175, 55, 0.15);
      color: #F5DE88;
      padding: 2px 10px;
      border-radius: 20px;
      font-weight: 700;
      border: 1px solid rgba(212, 175, 55, 0.4);
    }

    /* Ticket Footer Quote */
    .ticket-footer-quote {
      font-size: 10px;
      color: #8C8C94;
      font-style: italic;
      margin-top: 12px;
      letter-spacing: 0.5px;
      z-index: 2;
    }

    /* Perforation separator */
    .perforation {
      width: 0;
      position: relative;
      border-left: 2px dashed rgba(212, 175, 55, 0.6);
      background: transparent;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      z-index: 5;
    }
    .notch {
      width: 28px;
      height: 28px;
      background-color: #070708;
      border-radius: 50%;
      position: absolute;
      left: -14px;
      box-shadow: inset 0 0 4px rgba(0,0,0,0.8);
      border: 1px solid rgba(212, 175, 55, 0.35);
    }
    .notch-top {
      top: -14px;
    }
    .notch-bottom {
      bottom: -14px;
    }

    /* Right Stub Section (Gold Metallic) */
    .ticket-stub {
      flex: 1 1 32%;
      background: linear-gradient(145deg, #D4AF37 0%, #F5DF88 40%, #B8860B 80%, #946903 100%);
      color: #121214;
      padding: 30px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: space-between;
      text-align: center;
      position: relative;
    }
    .stub-header h4 {
      font-family: 'Cinzel', serif;
      font-size: 16px;
      letter-spacing: 2px;
      font-weight: 800;
      color: #121214;
    }
    .stub-header p {
      font-size: 9px;
      letter-spacing: 2.5px;
      text-transform: uppercase;
      font-weight: 700;
      color: #4A3805;
      margin-top: 2px;
    }
    .stub-divider {
      width: 70%;
      height: 1.5px;
      background: #121214;
      margin: 10px auto;
      opacity: 0.35;
    }
    .stub-event-title {
      font-family: 'Cinzel', serif;
      font-size: 15px;
      font-weight: 800;
      color: #1a1506;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .stub-event-sub {
      font-size: 8px;
      letter-spacing: 2px;
      text-transform: uppercase;
      color: #403207;
      font-weight: 700;
      margin-top: 2px;
    }
    .stub-admit {
      font-size: 10px;
      letter-spacing: 3px;
      text-transform: uppercase;
      font-weight: 800;
      color: #121214;
      margin: 12px 0 8px 0;
    }

    /* QR Code & Barcode */
    .stub-qr-wrap {
      background: #FFFFFF;
      padding: 8px;
      border-radius: 10px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.25);
      margin: 4px 0;
    }
    .stub-qr-wrap img {
      width: 88px;
      height: 88px;
      display: block;
    }
    .stub-barcode {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 32px;
      gap: 2px;
      margin-top: 6px;
    }
    .barcode-bar {
      height: 100%;
      background: #121214;
      width: 2px;
    }
    .barcode-bar.w-thick { width: 4px; }
    .barcode-bar.w-thin { width: 1.5px; }

    .stub-ticket-id {
      font-family: 'Courier New', monospace;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 2px;
      color: #121214;
      margin-top: 4px;
    }

    /* Print styling */
    @media print {
      body {
        background: transparent !important;
        padding: 0 !important;
      }
      .action-bar {
        display: none !important;
      }
      .ticket-wrapper {
        filter: none !important;
        max-width: 100% !important;
      }
      .ticket-container {
        border: 1px solid #D4AF37 !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
    }

    /* Mobile Responsive */
    @media (max-width: 768px) {
      .ticket-container {
        flex-direction: column;
      }
      .perforation {
        width: 100%;
        height: 0;
        border-left: none;
        border-top: 2px dashed rgba(212, 175, 55, 0.6);
      }
      .notch-top {
        left: -14px;
        top: -14px;
      }
      .notch-bottom {
        right: -14px;
        left: auto;
        bottom: -14px;
      }
      .details-grid {
        grid-template-columns: 1fr;
      }
      .customer-badge {
        grid-column: span 1;
      }
    }
  </style>
</head>
<body>

  <!-- Top Action Button -->
  <div class="action-bar no-print">
    <button onclick="window.print()" class="btn btn-gold">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="6 9 6 2 18 2 18 9"></polyline>
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
        <rect x="6" y="14" width="12" height="8"></rect>
      </svg>
      Print / Download Ticket (PDF)
    </button>
  </div>

  <div class="ticket-wrapper">
    <div class="ticket-container">
      
      <!-- MAIN TICKET BODY (LEFT) -->
      <div class="ticket-main">
        
        <!-- Haiti Map Watermark SVG -->
        <svg class="watermark-map" viewBox="0 0 100 60" fill="none" stroke="#D4AF37" stroke-width="1.2">
          <path d="M10 25 C15 20, 25 22, 35 20 C45 18, 55 12, 65 15 C75 18, 85 10, 92 18 C85 28, 75 35, 60 40 C45 45, 30 48, 15 42 C8 38, 5 30, 10 25 Z"/>
        </svg>

        <!-- Floral Vector Ornament SVG -->
        <svg class="watermark-floral" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" stroke-width="0.8">
          <path d="M10 90 C20 70, 40 60, 50 40 C60 20, 75 15, 85 10" />
          <path d="M20 90 C35 75, 45 50, 40 30 C35 15, 25 10, 15 5" />
          <circle cx="50" cy="40" r="12" stroke-width="0.6"/>
          <path d="M50 28 C55 20, 65 20, 68 28 C70 35, 60 42, 50 40 Z" />
          <path d="M38 42 C30 45, 25 35, 32 28 C38 22, 45 32, 50 40 Z" />
        </svg>

        <!-- Brand Header -->
        <div class="ticket-brand">
          <img src="https://res.cloudinary.com/dknmebeee/image/upload/v1789453331/logo-ifundayiti-nav_ea5qml.png" alt="IFundAyiti Logo" class="brand-logo-img" />
        </div>

        <!-- Headline Area -->
        <div class="headline-area">
          <div class="headline-invite">You're Invited To</div>
          <h1 class="event-title">${eventTitle}</h1>
          <div class="event-subtitle">${eventSubtitle}</div>
          <div class="gold-divider"></div>
          <p class="event-tagline">"An evening of impact, connection, and hope for our community."</p>
        </div>

        <!-- Details Grid -->
        <div class="details-grid">
          
          <!-- Date -->
          <div class="detail-item">
            <div class="detail-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <div class="detail-content">
              <div class="label">Date</div>
              <div class="value">${formattedDate}</div>
            </div>
          </div>

          <!-- Time -->
          <div class="detail-item">
            <div class="detail-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="detail-content">
              <div class="label">Time</div>
              <div class="value">${formattedTime}</div>
            </div>
          </div>

          <!-- Location -->
          <div class="detail-item">
            <div class="detail-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
            </div>
            <div class="detail-content">
              <div class="label">Location</div>
              <div class="value">${fullLocation}</div>
            </div>
          </div>

          <!-- Ticket Type & Dress Code -->
          <div class="detail-item">
            <div class="detail-icon">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="7" width="20" height="10" rx="2"></rect>
                <line x1="6" y1="12" x2="6" y2="12"></line>
                <line x1="10" y1="12" x2="14" y2="12"></line>
                <line x1="18" y1="12" x2="18" y2="12"></line>
              </svg>
            </div>
            <div class="detail-content">
              <div class="label">Type & Dress Code</div>
              <div class="value">${ticketType} • ${dressCode}</div>
            </div>
          </div>

          <!-- Guest Badge -->
          <div class="customer-badge">
            <div>
              <span class="label" style="display:block;">Ticket Holder</span>
              <span class="customer-name">${customerName}</span>
            </div>
            <div class="admit-count">
              Admit ${quantity}
            </div>
          </div>

        </div>

        <div class="ticket-footer-quote">
          Thank you for supporting a stronger, self-sustaining Haiti.
        </div>

      </div>

      <!-- PERFORATION -->
      <div class="perforation">
        <div class="notch notch-top"></div>
        <div class="notch notch-bottom"></div>
      </div>

      <!-- STUB (RIGHT) -->
      <div class="ticket-stub">
        
        <div class="stub-header">
          <img src="https://res.cloudinary.com/dknmebeee/image/upload/v1789453331/logo-ifundayiti-nav_ea5qml.png" alt="IFundAyiti Logo" style="max-height: 26px; width: auto; max-width: 120px; object-fit: contain; margin: 0 auto 6px auto; display: block;" />
          <p>EVENT TICKET</p>
          <div class="stub-divider"></div>
        </div>

        <div>
          <div class="stub-event-title">${eventTitle}</div>
          <div class="stub-event-sub">${eventSubtitle}</div>
          <div class="stub-admit">ADMIT ${quantity}</div>
        </div>

        <!-- QR Code Container -->
        <div class="stub-qr-wrap">
          <img src="${qrCodeDataUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(ticketCode)}`}" alt="Ticket QR Code" />
        </div>


        <!-- Barcode styling representation -->
        <div class="stub-barcode">
          <div class="barcode-bar w-thick"></div>
          <div class="barcode-bar w-thin"></div>
          <div class="barcode-bar w-thick"></div>
          <div class="barcode-bar"></div>
          <div class="barcode-bar w-thick"></div>
          <div class="barcode-bar w-thin"></div>
          <div class="barcode-bar"></div>
          <div class="barcode-bar w-thick"></div>
          <div class="barcode-bar w-thin"></div>
          <div class="barcode-bar"></div>
          <div class="barcode-bar w-thick"></div>
          <div class="barcode-bar w-thin"></div>
          <div class="barcode-bar w-thick"></div>
          <div class="barcode-bar"></div>
        </div>

        <!-- Ticket ID -->
        <div class="stub-ticket-id">
          ${ticketCode}
        </div>

      </div>

    </div>
  </div>

</body>
</html>
`;
};
