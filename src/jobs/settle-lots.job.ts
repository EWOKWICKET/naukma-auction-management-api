import cron from 'node-cron';
import { ItemStatus, LotStatus, TransactionType } from '@prisma/client';
import { prisma } from '../db/prisma';
import { lotRepository } from '../repositories/lot.repository';

export async function runSettleLots(): Promise<void> {
  const expiredLots = await lotRepository.findExpired();

  for (const lot of expiredLots) {
    const topBid = lot.bids[0];

    if (!topBid) {
      await lotRepository.update(lot.id, { status: LotStatus.CANCELLED });
      console.log(`[settle] Lot ${lot.id} cancelled (no bids)`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: topBid.bidderId },
        data: { frozenBalance: { decrement: topBid.amount } },
      });

      await tx.user.update({
        where: { id: lot.sellerId },
        data: { balance: { increment: topBid.amount } },
      });

      await tx.transaction.create({
        data: {
          userId: lot.sellerId,
          type: TransactionType.TRANSFER,
          amount: topBid.amount,
          referenceId: lot.id,
        },
      });

      await tx.item.update({
        where: { id: lot.itemId },
        data: { status: ItemStatus.SOLD, ownerId: topBid.bidderId },
      });

      await tx.lot.update({
        where: { id: lot.id },
        data: { status: LotStatus.COMPLETED },
      });
    });

    console.log(`[settle] Lot ${lot.id} completed, winner: ${topBid.bidderId}`);
  }
}

export function scheduleSettleLots(): void {
  cron.schedule('* * * * *', runSettleLots);
}
