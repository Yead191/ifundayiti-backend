import { Model } from 'mongoose';
import { ProductCategoryStatus } from './productcategory.constants';

export type IProductcategory = {
  name: string;
  status: ProductCategoryStatus;
  createdAt?: Date;
  updatedAt?: Date;
};

export type ProductcategoryModel = Model<IProductcategory>;
