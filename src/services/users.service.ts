import { Prisma, TransactionType } from '@prisma/client';
import { prisma } from '../db/prisma';
import { userRepository } from '../repositories/user.repository';
import { uploadImage, deleteImage } from '../clients/cloudinary.client';

type Tx = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export const usersService = {
  async freezeFunds(userId: string, amount: Prisma.Decimal | number, lotId: string, tx?: Tx) {
    const run = async (db: Tx) => {
      await db.user.update({
        where: { id: userId },
        data: { balance: { decrement: amount }, frozenBalance: { increment: amount } },
      });
      await db.transaction.create({
        data: { userId, type: TransactionType.HOLD, amount, referenceId: lotId },
      });
    };

    await (tx ? run(tx) : prisma.$transaction(run));
  },

  async unfreezeFunds(userId: string, amount: Prisma.Decimal | number, lotId: string, tx?: Tx) {
    const run = async (db: Tx) => {
      await db.user.update({
        where: { id: userId },
        data: { balance: { increment: amount }, frozenBalance: { decrement: amount } },
      });
      await db.transaction.create({
        data: { userId, type: TransactionType.RELEASE, amount, referenceId: lotId },
      });
    };

    await (tx ? run(tx) : prisma.$transaction(run));
  },

  async transferFromFrozen(
    winnerId: string,
    sellerId: string,
    amount: Prisma.Decimal | number,
    lotId: string,
    tx?: Tx,
  ) {
    const run = async (db: Tx) => {
      await db.user.update({
        where: { id: winnerId },
        data: { frozenBalance: { decrement: amount } },
      });
      await db.user.update({
        where: { id: sellerId },
        data: { balance: { increment: amount } },
      });
      await db.transaction.create({
        data: { userId: sellerId, type: TransactionType.TRANSFER, amount, referenceId: lotId },
      });
    };

    await (tx ? run(tx) : prisma.$transaction(run));
  },

  async cleanupUnverified(cutoff: Date) {
    return userRepository.deleteUnverifiedBefore(cutoff);
  },

  async findOne(userId: string) {
    return userRepository.findByIdOrFail(userId);
  },

  async getProfile(userId: string) {
    const user = await userRepository.findByIdOrFail(userId);
    const { passwordHash, ...safe } = user;

    return safe;
  },

  async deposit(userId: string, amount: number) {
    const [user] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { balance: { increment: amount } } }),
      prisma.transaction.create({ data: { userId, type: TransactionType.DEPOSIT, amount } }),
    ]);
    const { passwordHash, ...safe } = user;

    return safe;
  },

  async uploadAvatar(userId: string, buffer: Buffer) {
    await userRepository.findByIdOrFail(userId);

    const url = await uploadImage(buffer, 'auction-avatars', userId);
    const updated = await userRepository.update(userId, { avatarUrl: url });
    const { passwordHash, ...safe } = updated;

    return safe;
  },

  async deleteAvatar(userId: string) {
    const user = await userRepository.findByIdOrFail(userId);

    if (user.avatarUrl) {
      await deleteImage('auction-avatars', userId);
    }

    const updated = await userRepository.update(userId, { avatarUrl: null });
    const { passwordHash, ...safe } = updated;

    return safe;
  },

  async listAll() {
    return userRepository.findAll();
  },

  async getById(id: string) {
    const user = await userRepository.findByIdOrFail(id);
    const { passwordHash, ...safe } = user;

    return safe;
  },
};
