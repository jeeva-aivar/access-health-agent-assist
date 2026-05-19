import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  async rewrites() {
    const agentUrl = process.env.CONVOGENT_AGENT_URL
    return [
      // Live Call Assist WebSocket — proxied so the browser hits same-origin.
      // /api/agent/live (browser) -> ${CONVOGENT_AGENT_URL}/live (upstream)
      // Only register the rewrite when the env var is set; otherwise the route 404s.
      ...(agentUrl ? [{ source: '/api/agent/:path*', destination: `${agentUrl}/:path*` }] : []),
      // Unused in this app — leave the avatar proxy in place in case the meeting
      // avatar page is wired up to a real service later.
      { source: '/api/avatar/:path*', destination: 'https://avatar.aivar.app/api/:path*' },
    ]
  },
};

export default nextConfig;
