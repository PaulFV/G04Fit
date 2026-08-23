/* ============================================================
   GoFit v1.0.0 — Hilfsfunktionen
   Klassisches Script (kein Modul), damit die App auch per
   Doppelklick über file:// läuft.
   ============================================================ */
var GoFit = window.GoFit || {};
window.GoFit = GoFit;
GoFit.VERSION = '1.0.0';

(function (G) {
  'use strict';

  /* ---------- DOM ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /** HTML-String -> Element */
  function el(html) {
    var t = document.createElement('template');
    t.innerHTML = String(html).trim();
    return t.content.firstElementChild;
  }

  /** Text für sicheres Einsetzen in HTML maskieren */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /** Delegierter Event-Handler */
  function on(root, evt, sel, fn) {
    root.addEventListener(evt, function (e) {
      var t = e.target.closest(sel);
      if (t && root.contains(t)) fn.call(t, e, t);
    });
  }

  /* ---------- Zahlen ---------- */
  function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }
  function round(v, step) { step = step || 1; return Math.round(v / step) * step; }
  function num(v, fallback) { var n = parseFloat(v); return isFinite(n) ? n : (fallback || 0); }

  /** Gewicht auf gängige Hantelscheiben-Schritte runden */
  function roundWeight(kg, step) {
    step = step || 2.5;
    return Math.max(0, Math.round(kg / step) * step);
  }

  function fmt(v, dec) {
    if (v == null || !isFinite(v)) return '–';
    dec = dec == null ? (Math.abs(v % 1) > 0.001 ? 1 : 0) : dec;
    return v.toFixed(dec).replace('.', ',');
  }

  function fmtKg(v) { return fmt(v) + ' kg'; }

  /** Wiederholungsbereich als Text: [8,12] -> "8–12", [12,12] -> "12" */
  function fmtReps(range, unit) {
    if (!range) return '–';
    var lo = Math.round(range[0]), hi = Math.round(range[1]);
    var body = lo >= hi ? String(hi) : lo + '–' + hi;
    return unit ? body + ' ' + unit : body;
  }

  /* ---------- Datum ---------- */
  var DAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
  var DAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
  var MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];

  /** ISO-Datum ohne Zeit: 2026-08-23 */
  function isoDay(d) {
    d = d ? new Date(d) : new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  function today() { return isoDay(new Date()); }

  function parseDay(iso) {
    var p = String(iso).split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }

  function daysBetween(a, b) {
    var d1 = parseDay(a), d2 = parseDay(b);
    return Math.round((d2 - d1) / 86400000);
  }

  function addDays(iso, n) {
    var d = parseDay(iso);
    d.setDate(d.getDate() + n);
    return isoDay(d);
  }

  function dayName(iso, long) {
    var d = parseDay(iso);
    return (long ? DAYS_LONG : DAYS)[d.getDay()];
  }

  function fmtDate(iso) {
    var d = parseDay(iso);
    return d.getDate() + '. ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
  }

  function fmtDateShort(iso) {
    var d = parseDay(iso);
    return d.getDate() + '. ' + MONTHS[d.getMonth()];
  }

  /** "heute" / "gestern" / "vor 4 Tagen" */
  function relDay(iso) {
    var n = daysBetween(iso, today());
    if (n === 0) return 'heute';
    if (n === 1) return 'gestern';
    if (n === 2) return 'vorgestern';
    if (n < 0) return 'in ' + (-n) + ' Tagen';
    if (n < 7) return 'vor ' + n + ' Tagen';
    if (n < 14) return 'vor 1 Woche';
    if (n < 60) return 'vor ' + Math.floor(n / 7) + ' Wochen';
    return 'vor ' + Math.floor(n / 30) + ' Monaten';
  }

  /** Montag der Woche, in der iso liegt */
  function weekStart(iso) {
    var d = parseDay(iso || today());
    var wd = (d.getDay() + 6) % 7; // Mo=0
    d.setDate(d.getDate() - wd);
    return isoDay(d);
  }

  function mmss(sec) {
    sec = Math.max(0, Math.round(sec));
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + String(s).padStart(2, '0');
  }

  /* ---------- Trainingsmathematik ---------- */

  /** Geschätztes 1RM nach Epley */
  function e1rm(weight, reps) {
    if (!weight || !reps) return 0;
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
  }

  /** Volumen einer Satzliste (kg × Wdh) */
  function volume(sets) {
    return (sets || []).reduce(function (s, x) {
      return s + (x.done ? num(x.weight) * num(x.reps) : 0);
    }, 0);
  }

  /* ---------- Diverses ---------- */
  function uid() {
    return 'x' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function debounce(fn, ms) {
    var t;
    return function () {
      var a = arguments, self = this;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(self, a); }, ms || 200);
    };
  }

  function pick(arr, seed) {
    if (!arr.length) return null;
    var i = seed == null ? Math.floor(Math.random() * arr.length) : Math.abs(seed) % arr.length;
    return arr[i];
  }

  function sum(arr, fn) {
    return arr.reduce(function (s, x, i) { return s + (fn ? fn(x, i) : x); }, 0);
  }

  function groupBy(arr, fn) {
    var out = {};
    arr.forEach(function (x) {
      var k = fn(x);
      (out[k] = out[k] || []).push(x);
    });
    return out;
  }

  /** Datei-Download anstoßen (Blob) */
  function download(filename, text, mime) {
    try {
      var blob = new Blob([text], { type: (mime || 'text/plain') + ';charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url; a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 400);
      return true;
    } catch (e) { return false; }
  }

  async function copy(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) { /* Fallback unten */ }
    try {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;top:0';
      document.body.appendChild(ta);
      ta.select();
      var ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  /* ---------- Icons ---------- */
  var ICONS = {
    dashboard: '<path d="M4 13h6V4H4v9zm0 7h6v-5H4v5zm10 0h6v-9h-6v9zm0-16v5h6V4h-6z"/>',
    journey: '<path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4zm0 0v13m6-10.5v13" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>',
    workout: '<path d="M4 9v6M7 7v10M17 7v10m3-8v6M7 12h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    exercises: '<path d="M4 6h16M4 12h16M4 18h10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="19" cy="18" r="2.2" fill="none" stroke="currentColor" stroke-width="2"/>',
    progress: '<path d="M4 19V5m0 14h16M8 15l3.5-4 3 2.5L20 8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    profile: '<circle cx="12" cy="8" r="3.6" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4.5 20a7.5 7.5 0 0115 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    coach: '<path d="M12 3l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4L7.5 16.8l.9-5L4.8 8.3l5-.7L12 3z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="19.5" r="1.2"/>',
    reminders: '<path d="M18 15v-4a6 6 0 10-12 0v4l-1.6 2.4h15.2L18 15z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M10 20.5a2.2 2.2 0 004 0" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>',
    obsidian: '<path d="M12 2.5l6.5 5.2-2.3 12.3-4.2 1.5-4.2-1.5L5.5 7.7 12 2.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 2.5v19" fill="none" stroke="currentColor" stroke-width="1.2" opacity=".6"/>',
    privacy: '<path d="M12 3l7 3v6c0 4.2-2.8 7.7-7 9-4.2-1.3-7-4.8-7-9V6l7-3z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    check: '<path d="M5 12.5l4.5 4.5L19 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>',
    plus: '<path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    play: '<path d="M8 5.5l11 6.5-11 6.5v-13z"/>',
    flame: '<path d="M12 2.7s1 3 3 4.8c2.3 2 3.5 3.9 3.5 6.4A6.5 6.5 0 016 14c0-1.9.7-3.2 1.8-4.4.3 1 .9 1.7 1.7 2 .1-2.6.9-6.4 2.5-8.9z" fill="currentColor"/>',
    medal: '<circle cx="12" cy="14.5" r="5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M9 9.8L7 3h10l-2 6.8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/>',
    info: '<circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 11v5.5M12 7.8v.4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    warn: '<path d="M12 4l9 16H3l9-16z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/><path d="M12 10v4M12 17v.4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    trash: '<path d="M4 7h16M9 7V5h6v2m-8 0l1 13h8l1-13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
    download: '<path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.4" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8.5 10.5V8a3.5 3.5 0 017 0v2.5" fill="none" stroke="currentColor" stroke-width="1.7"/>',
    clock: '<circle cx="12" cy="12" r="8.6" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M12 7v5.3l3.3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>',
    arrowUp: '<path d="M12 19V6m0 0l-5.5 5.5M12 6l5.5 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    chevron: '<path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
    dumbbell: '<path d="M6.5 8.5v7M4 10v3m13-4.5v7M20 10v3M8 12h8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
    target: '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="4.6" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="12" cy="12" r="1.3"/>',
    refresh: '<path d="M20 12a8 8 0 11-2.6-5.9M20 4v4h-4" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"/>',
    share: '<path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5M5 13v5.5a1.5 1.5 0 001.5 1.5h11a1.5 1.5 0 001.5-1.5V13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>'
  };

  function icon(name, size) {
    size = size || 20;
    return '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" fill="currentColor" aria-hidden="true">' +
      (ICONS[name] || '') + '</svg>';
  }

  /* ---------- Toast ---------- */
  function toast(title, msg, kind, ms) {
    var host = $('#toasts');
    if (!host) return;
    kind = kind || 'ok';
    var ic = kind === 'err' ? 'warn' : (kind === 'warn' ? 'warn' : 'check');
    var node = el(
      '<div class="toast toast--' + kind + '">' +
      '<span class="toast__ic">' + icon(ic, 18) + '</span>' +
      '<div><b>' + esc(title) + '</b>' + (msg ? '<span class="small muted">' + esc(msg) + '</span>' : '') + '</div>' +
      '</div>'
    );
    host.appendChild(node);
    setTimeout(function () {
      node.classList.add('is-out');
      setTimeout(function () { node.remove(); }, 320);
    }, ms || 3600);
  }

  /* ---------- Sheet ---------- */
  function openSheet(title, bodyHtml, onMount) {
    var sheet = $('#sheet'), scrim = $('#scrim');
    $('#sheetTitle').textContent = title;
    $('#sheetBody').innerHTML = bodyHtml;
    sheet.hidden = false; scrim.hidden = false;
    document.body.style.overflow = 'hidden';
    if (onMount) onMount($('#sheetBody'));
  }

  function closeSheet() {
    $('#sheet').hidden = true;
    $('#scrim').hidden = true;
    document.body.style.overflow = '';
  }

  /** Einfacher Bestätigungsdialog im Sheet */
  function confirmSheet(opts) {
    return new Promise(function (resolve) {
      var danger = opts.danger !== false;
      openSheet(opts.title, [
        '<div class="stack">',
        '<div class="note note--' + (danger ? 'danger' : 'neon') + '">' + icon(danger ? 'warn' : 'info', 18) +
        '<div>' + opts.body + '</div></div>',
        '<div class="btn-row" style="justify-content:flex-end">',
        '<button class="btn" data-act="no">' + esc(opts.cancel || 'Abbrechen') + '</button>',
        '<button class="btn ' + (danger ? 'btn--danger' : 'btn--primary') + '" data-act="yes">' + esc(opts.ok || 'Bestätigen') + '</button>',
        '</div></div>'
      ].join(''), function (body) {
        body.querySelector('[data-act="no"]').onclick = function () { closeSheet(); resolve(false); };
        body.querySelector('[data-act="yes"]').onclick = function () { closeSheet(); resolve(true); };
      });
    });
  }

  /* ---------- XP-Effekt ---------- */
  function xpPop(amount, x, y) {
    var n = el('<div class="xp-pop">+' + amount + ' XP</div>');
    n.style.left = (x || window.innerWidth / 2) + 'px';
    n.style.top = (y || window.innerHeight / 2) + 'px';
    document.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 1300);
  }

  function levelUpFx(level, title) {
    var n = el(
      '<div class="levelup"><div class="levelup__box">' +
      '<span>Level erreicht</span><b>' + level + '</b>' +
      '<span>' + esc(title || '') + '</span>' +
      '</div></div>'
    );
    document.body.appendChild(n);
    setTimeout(function () { n.remove(); }, 2500);
  }

  G.u = {
    $: $, $$: $$, el: el, esc: esc, on: on,
    clamp: clamp, round: round, num: num, roundWeight: roundWeight, fmt: fmt, fmtKg: fmtKg, fmtReps: fmtReps,
    DAYS: DAYS, DAYS_LONG: DAYS_LONG, MONTHS: MONTHS,
    isoDay: isoDay, today: today, parseDay: parseDay, daysBetween: daysBetween, addDays: addDays,
    dayName: dayName, fmtDate: fmtDate, fmtDateShort: fmtDateShort, relDay: relDay,
    weekStart: weekStart, mmss: mmss,
    e1rm: e1rm, volume: volume,
    uid: uid, debounce: debounce, pick: pick, sum: sum, groupBy: groupBy,
    download: download, copy: copy,
    icon: icon, ICONS: ICONS,
    toast: toast, openSheet: openSheet, closeSheet: closeSheet, confirmSheet: confirmSheet,
    xpPop: xpPop, levelUpFx: levelUpFx
  };
})(GoFit);
