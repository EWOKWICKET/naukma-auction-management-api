import { ItemStatus, LotStatus, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { lotRepository } from '../repositories/lot.repository';
import { itemsService } from './items.service';
import { ForbiddenError } from '../errors/ForbiddenError';
import { ConflictError } from '../errors/ConflictError';

type Tx = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const lotsService = {
  async create(
    userId: string,
    itemId: string,
    startPrice: number,
    startTime: string,
    endTime: string,
  ) {
    const item = await itemsService.getById(itemId);
    if (item.ownerId !== userId) throw new ForbiddenError();
    if (item.status !== ItemStatus.APPROVED)
      throw new ConflictError('Item must be APPROVED to create a lot');

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
    return lotRepository.findByIdOrFail(id);
  },

  async findExpired() {
    return lotRepository.findExpired();
  },

  async update(id: string, data: Prisma.LotUpdateInput, tx?: Tx) {
    return lotRepository.update(id, data, tx);
  },

  async complete(id: string, tx?: Tx) {
    return lotRepository.update(id, { status: LotStatus.COMPLETED }, tx);
  },

  async cancel(id: string, tx?: Tx) {
    return lotRepository.update(id, { status: LotStatus.CANCELLED }, tx);
  },
};
