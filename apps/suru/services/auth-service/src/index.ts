/**
 * Auth Service Entry Point
 */

import { fastifyConnectPlugin } from '@connectrpc/connect-fastify';
import { PrismaClient } from '@prisma/client';
import { fastify } from 'fastify';

import { InMemorySessionRepository } from './infrastructure/repositories/in-memory-session-repository';
import { PrismaUserRepository } from './infrastructure/repositories/prisma-user-repository';
import { AuthServiceHandler } from './presentation/grpc/auth-service';

const PORT = process.env.PORT ? Number.parseInt(process.env.PORT) : 50053;
const HOST = process.env.HOST || '0.0.0.0';

async function main() {
  // Initialize Prisma
  const prisma = new PrismaClient();

  try {
    await prisma.$connect();
    console.log('Connected to database');
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }

  // Initialize repositories
  const userRepository = new PrismaUserRepository(prisma);
  // TODO: Replace InMemorySessionRepository with PrismaSessionRepository once Session table is added
  const sessionRepository = new InMemorySessionRepository();

  // Initialize service handler
  const authServiceHandler = new AuthServiceHandler(userRepository, sessionRepository);

  // Create Fastify server
  const server = fastify({
    logger: true,
  });

  // Register Connect plugin
  await server.register(fastifyConnectPlugin, {
    routes: (router) => {
      authServiceHandler.registerRoutes(router);
    },
  });

  // Start server
  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`Auth Service listening on ${HOST}:${PORT}`);
  } catch (error) {
    console.error('Failed to start server:', error);
    await prisma.$disconnect();
    process.exit(1);
  }

  // Graceful shutdown
  const shutdown = async () => {
    console.log('Shutting down gracefully...');
    await server.close();
    await prisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
