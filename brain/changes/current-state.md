# Current state — NASA Space Dashboard

**Exists now (2026-11-10):**
- `index.html`, `styles.css`, `app.js` — complete Phase 1 app: APOD viewer (date picker capped at today, video/image handling, copyright credit, full-res link), NeoWs 7-day asteroid table (flattened, parseFloat'd, sorted by miss distance, hazard badges), quota meter from X-RateLimit headers, fetch layer with one backoff retry on 5xx/network and no retry on 429, cached-APOD fallback with visible labelling, visitor key field (localStorage, DEMO_KEY default with shared-limit disclosure), per-section skeleton/error states and offline banner.
- `README.md`, `AGENT.md`, `.gitignore`, comment-only `.env.example`, full `brain/` documentation set.

**Verified:** app.js syntax (node --check); APOD + NeoWs field names against live NASA responses using DEMO_KEY.

**Pending:** GitHub repo creation + deploy (owner decision: GitHub Pages vs Vercel); README demo GIF after deploy; Phase 2 level-ups (scatter chart, EPIC slideshow).
- 2026-11-10 (later): NeoWs week highlights + first-person About shipped. Next: hosting choice (Pages vs Vercel) still open; a miss-distance scatter remains a Phase 2 candidate.
