import { TransactionType } from '@prisma/client';
import { prisma } from '../db/prisma';
import { userRepository } from '../repositories/user.repository';
import { uploadImage, deleteImage } from '../clients/cloudinary.client';
import { NotFoundError } from '../errors/NotFoundError';

export const usersService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
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
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    const url = await uploadImage(buffer, 'auction-avatars', userId);
    const updated = await userRepository.update(userId, { avatarUrl: url });
    const { passwordHash, ...safe } = updated;

    return safe;
  },

  async deleteAvatar(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

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
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    const { passwordHash, ...safe } = user;

    return safe;
  },
};
