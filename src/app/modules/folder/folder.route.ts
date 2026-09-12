import express from 'express';
import { FolderController } from './folder.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { FolderValidations } from './folder.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import tempAuth from '../../middlewares/tempAuth';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(FolderValidations.createFolderZodSchema),
    FolderController.createFolder,
  )
  .get(tempAuth(), FolderController.getAllFolders);

router
  .route('/stats')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    FolderController.getFolderStats,
  );

router.patch(
  '/status/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(FolderValidations.updateFolderStatusZod),
  FolderController.updateFolderStatus,
);

router.patch(
  '/featured/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(FolderValidations.toggleFolderFeaturedZod),
  FolderController.toggleFolderFeatured,
);

router
  .route('/:id')
  .get(tempAuth(), FolderController.getSingleFolder)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(FolderValidations.updateFolderZodSchema),
    FolderController.updateFolder,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    FolderController.deleteFolder,
  );

export const FolderRoutes = router;

