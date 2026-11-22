/* Mon portail : la page publique ne porte aucune donnée d'élève, et le vrai script la remplit avec la réponse du serveur. */
const fs = require('node:fs'), vm = require('node:vm'), assert = require('node:assert/strict');
const html = fs.readFileSync(require.resolve('../portail/index.html'), 'utf8');
const script = fs.readFileSync(require.resolve('../portail/portail.js'), 'utf8');

// La page au repos est l'état public.
assert.match(html, /id="non-connecte">[\s\S]*Tu n'es pas connecté/);
assert.match(html, /id="maintenant" hidden/);
assert.doesNotMatch(html, /[a-z0-9.]+@arcampin\.be/i, 'Aucune adresse dans la page publique');
// Dans l'iframe Apps Script, un lien sans target="_top" ne s'ouvre pas.
for (const a of html.match(/<a\b[^>]*>/g)) assert.match(a, /target="_top"/, a);
assert.match(html, /« M\. Louviaux »/);

function noeud(id){ return { id, hidden: /^(compte|maintenant|meteo|lien-prof)$/.test(id), textContent:'', href:'', children:[],
  addEventListener(){}, replaceChildren(...e){ this.children = e; } }; }
function lance(reponse, { suivi = true } = {}){
  const els = new Map(), ajoutes = [];
  const $ = id => { if(!els.has(id)) els.set(id, noeud(id)); return els.get(id); };
  const pont = { withSuccessHandler(f){ this.f = f; return this; }, withFailureHandler(){ return this; }, portail(){ this.f(reponse); } };
  const ctx = { document:{ documentElement:{ dataset:{} }, getElementById:$, createElement:t=>({ tag:t, textContent:'' }), head:{ append:s=>ajoutes.push(s) } },
    location:{ protocol:'https:', search:'', replace(u){ ctx.parti = u; } }, localStorage:{ getItem(){ throw Error('bloqué'); }, setItem(){} } };
  ctx.window = ctx; ctx.globalThis = ctx;
  if(suivi) ctx.google = { script:{ run:pont } };
  vm.runInNewContext(script, ctx);
  return { $, ajoutes, ctx };
}

// Élève reconnu : son prénom, le Classroom de sa classe, sa séance ; l'avis public disparaît.
let p = lance({ email:'eleve@example.test', prenom:'Camille', classe:'2B', prof:false, mesCours:'https://x/exec', tableau:'',
  devoirs:'https://classroom.google.com/w/ABC/t/all', seance:{ titre:'Messagerie 02', url:'https://x/exec?cours=messagerie-2' } });
assert.equal(p.$('non-connecte').hidden, true);
assert.equal(p.$('bonjour').textContent, 'Bonjour Camille, par où commences-tu ?');
assert.equal(p.$('porte-devoirs').href, 'https://classroom.google.com/w/ABC/t/all');
assert.equal(p.$('devoirs-detail').textContent, 'Classroom, directement dans le cours de 2B');
assert.equal(p.$('maintenant').hidden, false); assert.equal(p.$('seance-lien').href, 'https://x/exec?cours=messagerie-2');
assert.equal(p.$('lien-prof').hidden, true);
assert.equal(p.ctx.document.documentElement.dataset.theme, 'dark', 'Le stockage bloqué ne casse pas la page');

// Classe sans Classroom noté : le lien général reste, pas de séance.
p = lance({ email:'eleve@example.test', prenom:'Sam', classe:'2E', prof:false, mesCours:'https://x/exec', devoirs:'', seance:null, tableau:'' });
assert.equal(p.$('porte-devoirs').href, ''); assert.equal(p.$('maintenant').hidden, true);

// Compte hors école servi par Apps Script : la page reste publique.
p = lance({ email:'' });
assert.equal(p.$('non-connecte').hidden, false); assert.equal(p.$('compte').hidden, true);

// Page publique : une seule question au serveur ; « oui » mène à la page connectée, « non » ne fait rien.
p = lance(null, { suivi:false });
assert.equal(p.ajoutes.length, 1); assert.match(p.ajoutes[0].src, /\/exec\?vue=connecte$/);
p.ctx.campinConnecte(false); assert.equal(p.ctx.parti, undefined);
p.ctx.campinConnecte(true); assert.match(p.ctx.parti, /\/exec\?vue=portail$/);

// Météo : les mots et le conseil.
const { ciel, conseil } = p.ctx.PortailEssai;
assert.equal(ciel(0), 'ciel dégagé'); assert.equal(ciel(61), 'pluie'); assert.equal(ciel(95), 'orage');
assert.match(conseil(12, 61), /pluie/); assert.match(conseil(2, 3), /froid/); assert.equal(conseil(15, 1), '');
console.log('portail : page publique, élève reconnu, hors école, redirection et météo vérifiés.');
