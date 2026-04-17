import { Router } from 'express';
import { lotsController } from '../controllers/lots.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createLotSchema } from '../schemas/lot.schema';
import bidsRouter from './bids.router';

const router = Router();

router.get('/', lotsController.list);
router.get('/:id', lotsController.getById);
router.post('/', authenticate, validate(createLotSchema), lotsController.create);
router.use('/:lotId/bids', bidsRouter);

export default router;
