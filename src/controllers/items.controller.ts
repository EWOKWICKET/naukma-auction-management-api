import { Request, Response, NextFunction } from 'express';
import { itemsService } from '../services/items.service';

type ItemRequest = Request<{ id: string }>;

export const itemsController = {
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await itemsService.create(req.user.id, req.body.title, req.body.description);
      res.status(201).json(item);
    } catch (err) {
      next(err);
    }
  },

  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const items = await itemsService.list(req.user.id, req.user.role);
      res.json(items);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: ItemRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await itemsService.getById(req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  async update(req: ItemRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await itemsService.update(req.params.id, req.user.id, req.body);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: ItemRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      await itemsService.delete(req.params.id, req.user.id);
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },

  async uploadImage(req: ItemRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });

        return;
      }
      const item = await itemsService.uploadImage(req.params.id, req.user.id, req.file.buffer);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  async approve(req: ItemRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await itemsService.approve(req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },

  async reject(req: ItemRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const item = await itemsService.reject(req.params.id);
      res.json(item);
    } catch (err) {
      next(err);
    }
  },
};
