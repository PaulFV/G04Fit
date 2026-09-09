/* ============================================================
   GoFit — Diagramme (reines SVG, keine Bibliothek)
   Ring, Verlaufskurve, Netzdiagramm, Wochen-Heatmap
   ============================================================ */
(function (G) {
  'use strict';

  var u = G.u;
  var gradSeq = 0;

  function gradId() { return 'gfGrad' + (++gradSeq); }

  /* ------------------------------------------------------------
     RING — Fortschrittsring mit Beschriftung in der Mitte
     ------------------------------------------------------------ */
  function ring(pct, opts) {
    opts = opts || {};
    var size = opts.size || 120;
    var sw = opts.stroke || 10;
    var r = (size - sw) / 2;
    var c = 2 * Math.PI * r;
    var p = u.clamp(pct || 0, 0, 1);
    var id = gradId();
    var from = opts.from || '#12E27C';
    var to = opts.to || '#3DFF9E';

    var svg = [
      '<svg class="ring" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + ' ' + size + '" aria-hidden="true">',
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">',
      '<stop offset="0%" stop-color="' + from + '"/><stop offset="100%" stop-color="' + to + '"/>',
      '</linearGradient></defs>',
      '<circle class="ring__track" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none" stroke-width="' + sw + '"/>',
      '<circle class="ring__fill" cx="' + size / 2 + '" cy="' + size / 2 + '" r="' + r + '" fill="none"',
      ' stroke="url(#' + id + ')" stroke-width="' + sw + '" stroke-linecap="round"',
      ' stroke-dasharray="' + c.toFixed(2) + '" stroke-dashoffset="' + (c * (1 - p)).toFixed(2) + '"',
      ' transform="rotate(-90 ' + size / 2 + ' ' + size / 2 + ')"/>',
      '</svg>'
    ].join('');

    if (opts.raw) return svg;

    return '<div class="ring-wrap" style="width:' + size + 'px;height:' + size + 'px">' + svg +
      '<div class="ring-wrap__mid">' +
      '<b>' + (opts.value != null ? opts.value : Math.round(p * 100) + '%') + '</b>' +
      (opts.label ? '<span>' + u.esc(opts.label) + '</span>' : '') +
      '</div></div>';
  }

  /* ------------------------------------------------------------
     LINIE — Verlauf, z. B. Kraftentwicklung
     points: [{x:label, y:number}]
     ------------------------------------------------------------ */
  function line(points, opts) {
    opts = opts || {};
    var W = opts.width || 640, H = opts.height || 190;
    var padL = 38, padR = 12, padT = 14, padB = 26;
    var iw = W - padL - padR, ih = H - padT - padB;

    if (!points || points.length < 2) {
      return '<div class="empty small">Noch zu wenig Daten für einen Verlauf.<br>' +
        'Trage mindestens zwei Einheiten ein.</div>';
    }

    var ys = points.map(function (p) { return p.y; });
    var min = Math.min.apply(null, ys), max = Math.max.apply(null, ys);
    if (max === min) { max = min + 1; min = Math.max(0, min - 1); }
    var span = max - min;
    min -= span * 0.12; max += span * 0.12;

    function px(i) { return padL + (points.length === 1 ? iw / 2 : i / (points.length - 1) * iw); }
    function py(v) { return padT + ih - (v - min) / (max - min) * ih; }

    var id = gradId();
    var d = points.map(function (p, i) { return (i ? 'L' : 'M') + px(i).toFixed(1) + ' ' + py(p.y).toFixed(1); }).join(' ');
    var area = d + ' L' + px(points.length - 1).toFixed(1) + ' ' + (padT + ih) + ' L' + padL + ' ' + (padT + ih) + ' Z';

    var out = ['<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" preserveAspectRatio="none" style="display:block;height:' + H + 'px" role="img">'];
    out.push('<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1">' +
      '<stop offset="0%" stop-color="rgba(61,255,158,.32)"/>' +
      '<stop offset="100%" stop-color="rgba(61,255,158,0)"/></linearGradient></defs>');

    // Gitter + Achsenbeschriftung
    for (var g = 0; g <= 3; g++) {
      var yy = padT + ih * g / 3;
      var val = max - (max - min) * g / 3;
      out.push('<line x1="' + padL + '" y1="' + yy.toFixed(1) + '" x2="' + (W - padR) + '" y2="' + yy.toFixed(1) +
        '" style="stroke:var(--glass-br)" stroke-width="1"/>');
      out.push('<text x="' + (padL - 7) + '" y="' + (yy + 3.5).toFixed(1) + '" text-anchor="end" ' +
        'style="fill:var(--tx-2)" font-size="9.5" font-family="monospace">' + Math.round(val) + '</text>');
    }

    out.push('<path d="' + area + '" fill="url(#' + id + ')"/>');
    out.push('<path d="' + d + '" fill="none" style="stroke:var(--neon);filter:drop-shadow(0 0 6px rgba(61,255,158,.55))" stroke-width="2.4" ' +
      'stroke-linejoin="round" stroke-linecap="round"/>');

    points.forEach(function (p, i) {
      var isLast = i === points.length - 1;
      out.push('<circle cx="' + px(i).toFixed(1) + '" cy="' + py(p.y).toFixed(1) + '" r="' + (isLast ? 4.6 : 3) +
        '" style="fill:' + (isLast ? 'var(--neon)' : 'var(--bg-1)') + ';stroke:var(--neon)" stroke-width="2"/>');
      out.push('<title>' + u.esc(p.x) + ': ' + u.fmt(p.y) + '</title>');
    });

    // X-Beschriftung: erste, mittlere, letzte
    [0, Math.floor((points.length - 1) / 2), points.length - 1].forEach(function (i, k, arr) {
      if (arr.indexOf(i) !== k) return;
      out.push('<text x="' + px(i).toFixed(1) + '" y="' + (H - 7) + '" text-anchor="' +
        (i === 0 ? 'start' : i === points.length - 1 ? 'end' : 'middle') + '" ' +
        'style="fill:var(--tx-2)" font-size="9.5">' + u.esc(points[i].x) + '</text>');
    });

    out.push('</svg>');
    return out.join('');
  }

  /* ------------------------------------------------------------
     NETZ — Leistungsprofil (Kraft, Ausdauer, …)
     axes: [{label, value 0..1}]
     ------------------------------------------------------------ */
  function radar(axes, opts) {
    opts = opts || {};
    var S = opts.size || 250;
    var cx = S / 2, cy = S / 2 + 4, R = S * 0.34;
    var n = axes.length;
    if (!n) return '';

    function pt(i, f) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n;
      return [cx + Math.cos(a) * R * f, cy + Math.sin(a) * R * f];
    }

    var out = ['<svg viewBox="0 0 ' + S + ' ' + S + '" width="100%" style="display:block;max-width:' + S + 'px;margin:0 auto" role="img">'];

    // Netzringe
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var pts = [];
      for (var i = 0; i < n; i++) pts.push(pt(i, f).map(function (v) { return v.toFixed(1); }).join(','));
      out.push('<polygon points="' + pts.join(' ') + '" fill="none" style="stroke:var(--glass-br);opacity:' +
        (f === 1 ? '1' : '.6') + '" stroke-width="1"/>');
    });

    // Speichen
    for (var i = 0; i < n; i++) {
      var e = pt(i, 1);
      out.push('<line x1="' + cx + '" y1="' + cy + '" x2="' + e[0].toFixed(1) + '" y2="' + e[1].toFixed(1) +
        '" style="stroke:var(--glass-br);opacity:.6" stroke-width="1"/>');
    }

    // Datenfläche
    var dpts = axes.map(function (a, k) {
      return pt(k, u.clamp(a.value, 0.04, 1)).map(function (v) { return v.toFixed(1); }).join(',');
    });
    out.push('<polygon points="' + dpts.join(' ') + '" fill="rgba(61,255,158,.16)" style="stroke:var(--neon);filter:drop-shadow(0 0 8px rgba(61,255,158,.4))" ' +
      'stroke-width="2.2" stroke-linejoin="round"/>');

    axes.forEach(function (a, k) {
      var p = pt(k, u.clamp(a.value, 0.04, 1));
      out.push('<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.4" style="fill:var(--neon)"/>');
      var l = pt(k, 1.27);
      var anchor = Math.abs(l[0] - cx) < 6 ? 'middle' : (l[0] > cx ? 'start' : 'end');
      out.push('<text x="' + l[0].toFixed(1) + '" y="' + (l[1] + 3.5).toFixed(1) + '" text-anchor="' + anchor + '" ' +
        'style="fill:var(--tx-1)" font-size="10.5">' + u.esc(a.label) + '</text>');
      out.push('<text x="' + l[0].toFixed(1) + '" y="' + (l[1] + 15).toFixed(1) + '" text-anchor="' + anchor + '" ' +
        'style="fill:var(--neon)" font-size="10" font-family="monospace">' + Math.round(a.value * 100) + '</text>');
    });

    out.push('</svg>');
    return out.join('');
  }

  /* ------------------------------------------------------------
     BALANCE — waagerechte Balken je Muskelgruppe
     rows: [{label, value, pct, color}]
     ------------------------------------------------------------ */
  function balance(rows) {
    if (!rows.length) return '';
    return '<div class="bal">' + rows.map(function (r) {
      return '<div class="bal__row">' +
        '<span class="bal__lab"><i class="mdot" style="background:' + r.color + ';color:' + r.color + '"></i>' + u.esc(r.label) + '</span>' +
        '<span class="bar"><span class="bar__fill" style="width:' + Math.round(r.pct * 100) + '%;background:linear-gradient(90deg,' +
        r.color + '55,' + r.color + ');box-shadow:0 0 12px ' + r.color + '66"></span></span>' +
        '<span class="bal__v">' + u.esc(r.value) + '</span>' +
        '</div>';
    }).join('') + '</div>';
  }

  /* ------------------------------------------------------------
     SÄULEN — Volumen je Woche
     bars: [{label, value}]
     ------------------------------------------------------------ */
  function columns(bars, opts) {
    opts = opts || {};
    if (!bars.length) return '<div class="empty small">Noch keine Einheiten erfasst.</div>';
    var H = opts.height || 150;
    var max = Math.max.apply(null, bars.map(function (b) { return b.value; })) || 1;

    return '<div style="display:flex;align-items:flex-end;gap:6px;height:' + H + 'px">' +
      bars.map(function (b) {
        var h = Math.max(3, Math.round(b.value / max * (H - 30)));
        var on = b.value > 0;
        return '<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:5px;justify-content:flex-end;height:100%">' +
          '<span class="tiny mono" style="color:' + (on ? 'var(--neon)' : 'var(--tx-2)') + '">' +
          (on ? Math.round(b.value / 1000) + 't' : '–') + '</span>' +
          '<div title="' + u.esc(b.label) + ': ' + u.fmt(b.value) + ' kg" style="width:100%;height:' + h + 'px;border-radius:6px 6px 3px 3px;' +
          'background:' + (on ? 'linear-gradient(180deg,var(--neon),rgba(18,226,124,.28))' : 'var(--glass-bg-2)') + ';' +
          (on ? 'box-shadow:0 0 14px rgba(61,255,158,.28);' : '') + 'transition:height .8s cubic-bezier(.22,.9,.25,1)"></div>' +
          '<span class="tiny dim">' + u.esc(b.label) + '</span>' +
          '</div>';
      }).join('') + '</div>';
  }

  G.charts = { ring: ring, line: line, radar: radar, balance: balance, columns: columns };
})(GoFit);
