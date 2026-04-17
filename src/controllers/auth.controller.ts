import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';

export const authController = {
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.register(req.body.email, req.body.password);
      res.status(201).json({ message: 'Registration successful. Check your email to verify your account.' });
    } catch (err) {
      next(err);
    }
  },

  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = await authService.login(req.body.email, req.body.password);
      res.json({ token });
    } catch (err) {
      next(err);
    }
  },

  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const token = req.query.token as string;
      if (!token) {
        res.status(400).json({ message: 'Token is required' });

        return;
      }
      await authService.verifyEmail(token);
      res.json({ message: 'Email verified successfully' });
    } catch (err) {
      next(err);
    }
  },

  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.requestPasswordReset(req.body.email);
      res.json({ message: 'If that email is registered, a reset link has been sent.' });
    } catch (err) {
      next(err);
    }
  },

  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await authService.resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Password reset successfully' });
    } catch (err) {
      next(err);
    }
  },
};
