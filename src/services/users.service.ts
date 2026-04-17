import { prisma } from '../db/prisma';
import { userRepository } from '../repositories/user.repository';
import { uploadImage, deleteImage } from '../clients/cloudinary.client';
import { NotFoundError } from '../errors/NotFoundError';

export const usersService = {
  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');
    const { passwordHash, passwordResetToken, passwordResetExpiry, ...safe } = user;

    return safe;
  },

  async deposit(userId: string, amount: number) {
    const [user] = await prisma.$transaction([
      prisma.user.update({ where: { id: userId }, data: { balance: { increment: amount } } }),
      prisma.transaction.create({ data: { userId, type: 'DEPOSIT', amount } }),
    ]);
    const { passwordHash, passwordResetToken, passwordResetExpiry, ...safe } = user;

    return safe;
  },

  async uploadAvatar(userId: string, buffer: Buffer) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    const { url, publicId } = await uploadImage(buffer, 'auction-avatars');
    const updated = await userRepository.update(userId, { avatarUrl: url, avatarPublicId: publicId });
    const { passwordHash, passwordResetToken, passwordResetExpiry, ...safe } = updated;

    return safe;
  },

  async deleteAvatar(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User');

    if (user.avatarPublicId) {
      await deleteImage(user.avatarPublicId);
    }

    const updated = await userRepository.update(userId, { avatarUrl: null, avatarPublicId: null });
    const { passwordHash, passwordResetToken, passwordResetExpiry, ...safe } = updated;

    return safe;
  },

  async listAll() {
    return userRepository.findAll();
  },

  async getById(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');
    const { passwordHash, passwordResetToken, passwordResetExpiry, ...safe } = user;

    return safe;
  },
};
