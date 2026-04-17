import { Router } from 'express';
import authRouter from './auth.router';
import usersRouter from './users.router';
import itemsRouter from './items.router';
import lotsRouter from './lots.router';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/items', itemsRouter);
router.use('/lots', lotsRouter);

export default router;
