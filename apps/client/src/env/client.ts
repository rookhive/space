import { z } from 'zod/v4';

export const env = z
  .object({
    VITE_API_URL: z.url(),
    VITE_CORE_URL: z.url(),
    VITE_SFU_URL: z.url(),
    VITE_REPOSITORY_URL: z.url().optional(),
  })
  .parse(import.meta.env);
