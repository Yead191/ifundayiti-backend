import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { EventController } from './event.controller';
import { EventValidation } from './event.validation';

const router = express.Router();

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = EventValidation.createEventZodSchema.parse({
          body: JSON.parse(req.body.data),
        });
      }
      return EventController.createEvent(req, res, next);
    },
  )
  .get(EventController.getAllEvents);

router.get(
  '/stats',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventController.getEventStats,
);

router
  .route('/:id')
  .get(EventController.getSingleEvent)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        req.body = EventValidation.updateEventZodSchema.parse({
          body: JSON.parse(req.body.data),
        });
      }
      return EventController.updateEvent(req, res, next);
    },
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    EventController.deleteEvent,
  );

export const EventRoutes = router;
