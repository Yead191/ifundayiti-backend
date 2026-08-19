import express from 'express';
import { BookController } from './book.controller';
import { USER_ROLES } from '../../../enums/user';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import auth from '../../middlewares/auth';

const router = express.Router();

router
  .route('/')
  .get(BookController.getAllBooks)
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler([{ name: 'file', maxCount: 1 }]),
    BookController.createBook,
  );

router
  .route('/purchase/:id')
  .post(
    auth(USER_ROLES.USER, USER_ROLES.VENDOR),
    BookController.purchaseSingleProduct,
  );

router
  .route('/:id')
  .get(BookController.getSingleBook)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    BookController.updateBook,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    BookController.deleteBook,
  );
export const BookRoutes = router;
