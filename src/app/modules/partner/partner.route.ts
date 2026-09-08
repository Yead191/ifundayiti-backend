import express from 'express';
import { PartnerController } from './partner.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import tempAuth from '../../middlewares/tempAuth';
import validateRequest from '../../middlewares/validateRequest';
import { PartnerValidations } from './partner.validation';

const router = express.Router();

router
  .route('/apply')
  .post(
    auth(
      USER_ROLES.SUPER_ADMIN,
      USER_ROLES.ADMIN,
      USER_ROLES.USER,
      USER_ROLES.VENDOR,
    ),
    fileUploadHandler(),
    validateRequest(PartnerValidations.createPartnerZodSchema),
    PartnerController.applyPartner,
  );

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(PartnerValidations.createPartnerZodSchema),
    PartnerController.createPartner,
  )
  .get(tempAuth(), PartnerController.getAllPartner);

router.route('/logos').get(PartnerController.getParnterLogos);

router
  .route('/change-status')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(PartnerValidations.changeStatusZodValidation),
    PartnerController.changePartnerStatus,
  );

router
  .route('/:id')
  .get(tempAuth(), PartnerController.getSinglePartner)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    validateRequest(PartnerValidations.updatePartnerZodSchema),
    PartnerController.updatePartner,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    PartnerController.deletePartner,
  );

export const PartnerRoutes = router;
