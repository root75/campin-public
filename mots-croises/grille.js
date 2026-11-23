/* Mots croisés — le calcul de la grille, sans écran : il tourne aussi dans les essais (node tests/mots-croises.cjs).
   On donne une liste de mots et leurs indices ; il rend leur place, leur sens et leur numéro.
   La même liste et la même graine donnent toujours la même grille : l'élève retrouve la sienne en revenant. */
(function (racine) {
  /** PYTHON, HAMECONNAGE… : majuscules, sans accent ni espace, comme on l'écrit dans une grille. */
  function normalise(mot) {
    return String(mot).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  }
  /** Un hasard qui se rejoue : la graine fixe la suite des tirages. */
  function hasard(graine) {
    let a = graine >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function graineDe(texte) {
    let h = 2166136261;
    for (const c of String(texte)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  const cle = (x, y) => x + ',' + y;

  /** Un essai : on pose le premier mot, puis chaque mot là où il croise le plus de lettres déjà posées. */
  function essai(mots, tirage) {
    const cases = new Map();            // "x,y" -> { lettre, h, v } : h / v = la case appartient déjà à un mot de ce sens
    const poses = [];
    const pose = (m, x, y, sens) => {
      for (let i = 0; i < m.mot.length; i++) {
        const k = sens === 'h' ? cle(x + i, y) : cle(x, y + i);
        const c = cases.get(k) || { lettre: m.mot[i], h: false, v: false };
        c[sens] = true; cases.set(k, c);
      }
      poses.push({ mot: m.mot, indice: m.indice, x, y, sens });
    };
    /** Le nombre de croisements si le mot tient à cet endroit, sinon -1. */
    const croisements = (mot, x, y, sens) => {
      const dx = sens === 'h' ? 1 : 0, dy = sens === 'h' ? 0 : 1;
      if (cases.has(cle(x - dx, y - dy)) || cases.has(cle(x + dx * mot.length, y + dy * mot.length))) return -1;
      let n = 0;
      for (let i = 0; i < mot.length; i++) {
        const cx = x + dx * i, cy = y + dy * i, c = cases.get(cle(cx, cy));
        if (c) {
          if (c.lettre !== mot[i] || c[sens]) return -1;
          n++;
        } else if (cases.has(cle(cx + dy, cy + dx)) || cases.has(cle(cx - dy, cy - dx))) return -1;   // pas de mots collés côte à côte
      }
      return n;
    };
    const cadre = () => {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const k of cases.keys()) { const [x, y] = k.split(',').map(Number); x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
      return { x0, y0, x1, y1 };
    };
    const tente = m => {
      let mieux = null;
      const b = cadre();
      for (const [k, c] of cases) {
        const [cx, cy] = k.split(',').map(Number);
        for (let i = 0; i < m.mot.length; i++) {
          if (m.mot[i] !== c.lettre) continue;
          for (const sens of ['h', 'v']) {
            if (c[sens]) continue;
            const x = sens === 'h' ? cx - i : cx, y = sens === 'h' ? cy : cy - i;
            const n = croisements(m.mot, x, y, sens);
            if (n < 1) continue;
            const fx = sens === 'h' ? x + m.mot.length - 1 : x, fy = sens === 'h' ? y : y + m.mot.length - 1;
            const l = Math.max(b.x1, fx) - Math.min(b.x0, x) + 1, h = Math.max(b.y1, fy) - Math.min(b.y0, y) + 1;
            // Une grille plutôt carrée, pas trop large : elle doit tenir sur un écran étroit.
            const note = n * 100 - l * h - Math.max(0, l - 13) * 40 - Math.max(0, h - 14) * 30 + tirage() * 3;
            if (!mieux || note > mieux.note) mieux = { x, y, sens, note };
          }
        }
      }
      if (mieux) pose(m, mieux.x, mieux.y, mieux.sens);
      return !!mieux;
    };
    pose(mots[0], 0, 0, tirage() < 0.5 ? 'h' : 'v');
    let attente = mots.slice(1), avance = true;
    while (attente.length && avance) {
      avance = false;
      const reste = [];
      for (const m of attente) { if (tente(m)) avance = true; else reste.push(m); }
      attente = reste;
    }
    const b = cadre();
    return { poses, oublies: attente.map(m => m.mot), largeur: b.x1 - b.x0 + 1, hauteur: b.y1 - b.y0 + 1, x0: b.x0, y0: b.y0 };
  }

  /** La meilleure grille de plusieurs essais : d'abord tous les mots, ensuite la plus ramassée.
   *  mots : [{ mot, indice }]. Rend { largeur, hauteur, mots: [{ mot, indice, x, y, sens, numero }], oublies }. */
  function construit(mots, graine) {
    const propres = mots.map(m => ({ mot: normalise(m.mot), indice: String(m.indice || '') })).filter(m => m.mot.length > 1);
    if (!propres.length) return { largeur: 0, hauteur: 0, mots: [], oublies: [] };
    const tirage = hasard(typeof graine === 'number' ? graine : graineDe(graine == null ? propres.map(m => m.mot).join('|') : graine));
    let mieux = null;
    for (let t = 0; t < 120; t++) {
      const ordre = propres.map(m => ({ m, r: m.mot.length + tirage() * 4 })).sort((a, b) => b.r - a.r).map(o => o.m);
      const e = essai(ordre, tirage);
      const note = e.poses.length * 10000 - e.largeur * e.hauteur - Math.max(0, e.largeur - 13) * 500 - Math.max(0, e.hauteur - 14) * 300;
      if (!mieux || note > mieux.note) mieux = Object.assign(e, { note });
    }
    const places = mieux.poses.map(p => Object.assign({}, p, { x: p.x - mieux.x0, y: p.y - mieux.y0 }));
    // Numéros comme dans un journal : de gauche à droite, de haut en bas ; un même numéro pour deux mots qui partent de la même case.
    const departs = [...new Set(places.map(p => p.y * 1000 + p.x))].sort((a, b) => a - b);
    places.forEach(p => { p.numero = departs.indexOf(p.y * 1000 + p.x) + 1; });
    places.sort((a, b) => a.numero - b.numero || (a.sens < b.sens ? -1 : 1));
    return { largeur: mieux.largeur, hauteur: mieux.hauteur, mots: places, oublies: mieux.oublies };
  }

  const api = { normalise, construit, hasard, graineDe };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else racine.GrilleMotsCroises = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
