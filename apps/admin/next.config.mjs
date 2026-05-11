import { config } from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load env from the monorepo root so both apps share one .env file.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, '../../.env') });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@roua/db'],
  experimental: {
    serverActions: { bodySizeLimit: '20mb' },
  },
};

export default nextConfig;
