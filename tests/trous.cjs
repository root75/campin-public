// node tests/trous.cjs — le texte à trous (« Explique avec tes mots ») : données de chaque bloc `trous`
// de chaque fiche sur le moteur commun. Trois versions, chacune sa réponse, et la même phrase libre.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
function charge(cours) {
  const s = fs.readFileSync(`${cours}/pas-a-pas/fiche.js`, 'utf8') + fs.readFileSync('pas-a-pas/blocs.js', 'utf8');
  const ctx = vm.createContext({ echangeGuide() {} });
  const coupe = Math.min(...['const MOTEUR =', '/* ===== Python dans la page'].map(m => s.indexOf(m)).filter(i => i > 0));
  vm.runInContext(s.slice(0, coupe) + '\nconst APERCU = true;\n' +
    s.slice(s.indexOf('const apercuV ='), s.indexOf('\nfunction barre()')) +
    '\nglobalThis.bloc = (i,v) => { apercuV[i-1]=v; return blocVu(i-1); }; globalThis.N = BLOCS.length;', ctx);
  return ctx;
}
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let blocs = 0;
for (const cours of ['python-1', 'python-2', 'python-3']) {
  const ctx = charge(cours);
  for (let n = 1; n <= ctx.N; n++) {
    if (ctx.bloc(n, 1).q.type !== 'trous') continue;
    blocs++;
    const versions = [1, 2, 3].map(v => ctx.bloc(n, v));
    assert.equal(versions[0]._n, 3, `${cours} bloc ${n} : trois versions (règle anti-recopie)`);
    const reponses = new Set(), phrases = new Set();
    versions.forEach((b, k) => {
      const Q = b.q, ou = `${cours} bloc ${n} v${k + 1}`;
      assert.equal(Q.type, 'trous', ou);
      assert.equal(Q.texte.split('___').length - 1, Q.mots.length, ou + ' : un mot par trou');
      assert.ok(Q.mots.length >= 2 && Q.pieges.length >= 2, ou + ' : au moins deux trous et deux pièges');
      const banque = Q.mots.concat(Q.pieges).map(norm);
      assert.equal(new Set(banque).size, banque.length, ou + ' : un mot de la banque ne sert qu’une fois');
      assert.ok(!/___/.test(Q.q + (Q.juste || '')), ou);
      // La correction dite après coup ne doit pas être lisible avant : pas dans la question.
      Q.mots.forEach(m => assert.ok(!norm(Q.q).includes(norm(m)), ou + ' : « ' + m + ' » est déjà dans la question'));
      reponses.add(Q.mots.map(norm).join('|')); phrases.add(Q.phrase);
      assert.ok(Q.phrase && Q.phrase.endsWith('?'), ou + ' : une phrase libre, sous forme de question');
    });
    assert.equal(reponses.size, 3, `${cours} bloc ${n} : la réponse d'une version ne vaut pas pour une autre`);
    assert.equal(phrases.size, 1, `${cours} bloc ${n} : la même phrase libre pour tous (correction ensemble)`);
  }
}
assert.ok(blocs >= 1, 'au moins un bloc à trous (Python 02, bloc 2)');
const moteur = fs.readFileSync('pas-a-pas/blocs.js', 'utf8');
assert.match(moteur, /type:"phrase"/, 'la phrase libre part au Journal sous « phrase »');
assert.match(fs.readFileSync('pas-a-pas/tableau.js', 'utf8'), /Leurs phrases/, 'le tableau montre les phrases');
console.log('OK : ' + blocs + ' bloc(s) à trous — trois versions, réponses distinctes, même phrase libre.');
