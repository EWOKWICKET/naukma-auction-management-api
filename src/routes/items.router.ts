import { Router } from 'express';
import { itemsController } from '../controllers/items.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { upload } from '../middlewares/upload.middleware';
import { createItemSchema, updateItemSchema } from '../schemas/item.schema';

const router = Router();

router.use(authenticate);

router.post('/', validate(createItemSchema), itemsController.create);
router.get('/', itemsController.list);
router.get('/:id', itemsController.getById);
router.patch('/:id', validate(updateItemSchema), itemsController.update);
router.delete('/:id', itemsController.delete);
router.post('/:id/image', upload.single('image'), itemsController.uploadImage);
router.post('/:id/approve', requireRole('ADMIN'), itemsController.approve);
router.post('/:id/reject', requireRole('ADMIN'), itemsController.reject);

export default router;
