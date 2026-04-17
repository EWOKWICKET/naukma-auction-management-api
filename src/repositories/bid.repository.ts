import { prisma } from '../db/prisma';

export const bidRepository = {
  findTopBidForLot: (lotId: string) =>
    prisma.bid.findFirst({
      where: { lotId },
      orderBy: { amount: 'desc' },
    }),

  findByLot: (lotId: string) =>
    prisma.bid.findMany({
      where: { lotId },
      orderBy: { amount: 'desc' },
      include: { bidder: { select: { id: true, email: true } } },
    }),
};
