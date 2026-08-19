import express from 'express';
import { ApplicationController } from './application.controller';
import fileUploadHandler from '../../../middlewares/fileUploadHandler';
import validateRequest from '../../../middlewares/validateRequest';
import { applicationValidation } from './application.validation';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();

router.route('/').post(
    fileUploadHandler([{
        name: 'image',
        type: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
        maxCount: 1
    }, {
        name: 'nid_card',
        type: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'],
        maxCount: 1
    }, {
        name: 'proof_of_address',
        type: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'],
        maxCount: 1
    }, {
        name: 'business_plan',
        type: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf'],
        maxCount: 1
    }]),
    validateRequest(applicationValidation.createApplicationZodSchema),
    ApplicationController.createApplication
).get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.getAllApplications)

router.route('/track').get(ApplicationController.trackApplication)
router.route('/statistics').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.getStatistics)
router.route('/monthly-chart').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.getMonthlyChart)
router.route('/donation-amount').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.getDonationAmountChart)
router.route('/status-chart').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.getApplicationStatusStats)
router.route('/recent').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.getRecentApplications)
router.route('/winner-selection/:id').patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.winnerSelection)

router.route("/:id").get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.getSingleApplication)
    .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(applicationValidation.updateApplicationStatusSchema), ApplicationController.updateApplicationStatus).delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationController.deleteApplication)


export const ApplicationRoutes = router;
