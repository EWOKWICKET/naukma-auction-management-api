import cron from 'node-cron';
import { prisma } from '../db/prisma';
import { lotsService } from '../services/lots.service';
import { usersService } from '../services/users.service';
import { itemsService } from '../services/items.service';

export async function runSettleLots(): Promise<void> {
  const expiredLots = await lotsService.findExpired();

  for (const lot of expiredLots) {
    const topBid = lot.bids[0];

    if (!topBid) {
      await lotsService.cancel(lot.id);
      console.log(`[settle] Lot ${lot.id} cancelled (no bids)`);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      await usersService.transferFromFrozen(
        topBid.bidderId,
        lot.sellerId,
        topBid.amount,
        lot.id,
        tx,
      );
      await itemsService.markSold(lot.itemId, topBid.bidderId, tx);
      await lotsService.complete(lot.id, tx);
    });

    console.log(`[settle] Lot ${lot.id} completed, winner: ${topBid.bidderId}`);
  }
}

export function scheduleSettleLots(): void {
  cron.schedule('* * * * *', runSettleLots);
}
