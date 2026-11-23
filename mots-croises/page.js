(() => {
/* Mots croisés — la page. ?cours=python-1 ouvre la grille de ce cours (le jeu est dans jeu.js) ;
   sans rien, la page propose toutes les grilles, rangées par année. */
const $ = id => document.getElementById(id);
const el = (tag, cls, texte) => { const n = document.createElement(tag); if (cls) n.className = cls; if (texte != null) n.textContent = texte; return n; };
const ANNEES = { 1: '1re année', 2: '2e année', 3: '3e année' };

fetch('grilles.json').then(r => r.ok ? r.json() : Promise.reject()).then(d => {
  $('attente').hidden = true;
  const id = new URLSearchParams(location.search).get('cours') || '';
  const g = Object.prototype.hasOwnProperty.call(d.grilles, id) ? d.grilles[id] : null;
  if (!g) return choix(d.grilles);
  document.title = 'Mots croisés — ' + g.titre;
  $('surtitre').textContent = 'Je révise · mots croisés';
  $('titre').textContent = g.titre;
  MotsCroises.monte($('jeu'), id, g);
  $('partie').hidden = false;
}).catch(() => { $('attente').hidden = true; $('panne').hidden = false; });

function choix(grilles) {
  const liste = $('liste');
  for (const niveau of Object.keys(ANNEES)) {
    const du = Object.entries(grilles).filter(([, g]) => String(g.niveau) === niveau);
    if (!du.length) continue;
    liste.append(el('h2', null, ANNEES[niveau]));
    for (const [id, g] of du) {
      const a = el('a', 'carte'); a.href = '?cours=' + encodeURIComponent(id);
      a.append(el('b', null, g.titre), el('span', null, g.sujet + ' · ' + g.mots.length + ' mots'));
      liste.append(a);
    }
  }
  $('choix').hidden = false;
}
})();
