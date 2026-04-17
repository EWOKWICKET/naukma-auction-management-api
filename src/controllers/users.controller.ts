import { Request, Response, NextFunction } from 'express';
import { usersService } from '../services/users.service';

type UserRequest = Request<{ id: string }>;

export const usersController = {
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const profile = await usersService.getProfile(req.user.id);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  async deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await usersService.deposit(req.user.id, req.body.amount);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async uploadAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });

        return;
      }
      const updated = await usersService.uploadAvatar(req.user.id, req.file.buffer);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async deleteAvatar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const updated = await usersService.deleteAvatar(req.user.id);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },

  async listAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const users = await usersService.listAll();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: UserRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = await usersService.getById(req.params.id);
      res.json(user);
    } catch (err) {
      next(err);
    }
  },
};
