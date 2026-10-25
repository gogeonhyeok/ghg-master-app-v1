import { PondError } from "./store";

export const sessionTokenPattern = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;

export function checkOrigin(request: Request, required = false) {
  const origin = request.headers.get("origin");
  if (!origin && !required) return;
  let host = request.headers.get("host") || new URL(request.url).host;
  const forwardedHost = request.headers.get("x-forwarded-host");
  const loopbackHost = /^(localhost|127\.0\.0\.1|\[::1\])(?::\d+)?$/i;
  // Vercel dev rewrites Host to its internal port; WebSocket forwarding also
  // replaces X-Forwarded-Host. VERCEL_URL retains the browser-facing host.
  const devHost = [process.env.VERCEL_URL, forwardedHost].find(value => value && loopbackHost.test(value));
  if (process.env.NODE_ENV === "development" && loopbackHost.test(host) && devHost) {
    host = devHost;
  }
  let source: URL;
  try { source = new URL(origin || ""); }
  catch { throw new PondError("Please send your croak from this pond.", 403); }
  if (!["http:", "https:"].includes(source.protocol) || source.host !== host) {
    throw new PondError("Please send your croak from this pond.", 403);
  }
}
