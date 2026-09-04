import express from 'express';
import { ProductcategoryController } from './productcategory.controller';
import auth from '../../middlewares/auth';
import tempAuth from '../../middlewares/tempAuth';
import validateRequest from '../../middlewares/validateRequest';
import { USER_ROLES } from '../../../enums/user';
import { ProductcategoryValidations } from './productcategory.validation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ProductcategoryValidations.createCategoryZod),
    ProductcategoryController.createCategory,
  )
  .get(tempAuth(), ProductcategoryController.getAllCategories);

router
  .route('/:id')
  .get(tempAuth(), ProductcategoryController.getSingleCategory)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ProductcategoryValidations.updateCategoryZod),
    ProductcategoryController.updateCategory,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProductcategoryController.deleteCategory,
  );

export const ProductcategoryRoutes = router;
