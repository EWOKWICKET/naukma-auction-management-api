import { Bid, LotStatus, TransactionType } from '@prisma/client';
import { prisma } from '../db/prisma';
import { lotRepository } from '../repositories/lot.repository';
import { bidRepository } from '../repositories/bid.repository';
import { NotFoundError } from '../errors/NotFoundError';
import { BadRequestError } from '../errors/BadRequestError';

const SNIPER_WINDOW_MS = 10 * 60 * 1000;

export const bidsService = {
  async placeBid(lotId: string, bidderId: string, amount: number) {
    const lot = await lotRepository.findById(lotId);
    if (!lot) throw new NotFoundError('Lot');
    if (lot.status !== LotStatus.ACTIVE) throw new BadRequestError('Lot is not active');
    if (new Date() >= lot.endTime) throw new BadRequestError('Lot has ended');
    if (amount <= Number(lot.currentPrice)) {
      throw new BadRequestError(`Bid must exceed current price of ${lot.currentPrice}`);
    }

    const bidder = await prisma.user.findUnique({ where: { id: bidderId } });
    if (!bidder) throw new NotFoundError('User');
    if (Number(bidder.balance) < amount) throw new BadRequestError('Insufficient balance');

    const prevTopBid = await bidRepository.findTopBidForLot(lotId);

    const sniperExtension =
      lot.endTime.getTime() - Date.now() < SNIPER_WINDOW_MS
        ? new Date(Date.now() + SNIPER_WINDOW_MS)
        : undefined;

    let newBid: Bid | undefined;

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: bidderId },
        data: { balance: { decrement: amount }, frozenBalance: { increment: amount } },
      });

      if (prevTopBid) {
        await tx.user.update({
          where: { id: prevTopBid.bidderId },
          data: {
            balance: { increment: Number(prevTopBid.amount) },
            frozenBalance: { decrement: Number(prevTopBid.amount) },
          },
        });
        await tx.transaction.create({
          data: {
            userId: prevTopBid.bidderId,
            type: TransactionType.RELEASE,
            amount: prevTopBid.amount,
            referenceId: lotId,
          },
        });
      }

      await tx.transaction.create({
        data: { userId: bidderId, type: TransactionType.HOLD, amount, referenceId: lotId },
      });

      await tx.lot.update({
        where: { id: lotId },
        data: {
          currentPrice: amount,
          ...(sniperExtension ? { endTime: sniperExtension } : {}),
        },
      });

      newBid = await tx.bid.create({
        data: { lotId, bidderId, amount },
      });
    });

    return newBid!;
  },

  async getBidsForLot(lotId: string) {
    const lot = await lotRepository.findById(lotId);
    if (!lot) throw new NotFoundError('Lot');

    return bidRepository.findByLot(lotId);
  },
};
