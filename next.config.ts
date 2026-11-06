import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async headers() {
    const isProduction = process.env.NODE_ENV === "production";

    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          isProduction
            ? "script-src 'self' 'unsafe-inline'"
            : "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
          "font-src 'self' https://fonts.gstatic.com data:",
          "img-src 'self' data: blob: https://images.unsplash.com",
          "connect-src 'self'",
          "frame-ancestors 'self'",
          "base-uri 'self'",
          "form-action 'self'",
        ].join("; "),
      },
    ];

    // Apply HSTS exclusively in production HTTPS environments
    // Subdomain inclusion and preload omitted to prevent bricking uncertified subdomains
    if (isProduction) {
      securityHeaders.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000",
      });
    }
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};
export default nextConfig;
