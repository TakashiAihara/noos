import { PrismaClient } from '@prisma/client';
import { env } from './env';

declare global {
  var __prisma: PrismaClient | undefined;
}

const isDevelopment = env.NODE_ENV === 'development';

export const prisma =
  global.__prisma ??
  new PrismaClient({
    log: isDevelopment ? ['query', 'error', 'warn', 'info'] : ['error'],
  });

if (isDevelopment) {
  global.__prisma = prisma;
}
