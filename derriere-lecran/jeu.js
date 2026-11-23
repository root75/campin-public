(() => {
/* Derrière l'écran — je m'entraîne. Une manche = quatre situations tirées au hasard, chacune en trois temps :
   je perçois (une émotion de la roue, sans bonne ni mauvaise réponse), je comprends, j'ajuste (un choix, avec son retour).
   Rien n'est envoyé ; la manche finie est seulement notée dans ce navigateur (assets/progres.js). */
const MANCHE = 4;
function melange(a, hasard = Math.random) { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(hasard() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; }
/** Les situations d'une manche : jamais deux fois la même, et d'abord celles qu'on n'a pas encore vues. */
function tirage(situations, vues, n = MANCHE, hasard = Math.random) {
  const neuves = melange(situations.filter(s => !vues.includes(s.id)), hasard), deja = melange(situations.filter(s => vues.includes(s.id)), hasard);
  return neuves.concat(deja).slice(0, n);
}
/** Le bilan d'une manche : seuls « comprendre » et « ajuster » comptent, au premier essai. */
function bilan(resultats) {
  const du1er = cle => resultats.filter(r => r[cle] === 1).length;
  return { situations: resultats.length, comprendre: du1er('comprendre'), ajuster: du1er('ajuster') };
}
if (typeof module !== 'undefined') module.exports = { tirage, bilan, melange, MANCHE };
if (typeof document === 'undefined') return;

const $ = id => document.getElementById(id);
const el = (tag, cls, texte) => { const n = document.createElement(tag); if (cls) n.className = cls; if (texte != null) n.textContent = texte; return n; };
const SUIVI = 'derriere-lecran:manche';
/* Les personnages et la roue viennent d'emotions.js (du SVG écrit par le site, jamais un texte venu d'ailleurs).
   Si ce fichier n'a pas chargé, la page marche quand même : pastilles de couleur et boutons. */
const E = window.Emotions;
const dessin = (html, cls) => { const n = el('span', cls); n.innerHTML = html; return n; };
const perso = (e, taille) => E ? dessin(E.visage(e.id, e.couleur, taille)) : pastille(e);
const pastille = e => { const p = el('span', 'pastille'); p.style.background = e.couleur; p.setAttribute('aria-hidden', 'true'); return p; };

fetch('situations.json').then(r => r.ok ? r.json() : Promise.reject()).then(d => {
  $('attente').hidden = true; $('contenu').hidden = false;
  roue($('roue'), d.emotions);
  if (E) { $('bande').append(dessin(E.bande(d.emotions))); $('roue-dessin').append(dessin(E.roue(d.emotions), 'roue-jeu')); }
  let vues = [];
  const lance = () => {
    const tirees = tirage(d.situations, vues);
    vues = vues.concat(tirees.map(s => s.id)); if (vues.length >= d.situations.length) vues = tirees.map(s => s.id);
    try { Progres.marque(SUIVI, 'commence'); } catch (e) {}
    joue(d, tirees, lance);
  };
  $('jouer').addEventListener('click', lance);
  if (location.hash === '#jeu') $('jeu').scrollIntoView();
}).catch(() => { $('attente').hidden = true; $('panne').hidden = false; });

/** La roue, à lire : une ligne par famille. */
function roue(zone, emotions) {
  for (const e of emotions) {
    const li = el('li'); li.append(perso(e, 34), el('b', null, e.nom), el('span', 'doux', ' ' + e.nuances)); zone.append(li);
  }
}

function scene(s) {
  const c = el('div', 'ecran-dessin'); c.setAttribute('role', 'group');
  const haut = el('div', 'haut');
  if (s.genre === 'publication') {
    c.setAttribute('aria-label', 'Une publication en ligne');
    haut.append(el('b', null, s.compte), el('span', null, 'publication'));
    const p = el('div', 'publi'); p.append(el('span', 'texte', s.texte), el('span', 'bas', s.bas)); c.append(haut, p);
    return c;
  }
  c.setAttribute('aria-label', 'Une discussion en ligne');
  haut.append(el('b', null, s.lieu), el('span', null, s.detail));
  const fil = el('div', 'fil');
  for (const m of s.messages) {
    if (m.info) { fil.append(el('span', 'info-fil', m.info)); continue; }
    const b = el('span', 'bulle-msg' + (m.moi ? ' moi' : '') + (m.brouillon ? ' brouillon' : ''));
    b.append(el('span', 'qui', m.de), document.createTextNode(m.texte), el('span', 'heure', m.heure));
    fil.append(b);
  }
  c.append(haut, fil); return c;
}

function joue(d, tirees, rejouer) {
  const zone = $('partie'), nomDe = id => (d.emotions.find(e => e.id === id) || {}).nom || '';
  const resultats = [], percues = [];
  $('accueil-jeu').hidden = true; zone.hidden = false;
  let rang = 0;

  function situation() {
    const s = tirees[rang], r = { comprendre: 0, ajuster: 0 };
    zone.replaceChildren();
    zone.append(el('p', 'surtitre', 'Situation ' + (rang + 1) + ' sur ' + tirees.length), el('h3', null, s.titre), scene(s.scene));
    const temps = el('div', 'temps'); zone.append(temps);
    percevoir();

    function entete(n, verbe, question) {
      const t = el('section', 'temps-bloc'); t.append(el('p', 'verbe', n + ' · ' + verbe), el('p', 'question', question));
      temps.append(t); t.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); return t;
    }
    function suite(t, libelle, quoi) { const b = el('button', 'btn', libelle); b.type = 'button'; b.addEventListener('click', () => { b.remove(); quoi(); }); t.append(b); b.focus(); }

    function percevoir() {
      const t = entete(1, 'Je perçois', s.percevoir.question);
      const retour = el('p', 'retour percu'); retour.setAttribute('role', 'status');
      const choisie = e => {
        percues.push(e.id);
        retour.replaceChildren(perso(e, 64), el('span', null, 'Tu as choisi : ' + e.nom.toLowerCase() + '. ' + s.percevoir.pourquoi));
        suite(t, 'Continuer', () => choix(2, 'Je comprends', s.comprendre, 'comprendre', () => choix(3, 'J’ajuste', s.ajuster, 'ajuster', retenir)));
      };
      if (E) {
        t.append(el('p', 'doux', 'Clique sur une famille de la roue pour la découvrir, puis sur « Je choisis ». Ici, il n’y a pas de mauvaise réponse.'));
        const r = dessin(E.roue(d.emotions, { choisir: true }), 'roue-jeu');
        r.addEventListener('emotion-choisie', ev => choisie(d.emotions.find(e => e.id === ev.detail.id)));
        t.append(r, retour); return;
      }
      t.append(el('p', 'doux', 'Clique sur une famille d’émotions. Ici, il n’y a pas de mauvaise réponse.'));
      const g = el('div', 'familles'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', 'Les huit familles d’émotions');
      for (const e of d.emotions) {
        const b = el('button', 'famille'); b.type = 'button';
        b.append(pastille(e), el('b', null, e.nom), el('span', 'doux', e.nuances));
        b.addEventListener('click', () => { g.querySelectorAll('button').forEach(x => { x.disabled = true; }); b.classList.add('choisie'); choisie(e); });
        g.append(b);
      }
      t.append(g, retour);
    }

    function choix(n, verbe, q, cle, apres) {
      const t = entete(n, verbe, q.question), liste = el('div', 'choix'), retour = el('p', 'retour'); retour.setAttribute('role', 'status');
      let essais = 0;
      for (const c of melange(q.choix)) {
        const b = el('button', 'tuile', c.texte); b.type = 'button';
        b.addEventListener('click', () => {
          essais++;
          retour.textContent = (c.bon ? '✓ ' : '') + c.retour;
          retour.className = 'retour ' + (c.bon ? 'juste' : 'faux');
          if (c.bon) {
            b.classList.add('trouvee'); liste.querySelectorAll('button').forEach(x => { x.disabled = true; });
            r[cle] = essais; suite(t, 'Continuer', apres);
          } else { b.classList.add('rate'); b.disabled = true; }
        });
        liste.append(b);
      }
      t.append(liste, retour);
    }

    function retenir() {
      resultats.push(r);
      const t = el('section', 'temps-bloc retenir');
      t.append(el('p', 'verbe', 'À retenir'), el('p', 'question', s.retenir));
      const a = el('p', 'attendu'); a.append(el('b', null, 'Ce que demande le cours de numérique : '), document.createTextNode('« ' + d.attendus[s.attendu] + ' »'));
      t.append(a); temps.append(t);
      suite(t, rang + 1 < tirees.length ? 'Situation suivante' : 'Voir mon bilan', () => { rang++; rang < tirees.length ? situation() : fin(); });
      t.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  function fin() {
    const b = bilan(resultats);
    zone.replaceChildren();
    zone.append(el('h3', null, 'Manche terminée'));
    const ul = el('ul', 'bilan');
    ul.append(el('li', null, 'Je comprends : ' + b.comprendre + ' sur ' + b.situations + ' du premier coup.'),
      el('li', null, 'J’ajuste : ' + b.ajuster + ' sur ' + b.situations + ' du premier coup.'),
      el('li', null, 'Les émotions que tu as repérées : ' + [...new Set(percues)].map(nomDe).join(', ').toLowerCase() + '.'));
    const vues = el('p', 'percues'); for (const id of new Set(percues)) vues.append(perso(d.emotions.find(e => e.id === id), 56));
    zone.append(ul, vues, el('p', 'doux', 'Pour les émotions, il n’y avait pas de bonne réponse : deux personnes peuvent ressentir deux choses différentes devant le même message.'));
    const encore = el('button', 'btn', 'Une autre manche'); encore.type = 'button'; encore.addEventListener('click', rejouer);
    zone.append(encore); encore.focus();
    try { Progres.marque(SUIVI, 'fait'); } catch (e) {}
  }
  situation();
  zone.scrollIntoView({ block: 'start', behavior: 'smooth' });
}
})();
