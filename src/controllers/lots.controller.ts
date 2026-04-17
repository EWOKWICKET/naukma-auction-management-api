import { Request, Response, NextFunction } from 'express';
import { lotsService } from '../services/lots.service';

export const lotsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { itemId, startPrice, startTime, endTime } = req.body;
      const lot = await lotsService.create(req.user.id, itemId, startPrice, startTime, endTime);
      res.status(201).json(lot);
    } catch (err) {
      next(err);
    }
  },

  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lots = await lotsService.list();
      res.json(lots);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const lot = await lotsService.getById(req.params.id);
      res.json(lot);
    } catch (err) {
      next(err);
    }
  },
};
