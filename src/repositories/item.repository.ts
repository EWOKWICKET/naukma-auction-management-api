import { Prisma, ItemStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

export const itemRepository = {
  create: (data: Prisma.ItemCreateInput) =>
    prisma.item.create({ data }),

  findById: (id: string) =>
    prisma.item.findUnique({
      where: { id },
      include: { owner: { select: { id: true, email: true } } },
    }),

  findByOwner: (ownerId: string) =>
    prisma.item.findMany({ where: { ownerId }, orderBy: { createdAt: 'desc' } }),

  findAll: () =>
    prisma.item.findMany({ orderBy: { createdAt: 'desc' } }),

  update: (id: string, data: Prisma.ItemUpdateInput) =>
    prisma.item.update({ where: { id }, data }),

  updateStatus: (id: string, status: ItemStatus) =>
    prisma.item.update({ where: { id }, data: { status } }),

  delete: (id: string) =>
    prisma.item.delete({ where: { id } }),
};
