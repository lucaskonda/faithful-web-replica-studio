import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

// Imported media lives in Lovable Assets, which only Lovable's own hosting serves.
// When the site runs elsewhere (e.g. Netlify), forward those requests to the Lovable project host.
const LOVABLE_ASSETS_PREFIX = "/__l5e/assets-v1/";
const LOVABLE_ASSETS_ORIGIN = "https://6ea385dc-f9b7-4002-991d-9d0361b4b9aa.lovableproject.com";
const FORWARDED_ASSET_HEADERS = ["accept", "range", "if-none-match", "if-modified-since"];

async function proxyLovableAsset(request: Request, url: URL): Promise<Response> {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return new Response("Method Not Allowed", { status: 405 });
  }
  const headers = new Headers();
  for (const name of FORWARDED_ASSET_HEADERS) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }
  const upstream = await fetch(LOVABLE_ASSETS_ORIGIN + url.pathname, { method: request.method, headers });
  const responseHeaders = new Headers(upstream.headers);
  // fetch() already decoded the body, so the upstream encoding/length no longer apply.
  for (const name of ["set-cookie", "content-encoding", "content-length"]) responseHeaders.delete(name);
  if (upstream.ok) responseHeaders.set("cache-control", "public, max-age=31536000, immutable");
  return new Response(upstream.body, { status: upstream.status, headers: responseHeaders });
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const url = new URL(request.url);
      if (url.pathname.startsWith(LOVABLE_ASSETS_PREFIX)) {
        return await proxyLovableAsset(request, url);
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
