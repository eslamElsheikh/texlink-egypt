/**
 * TexLink Egypt Network Accessibility Bridge (Cloudflare Worker)
 * Fixed-origin reverse proxy for Egypt network accessibility:
 * - Upstream: https://texlink-egypt.netlify.app
 * - Public: https://texlink-egypt-bridge.<subdomain>.workers.dev
 * - Bypasses regional ISP blocks in Egypt without requiring a VPN
 * - Rewrites redirects and cookies to preserve seamless authentication
 */

export interface Env {
  UPSTREAM_ORIGIN?: string;
}

const UPSTREAM_ORIGIN = "https://texlink-egypt.netlify.app";

// Hop-by-hop headers that must not be forwarded
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const upstreamUrl = new URL(env.UPSTREAM_ORIGIN || UPSTREAM_ORIGIN);
    const clientUrl = new URL(request.url);

    // 1. Strict Security Guard: Only forward to fixed upstream origin
    const targetUrl = new URL(clientUrl.pathname + clientUrl.search, upstreamUrl.origin);

    // 2. Clone and prepare request headers
    const newHeaders = new Headers();
    for (const [key, value] of request.headers.entries()) {
      const lower = key.toLowerCase();
      if (!HOP_BY_HOP_HEADERS.has(lower)) {
        newHeaders.set(key, value);
      }
    }

    // Set origin routing headers
    newHeaders.set("Host", upstreamUrl.hostname);
    newHeaders.set("X-Forwarded-Host", clientUrl.hostname);
    newHeaders.set("X-Forwarded-Proto", clientUrl.protocol.replace(":", ""));
    newHeaders.set("X-Real-IP", request.headers.get("CF-Connecting-IP") || "");

    // 3. Forward request to Netlify upstream
    const init: RequestInit = {
      method: request.method,
      headers: newHeaders,
      redirect: "manual", // Intercept redirects to rewrite location headers
    };

    // Forward body for non-GET/HEAD methods
    if (request.method !== "GET" && request.method !== "HEAD") {
      init.body = request.body;
      // @ts-expect-error Cloudflare Workers specific duplex stream property
      init.duplex = "half";
    }

    let response: Response;
    try {
      response = await fetch(targetUrl.toString(), init);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return new Response(
        `<html><body style="font-family:sans-serif;text-align:center;padding:50px;">
          <h2>فشل الاتصال بخادم المنصة الأصلي</h2>
          <p>تعذر الاتصال بـ Netlify Upstream. يرجى المحاولة بعد قليل.</p>
          <pre style="color:gray;">${errorMsg}</pre>
        </body></html>`,
        {
          status: 502,
          headers: { "Content-Type": "text/html; charset=utf-8" },
        }
      );
    }

    // 4. Clone response headers and filter hop-by-hop
    const responseHeaders = new Headers();
    for (const [key, value] of response.headers.entries()) {
      const lower = key.toLowerCase();
      if (!HOP_BY_HOP_HEADERS.has(lower)) {
        responseHeaders.set(key, value);
      }
    }

    // 5. Safe Cookie Handling: Rewrite Domain to Worker Hostname or strip it
    const setCookieHeaders = response.headers.getSetCookie
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean) as string[];

    if (setCookieHeaders.length > 0) {
      responseHeaders.delete("set-cookie");
      for (const cookie of setCookieHeaders) {
        // Strip upstream domain attribute so cookie binds cleanly to Cloudflare Worker domain
        const rewrittenCookie = cookie.replace(/;\s*Domain=[^;]+/gi, "");
        responseHeaders.append("set-cookie", rewrittenCookie);
      }
    }

    // 6. Safe Redirect Handling: Rewrite Netlify Upstream URLs in Location header
    const location = response.headers.get("location");
    if (location) {
      try {
        const redirectUrl = new URL(location, upstreamUrl.origin);
        if (redirectUrl.hostname === upstreamUrl.hostname) {
          redirectUrl.protocol = clientUrl.protocol;
          redirectUrl.host = clientUrl.host;
          redirectUrl.port = clientUrl.port;
          responseHeaders.set("location", redirectUrl.toString());
        }
      } catch {
        // Keep relative locations intact
      }
    }

    // 7. No-Cache Protection for HTML & Dynamic API Routes
    const contentType = response.headers.get("content-type") || "";
    const isHtmlOrApi =
      contentType.includes("text/html") ||
      contentType.includes("application/json") ||
      clientUrl.pathname.startsWith("/api/");

    if (isHtmlOrApi) {
      responseHeaders.set("Cache-Control", "private, no-cache, no-store, must-revalidate");
      responseHeaders.set("Pragma", "no-cache");
      responseHeaders.set("Expires", "0");
    }

    // Add Cloudflare Bridge indicator headers
    responseHeaders.set("X-Cysle-Bridge", "Cloudflare-Workers-Egypt");
    responseHeaders.set("X-TexLink-Bridge", "Cloudflare-Workers-Egypt");
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  },
};
