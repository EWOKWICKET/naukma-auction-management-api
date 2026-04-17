import { Prisma, LotStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { NotFoundError } from '../errors/NotFoundError';

type Tx = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const lotRepository = {
  create: (data: Prisma.LotCreateInput) =>
    prisma.lot.create({
      data,
      include: { item: true, seller: { select: { id: true, email: true } } },
    }),

  findById: (id: string) =>
    prisma.lot.findUnique({
      where: { id },
      include: {
        item: true,
        seller: { select: { id: true, email: true } },
        bids: { orderBy: { amount: 'desc' }, take: 10 },
      },
    }),

  async findByIdOrFail(id: string) {
    const lot = await lotRepository.findById(id);
    if (!lot) throw new NotFoundError('Lot');

    return lot;
  },

  findActive: () =>
    prisma.lot.findMany({
      where: { status: LotStatus.ACTIVE },
      include: { item: true, seller: { select: { id: true, email: true } } },
      orderBy: { endTime: 'asc' },
    }),

  findExpired: () =>
    prisma.lot.findMany({
      where: { status: LotStatus.ACTIVE, endTime: { lte: new Date() } },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } },
    }),

  update: (id: string, data: Prisma.LotUpdateInput, tx?: Tx) =>
    (tx ?? prisma).lot.update({ where: { id }, data }),
};
