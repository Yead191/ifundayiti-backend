import express from 'express';
import { TeamController } from './team.controller';
import tempAuth from '../../middlewares/tempAuth';
import validateRequest from '../../middlewares/validateRequest';
import { TeamValidations } from './team.validation';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .route('/')
  .get(tempAuth(), TeamController.getAllTeamMembers)
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(TeamValidations.createMemberZodSchema),
    TeamController.createTeamMember,
  );

router
  .route('/volunteer-apply')
  .post(
    fileUploadHandler(),
    validateRequest(TeamValidations.applyVolunteerZodSchema),
    TeamController.applyAsVolunteer,
  );
router.patch(
  '/change-status/:id',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  TeamController.updateTeamStatus,
);

router
  .route('/:id')
  .get(TeamController.getSingleTeamMember)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(TeamValidations.updateMemberZodSchema),
    TeamController.updateTeamMember,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    TeamController.deleteTeamMember,
  );

export const TeamRoutes = router;
