import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Allows the dev server to accept requests from devices on your local
   * network (e.g. a phone scanning a QR code that points to your machine's
   * LAN IP during development). Add your machine's IP here if it changes.
   * Not needed in production — this only affects `next dev`.
   */
  allowedDevOrigins: ["10.72.222.233", "localhost", "127.0.0.1"],
};

export default nextConfig;
