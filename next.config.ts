import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "image.pollinations.ai", port: "", pathname: "/prompt/**", search: "" },
    ],
  },
};
export default nextConfig;
