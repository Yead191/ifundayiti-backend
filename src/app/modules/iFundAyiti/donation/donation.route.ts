import express from 'express';
import { DonationController } from './donation.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middlewares/validateRequest';
import { DonationValidations } from './donation.validation';

const router = express.Router();

router
  .route('/')
  .post(validateRequest(DonationValidations.createDonationSchema), DonationController.createDonation)
  .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), DonationController.getAllDonations);

router.get("/webhook", DonationController.handleWebhook)
router.route('/fund-stats').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), DonationController.getFundStats);


export const DonationRoutes = router;

// http://localhost:5000/api/v1/donation/webhook?status=failed