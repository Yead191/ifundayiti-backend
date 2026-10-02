import express from 'express';
import { ExpenseController } from './expense.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { ExpenseValidations } from './expense.validation';

const router = express.Router();

// Specific routes must come before parameterized routes (/:id)
router
  .route('/stats')
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ExpenseController.getExpenseStats,
  );

router
  .route('/delete-multiple')
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ExpenseValidations.deleteMultipleExpenseValidation),
    ExpenseController.deleteMultipleExpenses,
  );

// Collection routes
router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ExpenseValidations.createExpenseValidation),
    ExpenseController.createExpense,
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ExpenseController.getAllExpenses,
  );

// Parameterized item routes
router
  .route('/:id')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ExpenseValidations.updateExpenseValidation),
    ExpenseController.updateExpense,
  )
  .get(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ExpenseController.getSingleExpense,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    ExpenseController.deleteExpense,
  );

router
  .route('/:id/status')
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(ExpenseValidations.updateExpenseValidation),
    ExpenseController.updateExpenseStatus,
  );

export const ExpenseRoutes = router;
