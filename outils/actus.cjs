/* Quelques nouvelles pour « Mon portail » : lit les flux RSS de journaux pour les jeunes et écrit portail/actus.json.
   Lancé chaque matin d'école par .github/workflows/actus.yml ; la page tire ensuite un titre au hasard à chaque visite.
   Aucune dépendance. Un flux en panne garde ses titres de la veille ; le fichier n'est jamais vidé.
   node outils/actus.cjs            écrit portail/actus.json
   Ajouter une source = une ligne dans SOURCES (son flux RSS, et le domaine où ses liens ont le droit de mener). */
const fs = require('node:fs'), path = require('node:path');
const SOURCES = [
  { nom: '1jour1actu', flux: 'https://www.1jour1actu.com/feed', domaine: 'www.1jour1actu.com' },
  { nom: 'Le JDE', flux: 'https://www.lejde.be/feed/', domaine: 'www.lejde.be', sauf: /\/jeux\// }
];
const PAR_SOURCE = 8;
const SORTIE = path.join(__dirname, '..', 'portail', 'actus.json');

const ENTITES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', laquo: '«', raquo: '»', hellip: '…', ndash: '–', mdash: '—' };
function texte(s) {
  return String(s || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, '')
    .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, n) => ENTITES[n.toLowerCase()] ?? m)
    .replace(/\s+/g, ' ').trim();
}
/** Les titres d'un flux RSS : [{ titre, lien, source }], liens https du domaine de la source uniquement. */
function lire(xml, source) {
  const vus = new Set(), sortie = [];
  for (const item of String(xml).match(/<item\b[\s\S]*?<\/item>/gi) || []) {
    const titre = texte((item.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
    let lien = texte((item.match(/<link\b[^>]*>([\s\S]*?)<\/link>/i) || [])[1]);
    if (!lien) lien = (item.replace(/<title\b[\s\S]*?<\/title>/i, '').match(/https:\/\/[^\s<>"']+/) || [''])[0];
    let adresse; try { adresse = new URL(lien); } catch (e) { continue; }
    if (adresse.protocol !== 'https:' || adresse.hostname !== source.domaine) continue;
    if (source.sauf && source.sauf.test(adresse.pathname)) continue;
    if (titre.length < 8 || titre.length > 160 || vus.has(adresse.href)) continue;
    vus.add(adresse.href);
    sortie.push({ titre, lien: adresse.href, source: source.nom });
    if (sortie.length >= PAR_SOURCE) break;
  }
  return sortie;
}
/** Garde les titres de la veille pour une source dont le flux n'a rien donné. */
function assemble(parSource, ancien) {
  const actus = [];
  for (const s of SOURCES) {
    const neuf = parSource[s.nom] || [];
    actus.push(...(neuf.length ? neuf : (ancien.actus || []).filter(a => a.source === s.nom)));
  }
  return actus;
}
async function principal() {
  let ancien = {}; try { ancien = JSON.parse(fs.readFileSync(SORTIE, 'utf8')); } catch (e) {}
  const parSource = {};
  for (const s of SOURCES) {
    try {
      const r = await fetch(s.flux, { headers: { 'user-agent': 'portail-scolaire (lecture du flux RSS, une fois par jour)' }, signal: AbortSignal.timeout(20000) });
      if (!r.ok) throw Error('HTTP ' + r.status);
      parSource[s.nom] = lire(await r.text(), s);
      console.log(s.nom + ' : ' + parSource[s.nom].length + ' titres');
    } catch (e) { console.log(s.nom + ' : flux illisible (' + e.message + '), titres de la veille gardés'); }
  }
  const actus = assemble(parSource, ancien);
  if (!actus.length) { console.log('Aucun titre : fichier laissé tel quel.'); return; }
  if (JSON.stringify(actus) === JSON.stringify(ancien.actus)) { console.log('Rien de neuf.'); return; }
  fs.writeFileSync(SORTIE, JSON.stringify({ maj: new Date().toISOString().slice(0, 10), actus }, null, 1) + '\n');
  console.log(actus.length + ' titres écrits.');
}
module.exports = { lire, assemble, texte, SOURCES };
if (require.main === module) principal();
