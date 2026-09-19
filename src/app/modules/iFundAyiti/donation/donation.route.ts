import express from 'express';
import { DonationController } from './donation.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middlewares/validateRequest';
import { DonationValidations } from './donation.validation';

const router = express.Router();

router
  .route('/')
  .post(
    validateRequest(DonationValidations.createDonationSchema),
    DonationController.createDonation,
  )
  .get(auth(), DonationController.getAllDonations);

router.get(
  '/fund-stats',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  DonationController.getFundStats,
);

router.delete(
  '/delete-multiple',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(DonationValidations.deleteMultipleDonationsSchema),
  DonationController.deleteMultipleDonations,
);

router.get('/webhook', DonationController.handleWebhook);

router
  .route('/:id')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    DonationController.getSingleDonation,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    DonationController.deleteDonation,
  );

export const DonationRoutes = router;
