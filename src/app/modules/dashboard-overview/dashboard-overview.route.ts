import express from 'express';
import { DashboardOverviewController } from './dashboard-overview.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.route('/').get(auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), DashboardOverviewController.getDashboardOverview)

export const DashboardOverviewRoutes = router;
