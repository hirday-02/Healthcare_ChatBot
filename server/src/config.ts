import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const resolveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: resolveNumber(process.env.PORT, 4000),
  googleApiKey: process.env.GOOGLE_API_KEY ?? '',
  dataDir: process.env.DATA_DIR
    ? path.resolve(process.env.DATA_DIR)
    : path.join(process.cwd(), 'data')
};

if (!config.googleApiKey) {
  console.warn(
    '[config] GOOGLE_API_KEY is not set. API routes depending on Gemini will return an error.'
  );
}

