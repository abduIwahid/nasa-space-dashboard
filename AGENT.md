# NASA Space Dashboard — agent entry
Summary: Static dashboard on NASA APIs (APOD + NeoWs). Visitor's own key or DEMO_KEY, quota meter from rate-limit headers, backoff retry, cached-APOD fallback. Vanilla HTML/CSS/JS, no build step.
Core feature: APOD + 7-day asteroid table that stays useful when the API rate-limits or fails.
Read first: `brain/00-START-HERE.md`, then `brain/PRD.md` and `brain/ARCHITECTURE.md`.
Hard rules: design tokens only (see brain/DESIGN.md); NEVER hardcode a NASA key — visitor-entered, localStorage only, DEMO_KEY fallback; every change is logged in `brain/changes/` (changelog + session file).
Commands: open `index.html`, or `python3 -m http.server` then visit http://localhost:8000 . Syntax check: `node --check app.js`.
