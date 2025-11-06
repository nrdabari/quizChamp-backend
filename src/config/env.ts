export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 5000),
  FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:5173',
  MONGO_URI: process.env.MONGO_URI ?? '',
} as const;