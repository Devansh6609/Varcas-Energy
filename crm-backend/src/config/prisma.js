import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';

export const prismaMiddleware = async (c, next) => {
  // Create PrismaClient per-request when using D1 to ensure fresh bindings
  let prisma;
  if (c.env.DB) {
    const adapter = new PrismaD1(c.env.DB);
    prisma = new PrismaClient({ adapter });
  } else {
    // Fallback for local development without D1
    prisma = new PrismaClient();
  }
  
  c.set('prisma', prisma);
  await next();
};
