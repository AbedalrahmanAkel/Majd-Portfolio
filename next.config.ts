import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Builds a self-contained server bundle in `.next/standalone`, which is what
   * lets the site run on a plain Node host (a VPS, a container, a platform
   * with a persistent disk). The dashboard writes uploads to a volume at
   * runtime, so a serverless target with a read-only filesystem is not an
   * option — see docs/DEPLOYMENT.md.
   */
  output: "standalone",

  /**
   * sharp is a native module. Bundling it would break the `.node` binary
   * lookup, so it stays external and is required at runtime instead.
   */
  serverExternalPackages: ["sharp"],

  experimental: {
    serverActions: {
      /**
       * Uploads travel through a Server Action, and the default cap is 1MB.
       * This has to clear the largest single upload (a 64MB video) plus the
       * multipart framing around it.
       */
      bodySizeLimit: "80mb",
    },
  },
};

export default nextConfig;
