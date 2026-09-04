export const PRODUCT_CATEGORY_STATUS = ['active', 'inactive'] as const;
export type ProductCategoryStatus = (typeof PRODUCT_CATEGORY_STATUS)[number];
