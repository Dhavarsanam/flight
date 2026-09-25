'use strict';

/* =====================================================================
   AeroLux — flight search, seat selection & boarding pass (demo)
   ===================================================================== */

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

/* ---------- Data ---------- */
const AIRPORTS = [
  { code: 'MAA', city: 'Chennai', name: 'Chennai International', country: 'India', lat: 12.99, lon: 80.17 },
  { code: 'DEL', city: 'New Delhi', name: 'Indira Gandhi International', country: 'India', lat: 28.56, lon: 77.1 },
  { code: 'BOM', city: 'Mumbai', name: 'Chhatrapati Shivaji Maharaj Intl', country: 'India', lat: 19.09, lon: 72.87 },
  { code: 'BLR', city: 'Bengaluru', name: 'Kempegowda International', country: 'India', lat: 13.2, lon: 77.71 },
  { code: 'HYD', city: 'Hyderabad', name: 'Rajiv Gandhi International', country: 'India', lat: 17.24, lon: 78.43 },
  { code: 'CJB', city: 'Coimbatore', name: 'Coimbatore International', country: 'India', lat: 11.03, lon: 77.04 },
  { code: 'IXM', city: 'Madurai', name: 'Madurai Airport', country: 'India', lat: 9.83, lon: 78.09 },
  { code: 'COK', city: 'Kochi', name: 'Cochin International', country: 'India', lat: 10.15, lon: 76.4 },
  { code: 'CCU', city: 'Kolkata', name: 'Netaji Subhas Chandra Bose Intl', country: 'India', lat: 22.65, lon: 88.45 },
  { code: 'DXB', city: 'Dubai', name: 'Dubai International', country: 'UAE', lat: 25.25, lon: 55.36 },
  { code: 'DOH', city: 'Doha', name: 'Hamad International', country: 'Qatar', lat: 25.27, lon: 51.61 },
  { code: 'SIN', city: 'Singapore', name: 'Changi Airport', country: 'Singapore', lat: 1.36, lon: 103.99 },
  { code: 'KUL', city: 'Kuala Lumpur', name: 'KLIA', country: 'Malaysia', lat: 2.74, lon: 101.7 },
  { code: 'CMB', city: 'Colombo', name: 'Bandaranaike International', country: 'Sri Lanka', lat: 7.18, lon: 79.88 },
  { code: 'BKK', city: 'Bangkok', name: 'Suvarnabhumi', country: 'Thailand', lat: 13.69, lon: 100.75 },
  { code: 'LHR', city: 'London', name: 'Heathrow', country: 'UK', lat: 51.47, lon: -0.45 },
  { code: 'CDG', city: 'Paris', name: 'Charles de Gaulle', country: 'France', lat: 49.01, lon: 2.55 },
  { code: 'JFK', city: 'New York', name: 'John F. Kennedy International', country: 'USA', lat: 40.64, lon: -73.78 },
  { code: 'SFO', city: 'San Francisco', name: 'San Francisco International', country: 'USA', lat: 37.62, lon: -122.38 },
  { code: 'HND', city: 'Tokyo', name: 'Haneda', country: 'Japan', lat: 35.55, lon: 139.78 },
  { code: 'SYD', city: 'Sydney', name: 'Kingsford Smith', country: 'Australia', lat: -33.94, lon: 151.18 },
];

const AIRLINES = [
  { code: 'AX', name: 'AeroLux', c1: '#7c5cff', c2: '#22d3ee' },
  { code: 'SK', name: 'Skyline Air', c1: '#f97316', c2: '#facc15' },
  { code: 'NB', name: 'Nimbus', c1: '#10b981', c2: '#a3e635' },
  { code: 'OR', name: 'Orbit Airways', c1: '#ec4899', c2: '#8b5cf6' },
  { code: 'VG', name: 'Vega Jet', c1: '#0ea5e9', c2: '#6366f1' },
  { code: 'ZP', name: 'Zephyr', c1: '#f43f5e', c2: '#fb923c' },
];

const DEALS = [
  { code: 'DXB', tag: 'Skyline & souks', a: '#ff8a3d', b: '#7a2e12' },
  { code: 'SIN', tag: 'Garden city nights', a: '#22d3ee', b: '#0b4a5c' },
  { code: 'LHR', tag: 'Royal weekends', a: '#8b7cff', b: '#29206b' },
  { code: 'HND', tag: 'Neon & cherry blossoms', a: '#f472b6', b: '#5c1540' },
  { code: 'BKK', tag: 'Street food heaven', a: '#fbbf24', b: '#5c3a07' },
];

const CABINS = {
  economy: { label: 'Economy', mult: 1 },
  premium: { label: 'Premium Economy', mult: 1.65 },
  business: { label: 'Business', mult: 3.1 },
};

const HUBS = ['DXB', 'DOH', 'SIN', 'BOM', 'DEL', 'KUL'];
const EXIT_ROWS = [14, 15];
const PLANE_PATH = 'M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z';
const ICON = {
  plane: `<svg viewBox="0 0 24 24"><path d="${PLANE_PATH}"/></svg>`,
  tail: '<svg viewBox="0 0 32 32"><path d="M5 27 13 5h7l-5 12h12l-3 10H5Z"/></svg>',
  wifi: '<svg viewBox="0 0 24 24"><path d="M12 18a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm-4.2-2.8a6 6 0 0 1 8.4 0l-1.4 1.4a4 4 0 0 0-5.6 0l-1.4-1.4ZM4.9 12.4a10 10 0 0 1 14.2 0l-1.4 1.4a8 8 0 0 0-11.4 0l-1.4-1.4ZM2 9.5a14 14 0 0 1 20 0l-1.4 1.4a12 12 0 0 0-17.2 0L2 9.5Z"/></svg>',
  meal: '<svg viewBox="0 0 24 24"><path d="M8 2v8a2 2 0 0 1-2 2v10H4V12a2 2 0 0 1-2-2V2h2v6h1V2h2v6h1V2h0Zm8 0c2.2 0 4 2.5 4 6v5h-2v9h-2V2Z"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M9 2h6v3h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-1v1h-2v-1H9v1H7v-1H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h3V2Zm2 3h2V4h-2v1Z"/></svg>',
  seat: '<svg viewBox="0 0 24 24"><path d="M7 3h6a2 2 0 0 1 2 2v7h3a2 2 0 0 1 2 2v5h-2v-3H7a3 3 0 0 1-3-3V5a2 2 0 0 1 2-2h1Z"/></svg>',
};

/* ---------- Helpers ---------- */
const pad = (n) => String(n).padStart(2, '0');
const fmt = (n) => '₹' + Math.round(n).toLocaleString('en-IN');
const toTime = (m) => { m = ((m % 1440) + 1440) % 1440; return `${pad(Math.floor(m / 60))}:${pad(m % 60)}`; };
const durStr = (m) => `${Math.floor(m / 60)}h ${pad(m % 60)}m`;
const isoDate = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parseDate(s); d.setDate(d.getDate() + n); return isoDate(d); };
const niceDate = (s, opts = { weekday: 'short', day: 'numeric', month: 'short' }) => parseDate(s).toLocaleDateString('en-IN', opts);
const airport = (code) => AIRPORTS.find((a) => a.code === code);
const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const alLogo = (a, cls = '') => `<span class="al-logo ${cls}" style="--c1:${a.c1};--c2:${a.c2}">${ICON.tail}</span>`;

function hash(str) {
  let h = 1779033703 ^ str.length;
  for (let i = 0; i < str.length; i++) { h = Math.imul(h ^ str.charCodeAt(i), 3432918353); h = (h << 13) | (h >>> 19); }
  return h >>> 0;
}
function rng(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function haversine(a, b) {
  const R = 6371, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

let toastTimer;
function toast(msg, type = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.className = `toast is-on ${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('is-on'), 3200);
}
function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

/* ---------- State ---------- */
const today = isoDate(new Date());
const state = {
  trip: 'oneway', from: 'MAA', to: 'DXB',
  date: addDays(today, 7), ret: null,
  adults: 1, children: 0, cabin: 'economy',
  leg: 0, flight: null, returnFlight: null,
  seats: [], passengers: [], contact: {}, pnr: null,
  sort: 'best', stops: 'any', times: new Set(), airlines: new Set(),
  payMethod: 'card',
};
const paxCount = () => state.adults + state.children;
const paxList = () => [
  ...Array.from({ length: state.adults }, (_, i) => ({ type: 'adult', label: `Adult ${i + 1}` })),
  ...Array.from({ length: state.children }, (_, i) => ({ type: 'child', label: `Child ${i + 1}` })),
];

/* ---------- Flight generation (deterministic per route + date) ---------- */
const flightCache = new Map();
function genFlights(from, to, date, cabin) {
  const key = `${from}-${to}-${date}-${cabin}`;
  if (flightCache.has(key)) return flightCache.get(key);

  const A = airport(from), B = airport(to);
  const dist = haversine(A, B);
  const r = rng(hash(key));
  const n = 7 + Math.floor(r() * 4);
  const list = [];

  for (let i = 0; i < n; i++) {
    const al = AIRLINES[Math.floor(r() * AIRLINES.length)];
    const stops = dist < 1400 ? (r() < 0.85 ? 0 : 1) : r() < 0.5 ? 0 : r() < 0.85 ? 1 : 2;
    const cruise = (dist / 820) * 60 + 35;
    const dur = Math.round((cruise + stops * (65 + r() * 160)) / 5) * 5;
    const dep = Math.round((300 + r() * 1080) / 5) * 5;
    const base = Math.max(2299, dist * 4.3 * (0.78 + r() * 0.6) * (stops ? 0.86 : 1));
    const price = Math.round((base * CABINS[cabin].mult) / 10) * 10 - 1;
    const hubs = HUBS.filter((h) => h !== from && h !== to);
    const via = Array.from({ length: stops }, () => hubs[Math.floor(r() * hubs.length)]);
    const longHaul = dist > 3500;
    list.push({
      id: `${key}-${i}`, from, to, date, airline: al,
      no: `${al.code} ${100 + Math.floor(r() * 899)}`,
      aircraft: longHaul ? ['A350-900', 'B787-9', 'B777-300ER'][Math.floor(r() * 3)] : ['A320neo', 'A321neo', 'B737 MAX 8'][Math.floor(r() * 3)],
      dep, arr: dep + dur, dur, stops, via: [...new Set(via)], price,
      seatsLeft: 2 + Math.floor(r() * 9),
      wifi: r() > 0.4, meal: longHaul || r() > 0.45, bag: cabin === 'business' ? 40 : cabin === 'premium' ? 30 : longHaul ? 30 : 15,
      gate: `${'ABCDE'[Math.floor(r() * 5)]}${1 + Math.floor(r() * 24)}`,
    });
  }
  const minP = Math.min(...list.map((f) => f.price));
  const minD = Math.min(...list.map((f) => f.dur));
  list.forEach((f) => (f.score = f.price / minP + (f.dur / minD) * 0.8));
  const best = [...list].sort((a, b) => a.score - b.score)[0];
  list.forEach((f) => {
    f.badges = [];
    if (f === best) f.badges.push(['best', 'Best value']);
    if (f.price === minP) f.badges.push(['cheap', 'Cheapest']);
    if (f.dur === minD) f.badges.push(['fast', 'Fastest']);
  });
  flightCache.set(key, list);
  return list;
}

/* ---------- Fare ---------- */
function fare() {
  const legs = [state.flight, state.returnFlight].filter(Boolean);
  const base = legs.reduce((s, f) => s + f.price * state.adults + Math.round(f.price * 0.75) * state.children, 0);
  const taxes = Math.round(base * 0.12);
  const seats = state.seats.reduce((s, x) => s + x.price, 0);
  const fee = legs.length ? 249 : 0;
  return { base, taxes, seats, fee, total: base + taxes + seats + fee };
}

/* =====================================================================
   Navigation
   ===================================================================== */
const VIEWS = ['search', 'flights', 'seats', 'details', 'payment', 'pass'];
let current = 'search';

function goTo(name) {
  if (name === current) return;
  const from = $(`#view-${current}`), to = $(`#view-${name}`);
  const dir = VIEWS.indexOf(name) > VIEWS.indexOf(current) ? 1 : -1;
  from.style.setProperty('--dir', dir);
  to.style.setProperty('--dir', dir);
  from.classList.add('is-leaving');
  current = name;
  updateStepper();

  setTimeout(() => {
    from.classList.remove('is-active', 'is-leaving');
    document.body.dataset.view = name;
    to.classList.add('is-active');
    window.scrollTo({ top: 0, behavior: 'instant' });
    globe && (name === 'search' ? globe.start() : globe.stop());
    $$(".segmented", to).forEach(positionPill);
  }, reduceMotion ? 0 : 360);
}

function updateStepper() {
  const i = VIEWS.indexOf(current);
  $$('.step').forEach((el, k) => {
    el.classList.toggle('done', k < i);
    el.classList.toggle('current', k === i);
  });
  $('#stepFill').style.width = `${(i / (VIEWS.length - 1)) * 100}%`;
}

$$('.step').forEach((el) => el.addEventListener('click', () => {
  const k = +el.dataset.step;
  if (current === 'pass' || k >= VIEWS.indexOf(current)) return;
  navigateTo(VIEWS[k]);
}));

function navigateTo(name) {
  if (current === 'pass') return;
  if (name === 'flights') renderFlightsView();
  if (name === 'seats') renderSeatsView();
  if (name === 'details') renderDetails();
  goTo(name);
}

document.addEventListener('click', (e) => {
  const go = e.target.closest('[data-go]');
  if (go) {
    e.preventDefault();
    const target = go.dataset.go;
    if (current === 'pass' && target !== 'search') return;
    if (target === 'search') goTo('search');
    else navigateTo(target);
  }
  if (e.target.closest('[data-demo]')) {
    e.preventDefault();
    toast('This is a demo — accounts and trip management are not wired up.');
  }
});

/* =====================================================================
   Search form
   ===================================================================== */
function setupAirportField(field) {
  const key = field.dataset.field;
  const trigger = $('.ap-trigger', field);
  const input = $('.ap-search input', field);
  const list = $('.ap-list', field);
  let items = [], active = 0;

  const render = (q = '') => {
    q = q.trim().toLowerCase();
    const other = key === 'from' ? state.to : state.from;
    items = AIRPORTS.filter((a) => a.code !== other && (!q || [a.code, a.city, a.name, a.country].some((s) => s.toLowerCase().includes(q))));
    active = 0;
    list.innerHTML = items.length
      ? items.map((a, i) => `<li role="option" data-code="${a.code}" style="--i:${i}" class="${i === 0 ? 'is-active' : ''}"><span class="ap-code">${a.code}</span><span class="ap-info"><b>${a.city}</b><small>${a.name} · ${a.country}</small></span></li>`).join('')
      : '<li class="empty">No airports match that search</li>';
  };
  const open = () => {
    closePops(field);
    field.classList.add('is-open');
    input.value = '';
    render();
    setTimeout(() => input.focus(), 60);
  };
  const choose = (code) => {
    state[key] = code;
    field.classList.remove('is-open');
    updateAirports(true);
    trigger.focus();
  };

  trigger.addEventListener('click', () => (field.classList.contains('is-open') ? field.classList.remove('is-open') : open()));
  input.addEventListener('input', () => render(input.value));
  input.addEventListener('keydown', (e) => {
    const lis = $$('li[data-code]', list);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      if (!lis.length) return;
      active = (active + (e.key === 'ArrowDown' ? 1 : -1) + lis.length) % lis.length;
      lis.forEach((li, i) => li.classList.toggle('is-active', i === active));
      lis[active].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (items[active]) choose(items[active].code);
    } else if (e.key === 'Escape') {
      field.classList.remove('is-open');
      trigger.focus();
    }
  });
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-code]');
    if (li) choose(li.dataset.code);
  });
}

function closePops(except) {
  $$('.field.is-open').forEach((f) => f !== except && f.classList.remove('is-open'));
}
document.addEventListener('pointerdown', (e) => {
  $$('.field.is-open').forEach((f) => { if (!f.contains(e.target)) f.classList.remove('is-open'); });
});
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePops(); });

function updateAirports(animate) {
  for (const k of ['from', 'to']) {
    const a = airport(state[k]);
    const f = $(`.field[data-field="${k}"]`);
    const code = $('.ap-code-big', f);
    code.textContent = a.code;
    $('.ap-city', f).textContent = `${a.city}, ${a.country}`;
    if (animate) { code.classList.remove('flip-in'); void code.offsetWidth; code.classList.add('flip-in'); }
  }
  const A = airport(state.from), B = airport(state.to);
  const d = haversine(A, B);
  $('#heroFrom').textContent = A.code;
  $('#heroTo').textContent = B.code;
  $('#heroMeta').textContent = `${Math.round(d).toLocaleString('en-IN')} km · ~${durStr(Math.round((d / 820) * 60 + 35))}`;
  globe && globe.setRoute(A, B);
  renderDeals();
}

$('#swapBtn').addEventListener('click', (e) => {
  [state.from, state.to] = [state.to, state.from];
  e.currentTarget.classList.toggle('spin');
  updateAirports(true);
});

/* Segmented controls with sliding pill */
function positionPill(seg) {
  const active = $('button.is-active', seg);
  const pill = $('.seg-pill', seg);
  if (!active || !pill) return;
  pill.style.width = `${active.offsetWidth}px`;
  pill.style.transform = `translateX(${active.offsetLeft}px)`;
}
function setupSegmented(seg, onChange) {
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b || b.classList.contains('is-active')) return;
    $$('button', seg).forEach((x) => x.classList.toggle('is-active', x === b));
    positionPill(seg);
    onChange(b);
  });
  requestAnimationFrame(() => positionPill(seg));
}
window.addEventListener('resize', () => $$('.segmented').forEach(positionPill));
document.fonts && document.fonts.ready.then(() => $$('.segmented').forEach(positionPill));

function setTrip(trip) {
  state.trip = trip;
  $$('#tripToggle button').forEach((b) => b.classList.toggle('is-active', b.dataset.trip === trip));
  positionPill($('#tripToggle'));
  if (trip === 'round' && !state.ret) state.ret = addDays(state.date, 7);
  if (trip === 'oneway') state.ret = null;
  updateDates();
}
setupSegmented($('#tripToggle'), (b) => setTrip(b.dataset.trip));

/* Dates */
const departInput = $('#departDate'), returnInput = $('#returnDate');
departInput.min = today;
returnInput.min = today;

function updateDates() {
  const d = parseDate(state.date);
  departInput.value = state.date;
  $('#departDay').textContent = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
  $('#departWeek').textContent = d.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric' });
  returnInput.min = state.date;

  const rf = $('#returnField');
  const existing = $('.clear-ret', rf);
  if (state.ret) {
    const r = parseDate(state.ret);
    returnInput.value = state.ret;
    rf.classList.remove('is-empty');
    $('#returnDay').textContent = r.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    $('#returnWeek').textContent = r.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric' });
    if (!existing) {
      const x = document.createElement('button');
      x.type = 'button'; x.className = 'clear-ret'; x.setAttribute('aria-label', 'Remove return date'); x.textContent = '×';
      x.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); setTrip('oneway'); });
      rf.appendChild(x);
    }
  } else {
    returnInput.value = '';
    rf.classList.add('is-empty');
    $('#returnDay').textContent = '+ Add';
    $('#returnWeek').textContent = 'Save more on round trips';
    existing && existing.remove();
  }
}

function openPicker(input) {
  try { input.showPicker(); } catch { input.focus(); }
}
$('#departField').addEventListener('click', (e) => { if (e.target === departInput) return; e.preventDefault(); openPicker(departInput); });
$('#returnField').addEventListener('click', (e) => { if (e.target === returnInput || e.target.closest('.clear-ret')) return; e.preventDefault(); openPicker(returnInput); });
departInput.addEventListener('change', () => {
  if (!departInput.value) return;
  state.date = departInput.value < today ? today : departInput.value;
  if (state.ret && state.ret < state.date) state.ret = addDays(state.date, 3);
  updateDates();
});
returnInput.addEventListener('change', () => {
  if (!returnInput.value) return;
  state.ret = returnInput.value < state.date ? state.date : returnInput.value;
  if (state.trip !== 'round') setTrip('round'); else updateDates();
});

/* Travellers */
const paxField = $('#paxField');
$('.pax-trigger', paxField).addEventListener('click', () => {
  const open = !paxField.classList.contains('is-open');
  closePops(paxField);
  paxField.classList.toggle('is-open', open);
});
$('#paxDone').addEventListener('click', () => paxField.classList.remove('is-open'));
$$('.counter', paxField).forEach((c) => {
  c.addEventListener('click', (e) => {
    const b = e.target.closest('button');
    if (!b) return;
    const key = c.dataset.key;
    const next = state[key] + +b.dataset.delta;
    const min = key === 'adults' ? 1 : 0;
    if (next < min || (+b.dataset.delta > 0 && paxCount() >= 9)) return;
    state[key] = next;
    const out = $('output', c);
    out.classList.remove('bump'); void out.offsetWidth; out.classList.add('bump');
    updatePax();
  });
});
$$('input[name="cabin"]').forEach((r) => r.addEventListener('change', () => { state.cabin = r.value; updatePax(); }));

function updatePax() {
  const n = paxCount();
  $('#paxSummary').textContent = `${n} Traveller${n > 1 ? 's' : ''}`;
  $('#cabinSummary').textContent = CABINS[state.cabin].label;
  $$('.counter', paxField).forEach((c) => {
    const key = c.dataset.key;
    $('output', c).textContent = state[key];
    $('[data-delta="-1"]', c).disabled = state[key] <= (key === 'adults' ? 1 : 0);
    $('[data-delta="1"]', c).disabled = n >= 9;
  });
}

/* Submit */
$('#search-card').addEventListener('submit', async (e) => {
  e.preventDefault();
  closePops();
  if (state.from === state.to) {
    shake($('#search-card'));
    return toast('Origin and destination can’t be the same.', 'error');
  }
  resetBooking();
  await showLoader(['Scanning 180+ airlines…', 'Comparing live fares…', 'Checking seat maps…'], 1700);
  renderFlightsView();
  goTo('flights');
});

function resetBooking() {
  state.leg = 0;
  state.flight = null;
  state.returnFlight = null;
  state.seats = [];
  state.passengers = [];
  state.pnr = null;
  state.stops = 'any';
  state.times.clear();
  state.airlines.clear();
  document.body.classList.remove('is-booked');
}

/* =====================================================================
   Loader
   ===================================================================== */
function showLoader(messages, ms) {
  return new Promise((resolve) => {
    const L = $('#loader'), text = $('#loaderText'), bar = $('#loaderBar');
    const dur = reduceMotion ? 300 : ms;
    L.classList.add('is-on');
    text.textContent = messages[0];
    bar.style.transition = 'none';
    bar.style.width = '0';
    void bar.offsetWidth;
    bar.style.transition = `width ${dur}ms cubic-bezier(.4,0,.2,1)`;
    bar.style.width = '100%';
    let i = 0;
    const iv = setInterval(() => {
      i = Math.min(i + 1, messages.length - 1);
      text.classList.remove('swap'); void text.offsetWidth; text.classList.add('swap');
      text.textContent = messages[i];
    }, dur / messages.length);
    setTimeout(() => { clearInterval(iv); L.classList.remove('is-on'); resolve(); }, dur + 150);
  });
}

/* =====================================================================
   Deals
   ===================================================================== */
function skylineSVG(seed) {
  const r = rng(hash(seed));
  let x = 0, d = 'M0 200 ';
  while (x < 400) {
    const w = 14 + r() * 34, h = 40 + r() * 130;
    d += `L${x.toFixed(0)} ${200 - h} L${(x + w).toFixed(0)} ${200 - h} `;
    if (r() > 0.75) d += `L${(x + w / 2).toFixed(0)} ${200 - h - 24} L${(x + w).toFixed(0)} ${200 - h} `;
    x += w + r() * 6;
  }
  d += 'L400 200 Z';
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="none"><path d="${d}" fill="currentColor"/></svg>`;
}

function renderDeals() {
  const from = airport(state.from);
  $('#dealsFrom').textContent = from.city;
  const grid = $('#dealsGrid');
  const deals = DEALS.filter((d) => d.code !== state.from);
  grid.innerHTML = deals.map((d, i) => {
    const a = airport(d.code);
    const cheapest = Math.min(...genFlights(state.from, d.code, state.date, 'economy').map((f) => f.price));
    return `<button type="button" class="deal" data-tilt="8" data-code="${d.code}" style="--a:${d.a};--b:${d.b}" aria-label="Plan a trip to ${a.city}">
      <span class="sun"></span>
      <span class="big-code">${d.code}</span>
      <span class="skyline">${skylineSVG(d.code + i)}</span>
      <span class="deal-info">
        <span><h3>${a.city}</h3><p>${d.tag}</p></span>
        <span class="deal-price"><small>from</small><b>${fmt(cheapest)}</b></span>
      </span>
      <span class="glare"></span>
    </button>`;
  }).join('');
  bindTilt(grid);
}
$('#dealsGrid').addEventListener('click', (e) => {
  const card = e.target.closest('.deal');
  if (!card) return;
  state.to = card.dataset.code;
  updateAirports(true);
  $('#search-card').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
  toast(`Destination set to ${airport(state.to).city}. Hit search when ready!`, 'ok');
});

/* =====================================================================
   Flights view
   ===================================================================== */
const legInfo = () => (state.leg === 0
  ? { from: state.from, to: state.to, date: state.date }
  : { from: state.to, to: state.from, date: state.ret });

function renderFlightsView() {
  const { from, to, date } = legInfo();
  $('#rFrom').textContent = from;
  $('#rTo').textContent = to;
  const n = paxCount();
  $('#rMeta').textContent = `${niceDate(date, { weekday: 'long', day: 'numeric', month: 'long' })} · ${n} traveller${n > 1 ? 's' : ''} · ${CABINS[state.cabin].label}`;

  const tabs = $('#legTabs');
  if (state.trip === 'round') {
    tabs.innerHTML = [
      { t: 'Departure', f: state.from, to: state.to, d: state.date, done: !!state.flight },
      { t: 'Return', f: state.to, to: state.from, d: state.ret, done: !!state.returnFlight },
    ].map((l, i) => `<div class="leg-tab ${i === state.leg ? 'is-active' : ''} ${l.done ? 'is-done' : ''}"><span>${l.t} · ${niceDate(l.d)}</span><b>${l.f} → ${l.to}</b></div>`).join('');
  } else tabs.innerHTML = '';

  renderDateStrip();
  renderAirlineFilter();
  syncFilterUI();
  renderFlightList();
}

function renderDateStrip() {
  const { from, to, date } = legInfo();
  const minDate = state.leg === 1 ? state.date : today;
  const days = Array.from({ length: 7 }, (_, i) => addDays(date, i - 3));
  const prices = days.map((d) => (d < minDate ? null : Math.min(...genFlights(from, to, d, state.cabin).map((f) => f.price))));
  const valid = prices.filter((p) => p !== null);
  const low = Math.min(...valid);
  $('#dateStrip').innerHTML = days.map((d, i) => `
    <button type="button" class="date-cell ${d === date ? 'is-active' : ''} ${prices[i] === low ? 'cheap' : ''}" data-date="${d}" style="--i:${i}" ${prices[i] === null ? 'disabled' : ''}>
      <small>${niceDate(d, { weekday: 'short' })}</small>
      <b>${niceDate(d, { day: 'numeric', month: 'short' })}</b>
      <span>${prices[i] === null ? '—' : fmt(prices[i])}</span>
    </button>`).join('');
}
$('#dateStrip').addEventListener('click', (e) => {
  const c = e.target.closest('.date-cell');
  if (!c || c.disabled || c.classList.contains('is-active')) return;
  if (state.leg === 0) {
    state.date = c.dataset.date;
    if (state.ret && state.ret < state.date) state.ret = state.date;
  } else state.ret = c.dataset.date;
  updateDates();
  renderFlightsView();
});

function renderAirlineFilter() {
  const flights = genFlights(legInfo().from, legInfo().to, legInfo().date, state.cabin);
  const byAl = new Map();
  flights.forEach((f) => byAl.set(f.airline.code, Math.min(byAl.get(f.airline.code) ?? Infinity, f.price)));
  $('#airlineFilter').innerHTML = AIRLINES.filter((a) => byAl.has(a.code)).map((a) => `
    <label class="al-check">
      <input type="checkbox" value="${a.code}" ${state.airlines.has(a.code) ? 'checked' : ''} />
      <span class="box"></span>
      ${alLogo(a, 'xs')}
      <span class="al-name">${a.name}</span>
      <small>${fmt(byAl.get(a.code))}</small>
    </label>`).join('');
}
$('#airlineFilter').addEventListener('change', (e) => {
  const cb = e.target;
  cb.checked ? state.airlines.add(cb.value) : state.airlines.delete(cb.value);
  renderFlightList();
});
$('#stopFilter').addEventListener('click', (e) => {
  const b = e.target.closest('.chip');
  if (!b) return;
  state.stops = b.dataset.stops;
  syncFilterUI();
  renderFlightList();
});
$('#timeFilter').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  const t = b.dataset.time;
  state.times.has(t) ? state.times.delete(t) : state.times.add(t);
  syncFilterUI();
  renderFlightList();
});
$('#resetFilters').addEventListener('click', () => {
  state.stops = 'any'; state.times.clear(); state.airlines.clear();
  renderAirlineFilter();
  syncFilterUI();
  renderFlightList();
});
setupSegmented($('#sortTabs'), (b) => { state.sort = b.dataset.sort; renderFlightList(); });

function syncFilterUI() {
  $$('#stopFilter .chip').forEach((c) => c.classList.toggle('is-active', c.dataset.stops === state.stops));
  $$('#timeFilter button').forEach((b) => b.classList.toggle('is-active', state.times.has(b.dataset.time)));
}

const timeBucket = (m) => {
  const h = Math.floor((m % 1440) / 60);
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 21) return 'evening';
  return 'night';
};

function renderFlightList() {
  const { from, to, date } = legInfo();
  let list = genFlights(from, to, date, state.cabin).filter((f) =>
    (state.stops === 'any' || (state.stops === '0' ? f.stops === 0 : f.stops >= 1)) &&
    (!state.times.size || state.times.has(timeBucket(f.dep))) &&
    (!state.airlines.size || state.airlines.has(f.airline.code)));

  const sorters = {
    best: (a, b) => a.score - b.score,
    cheap: (a, b) => a.price - b.price,
    fast: (a, b) => a.dur - b.dur,
    early: (a, b) => a.dep - b.dep,
  };
  list = [...list].sort(sorters[state.sort]);
  $('#resultCount').textContent = list.length;

  const el = $('#flightList');
  if (!list.length) {
    el.innerHTML = `<div class="empty-state glass"><h3>No flights match those filters</h3><p>Try widening the departure window or clearing a filter.</p></div>`;
    return;
  }
  el.innerHTML = list.map((f, i) => {
    const plusDay = Math.floor(f.arr / 1440);
    const stopsTxt = f.stops === 0 ? 'Non-stop' : `${f.stops} stop${f.stops > 1 ? 's' : ''} · ${f.via.join(', ')}`;
    const stopDots = f.via.map((_, k) => `<i class="stop" style="left:${((k + 1) / (f.via.length + 1)) * 100}%"></i>`).join('');
    return `<article class="flight-card glass" data-tilt="3" style="--i:${i}">
      <div class="fc-badges">${f.badges.map(([c, t]) => `<span class="badge ${c}">${t}</span>`).join('')}</div>
      <div class="fc-airline">${alLogo(f.airline)}<div><b>${f.airline.name}</b><small>${f.no} · ${f.aircraft}</small></div></div>
      <div class="fc-main">
        <div class="fc-route">
          <div class="fc-time"><strong>${toTime(f.dep)}</strong><span>${f.from}</span></div>
          <div class="fc-path">
            <span>${durStr(f.dur)}</span>
            <div class="fc-line"><i class="dot"></i>${stopDots}<i class="pl">${ICON.plane}</i><i class="dot end"></i></div>
            <span class="fc-stops ${f.stops ? 'via' : 'non'}">${stopsTxt}</span>
          </div>
          <div class="fc-time"><strong>${toTime(f.arr)}${plusDay ? `<sup>+${plusDay}</sup>` : ''}</strong><span>${f.to}</span></div>
        </div>
        <div class="fc-amen">
          <span>${ICON.bag}${f.bag} kg</span>
          ${f.meal ? `<span>${ICON.meal}Meal</span>` : ''}
          ${f.wifi ? `<span>${ICON.wifi}Wi-Fi</span>` : ''}
          <span>${ICON.seat}Seat map</span>
        </div>
      </div>
      <div class="fc-price">
        <div><small>per adult</small><strong>${fmt(f.price)}</strong>
        <em class="left ${f.seatsLeft > 5 ? 'ok' : ''}">${f.seatsLeft > 5 ? `${CABINS[state.cabin].label}` : `Only ${f.seatsLeft} seats left`}</em></div>
        <button type="button" class="btn-primary sm" data-select="${f.id}">Select</button>
      </div>
      <span class="glare"></span>
    </article>`;
  }).join('');
  bindTilt(el);
}

$('#flightList').addEventListener('click', async (e) => {
  const b = e.target.closest('[data-select]');
  if (!b) return;
  const { from, to, date } = legInfo();
  const f = genFlights(from, to, date, state.cabin).find((x) => x.id === b.dataset.select);
  if (!f) return;

  if (state.leg === 0) {
    if (!state.flight || state.flight.id !== f.id) state.seats = [];
    state.flight = f;
    if (state.trip === 'round') {
      state.leg = 1;
      state.stops = 'any'; state.times.clear(); state.airlines.clear();
      toast(`Departure locked in — ${f.no}. Now pick your return.`, 'ok');
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      renderFlightsView();
      return;
    }
  } else {
    state.returnFlight = f;
  }
  await showLoader(['Loading cabin layout…', 'Fetching live seat availability…'], 1100);
  renderSeatsView();
  goTo('seats');
});

/* =====================================================================
   Seat map
   ===================================================================== */
let SEATS = {};
const cabinOfRow = (r) => (r <= 3 ? 'business' : r <= 8 ? 'premium' : 'economy');
const ROWS = Array.from({ length: 31 }, (_, i) => i + 1).filter((r) => r !== 13); // no row 13, like most airlines

function seatInfo(row, letter, cab) {
  const pos = cab === 'business'
    ? (letter === 'A' || letter === 'F' ? 'window' : 'aisle')
    : (letter === 'A' || letter === 'F' ? 'window' : letter === 'C' || letter === 'D' ? 'aisle' : 'middle');
  const exit = EXIT_ROWS.includes(row);
  let price = 0;
  if (cab === 'economy') price = exit ? 899 : pos === 'window' ? 349 : pos === 'aisle' ? 249 : 0;
  if (cab === 'economy' && row <= 11 && !exit) price += 150; // up-front rows
  return { pos, exit, price };
}

function renderSeatsView() {
  const f = state.flight;
  const r = rng(hash(f.id + 'seats'));
  SEATS = {};
  let html = '', last = null;

  ROWS.forEach((row, idx) => {
    const cab = cabinOfRow(row);
    if (cab !== last) {
      html += `<div class="cabin-divider ${cab === state.cabin ? 'mine' : ''}">${CABINS[cab].label}${cab === state.cabin ? ' · your cabin' : ''}</div>`;
      last = cab;
    }
    const groups = cab === 'business' ? [['A', 'C'], ['D', 'F']] : [['A', 'B', 'C'], ['D', 'E', 'F']];
    const exit = EXIT_ROWS.includes(row);
    const seatBtn = (letter) => {
      const id = `${row}${letter}`;
      const info = seatInfo(row, letter, cab);
      const taken = r() < (cab === 'business' ? 0.3 : cab === 'premium' ? 0.35 : 0.42);
      const off = cab !== state.cabin;
      SEATS[id] = { id, row, letter, cabin: cab, ...info, taken, off };
      const cls = ['seat', cab === 'business' ? 'biz' : cab === 'premium' ? 'prem' : '', info.exit ? 'xl' : '', taken ? 'taken' : '', off ? 'off' : ''].join(' ');
      const label = taken ? '×' : letter;
      const aria = `Seat ${id}, ${info.pos}${info.exit ? ', extra legroom' : ''}${taken ? ', occupied' : off ? `, ${CABINS[cab].label} cabin` : info.price ? `, ${fmt(info.price)}` : ', free'}`;
      return `<button type="button" class="${cls}" data-seat="${id}" aria-label="${aria}" ${taken || off ? 'disabled' : ''}><span class="seat-label">${label}</span></button>`;
    };
    html += `<div class="seat-row ${exit ? 'exit' : ''}" style="--r:${idx}">
      <div class="seat-group l">${groups[0].map(seatBtn).join('')}</div>
      <span class="row-no">${row}</span>
      <div class="seat-group r">${groups[1].map(seatBtn).join('')}</div>
    </div>`;
  });
  $('#cabin').innerHTML = html;

  // drop any previously chosen seats that don't exist / are now invalid
  state.seats = state.seats.filter((s) => SEATS[s.id] && !SEATS[s.id].taken && !SEATS[s.id].off);
  syncSeats();

  // restart plane entrance animation
  const plane = $('#plane');
  plane.style.animation = 'none'; void plane.offsetWidth; plane.style.animation = '';
}

function syncSeats() {
  $$('#cabin .seat').forEach((b) => {
    const i = state.seats.findIndex((s) => s.id === b.dataset.seat);
    const on = i > -1;
    if (on !== b.classList.contains('is-selected')) b.classList.toggle('is-selected', on);
    const lbl = $('.seat-label', b);
    const seat = SEATS[b.dataset.seat];
    lbl.textContent = on ? `P${i + 1}` : seat.taken ? '×' : seat.letter;
    b.setAttribute('aria-pressed', on);
  });
  const need = paxCount(), have = state.seats.length;
  $('#seatHint').textContent = have >= need
    ? `All set — ${have} seat${have > 1 ? 's' : ''} selected. Tap another to swap.`
    : `Select ${need - have} more seat${need - have > 1 ? 's' : ''} · ${CABINS[state.cabin].label} cabin`;
  $('#seatContinue').disabled = have < need;
  renderSummaries();
}

$('#cabin').addEventListener('click', (e) => {
  const b = e.target.closest('.seat');
  if (!b || b.disabled) return;
  const id = b.dataset.seat;
  const i = state.seats.findIndex((s) => s.id === id);
  if (i > -1) state.seats.splice(i, 1);
  else {
    if (state.seats.length >= paxCount()) state.seats.shift();
    state.seats.push({ ...SEATS[id] });
  }
  syncSeats();
  showSeatTip(b);
});

/* Seat tooltip */
const tip = $('#seatTip');
function showSeatTip(b) {
  const s = SEATS[b.dataset.seat];
  if (!s) return;
  const rect = b.getBoundingClientRect();
  const posLbl = s.pos[0].toUpperCase() + s.pos.slice(1);
  let body;
  if (s.taken) body = '<small>Already taken</small>';
  else if (s.off) body = `<small>${CABINS[s.cabin].label} cabin — not in your fare</small>`;
  else body = `<small>${posLbl}${s.exit ? ' · Extra legroom' : ''}</small><span class="tp">${s.price ? '+' + fmt(s.price) : 'Included'}</span>`;
  tip.innerHTML = `<b>${s.id}</b>${body}`;
  tip.style.left = `${rect.left + rect.width / 2}px`;
  tip.style.top = `${rect.top}px`;
  tip.classList.add('is-on');
}
$('#cabin').addEventListener('pointerover', (e) => {
  const b = e.target.closest('.seat');
  if (b && e.pointerType === 'mouse') showSeatTip(b);
});
$('#cabin').addEventListener('pointerout', (e) => {
  if (e.target.closest('.seat') && !e.relatedTarget?.closest?.('.seat')) tip.classList.remove('is-on');
});
window.addEventListener('scroll', () => tip.classList.remove('is-on'), { passive: true });

/* Auto-pick: prefer a contiguous block in one row, as far forward as possible */
$('#autoPick').addEventListener('click', () => {
  const need = paxCount();
  const avail = (id) => SEATS[id] && !SEATS[id].taken && !SEATS[id].off;
  const rows = ROWS.filter((r) => cabinOfRow(r) === state.cabin);
  let pick = null;

  outer: for (const row of rows) {
    const groups = state.cabin === 'business' ? [['A', 'C'], ['D', 'F']] : [['A', 'B', 'C'], ['D', 'E', 'F']];
    const all = [...groups[0], ...groups[1]];
    for (const g of need <= groups[0].length ? groups : [all]) {
      const free = g.filter((l) => avail(`${row}${l}`));
      if (free.length >= need) { pick = free.slice(0, need).map((l) => `${row}${l}`); break outer; }
    }
  }
  if (!pick) {
    pick = Object.values(SEATS).filter((s) => avail(s.id)).slice(0, need).map((s) => s.id);
    if (pick.length < need) return toast('Not enough free seats in this cabin — try another flight.', 'error');
    toast('Couldn’t seat everyone together — picked the closest seats.', '');
  } else toast(need > 1 ? 'Seated together — nice!' : 'Picked the best available seat.', 'ok');

  state.seats = pick.map((id) => ({ ...SEATS[id] }));
  syncSeats();
  const first = $(`.seat[data-seat="${pick[0]}"]`);
  first && first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
});
$('#clearSeats').addEventListener('click', () => { state.seats = []; syncSeats(); });

$('#seatContinue').addEventListener('click', () => {
  if (state.seats.length < paxCount()) return;
  renderDetails();
  goTo('details');
});

/* =====================================================================
   Summary (shared by seats / details / payment)
   ===================================================================== */
let shownTotal = 0;
function renderSummaries() {
  const legs = [state.flight, state.returnFlight].filter(Boolean);
  if (!legs.length) return;
  const fr = fare();
  const people = paxList();
  const html = `
    ${legs.map((f) => `
      <div class="sum-leg">
        ${alLogo(f.airline)}
        <div>
          <div class="sl-route">${f.from} ${ICON.plane} ${f.to}</div>
          <small>${niceDate(f.date)} · ${toTime(f.dep)} – ${toTime(f.arr)} · ${f.no}</small>
        </div>
      </div>`).join('')}
    <div class="sum-pax"><ul>
      ${people.map((p, i) => {
        const d = state.passengers[i];
        const name = d ? `${d.first} ${d.last}` : p.label;
        const s = state.seats[i];
        return `<li><span>${escapeHTML(name)}</span><span class="seat-pill ${s ? 'on' : ''}">${s ? s.id : 'No seat'}</span></li>`;
      }).join('')}
    </ul></div>
    <ul class="sum-fare">
      <li><span>Base fare (${people.length} × ${legs.length === 2 ? 'return' : 'one way'})</span><b>${fmt(fr.base)}</b></li>
      <li><span>Taxes & airport fees</span><b>${fmt(fr.taxes)}</b></li>
      <li><span>Seat selection</span><b>${fr.seats ? fmt(fr.seats) : 'Free'}</b></li>
      <li><span>Convenience fee</span><b>${fmt(fr.fee)}</b></li>
    </ul>
    <div class="sum-total"><span>Total</span><b class="total-val">${fmt(shownTotal)}</b></div>`;
  $$('.summary-body').forEach((el) => (el.innerHTML = html));
  $$('.total-val').forEach((el) => countUp(el, shownTotal, fr.total));
  shownTotal = fr.total;
}

function countUp(el, from, to) {
  if (reduceMotion || from === to) { el.textContent = fmt(to); return; }
  const t0 = performance.now(), d = 750;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 3);
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

/* =====================================================================
   Traveller details
   ===================================================================== */
function renderDetails() {
  const people = paxList();
  $('#paxForms').innerHTML = people.map((p, i) => {
    const d = state.passengers[i] || {};
    const titles = p.type === 'child' ? ['Master', 'Miss'] : ['Mr', 'Ms', 'Mrs', 'Dr'];
    return `<fieldset class="pax-card glass" style="--i:${i}" data-idx="${i}" data-type="${p.type}">
      <legend><span class="pax-num">${i + 1}</span>${p.label}<em>Seat ${state.seats[i]?.id ?? '—'}</em></legend>
      <div class="fgrid">
        <div class="fl"><select name="title" aria-label="Title">${titles.map((t) => `<option ${d.title === t ? 'selected' : ''}>${t}</option>`).join('')}</select><label>Title</label></div>
        <div class="fl"><input name="first" placeholder=" " autocomplete="${i === 0 ? 'given-name' : 'off'}" value="${escapeHTML(d.first || '')}" maxlength="30" /><label>First name</label><small class="err"></small></div>
        <div class="fl"><input name="last" placeholder=" " autocomplete="${i === 0 ? 'family-name' : 'off'}" value="${escapeHTML(d.last || '')}" maxlength="30" /><label>Last name</label><small class="err"></small></div>
        <div class="fl"><input name="age" type="number" inputmode="numeric" placeholder=" " value="${d.age ?? ''}" min="${p.type === 'child' ? 2 : 12}" max="${p.type === 'child' ? 11 : 110}" /><label>Age</label><small class="err"></small></div>
      </div>
    </fieldset>`;
  }).join('');
  $('#contactEmail').value = state.contact.email || '';
  $('#contactPhone').value = state.contact.phone || '';
  renderSummaries();
}

function setErr(input, msg) {
  const fl = input.closest('.fl');
  fl.classList.toggle('invalid', !!msg);
  const err = $('.err', fl);
  if (err) err.textContent = msg || '';
  return !msg;
}
document.addEventListener('input', (e) => {
  const fl = e.target.closest?.('.fl.invalid');
  if (fl) setErr(e.target, '');
});

$('#contactPhone').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10); });

$('#detailsForm').addEventListener('submit', (e) => {
  e.preventDefault();
  let ok = true, firstBad = null;
  const people = [];
  const nameRe = /^[A-Za-z][A-Za-z .'-]{0,29}$/;

  $$('#paxForms .pax-card').forEach((card) => {
    const child = card.dataset.type === 'child';
    const get = (n) => $(`[name="${n}"]`, card);
    const first = get('first'), last = get('last'), age = get('age');
    const a = +age.value;
    const checks = [
      setErr(first, nameRe.test(first.value.trim()) ? '' : 'Enter a valid first name'),
      setErr(last, nameRe.test(last.value.trim()) ? '' : 'Enter a valid last name'),
      setErr(age, !age.value ? 'Required' : child ? (a < 2 || a > 11 ? 'Child must be 2–11' : '') : (a < 12 || a > 110 ? 'Adult must be 12+' : '')),
    ];
    if (checks.includes(false)) { ok = false; firstBad ??= card; shake(card); }
    people.push({ title: get('title').value, first: first.value.trim(), last: last.value.trim(), age: a, type: card.dataset.type });
  });

  const email = $('#contactEmail'), phone = $('#contactPhone');
  const c1 = setErr(email, /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim()) ? '' : 'Enter a valid email');
  const c2 = setErr(phone, /^[6-9]\d{9}$/.test(phone.value) ? '' : 'Enter a 10-digit mobile number');
  if (!c1 || !c2) { ok = false; firstBad ??= email.closest('.pax-card'); shake(email.closest('.pax-card')); }

  if (!ok) {
    firstBad?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    return toast('Please fix the highlighted fields.', 'error');
  }
  state.passengers = people;
  state.contact = { email: email.value.trim(), phone: phone.value };
  renderSummaries();
  goTo('payment');
});

/* =====================================================================
   Payment (demo — values are only validated for format, never stored or sent)
   ===================================================================== */
const card3d = $('#card3d');
const cardNum = $('#cardNum'), cardName = $('#cardName'), cardExp = $('#cardExp'), cardCvv = $('#cardCvv');

function cardBrand(num) {
  if (/^4/.test(num)) return 'VISA';
  if (/^(5[1-5]|2[2-7])/.test(num)) return 'MASTERCARD';
  if (/^3[47]/.test(num)) return 'AMEX';
  if (/^(60|65|81|82)/.test(num)) return 'RUPAY';
  return 'AEROLUX';
}
cardNum.addEventListener('input', () => {
  const digits = cardNum.value.replace(/\D/g, '').slice(0, 16);
  cardNum.value = digits.replace(/(.{4})/g, '$1 ').trim();
  const masked = (digits + '•'.repeat(16 - digits.length)).replace(/(.{4})/g, '$1 ').trim();
  $('#cvNumber').textContent = masked;
  $('#cvBrand').textContent = cardBrand(digits);
});
cardName.addEventListener('input', () => {
  cardName.value = cardName.value.replace(/[^A-Za-z .'-]/g, '');
  $('#cvName').textContent = cardName.value.trim().toUpperCase() || 'YOUR NAME';
});
cardExp.addEventListener('input', (e) => {
  let v = cardExp.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
  else if (v.length === 2 && e.inputType !== 'deleteContentBackward') v += '/';
  cardExp.value = v;
  $('#cvExp').textContent = v || 'MM/YY';
});
cardCvv.addEventListener('input', () => {
  cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4);
  $('#cvCvv').textContent = '•'.repeat(cardCvv.value.length) || '•••';
});
cardCvv.addEventListener('focus', () => card3d.classList.add('is-flipped'));
cardCvv.addEventListener('blur', () => card3d.classList.remove('is-flipped'));

setupSegmented($('#payTabs'), (b) => {
  state.payMethod = b.dataset.pay;
  $$('.pay-panel').forEach((p) => p.classList.toggle('is-active', p.dataset.panel === b.dataset.pay));
});

function renderUpiQr() {
  const r = rng(hash('aerolux-upi'));
  const n = 25, s = 100 / n;
  let rects = '';
  const finder = (x, y) => `<rect x="${x * s}" y="${y * s}" width="${7 * s}" height="${7 * s}" fill="#0b0f2e"/><rect x="${(x + 1) * s}" y="${(y + 1) * s}" width="${5 * s}" height="${5 * s}" fill="#fff"/><rect x="${(x + 2) * s}" y="${(y + 2) * s}" width="${3 * s}" height="${3 * s}" fill="#7c5cff"/>`;
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const inFinder = (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    if (!inFinder && r() > 0.52) rects += `<rect x="${x * s}" y="${y * s}" width="${s}" height="${s}" fill="#0b0f2e"/>`;
  }
  $('#upiQr').innerHTML = `<svg viewBox="0 0 100 100" shape-rendering="crispEdges" aria-label="Sample UPI QR code (demo)">${rects}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
}

$('#payForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  let ok;
  if (state.payMethod === 'card') {
    const digits = cardNum.value.replace(/\D/g, '');
    const [mm, yy] = cardExp.value.split('/').map(Number);
    const now = new Date();
    const expOk = mm >= 1 && mm <= 12 && yy >= 0 && new Date(2000 + yy, mm, 0) >= new Date(now.getFullYear(), now.getMonth(), 1);
    ok = [
      setErr(cardNum, digits.length >= 15 ? '' : 'Enter a 15–16 digit card number'),
      setErr(cardName, cardName.value.trim().length >= 2 ? '' : 'Enter the name on the card'),
      setErr(cardExp, expOk ? '' : 'Enter a valid future expiry'),
      setErr(cardCvv, /^\d{3,4}$/.test(cardCvv.value) ? '' : '3 or 4 digits'),
    ].every(Boolean);
  } else {
    const upi = $('#upiId');
    ok = setErr(upi, /^[\w.-]{2,}@[A-Za-z]{2,}$/.test(upi.value.trim()) ? '' : 'Enter a UPI ID like name@bank');
  }
  if (!ok) { shake($('#payForm')); return toast('Please check your payment details.', 'error'); }

  await showLoader(['Authorising payment…', 'Locking your seats…', 'Issuing e-tickets…'], 2200);

  // Payment fields are cleared immediately — nothing is kept.
  [cardNum, cardName, cardExp, cardCvv, $('#upiId')].forEach((i) => (i.value = ''));
  $('#cvNumber').textContent = '•••• •••• •••• ••••'; $('#cvName').textContent = 'YOUR NAME'; $('#cvExp').textContent = 'MM/YY'; $('#cvCvv').textContent = '•••'; $('#cvBrand').textContent = 'AEROLUX';

  state.pnr = Array.from({ length: 6 }, () => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 32)]).join('');
  renderPass();
  document.body.classList.add('is-booked');
  goTo('pass');
  setTimeout(confetti, reduceMotion ? 0 : 500);
});

/* =====================================================================
   Boarding pass
   ===================================================================== */
function barcodeSVG(seed) {
  const r = rng(hash(seed));
  let x = 0, bars = '';
  while (x < 200) {
    const w = 1 + Math.floor(r() * 3);
    if (r() > 0.4) bars += `<rect x="${x}" y="0" width="${w}" height="60" fill="#0b0f2e"/>`;
    x += w + 1;
  }
  return `<svg viewBox="0 0 200 60" preserveAspectRatio="none">${bars}</svg>`;
}

function renderPass() {
  const f = state.flight;
  const A = airport(f.from), B = airport(f.to);
  const lead = state.passengers[0];
  $('#passName').textContent = lead.first;
  $('#pnrCode').textContent = state.pnr;
  $('#passEmail').textContent = state.contact.email;
  const zone = (s) => (s.cabin === 'business' ? 1 : s.cabin === 'premium' ? 2 : s.row < 20 ? 3 : 4);

  $('#passList').innerHTML = state.passengers.map((p, i) => {
    const s = state.seats[i];
    return `<article class="bpass" data-tilt="5" style="--i:${i}">
      <span class="bp-foil"></span>
      <div class="bp-main">
        <div class="bp-head">${alLogo(f.airline)}<b>${f.airline.name}</b><span class="bp-class">${CABINS[state.cabin].label}</span><span class="bp-tag">Boarding pass</span></div>
        <div class="bp-route">
          <div><strong>${A.code}</strong><span>${A.city}</span></div>
          <div class="bp-arc">
            <svg class="arc" viewBox="0 0 200 60" preserveAspectRatio="none"><path d="M4 56 Q100 -20 196 56"/></svg>
            <span class="arc-plane">${ICON.plane}</span>
            <em>${durStr(f.dur)} · ${f.stops ? `via ${f.via.join(', ')}` : 'Non-stop'}</em>
          </div>
          <div><strong>${B.code}</strong><span>${B.city}</span></div>
        </div>
        <div class="bp-grid">
          <div><small>Passenger</small><b>${escapeHTML(`${p.title} ${p.first} ${p.last}`.toUpperCase())}</b></div>
          <div><small>Flight</small><b>${f.no}</b></div>
          <div><small>Date</small><b>${niceDate(f.date)}</b></div>
          <div><small>Departs</small><b>${toTime(f.dep)}</b></div>
          <div><small>Boarding</small><b>${toTime(f.dep - 45)}</b></div>
          <div><small>Gate</small><b>${f.gate}</b></div>
          <div><small>Zone</small><b>${zone(s)}</b></div>
          <div><small>Seat</small><b class="hl">${s.id}</b></div>
        </div>
      </div>
      <div class="bp-stub">
        <div><small>PNR</small><b>${state.pnr}</b></div>
        <div><small>Seat</small><b>${s.id}</b></div>
        <div><small>Gate closes</small><b>${toTime(f.dep - 20)}</b></div>
        <div class="barcode">${barcodeSVG(state.pnr + i)}</div>
      </div>
      <span class="glare"></span>
    </article>`;
  }).join('');

  if (state.returnFlight) {
    const rf = state.returnFlight;
    $('#passList').insertAdjacentHTML('beforeend', `<p class="muted" style="text-align:center">Return ${rf.no} · ${rf.from} → ${rf.to} on ${niceDate(rf.date)} is confirmed — seats for the return can be chosen at online check-in.</p>`);
  }
  bindTilt($('#passList'));
}

$('#printBtn').addEventListener('click', () => window.print());
$('#newBooking').addEventListener('click', () => {
  resetBooking();
  shownTotal = 0;
  goTo('search');
});

/* =====================================================================
   Confetti
   ===================================================================== */
function confetti() {
  if (reduceMotion) return;
  const c = $('#confetti'), ctx = c.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  c.width = innerWidth * dpr; c.height = innerHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const colors = ['#7c5cff', '#22d3ee', '#f472b6', '#fbbf24', '#34d399', '#ffffff'];
  const parts = Array.from({ length: 200 }, (_, i) => {
    const fromLeft = i % 2 === 0;
    return {
      x: fromLeft ? -10 : innerWidth + 10, y: innerHeight * (0.55 + Math.random() * 0.3),
      vx: (fromLeft ? 1 : -1) * (6 + Math.random() * 9), vy: -(10 + Math.random() * 12),
      w: 6 + Math.random() * 6, h: 8 + Math.random() * 10, rot: Math.random() * 6, vr: (Math.random() - 0.5) * 0.35,
      color: colors[i % colors.length], life: 0,
    };
  });
  const t0 = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts.forEach((p) => {
      p.vy += 0.32; p.vx *= 0.985; p.vy *= 0.99;
      p.x += p.vx; p.y += p.vy; p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y); ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.rot * 2));
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });
    if (t - t0 < 4500) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })(t0);
}

/* =====================================================================
   3D globe (canvas)
   ===================================================================== */
function createGlobe(canvas) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, R = 0, running = false, raf = 0;
  const N = 1400, GOLD = Math.PI * (3 - Math.sqrt(5));
  const pts = Array.from({ length: N }, (_, i) => {
    const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = GOLD * i;
    return [Math.cos(th) * r, y, Math.sin(th) * r];
  });
  const vec = (a) => {
    const la = (a.lat * Math.PI) / 180, lo = (a.lon * Math.PI) / 180;
    return [Math.cos(la) * Math.cos(lo), Math.sin(la), -Math.cos(la) * Math.sin(lo)];
  };
  const bgRoutes = [['DXB', 'LHR'], ['SIN', 'SYD'], ['DEL', 'JFK'], ['HND', 'SFO'], ['DOH', 'CDG'], ['BOM', 'SIN'], ['LHR', 'JFK'], ['BKK', 'HND'], ['MAA', 'SIN'], ['DXB', 'SIN']]
    .map(([a, b]) => [vec(airport(a)), vec(airport(b))]);
  const cityVecs = AIRPORTS.map((a) => ({ a, v: vec(a) }));

  let rotY = 0, rotX = -0.3, targetY = 0, targetX = -0.3, offset = 0, dragging = false, lastX = 0, velocity = 0;
  let active = null, t0 = performance.now();

  const rotate = ([x, y, z]) => {
    const cy = Math.cos(rotY + offset), sy = Math.sin(rotY + offset);
    const x1 = x * cy + z * sy, z1 = -x * sy + z * cy;
    const cx = Math.cos(rotX), sx = Math.sin(rotX);
    return [x1, y * cx - z1 * sx, y * sx + z1 * cx];
  };
  const slerp = (a, b, t) => {
    const d = Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2])));
    if (d < 1e-6) return a;
    const s = Math.sin(d), k1 = Math.sin((1 - t) * d) / s, k2 = Math.sin(t * d) / s;
    return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
  };
  const arcPt = (a, b, t, lift) => {
    const p = slerp(a, b, t), h = 1 + Math.sin(Math.PI * t) * lift;
    return [p[0] * h, p[1] * h, p[2] * h];
  };
  const proj = (p) => { const [x, y, z] = rotate(p); return { x: W / 2 + x * R, y: H / 2 - y * R, z, r2: x * x + y * y }; };
  const visible = (q) => q.z > 0 || q.r2 > 1;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    R = Math.min(W, H) * 0.36;
  }

  function drawArc(a, b, lift, style, width, from = 0, to = 1) {
    const steps = 60;
    ctx.beginPath();
    let pen = false;
    for (let i = 0; i <= steps; i++) {
      const t = from + (to - from) * (i / steps);
      const q = proj(arcPt(a, b, t, lift));
      if (visible(q)) { pen ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y); pen = true; } else pen = false;
    }
    ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
  }

  function frame(now) {
    if (!running) return;
    const time = (now - t0) / 1000;
    if (!dragging) {
      offset += velocity; velocity *= 0.95;
      if (active) {
        offset *= 0.985;
        rotY += (targetY + Math.sin(time * 0.25) * 0.2 - rotY) * 0.04;
        rotX += (targetX - rotX) * 0.04;
      } else rotY += 0.0025;
    }

    ctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2;

    // Atmosphere + body
    let g = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.25);
    g.addColorStop(0, 'rgba(79,139,255,0.35)'); g.addColorStop(1, 'rgba(79,139,255,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R * 1.25, 0, Math.PI * 2); ctx.fill();
    g = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
    g.addColorStop(0, '#1b2a6b'); g.addColorStop(0.7, '#0b1236'); g.addColorStop(1, '#060a22');
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

    // Dots
    for (const p of pts) {
      const q = proj(p);
      if (q.z < 0) continue;
      const a = 0.12 + q.z * 0.75;
      ctx.fillStyle = `rgba(150,170,255,${a})`;
      const s = 0.6 + q.z * 1.2;
      ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
    }

    // Rim light
    ctx.strokeStyle = 'rgba(120,160,255,0.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();

    // Background routes
    bgRoutes.forEach(([a, b]) => drawArc(a, b, 0.12, 'rgba(124,92,255,0.22)', 1));

    // Cities
    for (const { a, v } of cityVecs) {
      const q = proj(v);
      if (q.z < 0.05) continue;
      const isActive = active && (a === active.A || a === active.B);
      ctx.fillStyle = isActive ? '#22d3ee' : `rgba(255,255,255,${0.3 + q.z * 0.5})`;
      ctx.beginPath(); ctx.arc(q.x, q.y, isActive ? 3.5 : 1.8, 0, Math.PI * 2); ctx.fill();
      if (isActive) {
        const pulse = (time * 0.8) % 1;
        ctx.strokeStyle = `rgba(34,211,238,${1 - pulse})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(q.x, q.y, 4 + pulse * 18, 0, Math.PI * 2); ctx.stroke();
        ctx.font = '600 12px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = 'rgba(238,241,255,0.95)';
        ctx.fillText(a.code, q.x + 8, q.y - 8);
      }
    }

    // Active route
    if (active) {
      const { va, vb, lift } = active;
      const grad = ctx.createLinearGradient(0, 0, W, H);
      grad.addColorStop(0, '#7c5cff'); grad.addColorStop(1, '#22d3ee');
      ctx.shadowColor = '#4f8bff'; ctx.shadowBlur = 12;
      drawArc(va, vb, lift, 'rgba(124,92,255,0.35)', 2);
      const k = (time * 0.28) % 1;
      drawArc(va, vb, lift, grad, 2.6, Math.max(0, k - 0.3), k);
      ctx.shadowBlur = 0;
      const head = proj(arcPt(va, vb, k, lift));
      if (visible(head)) {
        const hg = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 14);
        hg.addColorStop(0, 'rgba(255,255,255,1)'); hg.addColorStop(0.3, 'rgba(34,211,238,0.8)'); hg.addColorStop(1, 'rgba(34,211,238,0)');
        ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(head.x, head.y, 14, 0, Math.PI * 2); ctx.fill();
      }
    }

    raf = requestAnimationFrame(frame);
  }

  // Drag to spin
  canvas.addEventListener('pointerdown', (e) => { dragging = true; lastX = e.clientX; velocity = 0; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const dx = (e.clientX - lastX) * 0.006;
    offset += dx; velocity = dx; lastX = e.clientX;
  });
  const end = () => { dragging = false; };
  canvas.addEventListener('pointerup', end);
  canvas.addEventListener('pointercancel', end);

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  return {
    setRoute(A, B) {
      const va = vec(A), vb = vec(B);
      const mid = slerp(va, vb, 0.5);
      const dist = Math.acos(Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2])));
      targetY = Math.atan2(-mid[0], mid[2]);
      // keep the rotation continuous (shortest path)
      while (targetY - rotY > Math.PI) targetY -= Math.PI * 2;
      while (targetY - rotY < -Math.PI) targetY += Math.PI * 2;
      const z1 = Math.hypot(mid[0], mid[2]);
      targetX = Math.max(-0.9, Math.min(0.9, Math.atan2(mid[1], z1) * 0.9));
      active = { A, B, va, vb, lift: 0.08 + dist * 0.16 };
    },
    start() { if (running) return; running = true; raf = requestAnimationFrame(frame); },
    stop() { running = false; cancelAnimationFrame(raf); },
  };
}

/* =====================================================================
   Starfield background
   ===================================================================== */
function starfield() {
  const c = $('#starfield'), ctx = c.getContext('2d');
  let w, h, stars = [], mx = 0, my = 0, tx = 0, ty = 0, shoot = null;
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = innerWidth; h = innerHeight;
    c.width = w * dpr; c.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((w * h) / 4200) }, () => ({ x: Math.random() * w, y: Math.random() * h, z: Math.random() * 0.9 + 0.1, t: Math.random() * 6.28 }));
  };
  resize();
  addEventListener('resize', resize);
  addEventListener('pointermove', (e) => { tx = (e.clientX / w - 0.5) * 2; ty = (e.clientY / h - 0.5) * 2; }, { passive: true });

  const draw = () => {
    ctx.clearRect(0, 0, w, h);
    mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
    for (const s of stars) {
      s.t += 0.015 * s.z;
      const a = (0.25 + 0.75 * Math.abs(Math.sin(s.t))) * s.z;
      ctx.fillStyle = `rgba(210,220,255,${a})`;
      const size = s.z * 1.6;
      ctx.fillRect(s.x - mx * s.z * 14, s.y - my * s.z * 14 - scrollY * s.z * 0.08 % h, size, size);
    }
    if (!shoot && Math.random() < 0.004) shoot = { x: Math.random() * w * 0.7, y: Math.random() * h * 0.4, l: 0 };
    if (shoot) {
      shoot.l += 0.025;
      const len = 140, x = shoot.x + shoot.l * 500, y = shoot.y + shoot.l * 220;
      const g = ctx.createLinearGradient(x - len, y - len * 0.44, x, y);
      g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, `rgba(255,255,255,${1 - shoot.l})`);
      ctx.strokeStyle = g; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x - len, y - len * 0.44); ctx.lineTo(x, y); ctx.stroke();
      if (shoot.l >= 1) shoot = null;
    }
    if (!reduceMotion) requestAnimationFrame(draw);
  };
  draw();
}

/* =====================================================================
   Micro-interactions
   ===================================================================== */
function bindTilt(root = document) {
  if (!finePointer || reduceMotion) return;
  $$('[data-tilt]', root).forEach((el) => {
    if (el._tilt) return;
    el._tilt = true;
    const max = +el.dataset.tilt || 8;
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rx', `${((0.5 - y) * max).toFixed(2)}deg`);
      el.style.setProperty('--ry', `${((x - 0.5) * max).toFixed(2)}deg`);
      el.style.setProperty('--gx', `${x * 100}%`);
      el.style.setProperty('--gy', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--rx', '0deg'); el.style.setProperty('--ry', '0deg'); });
  });
}

function bindCardTilt() {
  if (!finePointer || reduceMotion) return;
  card3d.addEventListener('pointermove', (e) => {
    const r = card3d.getBoundingClientRect();
    card3d.style.setProperty('--rx', `${((0.5 - (e.clientY - r.top) / r.height) * 16).toFixed(2)}deg`);
    card3d.style.setProperty('--ry', `${(((e.clientX - r.left) / r.width - 0.5) * 16).toFixed(2)}deg`);
  });
  card3d.addEventListener('pointerleave', () => { card3d.style.setProperty('--rx', '0deg'); card3d.style.setProperty('--ry', '0deg'); });
}

function bindMagnetic() {
  if (!finePointer || reduceMotion) return;
  $$('.magnetic').forEach((b) => {
    b.addEventListener('pointermove', (e) => {
      const r = b.getBoundingClientRect();
      b.style.setProperty('--mx', `${(e.clientX - r.left - r.width / 2) * 0.2}px`);
      b.style.setProperty('--my', `${(e.clientY - r.top - r.height / 2) * 0.3}px`);
    });
    b.addEventListener('pointerleave', () => { b.style.setProperty('--mx', '0px'); b.style.setProperty('--my', '0px'); });
  });
}

document.addEventListener('pointerdown', (e) => {
  const b = e.target.closest('.btn-primary, .btn-ghost');
  if (!b || b.disabled || reduceMotion) return;
  const r = b.getBoundingClientRect();
  const s = document.createElement('span');
  s.className = 'ripple';
  s.style.left = `${e.clientX - r.left}px`;
  s.style.top = `${e.clientY - r.top}px`;
  b.appendChild(s);
  setTimeout(() => s.remove(), 700);
});

function bindCursorGlow() {
  if (!finePointer || reduceMotion) return;
  const glow = $('.cursor-glow');
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y;
  addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; }, { passive: true });
  (function loop() {
    cx += (x - cx) * 0.12; cy += (y - cy) * 0.12;
    glow.style.setProperty('--x', `${cx}px`);
    glow.style.setProperty('--y', `${cy}px`);
    requestAnimationFrame(loop);
  })();
}

function bindReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      $$('[data-count]', en.target).forEach(animateCount);
      io.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  $$('[data-reveal]').forEach((el) => io.observe(el));
}
function animateCount(el) {
  const to = +el.dataset.count, t0 = performance.now(), d = 1600;
  const step = (t) => {
    const k = Math.min(1, (t - t0) / d), e = 1 - Math.pow(1 - k, 4);
    el.textContent = Math.round(to * e).toLocaleString('en-IN');
    if (k < 1) requestAnimationFrame(step);
  };
  reduceMotion ? (el.textContent = to.toLocaleString('en-IN')) : requestAnimationFrame(step);
}

function liveCounter() {
  const el = $('#airborne');
  let n = 12847;
  setInterval(() => { n += Math.round((Math.random() - 0.45) * 12); el.textContent = n.toLocaleString('en-IN'); }, 1800);
}

addEventListener('scroll', () => $('.topbar').classList.toggle('is-scrolled', scrollY > 10), { passive: true });

/* =====================================================================
   Init
   ===================================================================== */
let globe = null;
function init() {
  $('#year').textContent = new Date().getFullYear();
  $$('.field.airport').forEach(setupAirportField);
  globe = createGlobe($('#globe'));
  globe.start();
  updateAirports(false);
  updateDates();
  updatePax();
  updateStepper();
  renderUpiQr();
  starfield();
  bindTilt();
  bindCardTilt();
  bindMagnetic();
   bindCursorGlow();            
  bindReveal();
  liveCounter();
}
init();
                                      //  FINISH