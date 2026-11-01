/* Exécute le vrai script élève avec un DOM et un pont Apps Script simulés. */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const script = fs.readFileSync(require.resolve('../pas-a-pas/mes-cours.js'), 'utf8');
function noeud(){
  return {
    hidden:true, children:[], textContent:'',
    addEventListener(){},
    replaceChildren(...enfants){ this.children = enfants; },
    append(enfant){ this.children.push(enfant); }
  };
}
async function affiche(cours){
  const elements = new Map();
  const element = id => {
    if(!elements.has(id)) elements.set(id, noeud());
    return elements.get(id);
  };
  let reponse;
  const pont = {
    withSuccessHandler(fn){ reponse = fn; return this; },
    withFailureHandler(){ return this; },
    mesCours(){ reponse({ email:'eleve@example.test', classe:'3F', cours }); }
  };
  vm.runInNewContext(script, {
    document:{ getElementById:element, createElement:noeud, querySelectorAll:()=>[] },
    google:{ script:{ run:pont } }, setInterval:()=>0
  });
  // La réponse Apps Script est rendue dans la continuation de la promesse.
  await new Promise(resolve=>setImmediate(resolve));
  return element;
}
(async()=>{
  const cours = [
    { titre:'python 10 — Suite', url:'/python-10' },
    { titre:'Python 02 — Erreurs', url:'/python-2' },
    { titre:'Messagerie 01 — Message', url:'/messagerie' },
    { titre:'Python 01 — Premiers pas', url:'/python-1' },
    { titre:'Labo 07 — PC', url:'/labo-07' },
    { titre:'Écran 01 — Découvrir', url:'/ecran' }
  ];
  const avant = JSON.stringify(cours);
  cours.forEach(Object.freeze); Object.freeze(cours);
  const page = await affiche(cours);
  assert.deepEqual(page('cours').children.map(c=>c.textContent), [
    'Écran 01 — Découvrir ▸', 'Labo 07 — PC ▸', 'Messagerie 01 — Message ▸',
    'Python 01 — Premiers pas ▸', 'Python 02 — Erreurs ▸', 'python 10 — Suite ▸'
  ]);
  assert.deepEqual(page('cours').children.map(c=>c.href), [
    '/ecran', '/labo-07', '/messagerie', '/python-1', '/python-2', '/python-10'
  ]);
  assert.ok(page('cours').children.every(c=>c.target === '_top'));
  assert.equal(JSON.stringify(cours), avant, 'Les données du serveur sont conservées.');
  assert.equal(page('aucun').hidden, true);
  assert.equal(page('mes-cours').hidden, false);
  const vide = await affiche([]);
  assert.equal(vide('cours').children.length, 0);
  assert.equal(vide('aucun').hidden, false);
  console.log('Vue élève : tri français, casse, accents, numéros, liens et liste vide vérifiés.');
})().catch(err=>{ console.error(err); process.exitCode=1; });
