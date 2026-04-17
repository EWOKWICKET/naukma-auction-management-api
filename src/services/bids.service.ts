import { LotStatus } from '@prisma/client';
import { prisma } from '../db/prisma';
import { lotsService } from './lots.service';
import { bidRepository } from '../repositories/bid.repository';
import { usersService } from './users.service';
import { BadRequestError } from '../errors/BadRequestError';

const SNIPER_WINDOW_MS = 10 * 60 * 1000;

export const bidsService = {
  async placeBid(lotId: string, bidderId: string, amount: number) {
    const lot = await lotsService.getById(lotId);
    if (lot.status !== LotStatus.ACTIVE) throw new BadRequestError('Lot is not active');
    if (new Date() >= lot.endTime) throw new BadRequestError('Lot has ended');
    if (amount <= Number(lot.currentPrice)) {
      throw new BadRequestError(`Bid must exceed current price of ${lot.currentPrice}`);
    }

    const bidder = await usersService.findOne(bidderId);
    if (Number(bidder.balance) < amount) throw new BadRequestError('Insufficient balance');

    const prevTopBid = await bidRepository.findTopBidForLot(lotId);

    const sniperExtension =
      lot.endTime.getTime() - Date.now() < SNIPER_WINDOW_MS
        ? new Date(Date.now() + SNIPER_WINDOW_MS)
        : undefined;

    return prisma.$transaction(async (tx) => {
      await usersService.freezeFunds(bidderId, amount, lotId, tx);

      if (prevTopBid) {
        await usersService.unfreezeFunds(prevTopBid.bidderId, prevTopBid.amount, lotId, tx);
      }

      await lotsService.update(
        lotId,
        {
          currentPrice: amount,
          ...(sniperExtension ? { endTime: sniperExtension } : {}),
        },
        tx,
      );

      return bidRepository.create(
        { lot: { connect: { id: lotId } }, bidder: { connect: { id: bidderId } }, amount },
        tx,
      );
    });
  },

  async getBidsForLot(lotId: string) {
    await lotsService.getById(lotId);

    return bidRepository.findByLot(lotId);
  },
};
