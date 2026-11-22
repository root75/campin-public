/* Le lecteur de flux de « Quelques nouvelles » (outils/actus.cjs), sur un flux RSS imité. */
const assert = require('node:assert/strict');
const { lire, assemble, texte, SOURCES } = require('../outils/actus.cjs');
const S = { nom:'Essai', domaine:'www.essai.test', sauf:/\/jeux\// };
const item = (t, l) => '<item><title>' + t + '</title><link>' + l + '</link><description><![CDATA[<p>Texte https://ailleurs.test/x</p>]]></description></item>';
const xml = '<?xml version="1.0"?><rss><channel><title>Le journal</title><link>https://www.essai.test/</link>'
  + item('<![CDATA[C&rsquo;est quoi un blocus ?]]>', 'https://www.essai.test/a')
  + item('L&#8217;eau manque &amp; la pluie arrive', 'https://www.essai.test/b')
  + item('Un lien qui sort du journal', 'https://pirate.test/c')
  + item('Un lien pas sûr du tout', 'http://www.essai.test/d')
  + item('Une page de jeux réservée', 'https://www.essai.test/jeux/e')
  + item('Court', 'https://www.essai.test/f')
  + item('Le même article une seconde fois', 'https://www.essai.test/a')
  + '</channel></rss>';
const lus = lire(xml, S);
assert.deepEqual(lus.map(a => a.lien), ['https://www.essai.test/a', 'https://www.essai.test/b']);
assert.equal(lus[1].titre, 'L’eau manque & la pluie arrive');
assert.equal(lus[0].source, 'Essai');
assert.equal(texte('<b>Gras</b>  et\n&lt;balise&gt;'), 'Gras et <balise>');
assert.equal(lire('<html>page d erreur</html>', S).length, 0);
assert.ok(lire(Array.from({ length: 30 }, (x, i) => item('Un titre assez long ' + i, 'https://www.essai.test/n' + i)).join(''), S).length <= 8);
// Un flux en panne garde ses titres de la veille ; un flux qui répond les remplace.
const [a, b] = SOURCES.map(s => s.nom);
const ancien = { actus: [{ titre:'Hier A', lien:'https://x/1', source:a }, { titre:'Hier B', lien:'https://x/2', source:b }] };
const neuf = assemble({ [a]: [{ titre:'Ce matin A', lien:'https://x/3', source:a }] }, ancien);
assert.deepEqual(neuf.map(n => n.titre), ['Ce matin A', 'Hier B']);
assert.deepEqual(assemble({}, {}), []);
console.log('actus : lecture du flux, filtres et panne vérifiés.');
