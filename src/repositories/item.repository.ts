import { Prisma, ItemStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { NotFoundError } from '../errors/NotFoundError';

type Tx = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const itemRepository = {
  create: (data: Prisma.ItemCreateInput) => prisma.item.create({ data }),

  findById: (id: string) =>
    prisma.item.findUnique({
      where: { id },
      include: { owner: { select: { id: true, email: true } } },
    }),

  async findByIdOrFail(id: string) {
    const item = await itemRepository.findById(id);
    if (!item) throw new NotFoundError('Item');

    return item;
  },

  findByOwner: (ownerId: string) =>
    prisma.item.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } }),

  findAll: () => prisma.item.findMany({ orderBy: { createdAt: 'desc' } }),

  update: (id: string, data: Prisma.ItemUpdateInput, tx?: Tx) =>
    (tx ?? prisma).item.update({ where: { id }, data }),

  updateStatus: (id: string, status: ItemStatus, tx?: Tx) =>
    (tx ?? prisma).item.update({ where: { id }, data: { status } }),

  delete: (id: string) => prisma.item.delete({ where: { id } }),
};
