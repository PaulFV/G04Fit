/* ============================================================
   GoFit — Übungsdarstellung & Muskelkarte

   Konzept Abschnitt 5: Jede Übung zeigt die Bewegungsausführung,
   die beanspruchten Muskelgruppen und Technikhinweise.

   Die Figuren sind anatomische Silhouetten, vollständig als SVG
   berechnet: scharf in jeder Auflösung, offline verfügbar, ohne
   fremde Bilddateien und ohne Lizenzfragen.

   Aufbau:
     Körperteile entstehen als konische Kapseln zwischen den
     Gelenkpunkten — an der Schulter dick, am Handgelenk schmal.
     Die Gelenke liegen in verschachtelten Gruppen
     (Schulter > Ellenbogen > Hand), die von den Keyframes in
     css/anim.css gedreht werden.
     Der arbeitende Muskel wird auf dem Körper farbig hervorgehoben.
   ============================================================ */
(function (G) {
  'use strict';

  var GROUND = 186;

  function n(v) { return Math.round(v * 10) / 10; }

  /* ============================================================
     GRUNDFORMEN
     ============================================================ */

  function circlePath(x, y, r) {
    return 'M' + n(x - r) + ' ' + n(y) +
      'a' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(r * 2) + ' 0' +
      'a' + n(r) + ' ' + n(r) + ' 0 1 0 ' + n(-r * 2) + ' 0Z';
  }

  /**
   * Konische Kapsel zwischen zwei Kreisen — die Grundform jedes
   * Körperteils. Die beiden Radien geben dem Glied seine Verjüngung.
   */
  function seg(x1, y1, r1, x2, y2, r2) {
    var dx = x2 - x1, dy = y2 - y1;
    var d = Math.sqrt(dx * dx + dy * dy);
    if (d < 0.01) return circlePath(x1, y1, Math.max(r1, r2));
    if (d <= Math.abs(r1 - r2)) {
      return r1 > r2 ? circlePath(x1, y1, r1) : circlePath(x2, y2, r2);
    }

    var a = Math.atan2(dy, dx);
    var b = Math.acos((r1 - r2) / d);
    var t1 = a + b, t2 = a - b;
    var big2 = b > Math.PI / 2 ? 1 : 0;
    var big1 = 1 - big2;

    function p(x, y, r, t) {
      return n(x + r * Math.cos(t)) + ' ' + n(y + r * Math.sin(t));
    }

    return 'M' + p(x1, y1, r1, t1) +
      'L' + p(x2, y2, r2, t1) +
      'A' + n(r2) + ' ' + n(r2) + ' 0 ' + big2 + ' 0 ' + p(x2, y2, r2, t2) +
      'L' + p(x1, y1, r1, t2) +
      'A' + n(r1) + ' ' + n(r1) + ' 0 ' + big1 + ' 0 ' + p(x1, y1, r1, t1) + 'Z';
  }

  function part(d, cls) {
    return '<path class="' + (cls || 'body') + '" d="' + d + '"/>';
  }

  /* ---------- Zwischenpunkte für Hervorhebungen ---------- */
  function lerp(x1, y1, x2, y2, t) {
    return [x1 + (x2 - x1) * t, y1 + (y2 - y1) * t];
  }
  function shift(pt, x1, y1, x2, y2, off) {
    var a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    return [pt[0] + Math.cos(a) * off, pt[1] + Math.sin(a) * off];
  }

  /** Farbige Hervorhebung eines Körperteils */
  function glow(muscle, d) {
    if (!muscle || !MCOLOR[muscle]) return '';
    return '<path class="hl" style="--hl:' + MCOLOR[muscle] + '" d="' + d + '"/>';
  }

  /**
   * Hervorhebung entlang eines Gliedes.
   * @param off  seitlicher Versatz: positiv = eine Seite, negativ = die andere
   */
  function glowAlong(muscle, x1, y1, x2, y2, t0, t1, r, off) {
    var a = shift(lerp(x1, y1, x2, y2, t0), x1, y1, x2, y2, off || 0);
    var b = shift(lerp(x1, y1, x2, y2, t1), x1, y1, x2, y2, off || 0);
    return glow(muscle, seg(a[0], a[1], r, b[0], b[1], r * 0.82));
  }

  /* ============================================================
     KÖRPERTEILE
     ============================================================ */

  function torso(sx, sy, hx, hy, muscle, face) {
    var m = lerp(sx, sy, hx, hy, 0.52);
    var out =
      part(seg(sx, sy, 16.5, m[0], m[1], 14.5)) +
      part(seg(m[0], m[1], 14.5, hx, hy, 12.5));

    // Arbeitender Rumpfmuskel
    if (muscle === 'chest') {
      out += glowAlong('chest', sx, sy, hx, hy, 0.08, 0.42, 9, face * 5.5);
    } else if (muscle === 'back') {
      out += glowAlong('back', sx, sy, hx, hy, 0.06, 0.5, 9, -face * 5.5);
    } else if (muscle === 'abs') {
      out += glowAlong('abs', sx, sy, hx, hy, 0.5, 0.94, 8, face * 4);
    } else if (muscle === 'traps') {
      out += glowAlong('traps', sx, sy, hx, hy, -0.02, 0.2, 9, -face * 4);
    } else if (muscle === 'glutes') {
      out += glowAlong('glutes', sx, sy, hx, hy, 0.86, 1.06, 9, -face * 4.5);
    }
    return out;
  }

  function neckHead(sx, sy, hx, hy, r) {
    return part(seg(sx, sy, 7.5, hx, hy + r * 0.55, 8)) +
      part(circlePath(hx, hy, r || 12));
  }

  function arm(sx, sy, ex, ey, wx, wy, muscle, face, inner) {
    var out = '';
    if (muscle === 'shoulders') out += glow('shoulders', circlePath(sx, sy, 11));

    var upper = part(seg(sx, sy, 10, ex, ey, 6.8));
    if (muscle === 'biceps') upper += glowAlong('biceps', sx, sy, ex, ey, 0.3, 0.92, 5.6, face * 3.2);
    if (muscle === 'triceps') upper += glowAlong('triceps', sx, sy, ex, ey, 0.22, 0.9, 5.6, -face * 3.2);

    var fore = part(seg(ex, ey, 6.8, wx, wy, 4.8)) + part(circlePath(wx, wy, 4.6));

    return out + joint('j-armU', sx, sy,
      upper + joint('j-armF', ex, ey, fore + (inner ? joint('j-bar', wx, wy, inner) : ''))
    );
  }

  /** Beide Arme gespiegelt (Fliegende, Seitheben) */
  function armsPair(sx, sy, lx, ly, rx, ry, muscle, load) {
    function one(cls, ex, ey) {
      var s = part(seg(sx, sy, 10, ex, ey, 5.4)) + part(circlePath(ex, ey, 5));
      if (muscle === 'biceps' || muscle === 'triceps' || muscle === 'shoulders') {
        s += glowAlong(muscle, sx, sy, ex, ey, 0.15, 0.75, 5.4, 0);
      }
      return joint(cls, sx, sy, s + (load ? load(ex, ey) : ''));
    }
    return (muscle === 'shoulders' ? glow('shoulders', circlePath(sx, sy, 11)) : '') +
      one('j-armL', lx, ly) + one('j-armR', rx, ry);
  }

  function leg(hx, hy, kx, ky, ax, ay, face, wrapJoints, cls, muscle) {
    var upper = part(seg(hx, hy, 12.5, kx, ky, 8), cls);
    if (muscle === 'legs') upper += glowAlong('legs', hx, hy, kx, ky, 0.16, 0.9, 8, 0);

    var lower = part(seg(kx, ky, 8, ax, ay, 5), cls) +
      part(seg(ax, ay, 5, ax + face * 11, ay + 4.5, 3.6), cls);
    if (muscle === 'calves') lower += glowAlong('calves', kx, ky, ax, ay, 0.1, 0.75, 5.6, -face * 2.5);

    if (!wrapJoints) return upper + lower;
    return joint('j-legU', hx, hy, upper + joint('j-legL', kx, ky, lower));
  }

  /**
   * Beinpaar mit Tiefenwirkung: das hintere Bein wird versetzt und
   * dunkler gezeichnet, damit die Figur räumlich wirkt.
   */
  function legs(hx, hy, kx, ky, ax, ay, face, muscle) {
    return leg(hx - face * 7, hy + 2, kx - face * 9, ky, ax - face * 9, ay, face, false, 'body body--far') +
      leg(hx, hy, kx, ky, ax, ay, face, false, null, muscle);
  }

  /** Zweiter Arm im Hintergrund, nur zur Tiefenwirkung */
  function armFar(sx, sy, ex, ey, wx, wy) {
    return part(seg(sx - 4, sy + 3, 8.6, ex - 6, ey, 5.8), 'body body--far') +
      part(seg(ex - 6, ey, 5.8, wx - 6, wy, 4.2), 'body body--far');
  }

  /* ============================================================
     GERÄTE
     ============================================================ */

  function floor(y) {
    return '<rect class="floor" x="6" y="' + (y || GROUND) + '" width="228" height="3.5" rx="1.8"/>';
  }

  /** Gewichtsscheibe von der Seite: Kreis mit Nabe */
  function plate(x, y, r) {
    return '<circle class="plate" cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r) + '"/>' +
      '<circle class="plate-hub" cx="' + n(x) + '" cy="' + n(y) + '" r="' + n(r * 0.3) + '"/>';
  }

  /** Langhantel in Seitenansicht: Scheibe mit durchgestecktem Holm */
  function barbell(x, y, r) {
    r = r || 15;
    return '<rect class="bar" x="' + n(x - r - 7) + '" y="' + n(y - 2) + '" width="' +
      n(r * 2 + 14) + '" height="4" rx="2"/>' +
      plate(x, y, r) + plate(x, y, r * 0.68);
  }

  function dumbbell(x, y, r) {
    r = r || 9.5;
    return '<rect class="bar" x="' + n(x - r - 4) + '" y="' + n(y - 1.8) + '" width="' +
      n(r * 2 + 8) + '" height="3.6" rx="1.8"/>' +
      plate(x, y, r);
  }

  /** Flachbank mit Polster und Rahmen */
  function bench(x1, x2, y) {
    return '<path class="steel" d="M' + (x1 + 16) + ' ' + (y + 12) + 'L' + (x1 + 7) + ' ' + GROUND +
      'M' + (x2 - 16) + ' ' + (y + 12) + 'L' + (x2 - 7) + ' ' + GROUND + '"/>' +
      '<rect class="pad" x="' + x1 + '" y="' + y + '" width="' + (x2 - x1) + '" height="13" rx="6.5"/>';
  }

  /** Schrägbank: waagerechte Sitzfläche plus geneigte Lehne */
  function benchIncline(hx, hy, angle) {
    return '<path class="steel" d="M' + (hx + 10) + ' ' + (hy + 12) + 'L' + (hx + 16) + ' ' + GROUND + '"/>' +
      '<rect class="pad" x="' + (hx - 6) + '" y="' + hy + '" width="34" height="13" rx="6.5"/>' +
      '<g transform="rotate(' + angle + ' ' + hx + ' ' + hy + ')">' +
      '<rect class="pad" x="' + (hx - 74) + '" y="' + hy + '" width="76" height="13" rx="6.5"/>' +
      '<path class="steel" d="M' + (hx - 62) + ' ' + (hy + 12) + 'L' + (hx - 66) + ' ' + (hy + 44) + '"/>' +
      '</g>';
  }

  /** Ablageständer hinter der Bank */
  function rack(x, topY) {
    return '<path class="steel" d="M' + x + ' ' + GROUND + 'L' + x + ' ' + topY +
      'M' + (x - 9) + ' ' + GROUND + 'L' + (x + 9) + ' ' + GROUND +
      'M' + x + ' ' + topY + 'l10 -7' + '"/>';
  }

  /** Klimmzugstange mit Aufhängung */
  function pullBar(y) {
    return '<path class="steel" d="M40 ' + y + 'H200M62 ' + y + 'V' + (y - 12) + 'M178 ' + y + 'V' + (y - 12) + '"/>' +
      '<circle class="steel-dot" cx="110" cy="' + y + '" r="3"/>';
  }

  /** Kabelturm mit Umlenkrolle */
  function cableTower(x, pulleyY, handX, handY) {
    return '<rect class="frame" x="' + (x - 9) + '" y="' + (pulleyY - 14) + '" width="18" height="' +
      (GROUND - pulleyY + 14) + '" rx="4"/>' +
      '<circle class="pulley" cx="' + x + '" cy="' + pulleyY + '" r="7"/>' +
      '<path class="cable" d="M' + x + ' ' + pulleyY + 'L' + handX + ' ' + handY + '"/>';
  }

  /** Rahmen einer Trainingsmaschine */
  function machine(x, topY) {
    return '<rect class="frame" x="' + (x - 10) + '" y="' + topY + '" width="20" height="' +
      (GROUND - topY) + '" rx="5"/>' +
      '<path class="steel" d="M' + (x - 22) + ' ' + GROUND + 'H' + (x + 22) + '"/>';
  }

  /* ---------- Gelenkgruppe mit korrektem Drehpunkt ---------- */
  function joint(cls, x, y, inner) {
    return '<g data-joint class="' + cls + '" style="transform-box:view-box;transform-origin:' +
      n(x) + 'px ' + n(y) + 'px">' + inner + '</g>';
  }

  function wrap(inner, pattern) {
    return '<svg class="fig p-' + pattern + '" viewBox="0 0 240 200" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">' + inner + '</svg>';
  }

  /* ============================================================
     POSEN
     Jede Pose legt die Gelenkpunkte fest und stellt das passende
     Gerät dazu. Die Bewegung selbst kommt aus css/anim.css.
     ============================================================ */

  /* --- Liegend auf der Flachbank: Bankdrücken, Überzug --- */
  function poseBench(pattern, m) {
    var s = [];
    var SH = [104, 112], HIP = [152, 116], EL = [104, 86], WR = [104, 60];

    s.push(floor());
    s.push(rack(56, 74));
    s.push(bench(72, 186, 124));

    // Beine seitlich neben der Bank
    s.push(leg(HIP[0], HIP[1], 172, 146, 170, GROUND - 4, 1));

    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, -1) +
      neckHead(SH[0], SH[1], 80, 110, 12)
    ));

    s.push(arm(SH[0], SH[1], EL[0], EL[1], WR[0], WR[1], m, -1, barbell(WR[0], WR[1], 15)));
    return wrap(s.join(''), pattern);
  }

  /* --- Schrägbank: Schrägbankdrücken --- */
  function poseIncline(pattern, m) {
    var s = [];
    var SH = [112, 104], HIP = [150, 128], EL = [110, 80], WR = [108, 56];

    s.push(floor());
    s.push(benchIncline(150, 122, -34));
    s.push(leg(HIP[0], HIP[1], 176, 152, 176, GROUND - 4, 1));

    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, -1) +
      neckHead(SH[0], SH[1], 96, 84, 12)
    ));

    s.push(arm(SH[0], SH[1], EL[0], EL[1], WR[0], WR[1], m, -1, dumbbell(WR[0], WR[1], 10)));
    return wrap(s.join(''), pattern);
  }

  /* --- Stehend, ein Armpaar in der Mitte: Curl, Trizepsdrücken --- */
  function poseStand(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var SH = [106, 60], HIP = [106, 108], EL = [108, 88], WR = [110, 116];

    s.push(floor());
    if (opts.cable) s.push(cableTower(212, opts.cableY || 46, WR[0], WR[1]));
    if (opts.preacher) {
      s.push('<rect class="pad" x="118" y="86" width="46" height="12" rx="6" transform="rotate(18 118 86)"/>' +
        '<path class="steel" d="M132 104L134 ' + GROUND + '"/>');
    }

    s.push(legs(HIP[0], HIP[1], 104, 146, 106, GROUND - 4, 1));
    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 110, 36, 12.5)
    ));
    s.push(arm(SH[0], SH[1], EL[0], EL[1], WR[0], WR[1], m, 1,
      opts.bar ? barbell(WR[0], WR[1], 14) : dumbbell(WR[0], WR[1], 10)));

    return wrap(s.join(''), pattern);
  }

  /* --- Stehend, beide Arme seitlich: Fliegende, Seitheben --- */
  function poseWings(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var SH = [112, 60], HIP = [112, 108];

    s.push(floor());
    if (opts.machine) { s.push(machine(28, 44)); s.push(machine(196, 44)); }
    if (opts.cable) {
      s.push(cableTower(26, 40, 74, 98));
      s.push(cableTower(198, 40, 150, 98));
    }

    s.push(legs(HIP[0], HIP[1], 110, 146, 112, GROUND - 4, 1));
    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 112, 34, 12.5)
    ));
    s.push(armsPair(SH[0], SH[1], 74, 98, 150, 98, m, function (x, y) {
      return dumbbell(x, y + 6, 9);
    }));

    return wrap(s.join(''), pattern);
  }

  /* --- Überkopfdrücken --- */
  function poseOverhead(pattern, m) {
    var s = [];
    var SH = [108, 64], HIP = [108, 112], EL = [86, 74], WR = [86, 46];

    s.push(floor());
    s.push(legs(HIP[0], HIP[1], 106, 150, 108, GROUND - 4, 1));
    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 112, 40, 12.5)
    ));
    s.push(arm(SH[0], SH[1], EL[0], EL[1], WR[0], WR[1], m, 1, barbell(WR[0], WR[1], 15)));
    return wrap(s.join(''), pattern);
  }

  /* --- Vorgebeugt: Rudern --- */
  function poseBent(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var HIP = [148, 106], SH = [92, 82], EL = [92, 110], WR = [94, 138];

    s.push(floor());
    if (opts.cable) s.push(cableTower(220, 96, WR[0], WR[1]));
    if (opts.bench) s.push(bench(120, 200, 130));

    s.push(leg(HIP[0], HIP[1], 152, 146, 150, GROUND - 4, 1));
    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, -1) +
      neckHead(SH[0], SH[1], 70, 74, 12)
    ));
    s.push(arm(SH[0], SH[1], EL[0], EL[1], WR[0], WR[1], m, -1,
      opts.db ? dumbbell(WR[0], WR[1], 10) : barbell(WR[0], WR[1], 14)));

    return wrap(s.join(''), pattern);
  }

  /* --- Hängend: Klimmzug, Latzug, Beinheben --- */
  function poseHang(pattern, m) {
    var s = [];
    var WR = [110, 34], EL = [107, 56], SH = [106, 80], HIP = [106, 126];

    s.push(pullBar(26));
    s.push(joint('j-bar', 110, 30, '<rect class="bar" x="82" y="28" width="56" height="4" rx="2"/>'));

    s.push(joint('j-torso', SH[0], SH[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 112, 64, 12) +
      leg(HIP[0], HIP[1], 108, 160, 108, 190, 1, true)
    ));

    s.push(arm(SH[0], SH[1], EL[0], EL[1], WR[0], WR[1], m, 1, ''));
    return wrap(s.join(''), pattern);
  }

  /* --- Rückenlage am Boden: Crunch, Beinheben liegend --- */
  function poseFloor(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var G2 = 168;
    var HIP = [142, 156], SH = [92, 156], EL = [96, 136], WR = [112, 140];

    s.push(floor(G2));
    if (opts.cable) s.push(cableTower(214, 40, WR[0], WR[1]));

    s.push(joint('j-legU', HIP[0], HIP[1],
      part(seg(HIP[0], HIP[1], 12.5, 172, 130, 8)) +
      joint('j-legL', 172, 130, part(seg(172, 130, 8, 192, 156, 5)))
    ));

    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, -1) +
      neckHead(SH[0], SH[1], 74, 150, 12) +
      joint('j-armU', SH[0], SH[1],
        part(seg(SH[0], SH[1], 9, EL[0], EL[1], 6.4)) +
        joint('j-armF', EL[0], EL[1], part(seg(EL[0], EL[1], 6.4, WR[0], WR[1], 4.6)))
      )
    ));

    return wrap(s.join(''), pattern);
  }

  /* --- Stützposition: Liegestütz, Plank, Dip --- */
  function posePush(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var SH = [86, 118], HIP = [142, 132], EL = [86, 146], WR = [86, 172];

    s.push(floor());
    if (opts.bars) {
      s.push('<path class="steel" d="M64 96H128M70 96V' + GROUND + 'M122 96V' + GROUND + '"/>');
    }

    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, -1) +
      neckHead(SH[0], SH[1], 68, 112, 11.5) +
      part(seg(HIP[0], HIP[1], 12, 172, 152, 8)) +
      part(seg(172, 152, 8, 196, 174, 5)) +
      joint('j-armU', SH[0], SH[1],
        part(seg(SH[0], SH[1], 9.5, EL[0], EL[1], 6.6)) +
        joint('j-armF', EL[0], EL[1],
          part(seg(EL[0], EL[1], 6.6, WR[0], WR[1], 4.8)) +
          part(circlePath(WR[0], WR[1], 4.6))
        )
      )
    ));

    return wrap(s.join(''), pattern);
  }

  /* --- Nackenheben --- */
  function poseShrug(pattern, m) {
    var s = [];
    var SH = [108, 60], HIP = [108, 108];

    s.push(floor());
    s.push(legs(HIP[0], HIP[1], 106, 146, 108, GROUND - 4, 1));
    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 110, 34, 12.5) +
      (m === 'shoulders' || m === 'back'
        ? glow(m, seg(96, 52, 9, 122, 52, 9)) : '')
    ));
    s.push(joint('j-bar', 108, 118,
      part(seg(SH[0], SH[1], 9, 84, 112, 5.2)) +
      part(seg(SH[0], SH[1], 9, 132, 112, 5.2)) +
      dumbbell(82, 118, 9.5) + dumbbell(134, 118, 9.5)
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Kniebeuge: Langhantel auf den Schultern oder Maschine --- */
  function poseSquat(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var HIP = [110, 106], KN = [118, 146], AN = [110, GROUND - 4], SH = [110, 60];

    s.push(floor());
    if (opts.machine) {
      s.push('<path class="frame" d="M186 36L118 ' + GROUND + 'h22L206 44Z"/>');
      s.push('<rect class="pad" x="88" y="46" width="44" height="12" rx="6"/>');
    }

    s.push(joint('j-squat', HIP[0], HIP[1],
      /* hinteres Bein für Tiefenwirkung */
      leg(HIP[0] - 7, HIP[1] + 2, KN[0] - 9, KN[1], AN[0] - 9, AN[1], 1, false, 'body body--far') +
      leg(HIP[0], HIP[1], KN[0], KN[1], AN[0], AN[1], 1, true, null, m) +
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 114, 36, 12.5) +
      part(seg(SH[0] - 14, SH[1] - 4, 6.5, SH[0] + 14, SH[1] - 4, 6.5)) +
      (opts.machine ? '' :
        '<rect class="bar" x="58" y="' + (SH[1] - 10) + '" width="104" height="4.5" rx="2.2"/>' +
        plate(60, SH[1] - 8, 15) + plate(160, SH[1] - 8, 15))
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Hüftbeuge: Kreuzheben, rumänisches Kreuzheben --- */
  function poseHinge(pattern, m) {
    var s = [];
    var HIP = [116, 104], KN = [116, 146], AN = [110, GROUND - 4], SH = [116, 58];

    s.push(floor());
    s.push(leg(HIP[0] - 7, HIP[1] + 2, KN[0] - 9, KN[1], AN[0] - 9, AN[1], 1, false, 'body body--far'));
    s.push(leg(HIP[0], HIP[1], KN[0], KN[1], AN[0], AN[1], 1, false, null, m));

    s.push(joint('j-torso', HIP[0], HIP[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, -1) +
      neckHead(SH[0], SH[1], 116, 34, 12.5) +
      part(seg(SH[0], SH[1] + 4, 8.5, SH[0] - 4, SH[1] + 52, 5.4)) +
      barbell(SH[0] - 4, SH[1] + 58, 15)
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Sitzende Beinmaschine: Beinstrecker, Beinbeuger, Abduktion --- */
  function poseLegMachine(pattern, m) {
    var s = [];
    var HIP = [96, 128], KN = [140, 128], AN = [140, 168], SH = [88, 84];

    s.push(floor());
    s.push(machine(50, 60));
    s.push('<rect class="pad" x="86" y="132" width="62" height="12" rx="6"/>');
    s.push('<g transform="rotate(-12 84 128)"><rect class="pad" x="66" y="80" width="13" height="52" rx="6.5"/></g>');

    s.push(torso(SH[0], SH[1], HIP[0], HIP[1], m, 1));
    s.push(neckHead(SH[0], SH[1], 92, 60, 12));
    s.push(part(seg(SH[0] + 2, SH[1] + 6, 8, 108, 118, 5.2)));

    s.push(joint('j-legU', HIP[0], HIP[1],
      part(seg(HIP[0], HIP[1], 12.5, KN[0], KN[1], 8)) +
      (m === 'legs' ? glowAlong('legs', HIP[0], HIP[1], KN[0], KN[1], 0.16, 0.9, 8, 0) : '') +
      joint('j-legL', KN[0], KN[1],
        part(seg(KN[0], KN[1], 8, AN[0], AN[1], 5)) +
        part(seg(AN[0], AN[1], 5, AN[0] + 11, AN[1] + 4.5, 3.6)) +
        (m === 'calves' ? glowAlong('calves', KN[0], KN[1], AN[0], AN[1], 0.1, 0.75, 5.6, -2.5) : '') +
        '<rect class="pad" x="' + (AN[0] - 9) + '" y="' + (AN[1] - 16) + '" width="18" height="11" rx="5.5"/>'
      )
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Wadenheben: der ganze Körper hebt sich über die Fußballen --- */
  function poseCalf(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var HIP = [110, 108], KN = [110, 148], AN = [110, GROUND - 10], SH = [110, 60];

    s.push(floor());
    if (opts.block) {
      s.push('<rect class="pad" x="88" y="' + (GROUND - 8) + '" width="46" height="8" rx="3"/>');
    }
    if (opts.machine) {
      s.push(machine(178, 44));
      s.push('<rect class="pad" x="88" y="' + (SH[1] - 12) + '" width="80" height="12" rx="6"/>');
    }

    s.push(joint('j-calf', AN[0], AN[1],
      legs(HIP[0], HIP[1], KN[0], KN[1], AN[0], AN[1], 1, m === 'calves' ? 'calves' : m) +
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 112, 36, 12.5) +
      part(seg(SH[0] - 9, SH[1] + 4, 8, 96, 112, 5.2)) +
      part(seg(SH[0] + 9, SH[1] + 4, 8, 126, 112, 5.2))
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Ausfallschritt und Step-up: gespreizter Stand, beide Knie beugen --- */
  function poseLunge(pattern, m, opts) {
    opts = opts || {};
    var s = [];
    var HIP = [104, 106], SH = [104, 60];

    s.push(floor());
    if (opts.step) s.push('<rect class="pad" x="140" y="' + (GROUND - 26) + '" width="60" height="26" rx="6"/>');

    /* hinteres Bein */
    s.push(leg(HIP[0] - 4, HIP[1] + 2, 74, 150, 60, GROUND - 4, -1, false, 'body body--far'));

    s.push(joint('j-lunge', HIP[0], HIP[1],
      /* vorderes Bein */
      leg(HIP[0], HIP[1], 146, 144, 148, GROUND - (opts.step ? 30 : 4), 1, true, null, m) +
      torso(SH[0], SH[1], HIP[0], HIP[1], m, 1) +
      neckHead(SH[0], SH[1], 106, 36, 12.5) +
      part(seg(SH[0] - 9, SH[1] + 4, 8, 88, 112, 5.2)) +
      part(seg(SH[0] + 9, SH[1] + 4, 8, 120, 112, 5.2)) +
      dumbbell(86, 120, 9.5) + dumbbell(122, 120, 9.5)
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Hip Thrust und Glute Bridge: Hüfte drückt nach oben --- */
  function poseHipThrust(pattern, m) {
    var s = [];
    var SH = [76, 130], HIP = [132, 142], KN = [166, 158], AN = [172, GROUND - 4];

    s.push(floor());
    s.push(bench(48, 106, 136));
    s.push(leg(KN[0] - 6, KN[1], KN[0], KN[1], AN[0], AN[1], 1, false, 'body body--far'));

    s.push(joint('j-hip', SH[0], SH[1],
      torso(SH[0], SH[1], HIP[0], HIP[1], m, -1) +
      neckHead(SH[0], SH[1], 58, 124, 11.5) +
      part(seg(SH[0] + 4, SH[1] + 4, 8, 96, 158, 5.2)) +
      part(seg(HIP[0], HIP[1], 12.5, KN[0], KN[1], 8)) +
      '<rect class="bar" x="' + (HIP[0] - 26) + '" y="' + (HIP[1] - 20) + '" width="52" height="4.5" rx="2.2"/>' +
      plate(HIP[0] - 24, HIP[1] - 18, 13) + plate(HIP[0] + 24, HIP[1] - 18, 13)
    ));
    s.push(part(seg(KN[0], KN[1], 8, AN[0], AN[1], 5)));
    return wrap(s.join(''), pattern);
  }

  /* --- Kickback am Kabel: das Standbein bleibt, das Arbeitsbein schwingt --- */
  function poseKick(pattern, m) {
    var s = [];
    var HIP = [104, 106], KN = [104, 148], AN = [104, GROUND - 4], SH = [100, 60];

    s.push(floor());
    s.push(cableTower(30, GROUND - 24, 148, GROUND - 12));
    s.push(leg(HIP[0], HIP[1], KN[0], KN[1], AN[0], AN[1], 1, false, 'body body--far'));

    s.push(joint('j-legU', HIP[0], HIP[1],
      part(seg(HIP[0], HIP[1], 12.5, 138, 152, 8)) +
      (m === 'glutes' ? glowAlong('glutes', HIP[0], HIP[1], 138, 152, 0, 0.34, 9, -5) : '') +
      part(seg(138, 152, 8, 152, GROUND - 12, 5))
    ));

    s.push(torso(SH[0], SH[1], HIP[0], HIP[1], m, 1));
    s.push(neckHead(SH[0], SH[1], 100, 36, 12.5));
    s.push(part(seg(SH[0] - 8, SH[1] + 6, 8, 74, 104, 5.2)));
    return wrap(s.join(''), pattern);
  }

  /* ============================================================
     ZUORDNUNG Bewegungsmuster -> Pose und Gerät
     ============================================================ */
  /**
   * Ausführungsfotos mit Überblendung.
   * Liegen zwei Aufnahmen vor, blendet GoFit zwischen Start- und
   * Endposition über und macht daraus eine Bewegungsanimation.
   * Schlägt das Laden fehl, greift die gezeichnete Silhouette.
   */
  function photoFigure(ex) {
    var src1 = G.ex.photo(ex.id, 1);
    var src2 = ex.img > 1 ? G.ex.photo(ex.id, 2) : null;
    var alt = (ex.name || '').replace(/"/g, '&quot;');
    var fb = 'this.closest(\'.exphoto\').classList.add(\'exphoto--off\')';

    return '<div class="exphoto' + (src2 ? ' exphoto--pair' : '') + '">' +
      '<img class="exphoto__a" src="' + src1 + '" alt="' + alt + ', Startposition"' +
      ' loading="lazy" decoding="async" onerror="' + fb + '">' +
      (src2
        ? '<img class="exphoto__b" src="' + src2 + '" alt="" aria-hidden="true"' +
          ' loading="lazy" decoding="async">'
        : '') +
      '<span class="exphoto__fallback" aria-hidden="true">' + drawnFigure(ex) + '</span>' +
      '</div>';
  }

  function figure(ex) {
    if (ex && ex.img) return photoFigure(ex);
    return drawnFigure(ex);
  }

  function drawnFigure(ex) {
    var pattern = (ex && ex.pattern) || 'curl';
    var m = ex && ex.muscle;
    var id = ex && ex.id;
    var equip = (ex && ex.equip) || '';

    var kabel = equip === 'Kabelzug';
    var maschine = equip === 'Maschine';
    var langhantel = equip === 'Langhantel' || equip === 'SZ-Stange';

    switch (pattern) {
      case 'pressflat':
        return id === 'incline-db' ? poseIncline(pattern, m) : poseBench(pattern, m);

      case 'pullover':
        return poseBench(pattern, m);

      case 'pressover':
        return poseOverhead(pattern, m);

      case 'fly':
      case 'raise':
        return poseWings(pattern, m, { machine: maschine, cable: kabel });

      case 'curl':
        return poseStand(pattern, m, {
          bar: langhantel, cable: kabel, cableY: 118,
          preacher: equip === 'Scottbank'
        });

      case 'extension':
        return poseStand(pattern, m, { bar: langhantel, cable: kabel, cableY: 42 });

      case 'row':
        return poseBent(pattern, m, {
          cable: kabel, db: equip === 'Kurzhantel', bench: id === 'row-db'
        });

      case 'pulldown':
      case 'legraise':
        return poseHang(pattern, m);

      case 'crunch':
        return poseFloor(pattern, m, { cable: kabel });

      case 'plank':
      case 'dip':
        return posePush(pattern, m, { bars: equip === 'Barren' });

      case 'shrug':
        return poseShrug(pattern, m);

      case 'squat':
        return poseSquat(pattern, m, { machine: maschine });

      case 'hinge':
        return poseHinge(pattern, m);

      case 'legmachine':
        return poseLegMachine(pattern, m);

      case 'calf':
        return poseCalf(pattern, m, { machine: maschine, block: !maschine });

      case 'lunge':
        return poseLunge(pattern, m, { step: id === 'stepup' });

      case 'hipthrust':
        return poseHipThrust(pattern, m);

      case 'legkick':
        return poseKick(pattern, m);

      default:
        return poseStand(pattern, m, {});
    }
  }


  /* ============================================================
     MUSKELKARTE

     Anatomische Darstellung in Vorder- und Rückansicht.
     Die beanspruchten Gruppen werden farbig hervorgehoben:
     primär kräftig und leuchtend, unterstützend gedämpft.

     Zuordnung der Ansichten:
       Vorderseite : Trapez, Schulter, Brust, Bizeps, Bauch, Beine
       Rückseite   : Trapez, Schulter, Rücken, Trizeps, Po, Beine, Waden
     ============================================================ */

  var MCOLOR = {
    chest: '#3DFF9E', back: '#22D3EE', abs: '#FFC857',
    biceps: '#A78BFA', triceps: '#FF8FA3', shoulders: '#5EEAD4',
    traps: '#BEF264', legs: '#FF8A3D', glutes: '#E879F9', calves: '#8AB4FF'
  };

  /* Gruppen, die nur auf der Rückansicht sichtbar sind */
  var BACK_ONLY = ['back', 'triceps', 'traps', 'glutes', 'calves'];

  /* Gruppen, für die die Einzelansicht auf den Unterkörper zoomt */
  var LOWER = ['legs', 'glutes', 'calves'];

  var FRONT_ORDER = ['traps', 'shoulders', 'chest', 'biceps', 'abs', 'legs'];
  var BACK_ORDER = ['traps', 'shoulders', 'back', 'triceps', 'glutes', 'legs', 'calves'];

  /* --- Muskelgruppen der Vorderansicht --- */
  var MG_FRONT = {
    /* Oberer Trapez: die Linie vom Nacken zu den Schultern */
    traps:
      '<path d="M50 29C42 29 35 33 30.5 40.5L37.5 45C41.5 39.5 45.5 37 50 37' +
      'C54.5 37 58.5 39.5 62.5 45L69.5 40.5C65 33 58 29 50 29Z"/>',
    shoulders:
      '<ellipse cx="24" cy="47" rx="10.5" ry="12.5" transform="rotate(-20 24 47)"/>' +
      '<ellipse cx="76" cy="47" rx="10.5" ry="12.5" transform="rotate(20 76 47)"/>',
    chest:
      '<path d="M48.5 45C41 42.5 33 44.5 29.5 49 26.5 53.5 27.5 60.5 30.5 66 36.5 62.5 43 61.5 48.5 61.5Z"/>' +
      '<path d="M51.5 45C59 42.5 67 44.5 70.5 49 73.5 53.5 72.5 60.5 69.5 66 63.5 62.5 57 61.5 51.5 61.5Z"/>',
    biceps:
      '<ellipse cx="16.5" cy="71" rx="7.5" ry="14" transform="rotate(-7 16.5 71)"/>' +
      '<ellipse cx="83.5" cy="71" rx="7.5" ry="14" transform="rotate(7 83.5 71)"/>',
    abs:
      '<path d="M40 67h20v29c0 6.5-4.5 11-10 11s-10-4.5-10-11z"/>' +
      '<path class="seg" d="M40 76h20M40 85h20M40 94h20M50 67v40"/>',
    /* Quadrizeps */
    legs:
      '<ellipse cx="39.5" cy="128" rx="9" ry="23" transform="rotate(3 39.5 128)"/>' +
      '<ellipse cx="60.5" cy="128" rx="9" ry="23" transform="rotate(-3 60.5 128)"/>'
  };

  /* --- Muskelgruppen der Rückansicht --- */
  var MG_BACK = {
    /* Trapez: oberer, mittlerer und unterer Anteil */
    traps:
      '<path d="M50 31 34 42 41 61 50 53 59 61 66 42Z"/>',
    shoulders:
      '<ellipse cx="24" cy="47" rx="10.5" ry="12.5" transform="rotate(-20 24 47)"/>' +
      '<ellipse cx="76" cy="47" rx="10.5" ry="12.5" transform="rotate(20 76 47)"/>',
    back:
      /* Latissimus links und rechts */
      '<path d="M31 53C25.5 63 25.5 79 31 91L44 79C42 68 42 59 44 51Z"/>' +
      '<path d="M69 53C74.5 63 74.5 79 69 91L56 79C58 68 58 59 56 51Z"/>' +
      /* Unterer Rücken */
      '<path d="M44 82h12v20c0 4-2.5 6.5-6 6.5s-6-2.5-6-6.5z"/>',
    triceps:
      '<ellipse cx="16.5" cy="71" rx="7.5" ry="14" transform="rotate(-7 16.5 71)"/>' +
      '<ellipse cx="83.5" cy="71" rx="7.5" ry="14" transform="rotate(7 83.5 71)"/>',
    /* Gesäßmuskulatur */
    glutes:
      '<ellipse cx="41" cy="106" rx="11" ry="10"/>' +
      '<ellipse cx="59" cy="106" rx="11" ry="10"/>',
    /* Beinbeuger */
    legs:
      '<ellipse cx="39.5" cy="131" rx="9" ry="21" transform="rotate(3 39.5 131)"/>' +
      '<ellipse cx="60.5" cy="131" rx="9" ry="21" transform="rotate(-3 60.5 131)"/>',
    calves:
      '<ellipse cx="38" cy="177" rx="7.5" ry="17" transform="rotate(2 38 177)"/>' +
      '<ellipse cx="62" cy="177" rx="7.5" ry="17" transform="rotate(-2 62 177)"/>'
  };

  /* --- Silhouette (für beide Ansichten gleich) --- */
  var LIMBS = [
    'M23 43 13 78 15 114',   // Arm links
    'M77 43 87 78 85 114',   // Arm rechts
    'M41 106 37 155 39 203', // Bein links
    'M59 106 63 155 61 203'  // Bein rechts
  ];

  var TORSO =
    'M50 30C62 30 72.5 34.5 78 42 82 47.5 83 56 81 64 79 73 74.5 80 72.5 89 ' +
    '70.5 98 70 105 70 111L30 111C30 105 29.5 98 27.5 89 25.5 80 21 73 19 64 ' +
    '17 56 18 47.5 22 42 27.5 34.5 38 30 50 30Z';

  function silhouette(withLegs) {
    var out = [];
    var limbs = withLegs === false ? LIMBS.slice(0, 2) : LIMBS;
    // Gliedmaßen in drei Lagen: Kontur, dunkler Grund, helle Füllung
    limbs.forEach(function (d) { out.push('<path class="limb-o" d="' + d + '"/>'); });
    limbs.forEach(function (d) { out.push('<path class="limb-k" d="' + d + '"/>'); });
    limbs.forEach(function (d) { out.push('<path class="limb" d="' + d + '"/>'); });
    out.push('<circle class="body" cx="50" cy="17" r="11.5"/>');
    out.push('<path class="body" d="M43.5 25h13v9h-13z"/>');
    out.push('<path class="body" d="' + TORSO + '"/>');
    return out.join('');
  }

  /** Eine Ansicht (Vorder- oder Rückseite) */
  function panel(side, primary, secondary, label, withLegs) {
    var defs = side === 'front' ? MG_FRONT : MG_BACK;
    var order = side === 'front' ? FRONT_ORDER : BACK_ORDER;
    var out = [silhouette(withLegs)];

    order.forEach(function (k) {
      var cls = 'mg';
      if (k === primary) cls += ' primary';
      else if (secondary.indexOf(k) >= 0) cls += ' secondary';
      out.push('<g class="' + cls + '" style="--hl:' + MCOLOR[k] + '">' + defs[k] + '</g>');
    });

    if (label) {
      out.push('<text class="mmap-side" x="50" y="216" text-anchor="middle">' +
        (side === 'front' ? 'Vorderseite' : 'Rückseite') + '</text>');
    }
    return out.join('');
  }

  /**
   * Muskelkarte.
   * @param primary    Hauptmuskelgruppe
   * @param secondary  Array unterstützender Gruppen
   * @param opts       view: 'both' | 'front' | 'back' | 'auto'
   *                   labels: Seitenbeschriftung anzeigen
   */
  function muscleMap(primary, secondary, opts) {
    opts = opts || {};
    secondary = secondary || [];

    var view = opts.view || 'both';
    if (view === 'auto') {
      // Die Ansicht wählen, auf der die Hauptgruppe zu sehen ist
      view = BACK_ONLY.indexOf(primary) >= 0 ? 'back' : 'front';
    }

    var labels = opts.labels !== false && view === 'both';
    var box, body;

    if (view === 'both') {
      // Ganzkörper, beide Ansichten nebeneinander
      box = '0 0 212 ' + (labels ? 224 : 210);
      body = '<g>' + panel('front', primary, secondary, labels, true) + '</g>' +
        '<g transform="translate(112,0)">' + panel('back', primary, secondary, labels, true) + '</g>';
    } else {
      // Einzelansicht: auf den Körperabschnitt zugeschnitten, in dem die
      // Hauptgruppe liegt – so bleibt die Hervorhebung auch in kleinen
      // Kacheln erkennbar.
      var lower = LOWER.indexOf(primary) >= 0;
      box = lower ? '3 90 94 126' : '3 3 94 118';
      body = panel(view, primary, secondary, false, lower);
    }

    var names = [G.MUSCLES[primary] ? G.MUSCLES[primary].name : ''].concat(
      secondary.map(function (m) { return G.MUSCLES[m] ? G.MUSCLES[m].name : ''; })
    ).filter(Boolean);

    return '<svg class="mmap" viewBox="' + box + '" xmlns="http://www.w3.org/2000/svg" ' +
      'role="img" aria-label="Beanspruchte Muskelgruppen: ' + names.join(', ') + '">' +
      body + '</svg>';
  }

  /** Beschriftung mit den tatsächlich beanspruchten Gruppen */
  function muscleLegend(primary, secondary) {
    secondary = secondary || [];
    var items = [];

    if (G.MUSCLES[primary]) {
      items.push('<i class="lg-on" style="color:' + MCOLOR[primary] + '"><b>' +
        G.MUSCLES[primary].name + '</b></i>');
    }
    secondary.forEach(function (m) {
      if (!G.MUSCLES[m]) return;
      items.push('<i class="lg-sec" style="color:' + MCOLOR[m] + '">' + G.MUSCLES[m].name + '</i>');
    });

    return '<div class="mmap-legend">' + items.join('') +
      '<span class="mmap-legend__hint">fett = primär</span></div>';
  }

  G.anim = {
    figure: figure,
    drawnFigure: drawnFigure,
    muscleMap: muscleMap,
    muscleLegend: muscleLegend,
    MCOLOR: MCOLOR,
    BACK_ONLY: BACK_ONLY,
    LOWER: LOWER
  };
})(GoFit);
