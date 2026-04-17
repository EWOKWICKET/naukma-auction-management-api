import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export const userRepository = {
  findByEmail: (email: string) =>
    prisma.user.findUnique({ where: { email } }),

  findById: (id: string) =>
    prisma.user.findUnique({ where: { id } }),

  findByResetToken: (tokenHash: string) =>
    prisma.user.findFirst({
      where: {
        passwordResetToken: tokenHash,
        passwordResetExpiry: { gt: new Date() },
      },
    }),

  create: (data: Prisma.UserCreateInput) =>
    prisma.user.create({ data }),

  update: (id: string, data: Prisma.UserUpdateInput) =>
    prisma.user.update({ where: { id }, data }),

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
