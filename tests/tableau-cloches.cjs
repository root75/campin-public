/* Les cloches en attente : nombre dans le titre de l'onglet et en projection, jamais de nom. */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||require.resolve('../pas-a-pas/tableau.js'),'utf8');
const a=source.indexOf('const TITRE_PAGE'),b=source.indexOf('function dessine(d)');
assert.ok(a>0&&b>a,'signaleCloches introuvable');
assert.ok(!source.includes('✋'),'le signal est la cloche 🔔, pas la main levée');
const pastille={hidden:true,textContent:'',title:''},document={title:'Pas à pas — tableau de bord'};
const c=vm.createContext({document,$:id=>id==='seq-cloches'?pastille:null});
vm.runInContext(source.slice(a,b),c);
c.signaleCloches(3);
assert.equal(document.title,'🔔 3 · Pas à pas — tableau de bord');assert.equal(pastille.hidden,false);assert.equal(pastille.textContent,'🔔 3');
c.signaleCloches(1);assert.match(pastille.title,/1 élève attend/);
c.signaleCloches(0);
assert.equal(document.title,'Pas à pas — tableau de bord','plus de cloche : le titre redevient normal');assert.equal(pastille.hidden,true);
console.log('Cloches : titre d’onglet et projection vérifiés.');
