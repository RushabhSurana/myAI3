import type { NextConfig } from "next";

const replitDevDomain = process.env.REPLIT_DEV_DOMAIN || "";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: ["*"]
    }
  },
  allowedDevOrigins: [
    "localhost",
    "127.0.0.1",
    replitDevDomain,
    `.${replitDevDomain}`,
  ].filter(Boolean)
};

export default nextConfig;
