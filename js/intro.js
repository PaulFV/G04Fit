/* ============================================================
   G04Fit — Start-Animation
   Beim Öffnen der App füllt die Anatomie-Figur aus den Übungen
   den ganzen Bildschirm: sie erscheint, die Kamera fährt an den
   Oberkörper heran und die Figur präsentiert ihre Muskeln —
   Schultern, Brust, Bizeps und Bauch spannen sich nacheinander
   an (schwellen leicht an und leuchten). Danach Begrüßung und
   Übergang ins Dashboard. Antippen überspringt. Einmal pro
   App-Start (nicht bei jedem Neuladen im selben Tab).
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;
  var KEY = 'g04fit.introShown';
  var IMG = 'assets/avatar/anatomy-front-v4.webp';

  /* Muskelkonturen passend zu anatomy-front-v4.webp (400 × 800),
     je Seite getrennt, damit jede Seite um ihre eigene Mitte anschwillt. */
  var ZONES = [
    { k: 'shoulders', o: ['124px 214px', '276px 214px'], p: [
      'M151 184C132 176 110 184 99 201 92 215 94 233 103 247 117 245 131 234 142 220 149 210 153 196 151 184Z',
      'M249 184C268 176 290 184 301 201 308 215 306 233 297 247 283 245 269 234 258 220 251 210 247 196 249 184Z'] },
    { k: 'chest', o: ['165px 222px', '235px 222px'], p: [
      'M197 187C177 181 146 185 128 201 121 216 126 238 141 254 159 260 179 254 197 243Z',
      'M203 187C223 181 254 185 272 201 279 216 274 238 259 254 241 260 221 254 203 243Z'] },
    { k: 'biceps', o: ['100px 296px', '300px 296px'], p: [
      'M104 246C89 256 81 278 81 303 82 325 89 339 101 341 112 328 118 304 117 280 116 263 111 251 104 246Z',
      'M296 246C311 256 319 278 319 303 318 325 311 339 299 341 288 328 282 304 283 280 284 263 289 251 296 246Z'] },
    { k: 'abs', o: ['182px 328px', '218px 328px'], p: [
      'M165 261C176 266 188 264 197 259L197 392C188 398 176 396 168 387 162 354 159 290 165 261Z',
      'M235 261C224 266 212 264 203 259L203 392C212 398 224 396 232 387 238 354 241 290 235 261Z'] }
  ];
  var LABEL = { shoulders: 'Schultern', chest: 'Brust', biceps: 'Bizeps', abs: 'Bauch' };

  function greeting() {
    var h = new Date().getHours();
    if (h < 5) return 'Noch wach';
    if (h < 11) return 'Guten Morgen';
    if (h < 14) return 'Mahlzeit';
    if (h < 18) return 'Guten Tag';
    if (h < 22) return 'Guten Abend';
    return 'Späte Runde';
  }

  function figure() {
    var defs = '', bulge = '';
    ZONES.forEach(function (z, zi) {
      z.p.forEach(function (d, si) {
        var id = 'introClip-' + z.k + si;
        defs += '<clipPath id="' + id + '"><path d="' + d + '"/></clipPath>';
        var st = 'transform-origin:' + z.o[si] + ';--i:' + zi;
        // Muskel aus dem Bild ausgeschnitten → schwillt beim Anspannen an
        // Muskel samt Leuchten schwillt gemeinsam an
        bulge += '<g class="intro__bulge" style="' + st + '"><image href="' + IMG + '" width="400" height="800" clip-path="url(#' + id + ')"/>' +
          '<path class="intro__zone" style="--i:' + zi + '" d="' + d + '"/></g>';
      });
    });
    return '<svg class="intro__fig" viewBox="0 40 400 520" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">' +
      '<defs>' + defs +
      '<mask id="introShineMask" maskUnits="userSpaceOnUse" x="0" y="0" width="400" height="800" style="mask-type:alpha"><image href="' + IMG + '" width="400" height="800"/></mask>' +
      '<linearGradient id="introShine" x1="0" y1="0" x2="1" y2="0">' +
      '<stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".5" stop-color="#fff" stop-opacity=".55"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>' +
      
      '</defs>' +
      '<g class="intro__cam"><g class="intro__body">' +
      '<image class="intro__img" href="' + IMG + '" width="400" height="800"/>' +
      bulge +
      '<g mask="url(#introShineMask)"><rect class="intro__shine" x="-160" y="150" width="120" height="280" fill="url(#introShine)"/></g>' +
      '</g></g></svg>';
  }

  function play(force) {
    // Standard: an. Abschaltbar unter Einstellungen → Profil → App-Einstellungen.
    if (!force && G.store.state.settings.intro === false) return;
    try { if (!force && sessionStorage.getItem(KEY)) return; sessionStorage.setItem(KEY, '1'); } catch (e) {}
    var s = G.store.state;
    var li = G.store.levelInfo();
    var reduce = !!s.settings.reduceMotion ||
      (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    var streak = s.journey.streak || 0;
    var name = s.profile.name ? ', ' + s.profile.name : '';

    var tags = ZONES.map(function (z, i) {
      return '<span class="intro__tag" style="--i:' + i + '">' + LABEL[z.k] + '</span>';
    }).join('');

    var el = u.el(
      '<div class="intro intro--anatomy' + (reduce ? ' intro--calm' : '') + '" id="intro" role="presentation" aria-hidden="true">' +
      '<div class="intro__glow"></div>' +
      figure() +
      '<div class="intro__flash"></div>' +
      '<div class="intro__tags">' + tags + '</div>' +
      '<div class="intro__veil"></div>' +
      '<div class="intro__text">' +
      '<div class="intro__logo">G04<b>Fit</b></div>' +
      '<div class="intro__greet">' + u.esc(greeting() + name) + '</div>' +
      '<div class="intro__meta"><span>Level ' + li.level + ' · ' + u.esc(li.title) + '</span>' +
      (streak ? '<span class="intro__streak">🔥 ' + streak + (streak === 1 ? ' Woche' : ' Wochen') + ' Serie</span>' : '') +
      '</div></div>' +
      '<div class="intro__skip">Tippen zum Überspringen</div>' +
      '</div>'
    );
    document.body.appendChild(el);
    if (G.i18n) G.i18n.apply(el);

    var done = false;
    function close() {
      if (done) return;
      done = true;
      el.classList.add('is-out');
      setTimeout(function () { if (el.parentNode) el.parentNode.removeChild(el); }, 560);
    }
    el.addEventListener('click', close);
    setTimeout(close, reduce ? 1000 : 3600);
  }

  G.intro = { play: play };
})(G04Fit);
