import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(10, "NEXT_PUBLIC_SUPABASE_ANON_KEY is required and must be valid"),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional().default("https://nmimssports.com"),
});

const serverEnvSchema = clientEnvSchema.extend({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10, "SUPABASE_SERVICE_ROLE_KEY is required for server admin operations"),
});

let validatedClientEnv: z.infer<typeof clientEnvSchema> | null = null;
let validatedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

export function getClientEnv() {
  if (validatedClientEnv) return validatedClientEnv;

  const parsed = clientEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  });

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(`[CRITICAL] Missing or invalid client environment variables: ${errorDetails}`);
  }

  validatedClientEnv = parsed.data;
  return validatedClientEnv;
}

export function getServerEnv() {
  if (validatedServerEnv) return validatedServerEnv;

  const parsed = serverEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  });

  if (!parsed.success) {
    const errorDetails = parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", ");
    throw new Error(`[CRITICAL] Missing or invalid server environment variables: ${errorDetails}`);
  }

  validatedServerEnv = parsed.data;
  return validatedServerEnv;
}
