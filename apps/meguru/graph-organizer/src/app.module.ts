import { Module } from '@nestjs/common';
import { PrismaModule } from '@packages/db/nestjs';
import { ConfigModule } from './utilities/Config/config.module';
import { HealthModule } from './utilities/HealthCheck/health-check.module';

@Module({
  imports: [PrismaModule, HealthModule, ConfigModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
