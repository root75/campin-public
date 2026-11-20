// Sites du mode cours (pas-a-pas/sites.json), lus par le serveur Apps Script pour l'extension Chrome.
// Un domaine mal écrit serait écarté en silence par le serveur : on le refuse ici, avant publication.
const fs = require('fs'), path = require('path'), assert = require('assert/strict');
const racine = path.resolve(__dirname, '..');
const d = JSON.parse(fs.readFileSync(path.join(racine, 'pas-a-pas/sites.json'), 'utf8'));
const cours = JSON.parse(fs.readFileSync(path.join(racine, 'pas-a-pas/cours.json'), 'utf8')).cours.map((c) => c.id);
const DOMAINE = /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/;
const liste = (l, nom) => {
  assert.ok(Array.isArray(l) && l.length <= 200, nom + ' : une liste de 200 domaines au plus');
  l.forEach((x) => assert.match(String(x), DOMAINE, `${nom} : « ${x} » n'est pas un domaine (pas de https://, pas de chemin, minuscules)`));
  assert.equal(new Set(l).size, l.length, nom + ' : un domaine est répété');
};
assert.equal(d.version, 1);
assert.deepEqual(Object.keys(d).sort(), ['bonus', 'cours', 'toujours', 'version']);
liste(d.toujours, 'toujours'); liste(d.bonus, 'bonus');
['root75.github.io', 'script.google.com', 'accounts.google.com'].forEach((x) => assert.ok(d.toujours.includes(x), 'toujours doit garder ' + x));
Object.keys(d.cours).forEach((k) => { assert.ok(cours.includes(k), `cours inconnu du catalogue : ${k}`); liste(d.cours[k], 'cours.' + k); });
// Chaque site proposé par « Je m'occupe » doit être dans les bonus, sinon la récompense mène à une page fermée.
const html = fs.readFileSync(path.join(racine, 'je-m-occupe/index.html'), 'utf8');
const hotes = [...new Set([...html.matchAll(/href="https?:\/\/([^/"]+)/g)].map((m) => m[1].replace(/^www\./, '')))];
hotes.filter((h) => !d.toujours.includes(h)).forEach((h) =>
  assert.ok(d.bonus.some((b) => h === b || h.endsWith('.' + b)), `« Je m'occupe » propose ${h}, absent des bonus de sites.json`));
console.log(`OK sites : ${d.toujours.length} toujours, ${Object.keys(d.cours).length} cours, ${d.bonus.length} bonus (${hotes.length} sites de « Je m'occupe » couverts).`);
