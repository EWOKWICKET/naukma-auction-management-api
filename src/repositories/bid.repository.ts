import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

type Tx = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const bidRepository = {
  create: (data: Prisma.BidCreateInput, tx?: Tx) => (tx ?? prisma).bid.create({ data }),

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
