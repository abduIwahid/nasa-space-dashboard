# Interviewer Q&A — NASA Space Dashboard

**Q1. What happens when the rate limit runs out mid-demo?**
Two layers. The quota meter (from `X-RateLimit-Remaining` headers) shows it coming. If a 429 lands, APOD falls back to the last successful picture from localStorage — labelled as cached — and the error copy explains the hourly cap and that a free personal key raises it from 30 to 1,000 requests an hour.

**Q2. Why retry some errors and not others?**
5xx and network failures are transient, so the fetch layer retries once after a 1.2-second backoff. A 429 is the server stating a quota; retrying immediately just consumes the next window's goodwill and delays the user. Different failure semantics, different handling.

**Q3. What is the trickiest part of the asteroid data?**
Its shape: an object keyed by date, and every number is a string. If you sort miss distances as strings, "1200000" beats "900000". The mapper flattens the object, parseFloats velocity/distances/diameters, averages the diameter estimate range, and sorts numerically by miss distance.

**Q4. Where does the API key live?**
In the visitor's own browser localStorage, entered at runtime, sent only to api.nasa.gov. Nothing is hardcoded — the repo contains no key at all. The default DEMO_KEY is NASA's own public demo credential, and the UI discloses that it is shared and capped at 30 requests an hour.

**Q5. Why is there no chart in the asteroid section yet?**
Scope discipline: the table with correct parsing, sorting and hazard flags is the data-integrity proof. A size-vs-speed scatter is Phase 2 in the build plan — planned, listed, and deliberately not half-built into Phase 1.
