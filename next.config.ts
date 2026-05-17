import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: [
    'dockerode',
    'ssh2',
    'better-sqlite3',
    'cpu-features',
  ],
};

export default nextConfig;
