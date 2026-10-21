// Imported media is stored as Lovable Assets, referenced by `/__l5e/assets-v1/*` URLs that only
// Lovable's hosting serves. On Netlify, stream those files from the Lovable project host instead.
const LOVABLE_ASSET_ORIGIN = "https://6ea385dc-f9b7-4002-991d-9d0361b4b9aa.lovableproject.com";

export default async (request: Request) => {
  const url = new URL(request.url);
  const headers = new Headers();
  for (const name of ["range", "if-none-match", "if-modified-since", "accept"]) {
    const value = request.headers.get(name);
    if (value) headers.set(name, value);
  }

  const upstream = await fetch(`${LOVABLE_ASSET_ORIGIN}${url.pathname}`, {
    method: request.method,
    headers,
  });

  const responseHeaders = new Headers(upstream.headers);
  if (upstream.ok) {
    responseHeaders.set("cache-control", "public, max-age=31536000, immutable");
  }
  return new Response(upstream.body, {
    status: upstream.status,
    headers: responseHeaders,
  });
};

export const config = {
  path: "/__l5e/assets-v1/*",
  method: "GET",
};
