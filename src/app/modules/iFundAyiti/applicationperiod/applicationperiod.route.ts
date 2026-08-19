import express from 'express';
import { ApplicationperiodController } from './applicationperiod.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';
import validateRequest from '../../../middlewares/validateRequest';
import { ApplicationPeriodValidation } from './applicationperiod.validation';

const router = express.Router();

router.route('/')
    .post(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(ApplicationPeriodValidation.createApplicationPeriodZodSchema), ApplicationperiodController.createApplicationPeriod)
    .get(ApplicationperiodController.getAllApplicationPeriod);

router.route('/current')
    .get(ApplicationperiodController.getCurrentApplicationPeriod);

router.route('/:id')
    .get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationperiodController.getSingleApplicationPeriod)
    .patch(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), validateRequest(ApplicationPeriodValidation.updateApplicationPeriodZodSchema), ApplicationperiodController.updateApplicationPeriod)
    .delete(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ApplicationperiodController.deleteApplicationPeriod);



export const ApplicationperiodRoutes = router;
