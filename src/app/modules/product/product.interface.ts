import { Model, Types } from 'mongoose';
import {
  IProductVariant,
  ProductGender,
  ProductStatus,
} from './product.constants';

export interface IProduct {
  name: string;
  description: string;
  category: Types.ObjectId;
  price: number;
  compareAtPrice?: number;
  images: string[];
  variants: IProductVariant[];
  gender?: ProductGender;
  tags?: string[];
  status: ProductStatus;
  featured: boolean;
  sold: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export type ProductModel = Model<IProduct>;
