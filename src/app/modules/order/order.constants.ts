export enum ORDER_STATUS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export enum PAYMENT_STATUS {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum PRE_ORDER_STATUS {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}
