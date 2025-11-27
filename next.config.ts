import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    ".replit.dev",
    ".riker.replit.dev",
    ".repl.co"
  ]
};

export default nextConfig;
