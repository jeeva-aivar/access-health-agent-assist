import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ?? 'idfc-rm-workspace-demo-secret-2026',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL ?? 'http://localhost:3000',
  },
  async rewrites() {
    const beUrl = process.env.CONVOGENT_BE_URL || 'https://idfc-call-tapping.aivar.app'
    const agentUrl = process.env.CONVOGENT_AGENT_URL || 'https://idfc-call-tapping.aivar.app'
    return [
      {
        source: '/api/convogent/:path*',
        destination: `${beUrl}/api/:path*`,
      },
      {
        source: '/api/agent/:path*',
        destination: `${agentUrl}/:path*`,
      },
      {
        source: '/api/avatar/:path*',
        destination: `https://avatar.aivar.app/api/:path*`,
      },
    ]
  },
};

export default nextConfig;
