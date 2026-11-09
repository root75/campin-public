const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s=fs.readFileSync(__dirname+'/../python-1/pas-a-pas/fiche.js','utf8');
const context=vm.createContext({norm:s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()});vm.runInContext(s.slice(s.indexOf('function echangeGeneral(')),context);
for(const [a,b] of [[4,7],[3,9],[5,8]]){
const code=middle=>`a = ${a}\nb = ${b}\n${middle}\nprint(a, b)`;
assert.equal(context.echangeGeneral(code('temp = a\na = b\nb = temp'),a,b),true);
assert.equal(context.echangeGeneral(code('temp = b\nb = a\na = temp'),a,b),true);
for(const m of ['a = b\nb = a',`a = ${b}\nb = ${a}`,'a = temp\ntemp = a','temp = a\na = b','temp = a\na, b = b, a'])assert.equal(context.echangeGeneral(code(m),a,b),false,m);
}
for(const r of ['Je conserve la valeur avant de la remplacer.','Pour ne pas perdre l’ancienne valeur.','Je garde le contenu de a avant de l’écraser.',
  'pour garder a','pour pas perdre le 4','sinon on perd a','parce que a est écrasé','pour stocker la valeur de a','pour mettre a de côté','pour se souvenir de a','pour retenir le premier nombre','sinon les deux ont la même valeur','sinon a et b valent 7 deux fois','pour sauvgarder a','pour pas que a soit remplacé','pour stoker a','sinon a s\'éfface'])assert.equal(context.raisonEchange(r),true,r);
for(const r of ['temp = a','pour échanger','temp ne garde pas la valeur avant de l’écraser','inutile de garder une valeur avant de remplacer','c\'est plus facile','parce que','je sais pas','pour faire l\'échange'])assert.equal(context.raisonEchange(r),false,r);
console.log('OK : trois variantes, deux méthodes correctes, faux échange, nombres recopiés, variable indéfinie et explications.');
