/* ============================================================
   GoFit — Übungsanimationen & Muskelkarte

   Konzept Abschnitt 5: Jede Übung soll die Bewegungsausführung,
   die beanspruchten Muskelgruppen und Technikhinweise zeigen.

   Statt GIFs werden hier animierte SVG-Figuren erzeugt: klein,
   scharf in jeder Auflösung, offline verfügbar und in beiden
   Richtungen (Desktop/Handy) skalierbar.
   ============================================================ */
(function (G) {
  'use strict';

  /** Gelenk-Gruppe mit korrektem Drehpunkt im Anwenderkoordinatensystem */
  function joint(cls, x, y, inner) {
    return '<g data-joint class="' + cls + '" style="transform-box:view-box;transform-origin:' +
      x + 'px ' + y + 'px"><circle class="joint-ring" cx="' + x + '" cy="' + y +
      '" r="5.2"/><circle class="joint-core" cx="' + x + '" cy="' + y + '" r="2.2"/>' + inner + '</g>';
  }

  function bone(x1, y1, x2, y2, cls) {
    var pos = ' x1="' + x1 + '" y1="' + y1 + '" x2="' + x2 + '" y2="' + y2 + '"';
    return '<line class="body-shadow ' + (cls || '') + '"' + pos + '/>' +
      '<line class="body-shell ' + (cls || '') + '"' + pos + '/>' +
      '<line class="bone ' + (cls || '') + '"' + pos + '/>';
  }

  function head(cx, cy, r) {
    r = r || 11;
    return '<g class="avatar-head"><ellipse class="head" cx="' + cx + '" cy="' + cy +
      '" rx="' + (r * .82) + '" ry="' + (r * 1.08) + '"/>' +
      '<path class="face-grid" d="M' + (cx - r * .62) + ' ' + cy + 'Q' + cx + ' ' +
      (cy + r * .26) + ' ' + (cx + r * .62) + ' ' + cy + 'M' + cx + ' ' +
      (cy - r * .96) + 'V' + (cy + r * .96) + '"/></g>';
  }

  /** Hantelstange mit Scheiben */
  function barbell(x, y, half, vertical) {
    if (vertical) {
      return '<line class="load" x1="' + x + '" y1="' + (y - half) + '" x2="' + x + '" y2="' + (y + half) + '"/>' +
        '<rect class="plate" x="' + (x - 6) + '" y="' + (y - half - 4) + '" width="12" height="9" rx="3"/>' +
        '<rect class="plate" x="' + (x - 6) + '" y="' + (y + half - 5) + '" width="12" height="9" rx="3"/>';
    }
    return '<line class="load" x1="' + (x - half) + '" y1="' + y + '" x2="' + (x + half) + '" y2="' + y + '"/>' +
      '<rect class="plate" x="' + (x - half - 4) + '" y="' + (y - 7) + '" width="9" height="14" rx="3"/>' +
      '<rect class="plate" x="' + (x + half - 5) + '" y="' + (y - 7) + '" width="9" height="14" rx="3"/>';
  }

  function dumbbell(x, y) {
    return '<line class="load" x1="' + (x - 11) + '" y1="' + y + '" x2="' + (x + 11) + '" y2="' + y + '"/>' +
      '<rect class="plate" x="' + (x - 15) + '" y="' + (y - 6) + '" width="7" height="12" rx="2.5"/>' +
      '<rect class="plate" x="' + (x + 8) + '" y="' + (y - 6) + '" width="7" height="12" rx="2.5"/>';
  }

  function ground(y) {
    return '<line class="bench" x1="18" y1="' + y + '" x2="202" y2="' + y + '"/>';
  }

  /* ============================================================
     POSEN
     ============================================================ */

  /* --- Liegend auf der Bank: Drücken, Fliegende, Überzug --- */
  function poseBench(pattern) {
    var s = [];
    s.push('<rect class="bench" x="42" y="112" width="132" height="9" rx="4.5" fill="rgba(255,255,255,.05)"/>');
    s.push(bone(60, 128, 60, 150)); // Bankbein
    s.push(bone(156, 128, 156, 150));
    s.push(ground(152));
    // Beine
    s.push(bone(150, 110, 176, 126));
    s.push(bone(176, 126, 176, 150));
    // Rumpf
    s.push(joint('j-torso', 150, 110,
      bone(150, 110, 74, 110) + head(64, 110, 11)
    ));
    // Arme (Schulter bei 96,110)
    var arm = joint('j-armU', 96, 110,
      bone(96, 110, 96, 76) +
      joint('j-armF', 96, 76, bone(96, 76, 96, 48) +
        joint('j-bar', 96, 48, barbell(96, 48, 30))
      )
    );
    s.push(arm);
    return wrap(s.join(''), pattern);
  }

  /* --- Stehend: Überkopfdrücken, Curls, Strecken, Heben --- */
  function poseStand(pattern, opts) {
    opts = opts || {};
    var s = [];
    s.push(ground(172));
    s.push(head(110, 34, 12));
    s.push(joint('j-torso', 110, 110,
      bone(110, 46, 110, 108) +               // Rumpf
      bone(110, 108, 94, 140) + bone(94, 140, 94, 170) +  // linkes Bein
      bone(110, 108, 126, 140) + bone(126, 140, 126, 170) // rechtes Bein
    ));

    if (opts.symmetric) {
      // Zwei gespiegelte Arme (Fliegende, Seitheben)
      s.push(joint('j-armL', 110, 60,
        bone(110, 60, 82, 92) + (opts.load ? dumbbell(82, 96) : '')
      ));
      s.push(joint('j-armR', 110, 60,
        bone(110, 60, 138, 92) + (opts.load ? dumbbell(138, 96) : '')
      ));
    } else {
      var load = opts.bar ? barbell(110, opts.barY || 60, 34) : dumbbell(110, opts.barY || 60);
      s.push(joint('j-armU', 110, 60,
        bone(110, 60, 110, 88) +
        joint('j-armF', 110, 88, bone(110, 88, 110, 112) +
          joint('j-bar', 110, 112, opts.bar ? barbell(110, 112, 34) : dumbbell(110, 112))
        )
      ));
    }
    return wrap(s.join(''), pattern);
  }

  /* --- Überkopf: Startposition Arme schon angewinkelt --- */
  function poseOverhead(pattern) {
    var s = [];
    s.push(ground(172));
    s.push(head(110, 40, 12));
    s.push(joint('j-torso', 110, 112,
      bone(110, 52, 110, 110) +
      bone(110, 110, 94, 142) + bone(94, 142, 94, 170) +
      bone(110, 110, 126, 142) + bone(126, 142, 126, 170)
    ));
    s.push(joint('j-armU', 110, 64,
      bone(110, 64, 84, 74) +
      joint('j-armF', 84, 74, bone(84, 74, 84, 46) +
        joint('j-bar', 84, 46, barbell(110, 46, 40))
      )
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Vorgebeugt: Rudern --- */
  function poseBent(pattern) {
    var s = [];
    s.push(ground(174));
    s.push(joint('j-torso', 124, 96,
      bone(124, 96, 62, 74) + head(52, 70, 11)
    ));
    s.push(bone(124, 96, 130, 136));
    s.push(bone(130, 136, 130, 172));
    s.push(joint('j-armU', 78, 82,
      bone(78, 82, 78, 116) +
      joint('j-armF', 78, 116, bone(78, 116, 78, 138) +
        joint('j-bar', 78, 138, barbell(78, 138, 30))
      )
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Hängend: Klimmzug, Latzug, Beinheben --- */
  function poseHang(pattern) {
    var s = [];
    s.push('<line class="bench" x1="40" y1="22" x2="180" y2="22"/>');
    s.push(joint('j-bar', 110, 30, barbell(110, 30, 36)));
    s.push(joint('j-armU', 110, 66,
      bone(110, 66, 104, 46) +
      joint('j-armF', 104, 46, bone(104, 46, 104, 30))
    ));
    s.push(head(110, 54, 11));
    s.push(joint('j-torso', 110, 66,
      bone(110, 66, 110, 116) +
      joint('j-legU', 110, 116,
        bone(110, 116, 110, 146) +
        joint('j-legL', 110, 146, bone(110, 146, 110, 174))
      )
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Rückenlage am Boden: Crunch, Beinheben liegend --- */
  function poseFloor(pattern) {
    var s = [];
    s.push(ground(150));
    s.push(joint('j-torso', 118, 144,
      bone(118, 144, 62, 144) + head(52, 140, 11) +
      joint('j-armU', 70, 142, bone(70, 142, 56, 126))
    ));
    s.push(joint('j-legU', 118, 144,
      bone(118, 144, 152, 130) +
      joint('j-legL', 152, 130, bone(152, 130, 178, 144))
    ));
    return wrap(s.join(''), pattern);
  }

  /* --- Stützposition: Plank, Liegestütz, Dip --- */
  function posePush(pattern) {
    var s = [];
    s.push(ground(160));
    s.push(joint('j-torso', 60, 112,
      bone(60, 112, 154, 130) + head(50, 108, 11)
    ));
    s.push(joint('j-armU', 78, 116,
      bone(78, 116, 78, 138) +
      joint('j-armF', 78, 138, bone(78, 138, 78, 158))
    ));
    s.push(bone(154, 130, 182, 158));
    return wrap(s.join(''), pattern);
  }

  /* --- Nackenheben --- */
  function poseShrug(pattern) {
    var s = [];
    s.push(ground(172));
    s.push(head(110, 36, 12));
    s.push(joint('j-torso', 110, 110,
      bone(110, 48, 110, 108) +
      bone(110, 108, 94, 140) + bone(94, 140, 94, 170) +
      bone(110, 108, 126, 140) + bone(126, 140, 126, 170) +
      bone(84, 62, 136, 62)
    ));
    s.push(joint('j-bar', 110, 118,
      bone(84, 62, 84, 118) + bone(136, 62, 136, 118) +
      dumbbell(84, 118) + dumbbell(136, 118)
    ));
    return wrap(s.join(''), pattern);
  }

  function wrap(inner, pattern) {
    return '<svg class="fig p-' + pattern + '" viewBox="0 0 220 190" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Animierte, schematische Übungsausführung">' +
      '<defs>' +
      '<linearGradient id="gf-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#39424d"/><stop offset=".48" stop-color="#111820"/><stop offset="1" stop-color="#05090d"/></linearGradient>' +
      '<linearGradient id="gf-edge" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#3dff9e"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>' +
      '<filter id="gf-glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
      '</defs><g class="avatar-floor-glow"><ellipse cx="110" cy="174" rx="72" ry="7"/></g>' + inner + '</svg>';
  }

  /* ---------- Zuordnung Muster -> Pose ---------- */
  var POSE = {
    pressflat: function (p) { return poseBench(p); },
    pullover: function (p) { return poseBench(p); },
    pressover: function (p) { return poseOverhead(p); },
    fly: function (p) { return poseStand(p, { symmetric: true, load: true }); },
    raise: function (p) { return poseStand(p, { symmetric: true, load: true }); },
    curl: function (p) { return poseStand(p, { barY: 112 }); },
    extension: function (p) { return poseStand(p, { barY: 112 }); },
    row: function (p) { return poseBent(p); },
    pulldown: function (p) { return poseHang(p); },
    legraise: function (p) { return poseHang(p); },
    crunch: function (p) { return poseFloor(p); },
    plank: function (p) { return posePush(p); },
    dip: function (p) { return posePush(p); },
    shrug: function (p) { return poseShrug(p); }
  };

  /** SVG-Markup einer Übungsanimation */
  function figure(ex) {
    var referenceTone = ex && ex.demoStyle === 'reference-gif' ? ' fig--reference' : '';
    if (ex && ex.demoCrop && ex.demoDark && ex.demoLight) {
      return '<span class="fig fig--real fig--anatomy fig--cropped-pair" role="img"' +
        ' aria-label="Animierte Ausführung: ' + G.u.esc(ex.name) + '">' +
        '<span class="fig--crop-frame">' +
        '<img class="fig--theme-dark" src="' + ex.demoDark + '" alt="" loading="lazy" decoding="async">' +
        '<img class="fig--theme-light" src="' + ex.demoLight + '" alt="" loading="lazy" decoding="async">' +
        '</span></span>';
    }
    if (ex && ex.demoDark && ex.demoLight) {
      return '<span class="fig fig--real fig--anatomy fig--theme-pair" role="img"' +
        ' aria-label="Animierte Ausführung: ' + G.u.esc(ex.name) + '">' +
        '<img class="fig--theme-dark" src="' + ex.demoDark + '" alt="" loading="lazy" decoding="async">' +
        '<img class="fig--theme-light" src="' + ex.demoLight + '" alt="" loading="lazy" decoding="async">' +
        '</span>';
    }
    var demo = ex && (ex.demo || ('assets/exercises/anatomy/' + ex.id + '.webp'));
    if (demo) {
      if (/\.(?:mp4|webm)(?:[?#]|$)/i.test(demo)) {
        return '<video class="fig fig--real fig--video" src="' + demo + '"' +
          (ex.demoPoster ? ' poster="' + ex.demoPoster + '"' : '') +
          ' aria-label="Animierte Ausführung: ' + G.u.esc(ex.name) +
          '" autoplay muted loop playsinline preload="metadata"></video>';
      }
      return '<img class="fig fig--real fig--anatomy' + referenceTone +
        '" src="' + demo + '" alt="Animierte Ausführung: ' +
        G.u.esc(ex.name) + '" loading="lazy" decoding="async">';
    }
    var pattern = (ex && ex.pattern) || 'curl';
    var fn = POSE[pattern] || POSE.curl;
    return fn(pattern);
  }

  /* ============================================================
     MUSKELKARTE

     Anatomische Darstellung in Vorder- und Rückansicht.
     Die beanspruchten Gruppen werden farbig hervorgehoben:
     primär kräftig und leuchtend, unterstützend gedämpft.

     Zuordnung der Ansichten:
       Vorderseite : Schulter, Brust, Bizeps, Bauch
       Rückseite   : Schulter, Rücken, Trizeps
     ============================================================ */

  var MCOLOR = {
    chest: '#3DFF9E', back: '#22D3EE', abs: '#FFC857',
    biceps: '#A78BFA', triceps: '#FF8FA3', shoulders: '#5EEAD4'
  };

  /* Gruppen, die nur auf der Rückansicht sichtbar sind */
  var BACK_ONLY = ['back', 'triceps'];

  var FRONT_ORDER = ['shoulders', 'chest', 'biceps', 'abs'];
  var BACK_ORDER = ['shoulders', 'back', 'triceps'];

  /** Anatomische Ganzkörperfigur für Muskelkarten und Detailansichten. */
  function anatomyMuscleMap(primary, secondary, side, names) {
    var defs = side === 'front' ? CARD_FRONT : CARD_BACK;
    var order = side === 'front' ? FRONT_ORDER : BACK_ORDER;
    var zones = order.map(function (k) {
      var cls = 'mg';
      if (k === primary) cls += ' primary';
      else if (secondary.indexOf(k) >= 0) cls += ' secondary';
      return '<g class="' + cls + '">' + defs[k] + '</g>';
    }).join('');

    return '<svg class="mmap anatomy-mmap anatomy-mmap--' + side + '" viewBox="0 35 400 430" ' +
      'xmlns="http://www.w3.org/2000/svg" role="img" preserveAspectRatio="xMidYMid meet" ' +
      'aria-label="Beanspruchte Muskelgruppen: ' + names.join(', ') + '">' +
      '<image class="anatomy-mmap__image" href="assets/avatar/anatomy-' + side + '-v4.webp" ' +
      'x="0" y="0" width="400" height="800" preserveAspectRatio="xMidYMid meet"/>' +
      '<g class="anatomy-mmap__zones">' + zones + '</g></svg>';
  }

  /** Neue Anatomiefigur als Vorder-/Rückseiten-Paar für das Detailfenster. */
  function anatomyMusclePair(primary, secondary, names, labels) {
    function sidePanel(side, label) {
      return '<span class="anatomy-mmap-pair__panel">' +
        anatomyMuscleMap(primary, secondary, side, names) +
        (labels ? '<span class="anatomy-mmap-pair__label">' + label + '</span>' : '') +
        '</span>';
    }

    return '<span class="anatomy-mmap-pair" role="group" ' +
      'aria-label="Beanspruchte Muskelgruppen: ' + names.join(', ') + '">' +
      sidePanel('front', 'Vorderseite') + sidePanel('back', 'Rückseite') + '</span>';
  }

  /* --- Muskelgruppen der Vorderansicht --- */
  var MG_FRONT = {
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
      '<path class="seg" d="M40 76h20M40 85h20M40 94h20M50 67v40"/>'
  };

  /* --- Muskelgruppen der Rückansicht --- */
  var MG_BACK = {
    shoulders:
      '<ellipse cx="24" cy="47" rx="10.5" ry="12.5" transform="rotate(-20 24 47)"/>' +
      '<ellipse cx="76" cy="47" rx="10.5" ry="12.5" transform="rotate(20 76 47)"/>',
    back:
      /* Trapez */
      '<path d="M50 31 34 42 41 61 50 53 59 61 66 42Z"/>' +
      /* Latissimus links und rechts */
      '<path d="M31 53C25.5 63 25.5 79 31 91L44 79C42 68 42 59 44 51Z"/>' +
      '<path d="M69 53C74.5 63 74.5 79 69 91L56 79C58 68 58 59 56 51Z"/>',
    triceps:
      '<ellipse cx="16.5" cy="71" rx="7.5" ry="14" transform="rotate(-7 16.5 71)"/>' +
      '<ellipse cx="83.5" cy="71" rx="7.5" ry="14" transform="rotate(7 83.5 71)"/>'
  };

  /*
   * Muskelkonturen passend zu anatomy-front-v4.webp und
   * anatomy-back-v4.webp (jeweils 400 × 800 Pixel).
   */
  var CARD_FRONT = {
    shoulders:
      '<path d="M151 184C132 176 110 184 99 201 92 215 94 233 103 247 117 245 131 234 142 220 149 210 153 196 151 184Z"/>' +
      '<path d="M249 184C268 176 290 184 301 201 308 215 306 233 297 247 283 245 269 234 258 220 251 210 247 196 249 184Z"/>',
    chest:
      '<path d="M197 187C177 181 146 185 128 201 121 216 126 238 141 254 159 260 179 254 197 243Z"/>' +
      '<path d="M203 187C223 181 254 185 272 201 279 216 274 238 259 254 241 260 221 254 203 243Z"/>',
    biceps:
      '<path d="M104 246C89 256 81 278 81 303 82 325 89 339 101 341 112 328 118 304 117 280 116 263 111 251 104 246Z"/>' +
      '<path d="M296 246C311 256 319 278 319 303 318 325 311 339 299 341 288 328 282 304 283 280 284 263 289 251 296 246Z"/>',
    abs:
      '<path d="M165 261C176 266 188 264 197 259L197 392C188 398 176 396 168 387 162 354 159 290 165 261Z"/>' +
      '<path d="M235 261C224 266 212 264 203 259L203 392C212 398 224 396 232 387 238 354 241 290 235 261Z"/>' +
      '<path class="seg" d="M164 292H236M162 327H238M164 363H236M200 259V395"/>'
  };

  var CARD_BACK = {
    shoulders:
      '<path d="M151 184C132 179 110 188 100 204 93 218 95 237 105 250 119 246 135 234 148 219 154 208 156 195 151 184Z"/>' +
      '<path d="M249 184C268 179 290 188 300 204 307 218 305 237 295 250 281 246 265 234 252 219 246 208 244 195 249 184Z"/>',
    back:
      /* Trapezmuskel */
      '<path d="M200 157C188 171 174 181 158 191 164 218 176 248 200 272 224 248 236 218 242 191 226 181 212 171 200 157Z"/>' +
      /* Oberer Rücken */
      '<path d="M158 197C143 205 132 222 132 242 139 257 154 266 174 264L195 225C184 213 171 204 158 197Z"/>' +
      '<path d="M242 197C257 205 268 222 268 242 261 257 246 266 226 264L205 225C216 213 229 204 242 197Z"/>' +
      /* Latissimus */
      '<path d="M155 258C139 280 134 312 139 346 143 375 153 397 168 410L194 366C184 333 182 297 188 266Z"/>' +
      '<path d="M245 258C261 280 266 312 261 346 257 375 247 397 232 410L206 366C216 333 218 297 212 266Z"/>',
    triceps:
      '<path d="M102 249C87 262 80 286 82 313 84 334 91 346 103 341 113 325 119 300 117 276 115 262 109 253 102 249Z"/>' +
      '<path d="M298 249C313 262 320 286 318 313 316 334 309 346 297 341 287 325 281 300 283 276 285 262 291 253 298 249Z"/>'
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
  function panel(side, primary, secondary, label, withLegs, compact) {
    var defs = side === 'front' ? MG_FRONT : MG_BACK;
    var order = side === 'front' ? FRONT_ORDER : BACK_ORDER;
    var out = [silhouette(withLegs)];

    order.forEach(function (k) {
      var cls = 'mg';
      if (k === primary) cls += ' primary';
      else if (secondary.indexOf(k) >= 0) cls += ' secondary';
      out.push('<g class="' + cls + '" style="--hl:' + (compact ? '#E95A3C' : MCOLOR[k]) + '">' + defs[k] + '</g>');
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

    var names = [G.MUSCLES[primary] ? G.MUSCLES[primary].name : ''].concat(
      secondary.map(function (m) { return G.MUSCLES[m] ? G.MUSCLES[m].name : ''; })
    ).filter(Boolean);

    var view = opts.view || 'both';
    if (view === 'auto') {
      // Die Ansicht wählen, auf der die Hauptgruppe zu sehen ist
      view = BACK_ONLY.indexOf(primary) >= 0 ? 'back' : 'front';
      return anatomyMuscleMap(primary, secondary, view, names);
    }

    var labels = opts.labels !== false && view === 'both';
    var box, body;

    if (view === 'both') {
      return anatomyMusclePair(primary, secondary, names, labels);
    } else {
      // Einzelansicht: auf den Oberkörper zugeschnitten, damit die
      // Hervorhebung auch in kleinen Kacheln erkennbar bleibt.
      box = '3 3 94 118';
      body = panel(view, primary, secondary, false, false, false);
    }

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
    muscleMap: muscleMap,
    muscleLegend: muscleLegend,
    MCOLOR: MCOLOR,
    BACK_ONLY: BACK_ONLY
  };
})(GoFit);
