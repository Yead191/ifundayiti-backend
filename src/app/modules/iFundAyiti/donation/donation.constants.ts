export enum DONATION_PAYMENT_STATUS {
  PAID = 'paid',
  UNPAID = 'unpaid',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum DONATION_PAYMENT_METHOD {
  STRIPE = 'stripe',
  CASH = 'cash',
  BANK_TRANSFER = 'bank_transfer',
  DIRECT = 'direct',
  OTHER = 'other',
}

export enum DONATION_TYPE {
  DONATION = 'donation',
  GRANT = 'grant',
  FUND_RAISING = 'fund_raising',
}
