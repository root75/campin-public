(() => {
/* Mots croisés — le jeu, qui se monte dans n'importe quelle page : MotsCroises.monte(boîte, idDuCours, grille).
   La page mots-croises/ s'en sert, et le portail aussi, pour jouer sans changer de page.
   grilles.json donne les mots de chaque cours, grille.js calcule leur place, jeu.css l'habille.
   Ce que l'élève tape reste dans son navigateur (pour reprendre plus tard) : rien n'est envoyé nulle part. */
const SITE = 'https://root75.github.io/campin-public/';
const el = (tag, cls, texte) => { const n = document.createElement(tag); if (cls) n.className = cls; if (texte != null) n.textContent = texte; return n; };
const avec = (n, nom) => { n.dataset.mc = nom; return n; };

/** Le squelette du jeu : la grille et ses boutons à gauche, les indices à droite, puis « Ça coince ? ». */
function squelette() {
  const f = document.createDocumentFragment();
  const jeu = el('div', 'mc-jeu');
  const cote = el('section', 'mc-cote'); cote.setAttribute('aria-label', 'La grille');
  const actif = avec(el('p', 'mc-indice-actif'), 'indice-actif'); actif.setAttribute('aria-live', 'polite');
  const cadre = el('div', 'mc-cadre'), grille = avec(el('div', 'mc-grille'), 'grille');
  grille.setAttribute('role', 'group'); grille.setAttribute('aria-label', 'Grille de mots croisés'); cadre.append(grille);
  const actions = el('div', 'mc-actions');
  for (const [nom, cls, texte] of [['verifier', 'mc-btn', 'Vérifier ma grille'], ['lettre', 'mc-btn mc-vide', 'Donne-moi une lettre'], ['recommencer', 'mc-btn mc-vide', 'Recommencer']]) {
    const b = avec(el('button', cls, texte), nom); b.type = 'button'; actions.append(b);
  }
  const etat = avec(el('p', 'mc-etat'), 'etat'); etat.setAttribute('role', 'status');
  cote.append(actif, cadre, actions, etat);
  const indices = el('section', 'mc-indices'); indices.setAttribute('aria-label', 'Les indices');
  for (const [nom, titre] of [['indices-h', 'Horizontalement →'], ['indices-v', 'Verticalement ↓']]) {
    const d = el('div'); d.append(el('h3', null, titre), avec(el('ol'), nom)); indices.append(d);
  }
  jeu.append(cote, indices);
  const coince = el('section', 'mc-coince'); coince.append(el('h3', null, 'Ça coince ?'));
  const ul = el('ul');
  const ligne = (gras, suite) => { const li = el('li'); li.append(el('b', null, gras), ' ' + suite); ul.append(li); return li; };
  ligne('Je ne trouve pas un mot.', 'Passe au suivant : ses lettres vont t\'aider par croisement.');
  ligne('Mon mot ne rentre pas.', 'Compte les cases : le nombre de lettres est écrit à droite de l\'indice. Pas d\'accent, pas d\'espace, pas de tiret.');
  ligne('Je veux changer de sens.', 'Clique une deuxième fois sur la même case.');
  const bloque = ligne('Je suis bloqué·e.', 'Rouvre ');
  const lien = avec(el('a', null, 'le « je révise » du cours'), 'lien-revision'); lien.href = SITE + 'revisions/'; lien.target = '_top';
  bloque.append(lien, ', ou demande à ton voisin : il explique, il ne tape pas à ta place.');
  ligne('Toujours bloqué·e.', 'Clique sur une case, puis sur « Donne-moi une lettre ».');
  coince.append(ul);
  f.append(jeu, coince);
  return f;
}

/* ----- Une grille. ----- */
function monte(racine, id, g, options) {
  options = options || {};
  racine.classList.add('mc');
  racine.replaceChildren(squelette());
  const $ = nom => racine.querySelector('[data-mc="' + nom + '"]');
  const grille = GrilleMotsCroises.construit(g.mots, id);
  const mots = grille.mots;
  if (g.revision) $('lien-revision').href = SITE + g.revision;

  // Les cases : pour chacune, sa lettre attendue et le mot horizontal / vertical qui passe par elle.
  const cases = new Map();
  const cle = (x, y) => x + ',' + y;
  mots.forEach((m, n) => {
    m.cases = [];
    for (let i = 0; i < m.mot.length; i++) {
      const x = m.sens === 'h' ? m.x + i : m.x, y = m.sens === 'h' ? m.y : m.y + i;
      const c = cases.get(cle(x, y)) || { x, y, lettre: m.mot[i], h: null, v: null, donnee: false };
      c[m.sens] = n; cases.set(cle(x, y), c); m.cases.push(c);
    }
  });

  const zone = $('grille');
  zone.style.setProperty('--colonnes', grille.largeur);
  for (const c of cases.values()) {
    const boite = el('div', 'mc-case');
    boite.style.gridColumn = c.x + 1; boite.style.gridRow = c.y + 1;
    const depart = mots.find(m => m.x === c.x && m.y === c.y);
    if (depart) boite.append(el('span', 'mc-num', depart.numero));
    const champ = el('input');
    champ.type = 'text'; champ.maxLength = 1; champ.autocomplete = 'off'; champ.autocapitalize = 'characters'; champ.spellcheck = false;
    champ.setAttribute('inputmode', 'text');
    champ.setAttribute('aria-label', 'Ligne ' + (c.y + 1) + ', colonne ' + (c.x + 1));
    boite.append(champ); zone.append(boite);
    c.boite = boite; c.champ = champ;
  }

  // Les indices, dans deux listes.
  mots.forEach((m, n) => {
    const li = el('li'), b = el('button'); b.type = 'button';
    b.append(el('b', null, m.numero + '.'), el('span', 'mc-texte', m.indice), el('span', 'mc-long', m.mot.length + ' lettres'));
    b.addEventListener('click', () => { choisit(n); (m.cases.find(c => !c.champ.value) || m.cases[0]).champ.focus(); });
    li.append(b); $(m.sens === 'h' ? 'indices-h' : 'indices-v').append(li);
    m.li = li; m.bouton = b;
  });

  let actif = 0, aides = 0, fini = false;
  const memoire = 'mots-croises:' + id;

  function choisit(n) {
    actif = n;
    for (const c of cases.values()) c.boite.classList.toggle('mc-du-mot', mots[n].cases.includes(c));
    mots.forEach((m, i) => m.bouton.setAttribute('aria-current', i === n ? 'true' : 'false'));
    const m = mots[n], zoneIndice = $('indice-actif');
    zoneIndice.replaceChildren(m.numero + '. ' + m.indice, el('small', null, (m.sens === 'h' ? 'Horizontalement →' : 'Verticalement ↓') + ' · ' + m.mot.length + ' lettres'));
  }
  /** Le mot à suivre quand on arrive sur une case : celui en cours s'il y passe, sinon l'autre. */
  function motDe(c, bascule) {
    const a = mots[actif];
    if (c.h !== null && c.v !== null) {
      if (bascule) return a.sens === 'h' ? c.v : c.h;
      return a.sens === 'h' ? c.h : c.v;
    }
    return c.h !== null ? c.h : c.v;
  }
  function voisine(c, pas) {
    const liste = mots[actif].cases, i = liste.indexOf(c);
    return liste[i + pas] || null;
  }
  function garde() {
    try {
      localStorage.setItem(memoire, JSON.stringify({ lettres: [...cases.entries()].map(([k, c]) => [k, c.champ.value, c.donnee]), aides }));
    } catch (e) {}
  }
  function efface(c) { c.boite.classList.remove('mc-bon', 'mc-pas-bon'); }
  function trouves() {
    mots.forEach(m => m.li.classList.toggle('mc-trouve', m.verifie === true && m.cases.every(c => c.champ.value === c.lettre)));
  }

  for (const c of cases.values()) {
    const champ = c.champ;
    champ.addEventListener('focus', () => { if (!mots[actif].cases.includes(c)) choisit(motDe(c)); champ.select(); });
    champ.addEventListener('click', () => {
      // Un deuxième clic sur la même case change de sens.
      if (c.dernierClic && c.h !== null && c.v !== null) choisit(motDe(c, true));
      for (const autre of cases.values()) autre.dernierClic = autre === c;
    });
    champ.addEventListener('input', () => {
      const lettre = GrilleMotsCroises.normalise(champ.value).slice(-1);
      champ.value = lettre; efface(c); c.donnee = false; c.boite.classList.remove('mc-donnee');
      mots.forEach(m => { if (m.cases.includes(c)) m.verifie = false; }); trouves();
      if (fini) { fini = false; $('etat').textContent = ''; $('etat').classList.remove('mc-fini'); }
      garde();
      if (lettre) { const s = voisine(c, 1); if (s) s.champ.focus(); }
    });
    champ.addEventListener('keydown', e => {
      const va = (dx, dy) => { const s = cases.get(cle(c.x + dx, c.y + dy)); if (s) { e.preventDefault(); s.champ.focus(); } };
      if (e.key === 'ArrowRight') va(1, 0);
      else if (e.key === 'ArrowLeft') va(-1, 0);
      else if (e.key === 'ArrowDown') va(0, 1);
      else if (e.key === 'ArrowUp') va(0, -1);
      else if (e.key === 'Backspace' && !champ.value) { const p = voisine(c, -1); if (p) { e.preventDefault(); p.champ.value = ''; efface(p); p.champ.focus(); garde(); } }
      else if (e.key === ' ') { e.preventDefault(); if (c.h !== null && c.v !== null) choisit(motDe(c, true)); }
      else if (e.key === 'Enter') { e.preventDefault(); verifie(); }
    });
  }

  function verifie() {
    let pleines = 0, bonnes = 0;
    for (const c of cases.values()) {
      const v = c.champ.value;
      c.boite.classList.toggle('mc-bon', !!v && v === c.lettre);
      c.boite.classList.toggle('mc-pas-bon', !!v && v !== c.lettre);
      if (v) pleines++; if (v === c.lettre) bonnes++;
    }
    mots.forEach(m => { m.verifie = true; }); trouves();
    const total = cases.size, nbMots = mots.filter(m => m.li.classList.contains('mc-trouve')).length;
    const etat = $('etat');
    fini = bonnes === total;
    if (fini) { try { if (globalThis.Progres) Progres.marque('mots-croises:' + id, 'fait'); } catch (e) {} if (options.fini) options.fini(aides); }
    etat.classList.toggle('mc-fini', fini);
    if (fini) etat.textContent = 'Bravo, grille terminée : ' + mots.length + ' mots sur ' + mots.length + (aides ? ', avec ' + aides + ' lettre' + (aides > 1 ? 's' : '') + ' donnée' + (aides > 1 ? 's' : '') + '.' : ', sans aucune lettre donnée.');
    else if (!pleines) etat.textContent = 'La grille est vide : clique sur un indice et tape le mot.';
    else etat.textContent = nbMots + ' mot' + (nbMots > 1 ? 's' : '') + ' sur ' + mots.length + (pleines > bonnes ? '. Les cases en pointillés sont à revoir.' : '. Continue !');
  }
  $('verifier').addEventListener('click', verifie);

  $('lettre').addEventListener('click', () => {
    // La case où l'on est si elle est vide ou fausse, sinon la première case à compléter du mot en cours.
    const ici = [...cases.values()].find(c => c.champ === document.activeElement || c.dernierClic);
    const manque = c => c.champ.value !== c.lettre;
    const c = (ici && manque(ici) && ici) || mots[actif].cases.find(manque) || [...cases.values()].find(manque);
    if (!c) return;
    c.champ.value = c.lettre; c.donnee = true; c.boite.classList.add('mc-donnee'); efface(c); aides++; garde();
    const s = mots[actif].cases.find(manque); (s || c).champ.focus();
  });

  $('recommencer').addEventListener('click', () => {
    for (const c of cases.values()) { c.champ.value = ''; c.donnee = false; c.boite.classList.remove('mc-bon', 'mc-pas-bon', 'mc-donnee'); }
    mots.forEach(m => { m.verifie = false; }); trouves();
    aides = 0; fini = false; $('etat').textContent = ''; $('etat').classList.remove('mc-fini');
    try { localStorage.removeItem(memoire); } catch (e) {}
    choisit(0); mots[0].cases[0].champ.focus();
  });

  // Reprise : ce que l'élève avait déjà tapé sur ce navigateur.
  try {
    const v = JSON.parse(localStorage.getItem(memoire) || 'null');
    if (v && Array.isArray(v.lettres)) {
      for (const [k, lettre, donnee] of v.lettres) {
        const c = cases.get(k); if (!c) continue;
        c.champ.value = GrilleMotsCroises.normalise(lettre).slice(0, 1);
        if (donnee && c.champ.value === c.lettre) { c.donnee = true; c.boite.classList.add('mc-donnee'); }
      }
      aides = Number(v.aides) || 0;
    }
  } catch (e) {}

  choisit(0);
  try { if (globalThis.Progres) Progres.marque('mots-croises:' + id, 'commence'); } catch (e) {}
}

globalThis.MotsCroises = { monte };
})();
