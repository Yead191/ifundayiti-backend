import express from 'express';
import { ProjectController } from './project.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import tempAuth from '../../middlewares/tempAuth';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    ProjectController.createProjectToDB,
  )
  .get(tempAuth(), ProjectController.getAllProjectsFromDB);

router
  .route('/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProjectController.getSingleProjectFromDB,
  )
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProjectController.updateProjectToDB,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ProjectController.deleteProjectFromDB,
  );

export const ProjectRoutes = router;
