import { IProductVariant, PRODUCT_STATUS } from './product.constants';
import { IProduct, ProductModel } from './product.interface';
import { model, Schema } from 'mongoose';

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    size: {
      type: String,
      required: true,
      trim: true,
    },

    color: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isPreOrder: {
      type: Boolean,
      default: false,
    },

    expectedAvailableDate: {
      type: Date,
    },
  },
  {
    _id: false,
  },
);

const ProductSchema = new Schema<IProduct, ProductModel>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Productcategory',
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    compareAtPrice: {
      type: Number,
      min: 0,
    },

    images: {
      type: [String],
      default: [],
    },

    variants: {
      type: [ProductVariantSchema],
      default: [],
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex', 'kids'],
    },
    tags: {
      type: [String],
      default: [],
    },
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: 'draft',
    },

    featured: {
      type: Boolean,
      default: false,
    },

    sold: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true },
);

export const Product = model<IProduct, ProductModel>('Product', ProductSchema);
