# Changelog — NASA Space Dashboard

Format: Change → Reason → Affected Area → Impact → Status.

## 2026-11-10 — Project initialized + Phase 1 MVP built
- **Change:** Created the full static app (index.html, styles.css, app.js), README, AGENT.md, comment-only .env.example and this brain.
- **Reason:** Portfolio project #4 from the "5 Free APIs → 5 Portfolio Projects" guide; demonstrates rate-limit literacy, retry semantics and graceful degradation on NASA's APIs.
- **Affected Area:** Entire repo (new).
- **Impact:** APOD + asteroid dashboard runs from static files; not yet deployed.
- **Status:** Verified — `node --check app.js` passes; APOD field names and rate-limit headers confirmed against live NASA responses with DEMO_KEY; NeoWs response shape (date-keyed object, string numerics, estimated_diameter.meters, close_approach_data) confirmed against the live feed.

- **Change:** Week highlights line above the asteroid table — closest approach (km + lunar distance), largest object, hazardous count → **Reason:** owner asked for the repos to look genuinely worked on; a raw table hides the story the data tells → **Affected Area:** `app.js`, `styles.css` → **Status:** Verified against the live NeoWs feed (mapper output checked in Node).
- **Change:** First-person About section in the app + README author byline and highlights feature entry → **Reason:** the repo should read as its author's own project → **Affected Area:** `index.html`, `styles.css`, `README.md` → **Status:** Verified locally.
