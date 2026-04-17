import { Router } from 'express';
import { bidsController } from '../controllers/bids.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { validate } from '../middlewares/validate.middleware';
import { placeBidSchema } from '../schemas/bid.schema';

const router = Router({ mergeParams: true });

router.use(authenticate);

router.post('/', validate(placeBidSchema), bidsController.place);
router.get('/', bidsController.listForLot);

export default router;
