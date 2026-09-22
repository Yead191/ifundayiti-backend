import express, { NextFunction, Request, Response } from 'express';
import { BookingsController } from './bookings.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { BookingsValidations } from './bookings.validation';
import { jwtHelper } from '../../../helpers/jwtHelper';
import config from '../../../config';
import { Secret } from 'jsonwebtoken';
import { User } from '../user/user.model';

const router = express.Router();

/**
 * Optional authentication middleware:
 * Attaches user to req.user if a valid token is provided, otherwise allows guest checkout.
 */
const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token = '';
    const tokenWithBearer = req.headers.authorization;
    if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
      token = tokenWithBearer.split(' ')[1];
    } else if ((req as any).cookies?.token) {
      token = (req as any).cookies.token;
    } else if ((req as any).cookies?.accessToken) {
      token = (req as any).cookies.accessToken;
    }

    if (token) {
      const verifyUser = jwtHelper.verifyToken(
        token,
        config.jwt.jwt_secret as Secret,
      );
      if (verifyUser?.id) {
        const isExistUser = await User.findById(verifyUser.id).select(
          'status role verified',
        );
        if (isExistUser && isExistUser.status !== 'blocked') {
          req.user = {
            ...verifyUser,
            role: isExistUser.role,
          };
        }
      }
    }
  } catch (err) {
    // Non-fatal for optional auth
  }
  next();
};

// Check-in endpoints (Admins and Door Staff)
router.post(
  '/check-in',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  validateRequest(BookingsValidations.checkInTicketZod),
  BookingsController.checkInTicket,
);
router.post(
  '/check-in/:ticketCode',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  BookingsController.checkInTicket,
);

// Public Ticket View / Print / PDF Download
router.get('/ticket/:idOrCode', BookingsController.getTicketHtml);

// User Bookings Alias Route
router.get('/my-bookings', auth(), BookingsController.getAllBookings);

// Main Booking Routes
router
  .route('/')
  .post(
    auth(),
    validateRequest(BookingsValidations.createBookingZod),
    BookingsController.bookEvent,
  )
  .get(auth(), BookingsController.getAllBookings);


router
  .route('/:id')
  .get(auth(), BookingsController.getBookingById)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    validateRequest(BookingsValidations.updateBookingStatusZod),
    BookingsController.updateBookingStatus,
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    BookingsController.deleteBooking,
  );

export const BookingsRoutes = router;
