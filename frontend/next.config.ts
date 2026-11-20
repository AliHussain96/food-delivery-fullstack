
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Experimental features
  experimental: {
    agentFeedback: true,
  },

  // Enable Cache Components
  cacheComponents: true,

  // Enable Partial Prefetching
  partialPrefetching: true,

  // Turbopack configuration
  turbopack: {
    // Set frontend directory as project root
    root: process.cwd(),

    // Preserve existing Tailwind CSS configuration
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
