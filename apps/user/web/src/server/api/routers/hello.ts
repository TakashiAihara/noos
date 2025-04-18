import { createTRPCRouter, publicProcedure } from '@/server/api/trpc';

export const helloRouter = createTRPCRouter({
  hello: publicProcedure.query(async () => 'Hello!'),
});
