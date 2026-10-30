import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.join(projectRoot, "..");

const nextConfig: NextConfig = {
  transpilePackages: ["@fractal/shared"],
  experimental: {
    agentFeedback: true,
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    root: monorepoRoot,
    resolveAlias: {
      "@fractal/shared/auth-secret": "./fractal-shared/src/auth-secret.ts",
      "@fractal/shared/access-code": "./fractal-shared/src/access-code.ts",
      "@fractal/shared/password": "./fractal-shared/src/password.ts",
    },
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
