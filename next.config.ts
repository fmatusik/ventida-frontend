import type { NextConfig } from "next";
import path from "path";

const isDev = process.env.NODE_ENV !== "production";

// Adres backendu (API + zdjęcia) musi być dozwolony w CSP
let apiOrigin = "";
try {
  apiOrigin = new URL(process.env.NEXT_PUBLIC_SERVER_URL ?? "").origin;
} catch {
  /* brak/nieprawidłowy NEXT_PUBLIC_SERVER_URL */
}

const csp = [
  "default-src 'self'",
  // Next.js wstrzykuje inline-owe skrypty hydracji; w dev dodatkowo potrzebny eval (HMR)
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  `img-src 'self' data: blob: https: ${apiOrigin}`.trim(),
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${isDev ? " ws: wss:" : ""}`.trim(),
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  ...(isDev ? [] : [{ key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" }]),
];

const nextConfig: NextConfig = {
  transpilePackages: ["lucide-react"],
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // @ts-ignore
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
