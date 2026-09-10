import express from 'express';
import { FolderController } from './folder.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { FolderValidations } from './folder.validation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(FolderValidations.createFolderZodSchema),
    FolderController.createFolder,
  )
  .get(FolderController.getAllFolders);

router
  .route('/:id')
  .get(FolderController.getSingleFolder)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(FolderValidations.updateFolderZodSchema),
    FolderController.updateFolder,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    FolderController.deleteFolder,
  );

export const FolderRoutes = router;
