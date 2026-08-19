import express from 'express';
import { ProgramFundController } from './programFund.controller';
import auth from '../../../middlewares/auth';
import { USER_ROLES } from '../../../../enums/user';

const router = express.Router();

// router.get('/transactions', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ProgramFundController.getAllTransactions);
router.get('/', auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN), ProgramFundController.getFundBalance);

export const ProgramFundRoutes = router;
