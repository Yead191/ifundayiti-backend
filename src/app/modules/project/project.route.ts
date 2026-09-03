import express from 'express';
import { ProjectController } from './project.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import tempAuth from '../../middlewares/tempAuth';
import validateRequest from '../../middlewares/validateRequest';
import { ProjectValidations } from './project.validation';

const router = express.Router();

const projectUploadFields = [
  {
    name: 'image',
    type: [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'image/webp',
      'application/octet-stream',
    ],
    maxCount: 1,
  },
  {
    name: 'gallery',
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

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(projectUploadFields),
    validateRequest(ProjectValidations.createProjectValidation),
    ProjectController.createProjectToDB,
  )
  .get(tempAuth(), ProjectController.getAllProjectsFromDB);

router
  .route('/stats')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProjectController.getProjectStats,
  );

router
  .route('/status/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ProjectValidations.updateProjectStatusValidation),
    ProjectController.updateProjectStatusToDB,
  );

router
  .route('/toggle-featured/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProjectController.toggleProjectFeaturedToDB,
  );

router
  .route('/:id')
  .get(tempAuth(), ProjectController.getSingleProjectFromDB)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(projectUploadFields),
    validateRequest(ProjectValidations.updateProjectValidation),
    ProjectController.updateProjectToDB,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProjectController.deleteProjectFromDB,
  );

export const ProjectRoutes = router;
