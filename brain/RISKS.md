# Risks — NASA Space Dashboard

1. **DEMO_KEY exhaustion by other people's demos** (30/hour, shared) → Quota meter makes it visible; cached APOD keeps the page meaningful; error copy gives the one-minute personal-key fix.
2. **NASA 5xx flakiness** (documented behaviour) → One backoff retry in the fetch layer for both sections.
3. **Video APOD breaking the layout** → `media_type` is branched in the mapper/render; videos embed in a 16:9 frame.
4. **Stringly-typed NeoWs numbers sorting wrong** → The mapper parseFloats every numeric and the table sorts numerically by miss distance; verified against a live feed response shape.
