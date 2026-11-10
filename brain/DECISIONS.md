# Decisions — NASA Space Dashboard

## ADR-1 — Vanilla JS, no build step (2026-11-10)
Two independent GET-driven sections. A framework adds a toolchain and obscures the header/retry handling that is the project's core lesson.

## ADR-2 — Key strategy: visitor key, DEMO_KEY default (2026-11-10)
Options: (a) require a key before anything loads (kills the zero-setup demo), (b) hardcode the owner's key (rejected — leaked credential, and the owner's quota would serve every visitor), (c) DEMO_KEY default with a visible shared-limit note + optional visitor key in localStorage. Chose (c): the demo always opens, the limit is disclosed, and the upgrade is one minute of the visitor's time.

## ADR-3 — Cache the APOD only, never the asteroid table (2026-11-10)
A yesterday APOD is still a true picture with a date on it — good fallback content. A stale asteroid table presents old approach data as current, which is misleading. Caching is therefore per-data-type, not global.

## ADR-4 — Retry 5xx once with backoff; never auto-retry 429 (2026-11-10)
A transient server error deserves one 1.2 s-delayed retry. A 429 is a quota statement; immediate retries deepen it. The 429 path goes straight to the explanation + fallback.
