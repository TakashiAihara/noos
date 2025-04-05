import { config } from 'dotenv';
import { ZodObject, ZodRawShape, z } from 'zod';

config();

type LoadEnv<T extends ZodRawShape> = {
  schema: ZodObject<T>;
};

export const loadEnv = <T extends ZodRawShape>({ schema }: LoadEnv<T>): z.infer<ZodObject<T>> =>
  schema.parse(process.env);
