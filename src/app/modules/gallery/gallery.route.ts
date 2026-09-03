import express from 'express';
import { GalleryController } from './gallery.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { GalleryValidations } from './gallery.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import tempAuth from '../../middlewares/tempAuth';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(GalleryValidations.createGalleryZod),
    GalleryController.createGallery,
  )
  .get(tempAuth(), GalleryController.getAllGalleries);

router
  .route('/stats')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    GalleryController.getGalleryStats,
  );

router.patch(
  '/status/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(GalleryValidations.updateGalleryStatusZod),
  GalleryController.updateGalleryStatus,
);

router.patch(
  '/featured/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(GalleryValidations.toggleGalleryFeaturedZod),
  GalleryController.toggleGalleryFeatured,
);

router.route('/:id').get(tempAuth(), GalleryController.getSingleGallery);

router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(GalleryValidations.updateGalleryZod),
    GalleryController.updateGallery,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    GalleryController.deleteGallery,
  );

export const GalleryRoutes = router;
