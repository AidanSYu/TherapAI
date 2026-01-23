import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@langchain/core', '@langchain/openai', '@langchain/community', 'langchain'],
};

export default nextConfig;
