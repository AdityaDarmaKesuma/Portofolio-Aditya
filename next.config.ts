import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Mengabaikan error TypeScript ketat saat proses build di Vercel
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
