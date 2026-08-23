/* ============================================================
   GoFit — Trainings-Avatar

   Jede Person lädt ihr eigenes Bild hoch. GoFit wird ohne
   vorgegebenes Foto ausgeliefert; bis ein Bild gewählt wurde,
   erscheint ein neutraler Platzhalter.

   Der Avatar begleitet dich durch Dashboard, Profil, Journey und
   die Abschluss-Übersicht. Ein Antippen öffnet überall die
   Bildauswahl.

   Datenschutz: Ein Foto ist ein personenbezogenes Datum. Es wird
   wie die übrigen Profildaten behandelt — es bleibt auf diesem
   Gerät, wird nur mit der Einwilligung "Profil speichern"
   dauerhaft abgelegt und beim Löschen der Daten mit entfernt.
   Es findet keine Erkennung, keine Analyse und keine
   Übertragung statt.
   ============================================================ */
(function (G) {
  'use strict';
  var u = G.u;

  /* Größe des gespeicherten Bildes: quadratisch für runde Avatare,
     zusätzlich ein Hochformat für die Profilansicht. */
  var SQUARE_PX = 512;
  var PORTRAIT_PX = 900;
  var JPEG_QUALITY = 0.85;

  function p() { return G.store.state.profile; }

  /** Quelle für runde Avatare — null, solange kein Bild gewählt wurde */
  function src() { return p().avatar || null; }

  /** Quelle für das große Portrait */
  function fullSrc() { return p().avatarFull || p().avatar || null; }

  function has() { return !!src(); }

  function initials() {
    var n = (p().name || '').trim();
    if (!n) return '';
    var parts = n.split(/\s+/);
    return (parts[0][0] + (parts[1] ? parts[1][0] : '')).toUpperCase();
  }

  /**
   * Runder Avatar. Ohne Bild erscheint ein Platzhalter.
   *
   * @param size  Durchmesser in Pixeln
   * @param opts  ring:   0..1, Fortschrittsring außen herum
   *              level:  Zahl für das Abzeichen unten rechts
   *              hero:   kräftigerer Schein
   *              action: anklickbar, öffnet die Bildauswahl
   */
  function render(size, opts) {
    opts = opts || {};
    size = size || 48;
    var img = src();
    var ini = initials();

    var inner = img
      ? '<img src="' + u.esc(img) + '" alt="Trainings-Avatar">'
      : '<span class="avatar__ph">' +
        (ini ? u.esc(ini) : u.icon('profile', Math.round(size * 0.46))) +
        '</span>';

    var ring = '';
    if (opts.ring != null) {
      ring = '<span class="avatar__ring">' +
        G.charts.ring(opts.ring, {
          size: size + 14,
          stroke: Math.max(3, Math.round(size * 0.065)),
          raw: true
        }) + '</span>';
    }

    var badge = opts.level != null
      ? '<span class="avatar__lvl">' + u.esc(String(opts.level)) + '</span>'
      : '';

    var cls = 'avatar' +
      (opts.hero ? ' avatar--hero' : '') +
      (img ? '' : ' avatar--empty') +
      (opts.action ? ' avatar--action' : '');

    var attrs = 'class="' + cls + '" style="width:' + size + 'px;height:' + size + 'px"';

    if (opts.action) {
      return '<button type="button" ' + attrs + ' data-avatar-pick ' +
        'title="' + (img ? 'Bild ändern' : 'Eigenes Bild hochladen') + '" ' +
        'aria-label="' + (img ? 'Trainings-Avatar ändern' : 'Trainings-Avatar hochladen') + '">' +
        inner + ring + badge +
        '<span class="avatar__edit">' + u.icon(img ? 'refresh' : 'plus', Math.max(11, Math.round(size * 0.2))) + '</span>' +
        '</button>';
    }

    return '<span ' + attrs + '>' + inner + ring + badge + '</span>';
  }

  /** Großes Portrait mit weichem Verlauf nach unten */
  function renderPortrait(height, opts) {
    opts = opts || {};
    var img = fullSrc();
    if (!img) return '';
    return '<div class="portrait" style="height:' + (height || 240) + 'px">' +
      '<img src="' + u.esc(img) + '" alt="Trainings-Avatar">' +
      (opts.caption ? '<span class="portrait__cap">' + u.esc(opts.caption) + '</span>' : '') +
      '</div>';
  }

  /* ------------------------------------------------------------
     Bild auswählen
     Das Bild wird im Browser verkleinert und als JPEG abgelegt,
     damit der lokale Speicher nicht überläuft.
     ------------------------------------------------------------ */
  function pickFile(onDone) {
    var input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.onchange = function () {
      var file = input.files && input.files[0];
      input.remove();
      if (!file) return;

      if (!/^image\//.test(file.type)) {
        u.toast('Kein Bild', 'Bitte eine Bilddatei auswählen.', 'warn');
        return;
      }

      var reader = new FileReader();
      reader.onerror = function () {
        u.toast('Datei nicht lesbar', 'Versuche ein anderes Bild.', 'err');
      };
      reader.onload = function () {
        var im = new Image();
        im.onload = function () {
          try {
            onDone(toDataUrl(im, SQUARE_PX, true), toDataUrl(im, PORTRAIT_PX, false));
          } catch (e) {
            u.toast('Bild konnte nicht verarbeitet werden', String(e.message || e), 'err');
          }
        };
        im.onerror = function () {
          u.toast('Bild konnte nicht gelesen werden', 'Versuche ein anderes Format, etwa JPG oder PNG.', 'err');
        };
        im.src = String(reader.result);
      };
      reader.readAsDataURL(file);
    };

    input.click();
  }

  /**
   * @param square true  = quadratischer Ausschnitt, bei Hochformat
   *                       Richtung Kopf verschoben
   *               false = Seitenverhältnis erhalten, längste Kante auf `max`
   */
  function toDataUrl(im, max, square) {
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');
    ctx.imageSmoothingQuality = 'high';

    if (square) {
      var side = Math.min(im.width, im.height);
      var sx = (im.width - side) / 2;
      var sy = im.height > im.width ? im.height * 0.08 : (im.height - side) / 2;
      if (sy + side > im.height) sy = im.height - side;

      c.width = c.height = Math.min(max, side);
      ctx.drawImage(im, sx, sy, side, side, 0, 0, c.width, c.height);
    } else {
      var scale = Math.min(1, max / Math.max(im.width, im.height));
      c.width = Math.max(1, Math.round(im.width * scale));
      c.height = Math.max(1, Math.round(im.height * scale));
      ctx.drawImage(im, 0, 0, c.width, c.height);
    }

    return c.toDataURL('image/jpeg', JPEG_QUALITY);
  }

  function set(square, portrait) {
    var pr = p();
    pr.avatar = square || null;
    pr.avatarFull = portrait || null;
    G.store.commit('avatar');
  }

  /** Bild entfernen — es erscheint wieder der Platzhalter */
  function remove() {
    var pr = p();
    pr.avatar = null;
    pr.avatarFull = null;
    G.store.commit('avatar');
  }

  /** Ungefähre Größe des gespeicherten Bildes in KB */
  function sizeKb() {
    var pr = p();
    var n = (pr.avatar ? pr.avatar.length : 0) + (pr.avatarFull ? pr.avatarFull.length : 0);
    return n ? Math.round(n * 0.75 / 1024) : 0;
  }

  /**
   * Bildauswahl öffnen und das Ergebnis übernehmen.
   * Wird von jeder Stelle aus verwendet, an der ein Avatar angetippt wird.
   */
  function choose(afterFn) {
    pickFile(function (square, portrait) {
      set(square, portrait);
      u.toast('Bild übernommen', G.store.hasConsent('profile')
        ? 'Dein Avatar bleibt auf diesem Gerät gespeichert.'
        : 'Ohne die Einwilligung „Profil speichern“ ist er nach dem Schließen weg.',
        G.store.hasConsent('profile') ? 'ok' : 'warn', 5000);
      if (afterFn) afterFn();
      else G.app.rerender();
    });
  }

  G.avatar = {
    src: src,
    fullSrc: fullSrc,
    has: has,
    initials: initials,
    render: render,
    renderPortrait: renderPortrait,
    pickFile: pickFile,
    choose: choose,
    set: set,
    remove: remove,
    sizeKb: sizeKb
  };
})(GoFit);
