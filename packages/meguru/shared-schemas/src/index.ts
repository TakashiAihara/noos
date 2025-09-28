import { z } from 'zod';

export const NodeSchema = z.object({
  NODE_ENV: z.enum(['development', 'production']).default('production'),
});
