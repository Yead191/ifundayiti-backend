import express from 'express';
import { GalleryController } from './gallery.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { GalleryValidations } from './gallery.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler([{ name: 'image', maxCount: 20 }]),
    validateRequest(GalleryValidations.createGalleryZod),
    GalleryController.createGallery,
  )
  .get(GalleryController.getAllGalleries);

router.delete(
  '/delete-multiple',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(GalleryValidations.deleteMultipleGalleriesZod),
  GalleryController.deleteMultipleGalleries,
);

router
  .route('/:id')
  .get(GalleryController.getSingleGallery)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler([{ name: 'image', maxCount: 1 }]),
    validateRequest(GalleryValidations.updateGalleryZod),
    GalleryController.updateGallery,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    GalleryController.deleteGallery,
  );

export const GalleryRoutes = router;
