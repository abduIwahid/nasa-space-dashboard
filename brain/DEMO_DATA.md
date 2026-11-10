# Demo data — NASA Space Dashboard

- **First load:** no key needed — DEMO_KEY serves both sections; watch the quota line drop by 2.
- **Date picker:** pick `1995-06-16` (the very first APOD) or any famous date; note the picker refuses future dates.
- **Video day:** pick a recent Sunday at random until one shows an embedded video instead of an image — the handling is the demo.
- **Asteroid table:** point at the top row — the closest approach this week, in km and lunar distances; hazardous rows carry the red badge.
- **Failure demo:** throttle/block api.nasa.gov in DevTools and reload — the cached APOD appears with its "from cache" note instead of an error wall.
- **Key upgrade:** paste a free personal key and watch the quota jump to 1,000/hour.
