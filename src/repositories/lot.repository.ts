import { Prisma, LotStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

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

  update: (id: string, data: Prisma.LotUpdateInput) =>
    prisma.lot.update({ where: { id }, data }),
};
