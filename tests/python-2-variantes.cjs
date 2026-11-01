// node tests/python-2-variantes.cjs — contenu réel fusionné par blocVu, puis vrai Python.
const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
function charge(cours) {
  const contenu = fs.readFileSync(`${cours}/pas-a-pas/fiche.js`, 'utf8');
  const s = contenu + fs.readFileSync('pas-a-pas/blocs.js', 'utf8');
  const ctx = vm.createContext({});
  vm.runInContext(s.slice(0, s.indexOf('const MOTEUR =')) + '\nconst APERCU = true;\n' +
    s.slice(s.indexOf('const apercuV ='), s.indexOf('\nfunction barre()')) +
    '\nglobalThis.bloc = (i,v) => { apercuV[i-1]=v; return blocVu(i-1); };', ctx);
  return ctx.bloc;
}
const bloc = charge('python-2');
const cas = [
  [8, ['print(Vies)', 'print(vie)', 'prnt(vies)'], 'NameError'],
  [9, ['print(vies', 'print vies)', 'print(vies))'], 'SyntaxError']
];
let total = 0;
for (const [n, lignes, erreur] of cas) for (let v=1; v<=3; v++) {
  const b=bloc(n,v), ligne=lignes[v-1];
  assert.ok(b.fais.includes(ligne), `${n}/${v}: manipulation`);
  assert.ok(b.q.q.includes(ligne), `${n}/${v}: question`);
  assert.ok(b.fais.indexOf('AVANT') < b.fais.indexOf('Puis F5'), `${n}/${v}: prédire avant exécution`);
  assert.ok(b.q.c[0].includes(erreur), `${n}/${v}: correction`);
  for (const d of [3,5,6]) {
    const r=spawnSync('python3',['-c',`vies = ${d}\nvies = vies - 1\n${ligne}`],{encoding:'utf8'});
    assert.notEqual(r.status,0);
    assert.ok(r.stderr.includes(erreur),r.stderr);
    const repare=spawnSync('python3',['-c',`vies = ${d}\nvies = vies - 1\nprint(vies)`],{encoding:'utf8'});
    assert.equal(repare.status,0); assert.equal(repare.stdout.trim(),String(d-1));
  }
  total++; console.log(`OK Python 2 bloc ${n}, version ${v} : ${ligne} → ${erreur} → réparation`);
}
for (const [cours,n] of [['python-1',10],['python-2',7]]) {
  const lire=charge(cours);
  for(let v=1;v<=lire(n,1)._n;v++) {
    const secours=lire(n,v).coince.find(x=>x.startsWith('Thonny ne se lance pas'));
    assert.ok(secours.includes('https://cscircles.cemc.uwaterloo.ca/dev/console-fr/'));
    assert.ok(!/reviens au bloc/.test(secours));
    assert.ok(secours.includes('professeur')); assert.ok(secours.includes('sauvegarde'));
    total++; console.log(`OK ${cours} bloc ${n}, version ${v} : console et sauvegarde accompagnée`);
  }
}
console.log(`${total} versions vérifiées ; 18 exécutions en erreur et 18 réparations Python.`);
