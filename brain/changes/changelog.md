# Changelog — NASA Space Dashboard

Format: Change → Reason → Affected Area → Impact → Status.

## 2026-11-10 — Project initialized + Phase 1 MVP built
- **Change:** Created the full static app (index.html, styles.css, app.js), README, AGENT.md, comment-only .env.example and this brain.
- **Reason:** Portfolio project #4 from the "5 Free APIs → 5 Portfolio Projects" guide; demonstrates rate-limit literacy, retry semantics and graceful degradation on NASA's APIs.
- **Affected Area:** Entire repo (new).
- **Impact:** APOD + asteroid dashboard runs from static files; not yet deployed.
- **Status:** Verified — `node --check app.js` passes; APOD field names and rate-limit headers confirmed against live NASA responses with DEMO_KEY; NeoWs response shape (date-keyed object, string numerics, estimated_diameter.meters, close_approach_data) confirmed against the live feed.
