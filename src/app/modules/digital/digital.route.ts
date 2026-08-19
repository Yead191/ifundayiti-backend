import express from 'express';
import { DigitalController } from './digital.controller';
import auth from '../../middlewares/auth';

const router = express.Router();

router.route('/').get(auth(), DigitalController.getDigitalProducts);

router.route('/:id').get(auth(), DigitalController.getMySingleProduct);

export const DigitalRoutes = router;
