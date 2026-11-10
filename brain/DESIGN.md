# Design — NASA Space Dashboard

**Direction:** deep-space ink header on paper, one accent (mission orange). The APOD media is the visual hero; everything else is quiet data presentation. Solid colours only.

**Tokens (as used in styles.css):**
- `--bg: #F5F4EF` · `--surface: #FFFFFF` · `--surface-alt: #EBE8DD`
- `--ink: #101623` · `--text: #1B1B1B` · `--text-on-ink: #EDEBE2`
- `--text-muted: #5B594F` · `--border: #D6D1BF`
- `--accent: #E4572E` · `--accent-dark: #B23E1C`
- `--danger: #B3261E` · `--hazard-bg: #B3261E` · `--focus: #1A56C4` · `--radius: 10px`

**Typography:** system stack — "Helvetica Neue", Helvetica, Arial, sans-serif. Table numbers right-aligned; hazard is a labelled badge, never colour alone.

**Component states:**
- Quota line: normal / low (≤3 remaining, danger colour).
- Cached-APOD notice: distinct amber note so fallback content is never mistaken for live content.
- Per-section skeletons and error boxes (APOD and asteroids fail independently).
- Offline banner; key status line explains DEMO_KEY vs personal key at all times.

**Responsive:** the asteroid table scrolls horizontally inside its own wrapper (page never overflows) with a 640px minimum table width; APOD media scales to the card.
