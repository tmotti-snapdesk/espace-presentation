// Vercel Blob defaults to caching a blob for a month at its CDN edge, and
// that cache is keyed on the URL alone — it ignores query strings AND the
// requester's own cache headers (so neither a `?t=...` cache-buster nor
// `fetch(url, { cache: "no-store" })` protects against it). Any JSON blob
// that gets overwritten in place at a stable URL (`put()` with
// `allowOverwrite: true, addRandomSuffix: false`) must pass this value as
// `cacheControlMaxAge`, or an edit can stay invisible for up to a month.
// 60 seconds is the shortest max-age Vercel Blob allows.
export const JSON_BLOB_CACHE_MAX_AGE = 60;
