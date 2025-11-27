import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  allowedDevOrigins: [
    "*.replit.dev",
    "*.repl.co",
    "127.0.0.1"
  ]
};

export default nextConfig;
