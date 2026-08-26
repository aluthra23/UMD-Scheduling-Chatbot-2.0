import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {},
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      sharp$: false,
      "onnxruntime-node$": false,
      ...(isServer
        ? {
            "@huggingface/transformers$": path.resolve(
              process.cwd(),
              "src/app/transformers-server-stub.ts",
            ),
          }
        : {}),
    };
    return config;
  },
};

export default nextConfig;
