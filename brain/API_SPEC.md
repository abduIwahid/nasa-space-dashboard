# API spec — NASA APIs (https://api.nasa.gov)

Auth: `api_key` query parameter. Visitor's own free key (1,000 requests/hour) or the shared `DEMO_KEY` (30/hour, 50/day per IP). Rate-limit state is returned in `X-RateLimit-Limit` / `X-RateLimit-Remaining` headers.

| Endpoint | Used for | Response fields consumed |
|---|---|---|
| `GET /planetary/apod?api_key=KEY[&date=YYYY-MM-DD]` | Picture/video of the day | `date`, `title`, `explanation`, `media_type` (`image`/`video`), `url`, `hdurl` (optional), `copyright` (optional — absent means public domain) |
| `GET /neo/rest/v1/feed?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD&api_key=KEY` | Asteroids, max 7-day range | `near_earth_objects` — object keyed by date → arrays of: `name`, `estimated_diameter.meters.estimated_diameter_min/max`, `close_approach_data[0].relative_velocity.kilometers_per_hour`, `close_approach_data[0].miss_distance.kilometers`, `close_approach_data[0].miss_distance.lunar`, `is_potentially_hazardous_asteroid`. **All numeric values are strings.** |

**Gotchas honoured in code:**
- APOD `media_type` can be `video` → embed, never `<img>`.
- APOD dates follow US time; the picker caps at today (visitor-local) and defaults to no date (NASA's latest).
- NeoWs ranges longer than 7 days are rejected → the app always requests today → today+6.
- NASA endpoints occasionally return 5xx → one retry with backoff.
- Mars Rover Photos excluded (status uncertain per the guide; verified fallback APIs chosen instead).

**Verified live 2026-11-10:** field names checked against real APOD (DEMO_KEY) and NeoWs responses — see changes/sessions/2026-11-10-01-initial-build.md. (Verification note: the NeoWs smoke call initially ran slowly under the shared DEMO_KEY, consistent with its documented limits.)
