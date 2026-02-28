import { z } from "zod";

const envSchema = z.object({
    NEXT_PUBLIC_API_URL: z.string().min(1),
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: z.string().optional(),
});

const processEnv = {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
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
