import { Role } from '@prisma/client';
import { Router } from 'express';
import { usersController } from '../controllers/users.controller';
import { authenticate } from '../middlewares/authenticate.middleware';
import { requireRole } from '../middlewares/require-role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { upload } from '../middlewares/upload.middleware';
import { depositSchema } from '../schemas/user.schema';

const router = Router();

router.use(authenticate);

router.get('/me', usersController.getMe);
router.post('/me/avatar', upload.single('avatar'), usersController.uploadAvatar);
router.delete('/me/avatar', usersController.deleteAvatar);
router.post('/me/deposit', validate(depositSchema), usersController.deposit);
router.get('/', requireRole(Role.ADMIN), usersController.listAll);
router.get('/:id', requireRole(Role.ADMIN), usersController.getById);

export default router;
