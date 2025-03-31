import { loadEnv } from '@packages/env';
import { NodeSchema } from '@packages/shared-schemas';

export const env = loadEnv({ schema: NodeSchema });
