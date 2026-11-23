(() => {
/* Associe l'image — ?jeu=docs ouvre un jeu ; sans rien, la page les propose tous.
   Une manche = six paires tirées au hasard : je clique un dessin, puis son nom (ou l'inverse).
   Rien n'est envoyé ; la manche réussie est seulement notée dans ce navigateur (assets/progres.js). */
const $ = id => document.getElementById(id);
const el = (tag, cls, texte) => { const n = document.createElement(tag); if (cls) n.className = cls; if (texte != null) n.textContent = texte; return n; };
const MANCHE = 6;
function melange(a) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }

fetch('jeux.json').then(r => r.ok ? r.json() : Promise.reject()).then(d => {
  $('attente').hidden = true;
  const id = new URLSearchParams(location.search).get('jeu') || '';
  const jeu = Object.prototype.hasOwnProperty.call(d.jeux, id) ? d.jeux[id] : null;
  if (!jeu) return choix(d.jeux);
  document.title = 'Associe l\'image — ' + jeu.titre;
  $('titre').textContent = jeu.titre;
  $('consigne').textContent = jeu.sujet + ' Clique un dessin, puis son nom.';
  $('partie').hidden = false;
  try { Progres.marque('associe:' + id, 'commence'); } catch (e) {}
  manche(id, jeu);
  $('encore').addEventListener('click', () => manche(id, jeu));
}).catch(() => { $('attente').hidden = true; $('panne').hidden = false; });

function choix(jeux) {
  for (const [id, j] of Object.entries(jeux)) {
    const a = el('a', 'carte'); a.href = '?jeu=' + encodeURIComponent(id);
    a.append(el('b', null, j.titre), el('span', null, j.sujet + ' · ' + j.paires.length + ' images'));
    $('liste').append(a);
  }
  $('choix').hidden = false;
}

function manche(id, jeu) {
  const paires = melange(jeu.paires).slice(0, MANCHE);
  const images = $('images'), noms = $('noms'), etat = $('etat');
  images.replaceChildren(); noms.replaceChildren();
  etat.textContent = ''; etat.classList.remove('fini'); $('encore').hidden = true;
  let choisie = null, trouvees = 0, erreurs = 0;

  const carte = (paire, genre, n) => {
    const b = el('button', 'tuile ' + genre); b.type = 'button';
    if (genre === 'image') { b.innerHTML = IconesAssocie.dessin(paire.image); b.setAttribute('aria-label', 'Dessin ' + n); }
    else b.textContent = paire.nom;
    b.addEventListener('click', () => clic({ b, paire, genre }));
    return b;
  };
  function clic(c) {
    if (c.b.disabled) return;
    if (choisie && choisie.b === c.b) { c.b.classList.remove('choisie'); choisie = null; return; }
    if (!choisie || choisie.genre === c.genre) {          // premier clic, ou je change d'avis dans la même colonne
      if (choisie) choisie.b.classList.remove('choisie');
      choisie = c; c.b.classList.add('choisie'); return;
    }
    const autre = choisie; choisie = null; autre.b.classList.remove('choisie');
    if (autre.paire === c.paire) {
      for (const x of [autre, c]) { x.b.classList.remove('rate'); x.b.classList.add('trouvee'); x.b.disabled = true; }
      trouvees++;
      etat.textContent = '✓ ' + c.paire.nom + ' : ' + c.paire.aide;
      if (trouvees === paires.length) fin();
    } else {
      erreurs++;
      for (const x of [autre, c]) { x.b.classList.add('rate'); setTimeout(() => x.b.classList.remove('rate'), 700); }
      etat.textContent = 'Pas ces deux-là. Regarde bien le dessin, puis réessaie.';
    }
  }
  function fin() {
    etat.classList.add('fini');
    etat.textContent = 'Manche réussie : ' + paires.length + ' paires, ' + (erreurs ? erreurs + ' erreur' + (erreurs > 1 ? 's' : '') : 'sans erreur') + '.';
    $('encore').hidden = false;
    try { Progres.marque('associe:' + id, 'fait'); } catch (e) {}
  }
  paires.forEach((p, i) => images.append(carte(p, 'image', i + 1)));
  melange(paires).forEach(p => noms.append(carte(p, 'nom')));
}
})();
