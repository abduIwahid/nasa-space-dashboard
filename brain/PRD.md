# PRD — NASA Space Dashboard

**Core feature (one sentence):** Show today's APOD and every asteroid passing Earth in the next 7 days, while making NASA's hourly rate limit visible and survivable instead of a silent failure.

**Problem:** NASA API demos usually work once and then die mysteriously — the shared DEMO_KEY exhausts at 30 requests/hour, APOD sometimes returns a video that breaks `<img>` tags, and NeoWs numbers arrive as strings that sort alphabetically ("900" > "12000") if you forget to parse them.

**Target user:** Recruiters and interviewers opening the demo (possibly after DEMO_KEY is already exhausted by other visitors — the fallback path is built for exactly that moment); space-curious visitors.

## Scope
**MUST** — APOD with date picker (no future dates), video vs image handling, copyright credit; NeoWs 7-day table sorted by miss distance with hazard badges; quota meter from headers; one backoff retry on 5xx; cached-APOD fallback; 429 explanation state; visitor key field (localStorage), DEMO_KEY default with the shared-limit note; per-section loading/error/offline states.
**SHOULD** — size-vs-speed scatter chart for asteroids; EPIC Earth slideshow. (Phase 2, not built yet.)
**COULD** — NASA Image Library search page. (Stretch.)

## Success criteria
- With DEMO_KEY exhausted, the page still shows the cached APOD and explains the limit and the one-minute fix.
- The asteroid table's closest entry is genuinely the minimum miss distance (numbers parsed, not string-sorted).
- Video APOD days embed a player; no broken-image icon ever appears.
