import express from 'express';
import { ProductController } from './product.controller';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import tempAuth from '../../middlewares/tempAuth';
import validateRequest from '../../middlewares/validateRequest';
import { ProductValidations } from './product.validation';

const router = express.Router();

const productUploadFields = [
  {
    name: 'images',
    type: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/octet-stream',
    ],
    maxCount: 10,
  },
];

// Product collection routes
router
  .route('/')
  .get(tempAuth(), ProductController.getAllProducts)
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(productUploadFields),
    validateRequest(ProductValidations.createProductZod),
    ProductController.createProduct,
  );

// Product statistics & analytics for Admin Dashboard
router
  .route('/stats')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProductController.getProductStats,
  );

// Quick status & featured toggles
router
  .route('/status/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ProductValidations.updateProductStatusZod),
    ProductController.updateProductStatus,
  );

router
  .route('/featured/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProductController.toggleProductFeatured,
  );

// Inventory & variant management
router
  .route('/variant-stock/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ProductValidations.updateVariantStockZod),
    ProductController.updateProductVariantStock,
  );

router
  .route('/increase-stock/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ProductValidations.increaseVariantStockZod),
    ProductController.increaseProductVariantStock,
  );

router
  .route('/pre-order/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ProductValidations.updateVariantPreOrderZod),
    ProductController.updateVariantPreOrder,
  );

router
  .route('/check-availability/:id')
  .get(tempAuth(), ProductController.checkProductVariantAvailability);

// Individual product operations
router
  .route('/:id')
  .get(tempAuth(), ProductController.getSingleProduct)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(productUploadFields),
    validateRequest(ProductValidations.updateProductZod),
    ProductController.updateProduct,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProductController.deleteProduct,
  );

export const ProductRoutes = router;
export const BookRoutes = router; // Backward compatibility alias
