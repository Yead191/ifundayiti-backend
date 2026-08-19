import { IProduct, ProductModel } from './book.interface';
import { model, Schema } from 'mongoose';

const ProductDetailsSchema = new Schema(
  {
    // Digital
    publisher: {
      type: String,
    },
    firstPublish: {
      type: String,
    },
    edition: {
      type: String,
    },
    pages: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['in-stock', 'out-stock'],
      default: 'in-stock',
    },
    // Office
    material: {
      type: String,
    },
    dimensions: {
      type: String,
    },
    weight: {
      type: String,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
  },
  {
    _id: false,
  },
);

const ProductSchema = new Schema<IProduct, ProductModel>(
  {
    type: {
      type: String,
      enum: ['digital', 'office'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },

    subtitle: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    accent: {
      type: [String],
      required: true,
    },
    file: {
      type: String,
    },
    details: {
      type: ProductDetailsSchema,
      required: false,
    },
    sold: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Product = model<IProduct, ProductModel>('Product', ProductSchema);
