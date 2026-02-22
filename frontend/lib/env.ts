import { z } from "zod";

const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().min(1),
});

const processEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
};

// Validate env vars at runtime
const parsed = envSchema.safeParse(processEnv);

if (!parsed.success) {
    console.error(
        "❌ Invalid environment variables:",
        parsed.error.flatten().fieldErrors,
    );
    throw new Error("Invalid environment variables");
}

export const env = parsed.data;
