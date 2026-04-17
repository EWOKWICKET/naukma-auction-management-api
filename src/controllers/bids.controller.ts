import { Request, Response, NextFunction } from 'express';
import { bidsService } from '../services/bids.service';

export const bidsController = {
  async place(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bid = await bidsService.placeBid(req.params.lotId, req.user.id, req.body.amount);
      res.status(201).json(bid);
    } catch (err) {
      next(err);
    }
  },

  async listForLot(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const bids = await bidsService.getBidsForLot(req.params.lotId);
      res.json(bids);
    } catch (err) {
      next(err);
    }
  },
};
