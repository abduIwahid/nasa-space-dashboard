'use strict';
/*
 * NASA Space Dashboard — vanilla JS on NASA's APOD + NeoWs APIs.
 * Key strategy: the visitor's own free key (api.nasa.gov) in localStorage;
 * DEMO_KEY when empty. No key is ever hardcoded.
 * Resilience: 5xx retried once with backoff; the last successful APOD is
 * cached in localStorage and shown as fallback when a fetch fails; quota
 * is read from X-RateLimit-* headers and displayed.
 * API response -> mapper (mapApod / mapNeoFeed) -> state -> render.
 */
const APOD_URL = 'https://api.nasa.gov/planetary/apod';
const NEO_URL = 'https://api.nasa.gov/neo/rest/v1/feed';
const LS_KEY = 'nasa:key';
const LS_APOD = 'nasa:lastApod';
const RETRY_DELAY_MS = 1200;

const state = { quota: null, apodDate: null };

const el = {
  keyInput: document.getElementById('key-input'),
  keyNote: document.getElementById('key-note'),
  quota: document.getElementById('quota-line'),
  apodDate: document.getElementById('apod-date'),
  apodStatus: document.getElementById('apod-status'),
  apodRegion: document.getElementById('apod-region'),
  apodError: document.getElementById('apod-error'),
  apodErrorText: document.getElementById('apod-error-text'),
  neoStatus: document.getElementById('neo-status'),
  neoRegion: document.getElementById('neo-region'),
  neoError: document.getElementById('neo-error'),
  neoErrorText: document.getElementById('neo-error-text'),
  offline: document.getElementById('offline-banner'),
};

function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function fmtNum(n) { return Math.round(n).toLocaleString('en-US'); }
function getKey() {
  try { return localStorage.getItem(LS_KEY) || 'DEMO_KEY'; } catch (e) { return 'DEMO_KEY'; }
}
function usingDemoKey() { return getKey() === 'DEMO_KEY'; }
function isoDate(d) { return d.toISOString().slice(0, 10); }

/* ---------- quota ---------- */
function readQuota(headers) {
  const limit = headers.get('x-ratelimit-limit');
  const remaining = headers.get('x-ratelimit-remaining');
  if (limit === null || remaining === null) return;
  state.quota = { limit: Number(limit), remaining: Number(remaining) };
  el.quota.textContent = 'NASA API quota: ' + state.quota.remaining + ' of ' + state.quota.limit + ' requests left this hour (' + (usingDemoKey() ? 'shared DEMO_KEY' : 'your key') + ').';
  el.quota.classList.toggle('low', state.quota.remaining <= 3);
}

/* ---------- fetch with one backoff retry on 5xx ---------- */
function delay(ms) { return new Promise((r) => setTimeout(r, ms)); }
async function fetchNasa(url) {
  let lastErr = null;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(url);
      readQuota(res.headers);
      if (res.status === 429) {
        const err = new Error('Rate limit reached (429).');
        err.status = 429;
        throw err;
      }
      if (res.status >= 500) {
        const err = new Error('NASA server error (HTTP ' + res.status + ').');
        err.status = res.status;
        throw err;
      }
      if (!res.ok) {
        const err = new Error('Request failed (HTTP ' + res.status + ').');
        err.status = res.status;
        throw err;
      }
      return res.json();
    } catch (err) {
      lastErr = err;
      const retryable = err.status === undefined || err.status >= 500; // network or 5xx
      if (attempt === 0 && retryable) { await delay(RETRY_DELAY_MS); continue; }
      throw err;
    }
  }
  throw lastErr;
}

/* ---------- mapper layer ---------- */
function mapApod(raw) {
  return {
    date: raw.date,
    title: raw.title,
    explanation: raw.explanation,
    mediaType: raw.media_type,          // 'image' | 'video'
    url: raw.url,
    hdUrl: raw.hdurl || null,
    copyright: raw.copyright ? raw.copyright.trim() : null, // public domain when absent
  };
}
function mapNeoFeed(raw) {
  // near_earth_objects is an object keyed by date; flatten it, then normalise.
  // Numeric fields arrive as STRINGS — parseFloat everything numeric.
  const out = [];
  const byDate = raw.near_earth_objects || {};
  for (const date of Object.keys(byDate)) {
    for (const n of byDate[date]) {
      const ca = (n.close_approach_data || [])[0] || {};
      const dMeters = n.estimated_diameter && n.estimated_diameter.meters ? n.estimated_diameter.meters : {};
      out.push({
        name: n.name,
        date,
        diameterM: ((parseFloat(dMeters.estimated_diameter_min) || 0) + (parseFloat(dMeters.estimated_diameter_max) || 0)) / 2,
        velocityKmh: parseFloat(ca.relative_velocity ? ca.relative_velocity.kilometers_per_hour : '0'),
        missKm: parseFloat(ca.miss_distance ? ca.miss_distance.kilometers : '0'),
        missLunar: parseFloat(ca.miss_distance ? ca.miss_distance.lunar : '0'),
        hazardous: Boolean(n.is_potentially_hazardous_asteroid),
      });
    }
  }
  out.sort((a, b) => a.missKm - b.missKm); // closest first
  return out;
}

/* ---------- APOD ---------- */
async function loadApod(dateStr) {
  state.apodDate = dateStr || null;
  el.apodError.hidden = true;
  el.apodStatus.textContent = 'Loading APOD…';
  el.apodRegion.innerHTML = '<div class="skeleton"><div class="skel skel-media"></div><div class="skel skel-line"></div><div class="skel skel-line short"></div></div>';
  const url = APOD_URL + '?api_key=' + encodeURIComponent(getKey()) + (dateStr ? '&date=' + dateStr : '');
  try {
    const raw = await fetchNasa(url);
    const apod = mapApod(raw);
    try { localStorage.setItem(LS_APOD, JSON.stringify(apod)); } catch (e) { /* ignore */ }
    renderApod(apod, false);
    el.apodStatus.textContent = 'APOD loaded for ' + apod.date + '.';
  } catch (err) {
    // Fallback: show the last successful APOD from cache, clearly labelled.
    let cached = null;
    try { cached = JSON.parse(localStorage.getItem(LS_APOD) || 'null'); } catch (e) { /* ignore */ }
    if (cached) {
      renderApod(cached, true);
      el.apodStatus.textContent = '';
      el.apodErrorText.textContent = errorMessage(err) + ' Showing the last successfully loaded APOD instead.';
      el.apodError.hidden = false;
    } else {
      el.apodRegion.innerHTML = '';
      el.apodStatus.textContent = '';
      el.apodErrorText.textContent = errorMessage(err);
      el.apodError.hidden = false;
    }
  }
}
function errorMessage(err) {
  if (err.status === 429) {
    return 'NASA rate limit reached (429). ' + (usingDemoKey()
      ? 'DEMO_KEY allows only 30 requests/hour and is shared by everyone — add your own free key above (1,000 requests/hour) or wait for the hour to reset.'
      : 'Your key allows 1,000 requests/hour; wait for the hour to reset.');
  }
  if (err.status && err.status >= 500) return 'NASA\'s servers returned an error even after one retry. Try again in a moment.';
  if (err.status === 403) return 'The API key was rejected (403). Check the key in the settings above.';
  return 'Could not reach NASA\'s API. Check your connection and try again.';
}
function renderApod(apod, fromCache) {
  const media = apod.mediaType === 'video'
    ? '<iframe src="' + esc(apod.url) + '" title="APOD video: ' + esc(apod.title) + '" allowfullscreen></iframe>'
    : '<img src="' + esc(apod.url) + '" alt="Astronomy Picture of the Day: ' + esc(apod.title) + '">';
  el.apodRegion.innerHTML =
    (fromCache ? '<p class="cached-note">Offline / fetch failed — showing the last successfully loaded APOD (' + esc(apod.date) + ') from this browser\'s cache.</p>' : '') +
    '<article class="apod-card"><div class="apod-media">' + media + '</div>' +
    '<div class="apod-body"><h3>' + esc(apod.title) + '</h3>' +
    '<p class="apod-meta">' + esc(apod.date) +
    (apod.copyright ? ' · Image credit: ' + esc(apod.copyright) : ' · Public domain (NASA)') +
    (apod.hdUrl ? ' · <a href="' + esc(apod.hdUrl) + '" target="_blank" rel="noopener">Full resolution</a>' : '') +
    '</p><p class="explanation">' + esc(apod.explanation) + '</p></div></article>';
}

/* ---------- NeoWs asteroids ---------- */
async function loadNeo() {
  el.neoError.hidden = true;
  el.neoStatus.textContent = 'Loading asteroid data…';
  el.neoRegion.innerHTML = '<div class="skeleton"><div class="skel skel-line"></div><div class="skel skel-line"></div><div class="skel skel-line short"></div></div>';
  const start = new Date();
  const end = new Date(Date.now() + 6 * 24 * 3600 * 1000); // inclusive 7-day window (the API maximum)
  const url = NEO_URL + '?start_date=' + isoDate(start) + '&end_date=' + isoDate(end) + '&api_key=' + encodeURIComponent(getKey());
  try {
    const raw = await fetchNasa(url);
    const rows = mapNeoFeed(raw);
    renderNeo(rows);
    el.neoStatus.textContent = rows.length + ' near-Earth objects in the next 7 days, sorted by closest approach.';
  } catch (err) {
    el.neoRegion.innerHTML = '';
    el.neoStatus.textContent = '';
    el.neoErrorText.textContent = errorMessage(err);
    el.neoError.hidden = false;
  }
}
function renderNeo(rows) {
  if (rows.length === 0) {
    el.neoRegion.innerHTML = '<div class="state-box"><h3>No asteroids in range</h3><p>NASA reports no near-Earth objects for the next 7 days.</p></div>';
    return;
  }
  const body = rows.map((r) =>
    '<tr><td>' + esc(r.name) + '</td><td>' + esc(r.date) + '</td>' +
    '<td class="num">' + fmtNum(r.diameterM) + ' m</td>' +
    '<td class="num">' + fmtNum(r.velocityKmh) + ' km/h</td>' +
    '<td class="num">' + fmtNum(r.missKm) + ' km</td>' +
    '<td class="num">' + r.missLunar.toFixed(1) + '</td>' +
    '<td>' + (r.hazardous ? '<span class="badge hazard">Potentially hazardous</span>' : '<span class="badge safe">Not hazardous</span>') + '</td></tr>').join('');
  const closest = rows[0];
  const hazardCount = rows.filter((r) => r.hazardous).length;
  const largest = rows.reduce((a, b) => (b.diameterM > a.diameterM ? b : a), rows[0]);
  const highlight =
    '<p class="neo-highlight">Closest approach this week: <b>' + esc(closest.name) + '</b> passes ' +
    fmtNum(closest.missKm) + ' km away — about ' + closest.missLunar.toFixed(1) + '× the distance to the Moon. ' +
    'Largest object: <b>' + esc(largest.name) + '</b> at roughly ' + fmtNum(largest.diameterM) + ' m across. ' +
    hazardCount + ' of ' + rows.length + ' objects are flagged potentially hazardous.</p>';
  el.neoRegion.innerHTML = highlight +
    '<div class="table-wrap"><table><thead><tr>' +
    '<th scope="col">Name</th><th scope="col">Approach date</th>' +
    '<th scope="col" class="num">Est. diameter</th><th scope="col" class="num">Velocity</th>' +
    '<th scope="col" class="num">Miss distance</th><th scope="col" class="num">Lunar distances</th>' +
    '<th scope="col">Hazard</th></tr></thead><tbody>' + body + '</tbody></table></div>';
}

/* ---------- wiring ---------- */
function refreshKeyNote() {
  el.keyNote.textContent = usingDemoKey()
    ? 'No key saved: using NASA\'s shared DEMO_KEY — limited to 30 requests/hour and 50/day across everyone using it. A free personal key (1,000/hour) takes a minute at api.nasa.gov.'
    : 'Using your saved key (1,000 requests/hour). It never leaves this browser except to api.nasa.gov.';
}
document.getElementById('key-save').addEventListener('click', () => {
  const v = el.keyInput.value.trim();
  try { if (v) localStorage.setItem(LS_KEY, v); } catch (e) { /* ignore */ }
  el.keyInput.value = '';
  refreshKeyNote();
  loadApod(state.apodDate);
  loadNeo();
});
document.getElementById('key-clear').addEventListener('click', () => {
  try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignore */ }
  refreshKeyNote();
  loadApod(state.apodDate);
  loadNeo();
});
el.apodDate.max = isoDate(new Date()); // APOD follows US dates; never allow a future date
el.apodDate.addEventListener('change', () => {
  if (el.apodDate.value) loadApod(el.apodDate.value);
});
document.getElementById('apod-today').addEventListener('click', () => {
  el.apodDate.value = '';
  loadApod(null);
});
document.getElementById('apod-retry').addEventListener('click', () => loadApod(state.apodDate));
document.getElementById('neo-retry').addEventListener('click', loadNeo);

function updateOffline() { el.offline.hidden = navigator.onLine; }
window.addEventListener('online', updateOffline);
window.addEventListener('offline', updateOffline);

refreshKeyNote();
updateOffline();
loadApod(null);
loadNeo();
