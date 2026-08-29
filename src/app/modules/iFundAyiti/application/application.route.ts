import express from 'express';
import { ApplicationController } from './application.controller';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';
import validateRequest from '../../../middlewares/validateRequest';
import { applicationValidation } from './application.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import tempAuth from '../../../middlewares/tempAuth';

const router = express.Router();

router
  .route('/')
  .post(
    fileUploadHandler([
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
        name: 'nid_card',
        type: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
          'application/octet-stream',
        ],
        maxCount: 1,
      },
      {
        name: 'proof_of_address',
        type: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
          'application/octet-stream',
        ],
        maxCount: 1,
      },
      {
        name: 'business_plan',
        type: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
          'application/octet-stream',
        ],
        maxCount: 1,
      },
      {
        name: 'supporting_documents',
        type: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/pdf',
          'application/octet-stream',
        ],
        maxCount: 5,
      },
      {
        name: 'projectGallery',
        type: [
          'image/jpeg',
          'image/png',
          'image/jpg',
          'image/webp',
          'application/octet-stream',
        ],
        maxCount: 5,
      },
    ]),
    validateRequest(applicationValidation.createApplicationZodSchema),
    ApplicationController.createApplication,
  )
  .get(tempAuth(), ApplicationController.getAllApplications);

router.route('/track').get(ApplicationController.trackApplication);
router
  .route('/statistics')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ApplicationController.getStatistics,
  );
router
  .route('/monthly-chart')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ApplicationController.getMonthlyChart,
  );
router
  .route('/donation-amount')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ApplicationController.getDonationAmountChart,
  );
router
  .route('/status-chart')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ApplicationController.getApplicationStatusStats,
  );
router
  .route('/recent')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ApplicationController.getRecentApplications,
  );
router
  .route('/winner-selection/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ApplicationController.winnerSelection,
  );
router
  .route('/update-winner/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(applicationValidation.updateWinnerInformationZodSchema),
    ApplicationController.updateWinnerInformation,
  );

router
  .route('/:id')
  .get(tempAuth(), ApplicationController.getSingleApplication)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(applicationValidation.updateApplicationStatusSchema),
    ApplicationController.updateApplicationStatus,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ApplicationController.deleteApplication,
  );

export const ApplicationRoutes = router;
