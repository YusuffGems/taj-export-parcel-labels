import type { NextConfig } from "next";

// Static export: the app is 100% client-side (IndexedDB), so it can be hosted
// anywhere and works offline once installed as a PWA.
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
