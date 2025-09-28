import { Injectable, Logger } from '@nestjs/common';
import { loadEnv } from '@packages/env';
import { NodeSchema } from '@packages/shared-schemas';
import { z } from 'zod';

const logger = new Logger();
const envSchema = NodeSchema;

export type Env = z.infer<typeof envSchema>;

@Injectable()
export class ConfigService {
  readonly env: Env;

  constructor() {
    this.env = loadEnv({ schema: envSchema });
    logger.log('ConfigService initialized');
    logger.log(`NODE_ENV: ${this.env.NODE_ENV}`);
  }
}
