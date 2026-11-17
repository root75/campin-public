// node tests/python-coince.cjs — « Ça coince ? » s'ouvre seul au 2e essai raté (blocs.js, rate) : il aide sans donner la ligne à écrire (Vincent, 17/11/2026). Python 01 à 04, chaque version.
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const LIGNES = [
  [/print\([^)]*,/, 'un print( ) complet'],
  [/=\s*(int\()?input\(/, 'une lecture complète'],
  [/\bif \w+ ?(==|<=|>=|<|>) ?[^ ]+ ?:/, 'une ligne if complète'],
  [/\w+ = \w+ [-+*] \w+/, 'une affectation complète'],
  [/\d+ \* [a-z]+|[a-z]+ (>=|<=|-) [a-z]+/, 'un calcul ou une condition à recopier'],
];
// Seule exception : le secours de l'élève qui n'a pas son fichier du cours précédent (un prérequis, pas la réponse du bloc).
const SECOURS = /^Pas de fichier \S+ dans Documents/;
let vus = 0;
for (const c of ['python-1', 'python-2', 'python-3', 'python-4']) {
  const s = fs.readFileSync(c + '/pas-a-pas/fiche.js', 'utf8') + fs.readFileSync('pas-a-pas/blocs.js', 'utf8');
  const ctx = vm.createContext({ norm: x => x, echangeGuide: () => ({}) });
  vm.runInContext(s.slice(0, s.indexOf('/* ===== Python dans la page')) + '\nconst APERCU = true;\n' +
    s.slice(s.indexOf('const apercuV ='), s.indexOf('\nfunction barre()')) +
    '\nglobalThis.bloc = (i,v) => { apercuV[i-1]=v; return blocVu(i-1); };\nglobalThis.N = BLOCS.length;', ctx);
  for (let n = 1; n <= ctx.N; n++) {
    const nv = ctx.bloc(n, 1)._n || 1;
    for (let v = 1; v <= nv; v++) {
      const b = ctx.bloc(n, v), Q = b.q && (b.q.type === 'mixte' ? b.q.activite : b.q);
      // Hors bloc « code » (écriture dans Thonny, nom de fichier…) : mêmes lignes interdites, sauf le dernier motif,
      // qui prendrait « le tiret - entre Le et score » pour un calcul.
      const regles = Q && Q.type === 'code' ? LIGNES : LIGNES.slice(0, -1);
      (b.coince || []).map(x => x && x.html ? x.html : String(x)).forEach(x => {
        if (SECOURS.test(x)) return;
        vus++; regles.forEach(([re, quoi]) => assert.ok(!re.test(x), `${c} bloc ${n}/${v} : « Ça coince ? » donne ${quoi} — ${x}`)); });
    }
  }
}
assert.ok(vus >= 300, vus + ' aides lues');
console.log(`OK Ça coince ? : ${vus} aides, aucune ne donne la ligne à écrire.`);
