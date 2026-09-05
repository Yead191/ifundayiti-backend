import { Model, Types } from 'mongoose';
import {
  ORDER_STATUS,
  PAYMENT_STATUS,
  PRE_ORDER_STATUS,
} from './order.constants';

export interface IOrderItem {
  product: Types.ObjectId;

  name: string;
  image?: string;

  size: string;
  color: string;

  quantity: number;
  price: number;
  total_price: number;

  isPreOrder: boolean;
  expectedAvailableDate?: Date;
  preOrderStatus?: PRE_ORDER_STATUS;
}

export interface IPriceBreakdown {
  subtotal: number;
  delivery_charge: number;
  tax: number;
  discount_amount: number;
  total_price: number;
}

export interface IAddressBreakdown {
  country: string;
  city: string;
  postal_code: string;
  street_address: string;
}

export interface IOrder {
  user: Types.ObjectId;

  items: IOrderItem[];

  price_breakdown: IPriceBreakdown;

  total_items: number;

  formatted_address: string;
  address_breakdown: IAddressBreakdown;

  contact_number: string;

  status: ORDER_STATUS;
  payment_status: PAYMENT_STATUS;

  order_id: string;

  payment_intent_id?: string;
  transaction_id?: Types.ObjectId;

  createdAt?: Date;
  updatedAt?: Date;
}

export type OrderModel = Model<IOrder>;
