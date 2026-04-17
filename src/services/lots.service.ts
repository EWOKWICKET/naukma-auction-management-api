import { itemRepository } from '../repositories/item.repository';
import { lotRepository } from '../repositories/lot.repository';
import { NotFoundError } from '../errors/NotFoundError';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ConflictError } from '../errors/ConflictError';

export const lotsService = {
  async create(
    userId: string,
    itemId: string,
    startPrice: number,
    startTime: string,
    endTime: string,
  ) {
    const item = await itemRepository.findById(itemId);
    if (!item) throw new NotFoundError('Item');
    if (item.ownerId !== userId) throw new ForbiddenError();
    if (item.status !== 'APPROVED') throw new ConflictError('Item must be APPROVED to create a lot');

    return lotRepository.create({
      item: { connect: { id: itemId } },
      seller: { connect: { id: userId } },
      startPrice,
      currentPrice: startPrice,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
    });
  },

  async list() {
    return lotRepository.findActive();
  },

  async getById(id: string) {
    const lot = await lotRepository.findById(id);
    if (!lot) throw new NotFoundError('Lot');

    return lot;
  },
};
