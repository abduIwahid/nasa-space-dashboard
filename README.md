# NASA Space Dashboard

> Built by [Abdul Wahid](https://github.com/abduIwahid) — BS Artificial Intelligence student at COMSATS University Islamabad (Attock Campus). One of a series of dependency-free apps I built against free public APIs to practise real-world API constraints: rate limits, caching, and payload normalisation. More at [abdulwahid.me](https://www.abdulwahid.me).


NASA's Astronomy Picture of the Day (with a date picker) and a live 7-day table of near-Earth asteroids, sorted by how close they come. Built to demonstrate quota literacy: rate-limit headers in the UI, one backoff retry, and a cached fallback so the page degrades instead of dying.

**Live demo:** _TBD — deploy pending owner decision (GitHub Pages or Vercel static)._
Run it locally: open `index.html` in a browser, or `python3 -m http.server` in this folder and visit `http://localhost:8000`.

## Setup — bring your own free key (optional)

The app works immediately on NASA's shared `DEMO_KEY`, but that key is limited to **30 requests/hour and 50/day across everyone using it**. For reliable use, get a free personal key at [api.nasa.gov](https://api.nasa.gov) (email signup, instant, 1,000 requests/hour) and paste it into the settings field. The key is stored **only in your browser's localStorage** and sent only to `api.nasa.gov`. It is never hardcoded in this repo — see `.env.example` for the full explanation.

## Features

- **APOD viewer** — today's picture or video with title, explanation and photographer credit; a date picker for past entries (future dates blocked — APOD follows US time). Video days render an embedded player instead of a broken image.
- **Asteroid table** — every near-Earth object for the next 7 days: estimated diameter, velocity, miss distance in km and lunar distances, and a "potentially hazardous" badge, sorted by closest approach. A highlights line above the table names the week's closest approach (with its distance in lunar units), the largest object, and how many are flagged hazardous.
- **Quota meter** — after every response, the UI shows how many of the hourly requests remain, from NASA's `X-RateLimit-*` headers.
- **Resilience** — 5xx responses are retried once after a backoff pause; the last successful APOD is cached and shown (clearly labelled) when a fetch fails; a 429 produces an explanation of the hourly cap and the fix (your own key), not a generic error.
- **Full UI states** — skeletons, per-section error states with retry, an empty asteroid state, and an offline banner.

## Engineering decisions

- **Header-driven quota UI.** NASA returns `X-RateLimit-Limit` and `X-RateLimit-Remaining`; surfacing them turns an invisible limit into something a user (and an interviewer) can watch move.
- **Retry once, with backoff — and only where it helps.** 5xx and network errors retry after 1.2 s. A 429 never retries immediately: retrying a rate limit is how you stay rate-limited.
- **Graceful degradation by design.** The last good APOD is persisted; on failure the page shows it with an explicit "from cache" note instead of an error wall.
- **The NeoWs data is stringly-typed.** Velocities and distances arrive as strings inside a date-keyed object; the mapper flattens the object, `parseFloat`s every number, averages the diameter range, and sorts by miss distance. Raw payloads never reach the DOM.
- **The 7-day window is a hard API constraint** (NeoWs rejects longer ranges), so the app requests exactly today → today+6.
- **DEMO_KEY default is a deliberate onboarding choice** — zero-setup first run, with its limits disclosed in the UI and a one-minute upgrade path.

## Attribution

Data from [NASA APIs](https://api.nasa.gov) — APOD and NeoWs (Near Earth Object Web Service). NASA material is generally not copyrighted, but individual APOD photographs may be; credits are displayed whenever the API provides them.

## Trade-offs

- A personal key in localStorage is visible to anyone with the visitor's own browser — acceptable for a free, revocable, per-user key; the alternative (a proxy server) breaks the zero-backend constraint.
- Only the APOD is cached as a fallback; asteroid data is time-sensitive, so a stale table would be misleading rather than helpful.
- Mars Rover Photos were intentionally excluded: the endpoint's status is uncertain (reported deprecated in places while still listed), and APOD + NeoWs carry the project.
