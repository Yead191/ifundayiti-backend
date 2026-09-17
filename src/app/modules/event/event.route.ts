import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { EventController } from './event.controller';
import { EventValidation } from './event.validation';

const router = express.Router();

const eventUploadFields = [
  {
    name: 'image',
    maxCount: 1,
  },
  {
    name: 'avatar',
    maxCount: 10,
  },
];

router
  .route('/')
  .post(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(eventUploadFields),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        const parsed = JSON.parse(req.body.data);
        EventValidation.createEventZodSchema.parse({
          body: parsed,
        });
        req.body = parsed;
      }
      return EventController.createEvent(req, res, next);
    },
  )
  .get(EventController.getAllEvents);

router.get(
  '/stats/overview',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventController.getEventStats,
);

router.get(
  '/stats',
  auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
  EventController.getEventStats,
);

router.get('/upcoming', EventController.getNearestUpcomingEvent);

router
  .route('/:id')
  .get(EventController.getSingleEvent)
  .patch(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    fileUploadHandler(eventUploadFields),
    (req: Request, res: Response, next: NextFunction) => {
      if (req.body.data) {
        const parsed = JSON.parse(req.body.data);
        EventValidation.updateEventZodSchema.parse({
          body: parsed,
        });
        req.body = parsed;
      }
      return EventController.updateEvent(req, res, next);
    },
  )
  .delete(
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    EventController.deleteEvent,
  );

export const EventRoutes = router;
