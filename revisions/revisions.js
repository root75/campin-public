(() => {
/* Révisions — la page se construit depuis revisions.json : une carte par cours, ses activités, et « fait / à faire ».
   L'avancement vient de assets/progres.js : il vit dans ce navigateur, rien n'est enregistré ailleurs. */
const ANNEES = { 1: '1re année', 2: '2e année', 3: '3e année' };
const MARQUES = { fait: ['✓', 'fait'], commence: ['●', 'commencé'], '': ['○', 'à faire'] };

/** Combien d'activités suivies sont faites dans ce cours. */
function compte(activites, etat) {
  const suivies = (Array.isArray(activites) ? activites : []).filter(a => a && typeof a.suivi === 'string');
  return { faits: suivies.filter(a => etat(a.suivi) === 'fait').length, total: suivies.length };
}
/** Seulement un chemin du site : jamais une autre adresse, jamais un retour en arrière dans les dossiers. */
function cheminSur(chemin) {
  return typeof chemin === 'string' && /^[a-z0-9][a-z0-9\-\/.]*(\?(cours|jeu)=[a-z0-9\-]+)?(#[a-z]+)?$/.test(chemin) && !chemin.includes('..');
}
/** L'année à montrer : celle de l'adresse (?niveau=2), sinon la dernière choisie, sinon la première qui a des cours. */
function anneeDe(recherche, gardee, disponibles) {
  const voulue = Number(new URLSearchParams(recherche).get('niveau')) || Number(gardee) || 0;
  return disponibles.includes(voulue) ? voulue : disponibles[0];
}
const api = { compte, cheminSur, anneeDe };
if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
globalThis.Revisions = api;

const $ = id => document.getElementById(id);
const el = (tag, cls, texte) => { const n = document.createElement(tag); if (cls) n.className = cls; if (texte != null) n.textContent = texte; return n; };
const etat = cle => { try { return Progres.etat(cle); } catch (e) { return ''; } };

fetch('revisions.json').then(r => r.ok ? r.json() : Promise.reject()).then(d => {
  const cours = Object.entries(d.cours || {});
  const autres = Array.isArray(d.autres) ? d.autres : [];
  const disponibles = Object.keys(ANNEES).map(Number).filter(n => cours.some(([, c]) => c.niveau === n));
  let gardee = ''; try { gardee = localStorage.getItem('revisions-niveau') || ''; } catch (e) {}
  let annee = anneeDe(location.search, gardee, disponibles);

  const onglets = $('annees');
  for (const n of disponibles) {
    const b = el('button', null, ANNEES[n]); b.type = 'button'; b.dataset.niveau = n;
    b.addEventListener('click', () => { annee = n; try { localStorage.setItem('revisions-niveau', n); } catch (e) {} affiche(); });
    onglets.append(b);
  }

  function activite(a) {
    if (!a || !cheminSur(a.chemin)) return null;
    const lien = el('a', 'activite'); lien.href = '../' + a.chemin;
    if (typeof a.suivi === 'string') {
      const e = etat(a.suivi), [signe, mot] = MARQUES[e];
      lien.classList.add(e || 'a-faire');
      lien.append(el('span', 'marque', signe), el('span', null, a.genre || a.titre), el('small', null, mot));
    } else lien.append(el('span', null, a.genre || a.titre));
    return lien;
  }
  function affiche() {
    for (const b of onglets.children) b.setAttribute('aria-pressed', Number(b.dataset.niveau) === annee ? 'true' : 'false');
    const liste = $('cours'); liste.replaceChildren();
    for (const [, c] of cours.filter(([, c]) => c.niveau === annee)) {
      const carte = el('article', 'cours');
      const { faits, total } = compte(c.activites, etat);
      const tete = el('div', 'tete'); tete.append(el('h2', null, c.titre));
      if (total) {
        const p = el('p', 'avancement' + (faits === total ? ' complet' : ''), faits === total ? '✓ Tout est fait' : faits + ' sur ' + total + ' fait' + (faits > 1 ? 's' : ''));
        const barre = el('span', 'barre'); barre.setAttribute('aria-hidden', 'true');
        const plein = el('span'); plein.style.width = Math.round(100 * faits / total) + '%'; barre.append(plein);
        p.append(barre); tete.append(p);
      }
      const acts = el('div', 'activites');
      for (const a of c.activites || []) { const n = activite(a); if (n) acts.append(n); }
      carte.append(tete, el('p', 'sujet', c.sujet || ''), acts);
      liste.append(carte);
    }
    const plus = $('autres'); plus.replaceChildren();
    for (const a of autres.filter(a => Array.isArray(a.niveaux) && a.niveaux.includes(annee))) {
      if (!cheminSur(a.chemin)) continue;
      const lien = el('a', 'autre'); lien.href = '../' + a.chemin;
      const e = typeof a.suivi === 'string' ? etat(a.suivi) : null;
      lien.append(el('b', null, (e === 'fait' ? '✓ ' : '') + a.titre), el('span', null, a.sujet || ''));
      plus.append(lien);
    }
    $('titre-autres').hidden = !plus.children.length;
  }
  $('attente').hidden = true; $('contenu').hidden = false;
  affiche();
  // En revenant d'une activité (bouton Précédent), l'avancement se remet à jour.
  addEventListener('pageshow', affiche);
}).catch(() => { $('attente').hidden = true; $('panne').hidden = false; });
})();
