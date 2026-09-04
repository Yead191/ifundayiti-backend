import { Schema, model } from 'mongoose';
import {
  IProductcategory,
  ProductcategoryModel,
} from './productcategory.interface';
import { PRODUCT_CATEGORY_STATUS } from './productcategory.constants';

const productcategorySchema = new Schema<
  IProductcategory,
  ProductcategoryModel
>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    status: {
      type: String,
      enum: PRODUCT_CATEGORY_STATUS,
      default: 'active',
    },
  },
  {
    timestamps: true,
  },
);

export const Productcategory = model<IProductcategory, ProductcategoryModel>(
  'Productcategory',
  productcategorySchema,
);
