import { TransactionType } from '@prisma/client';
import { prisma } from '../db/prisma';

export const transactionRepository = {
  create: (userId: string, type: TransactionType, amount: number, referenceId?: string) =>
    prisma.transaction.create({
      data: {
        user: { connect: { id: userId } },
        type,
        amount,
        ...(referenceId ? { lot: { connect: { id: referenceId } } } : {}),
      },
    }),
};
