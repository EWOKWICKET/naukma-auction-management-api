import { ItemStatus, Role } from '@prisma/client';
import { itemRepository } from '../repositories/item.repository';
import { uploadImage } from '../clients/cloudinary.client';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ConflictError } from '../errors/ConflictError';
import { BadRequestError } from '../errors/BadRequestError';

export const itemsService = {
  async create(ownerId: string, title: string, description: string) {
    return itemRepository.create({ owner: { connect: { id: ownerId } }, title, description });
  },

  async list(userId: string, role: string) {
    if (role === Role.ADMIN) return itemRepository.findAll();

    return itemRepository.findByOwner(userId);
  },

  async getById(id: string) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError('Item');

    return item;
  },

  async update(id: string, userId: string, data: { title?: string; description?: string }) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError('Item');
    if (item.ownerId !== userId) throw new ForbiddenError();
    if (item.status !== ItemStatus.PENDING) throw new ConflictError('Only PENDING items can be edited');

    return itemRepository.update(id, data);
  },

  async delete(id: string, userId: string) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError('Item');
    if (item.ownerId !== userId) throw new ForbiddenError();
    if (item.status !== ItemStatus.PENDING) throw new ConflictError('Only PENDING items can be deleted');

    await itemRepository.delete(id);
  },

  async uploadImage(id: string, userId: string, buffer: Buffer) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError('Item');
    if (item.ownerId !== userId) throw new ForbiddenError();

    const url = await uploadImage(buffer, 'auction-items', id);

    return itemRepository.update(id, { imageUrl: url });
  },

  async approve(id: string) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError('Item');
    if (item.status !== ItemStatus.PENDING) throw new BadRequestError('Item is not in PENDING status');

    return itemRepository.updateStatus(id, ItemStatus.APPROVED);
  },

  async reject(id: string) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError('Item');
    if (item.status !== ItemStatus.PENDING) throw new BadRequestError('Item is not in PENDING status');

    return itemRepository.updateStatus(id, ItemStatus.REJECTED);
  },
};
