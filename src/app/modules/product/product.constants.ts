export const PRODUCT_STATUS = [
  'draft',
  'active',
  'inactive',
  'archived',
] as const;

export type ProductStatus = (typeof PRODUCT_STATUS)[number];

export const PRODUCT_GENDERS = ['men', 'women', 'unisex', 'kids'] as const;
export type ProductGender = (typeof PRODUCT_GENDERS)[number];

export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
  order?: number;
}

export interface IProductVariant {
  size: string;
  color: string;
  stock: number;

  // Pre-order
  isPreOrder: boolean;
  expectedAvailableDate?: Date;
}
