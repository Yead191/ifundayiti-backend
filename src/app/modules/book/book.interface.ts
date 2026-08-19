import { Model } from 'mongoose';

export type ProductType = 'digital' | 'office';
export type status = 'in-stock' | 'out-stock';

export interface IproductDetails {
  // digital product
  publisher?: string;
  firstPublish?: string;
  edition?: string;
  pages?: number;

  // office product
  material?: string;
  dimensions?: string;
  weight?: string;
  inStock?: boolean;
}

export interface IProduct {
  type: ProductType;
  title: string;
  subtitle: string;
  description: string;

  price: number;
  image: string;
  accent?: string[];
  file?: string;
  details: IproductDetails;
  status: status;
  sold?: number;
}

export type ProductModel = Model<IProduct>;
