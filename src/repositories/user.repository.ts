import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { NotFoundError } from '../errors/NotFoundError';

export const userRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id } }),

  async findByIdOrFail(id: string) {
    const user = await userRepository.findById(id);
    if (!user) throw new NotFoundError('User');

    return user;
  },

  create: (data: Prisma.UserCreateInput) => prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput) => prisma.user.update({ where: { id }, data }),

  findAll: () =>
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        isVerified: true,
        balance: true,
        frozenBalance: true,
        avatarUrl: true,
        createdAt: true,
      },
    }),

  deleteUnverifiedBefore: (cutoff: Date) =>
    prisma.user.deleteMany({
      where: { isVerified: false, createdAt: { lt: cutoff } },
    }),
};
