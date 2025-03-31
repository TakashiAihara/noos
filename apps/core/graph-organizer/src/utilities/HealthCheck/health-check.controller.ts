import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { PrismaService } from '@packages/db/nestjs';

@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prismaService: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async () => {
        await this.prismaService.$queryRaw`SELECT 1`;
        return { database: { status: 'up' } };
      },
    ]);
  }
}
