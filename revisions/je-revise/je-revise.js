/* « Je révise » commun — revisions/je-revise/?cours=<id du catalogue>.
   Lit pas-a-pas/cours.json (où est le cours), puis <dossier>/pas-a-pas/revision.json :
     { titre, surtitre, essentiel:[html…], quiz:[{ q, c:[bonne, piège…], p:[null, pourquoi non…], e, h }], mots_croises }
   et construit L'essentiel, le quiz (six questions au plus, tirées au hasard) et les cartes mémoire.
   Le moteur du quiz et des cartes est celui des pages « je révise » écrites à la main (messagerie-3/).
   « Fait / à faire » : assets/progres.js, clé quiz:<id>. Aucune logique propre à un cours. */
(function () {
  const PAR_QUIZ = 6;
  const el = (tag, cls, txt) => { const n = document.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; };
  const melange = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const id = new URLSearchParams(location.search).get('cours') || '';
  const dit = m => { document.getElementById('resume').replaceChildren(); document.getElementById('resume-note').textContent = m; };
  const json = u => fetch(u).then(r => { if (!r.ok) throw new Error(u); return r.json(); });

  const onglets = ['resume', 'quiz', 'cartes'];
  function montre(nom) {
    onglets.forEach(o => { document.getElementById('t-' + o).setAttribute('aria-selected', o === nom ? 'true' : 'false'); document.getElementById('p-' + o).hidden = o !== nom; });
  }
  onglets.forEach(o => document.getElementById('t-' + o).addEventListener('click', () => montre(o)));

  /* Une question : rend la carte, appelle fin(juste) quand l'élève a répondu. */
  function question(cible, Q, fin) {
    cible.replaceChildren(); cible.append(el('p', 'question', Q.q));
    const ind = el('div', 'indice', 'Indice : ' + (Q.h || '')); ind.hidden = true;
    const liste = el('div', 'choix'), retour = el('div', 'retour'); retour.hidden = true;
    const boutons = [];
    melange(Q.c.map((_, k) => k)).forEach((k, pos) => {
      const b = el('button'); b.type = 'button'; b.dataset.k = k;
      b.append(el('span', 'lettre', 'ABCDEFGH'[pos]), el('span', null, Q.c[k]));
      b.addEventListener('click', () => {
        boutons.forEach(x => { x.disabled = true; if (x.dataset.k === '0') x.classList.add('juste'); else if (x !== b) x.classList.add('estompe'); });
        const juste = k === 0; if (!juste) b.classList.add('faux');
        retour.className = 'retour ' + (juste ? 'juste' : 'faux');
        retour.replaceChildren(el('strong', null, juste ? "Oui, c'est ça." : 'Pas tout à fait.'));
        if (!juste && Q.p && Q.p[k]) retour.append(el('p', null, Q.p[k]));
        if (Q.e) retour.append(el('p', null, Q.e));
        retour.hidden = false; btnInd.disabled = true; fin && fin(juste);
      });
      boutons.push(b); liste.append(b);
    });
    const btnInd = el('button', 'btn vide', 'Un indice'); btnInd.type = 'button'; btnInd.hidden = !Q.h;
    btnInd.addEventListener('click', () => { ind.hidden = false; btnInd.disabled = true; });
    const act = el('div', 'actions'); act.append(btnInd);
    cible.append(liste, ind, retour, act);
    return act;
  }

  function quiz(QUIZ) {
    const zone = document.getElementById('quiz'), total = Math.min(PAR_QUIZ, QUIZ.length);
    let n = 0, resultats = [], tirage = melange(QUIZ).slice(0, total);
    const barre = () => { const b = el('div', 'progres'); tirage.forEach((_, i) => { const s = el('span'); if (i < resultats.length) s.className = resultats[i] ? 'ok' : 'ko'; else if (i === n) s.className = 'fait'; b.append(s); }); return b; };
    (function affiche() {
      zone.replaceChildren(); const wrap = el('div'); wrap.style.cssText = 'display:grid;gap:14px'; zone.append(wrap);
      if (n >= total) {
        const s = resultats.filter(Boolean).length;
        if (window.Progres) Progres.marque('quiz:' + id, 'fait');
        wrap.append(barre(), el('h2', null, 'Ton score'), el('div', 'score', s + ' / ' + total),
          el('p', null, s === total ? 'Tout juste.' : s >= total / 2 ? 'Bien. Relis les cartes des questions ratées, puis recommence.' : 'Relis « L’essentiel », puis recommence.'));
        const act = el('div', 'actions');
        const r = el('button', 'btn plein', 'Recommencer'); r.type = 'button'; r.addEventListener('click', () => { n = 0; resultats = []; tirage = melange(QUIZ).slice(0, total); affiche(); });
        const c = el('button', 'btn vide', 'Réviser avec les cartes'); c.type = 'button'; c.addEventListener('click', () => montre('cartes'));
        act.append(r, c); wrap.append(act); return;
      }
      wrap.append(barre(), el('div', 'numero', 'Question ' + (n + 1) + ' sur ' + total));
      const zq = el('div'); zq.style.cssText = 'display:grid;gap:14px'; wrap.append(zq);
      const act = question(zq, tirage[n], juste => {
        resultats.push(juste);
        const suiv = el('button', 'btn plein', n + 1 < total ? 'Question suivante' : 'Voir mon score'); suiv.type = 'button';
        suiv.addEventListener('click', () => { n++; affiche(); }); act.append(suiv); suiv.focus();
      });
    })();
  }

  function cartes(CARTES) {
    const carte = document.getElementById('carte'); let ic = 0;
    const affiche = () => { const Q = CARTES[ic]; carte.classList.remove('verso');
      document.getElementById('carte-q').textContent = Q.q; document.getElementById('carte-r').textContent = Q.c[0];
      document.getElementById('carte-e').textContent = Q.e || ''; document.getElementById('carte-n').textContent = (ic + 1) + ' / ' + CARTES.length;
      document.getElementById('carte-avant').disabled = ic === 0; document.getElementById('carte-apres').disabled = ic === CARTES.length - 1; };
    const retourne = () => carte.classList.toggle('verso');
    carte.addEventListener('click', retourne); document.getElementById('carte-retourne').addEventListener('click', retourne);
    document.getElementById('carte-avant').addEventListener('click', () => { if (ic > 0) { ic--; affiche(); } });
    document.getElementById('carte-apres').addEventListener('click', () => { if (ic < CARTES.length - 1) { ic++; affiche(); } });
    affiche();
  }

  if (!/^[a-z0-9-]+$/.test(id)) return dit('Ouvre cette page depuis « Révisions et entraînements ».');
  json('../../pas-a-pas/cours.json').then(cat => {
    const c = (cat.cours || []).find(x => x.id === id); if (!c) throw new Error('cours inconnu');
    return json('../../' + c.chemin.replace(/\/?$/, '/') + 'revision.json');
  }).then(R => {
    document.title = R.titre + ' — je révise';
    document.getElementById('surtitre').textContent = R.surtitre || '';
    document.getElementById('titre').textContent = R.titre;
    document.getElementById('resume-titre').textContent = 'L’essentiel en ' + R.essentiel.length + ' lignes';
    /* Le texte de l'essentiel est écrit par le professeur dans la fiche de séquence (gras permis). */
    document.getElementById('resume').replaceChildren(...R.essentiel.map(l => { const li = el('li'), s = el('span'); s.innerHTML = l; li.append(s); return li; }));
    const Q = Array.isArray(R.quiz) ? R.quiz : [], actions = document.getElementById('resume-actions');
    if (Q.length) {
      document.getElementById('t-quiz').hidden = false; document.getElementById('t-cartes').hidden = false;
      document.getElementById('resume-note').textContent = 'Ensuite : le quiz (' + Math.min(PAR_QUIZ, Q.length) + ' questions' + (Q.length > PAR_QUIZ ? ', tirées parmi ' + Q.length + ' : il change à chaque fois' : '') + '), puis les ' + Q.length + ' cartes pour réviser.';
      const b = el('button', 'btn plein', 'Commencer le quiz'); b.type = 'button'; b.addEventListener('click', () => montre('quiz')); actions.append(b);
      quiz(Q); cartes(Q);
      if (window.Progres) Progres.marque('quiz:' + id, 'commence');
    }
    if (R.mots_croises) { const a = el('a', 'btn vide', 'Faire les mots croisés'); a.href = '../../mots-croises/?cours=' + id; actions.append(a); }
    const h = location.hash.slice(1); if (onglets.includes(h) && !document.getElementById('t-' + h).hidden) montre(h);
  }).catch(() => dit('Cette révision n’existe pas encore. Reviens par « Révisions et entraînements ».'));
})();
