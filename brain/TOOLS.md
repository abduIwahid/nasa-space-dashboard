# Tools — NASA Space Dashboard

**API: NASA Open APIs** — free key by email signup at api.nasa.gov (instant). Documented limits: personal key 1,000 requests/hour; DEMO_KEY 30/hour + 50/day, shared per IP. Rate-limit headers (`X-RateLimit-Limit/Remaining`) are returned on responses.

**Hosting plan:** static files only — GitHub Pages or Vercel static. **TBD by owner** (no repo/deployment created yet).

**Fallback if the API is down:** the last successful APOD renders from localStorage with a visible "from cache" note; asteroid section shows its own error state; 5xx is retried once before either path is taken.

**Accounts needed:** none to run (DEMO_KEY). A free NASA key is the visitor's optional upgrade.
