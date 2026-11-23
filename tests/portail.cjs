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
// Le hibou de l'école, par son adresse absolue (la page est aussi servie par Apps Script), et la place de l'extension.
assert.match(html, /src="https:\/\/root75\.github\.io\/campin-public\/assets\/logo-campin\.png"/);
assert.ok(fs.existsSync(require.resolve('../assets/logo-campin.png')));
assert.match(html, /id="bandeau-extension" hidden/);

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
const { ciel, conseil, dateNom, dateJour } = p.ctx.PortailEssai;
// La date : en toutes lettres, et sous la forme AAAAMMJJ des noms de travaux. Elle s'affiche sans connexion.
assert.equal(dateNom(new Date(2026, 0, 5)), '20260105');
assert.equal(dateJour(new Date(2026, 10, 23)), 'Lundi 23 novembre 2026');
assert.equal(p.$('date').hidden, false); assert.match(p.$('date-nom').textContent, /^\d{8}$/);
// Peu de distractions : pas de Canva ni de messagerie instantanée sur la page d'accueil.
assert.doesNotMatch(html, /canva|chat\.google/i);
assert.match(html, /href="https:\/\/www\.1jour1actu\.com\/"/);
// Quelques nouvelles : jamais deux fois de suite le même titre, et rien d'autre qu'un lien https.
const { tire } = p.ctx.PortailEssai;
const A = [{ titre:'Un', lien:'https://a.test/1', source:'A' }, { titre:'Deux', lien:'https://a.test/2', source:'A' }];
for (let i = 0; i < 20; i++) assert.equal(tire(A, 'https://a.test/1').titre, 'Deux');
assert.equal(tire([A[0]], 'https://a.test/1').titre, 'Un', 'Un seul titre : on le garde');
assert.equal(tire([{ titre:'Piège', lien:'javascript:alert(1)' }, { titre:'', lien:'https://a.test/3' }], ''), null);
assert.equal(tire(null, ''), null);
// Le fichier publié : des titres, de plus d'une source, tous en https.
const actus = JSON.parse(fs.readFileSync(require.resolve('../portail/actus.json'), 'utf8')).actus;
assert.ok(actus.length >= 4); assert.ok(new Set(actus.map(a => a.source)).size >= 2, 'Sources variées');
for (const a of actus) { assert.match(a.lien, /^https:\/\/www\.(1jour1actu\.com|lejde\.be)\//); assert.ok(a.titre.length >= 8); }
assert.equal(ciel(0), 'ciel dégagé'); assert.equal(ciel(61), 'pluie'); assert.equal(ciel(95), 'orage');
assert.match(conseil(12, 61), /pluie/); assert.match(conseil(2, 3), /froid/); assert.equal(conseil(15, 1), '');
console.log('portail : page publique, élève reconnu, hors école, redirection et météo vérifiés.');

// Mes révisions : seulement celles des cours de l'élève, sans doublon, et jamais une adresse hors du site.
{
  const { revisionsDe } = lance({ email:'' }).ctx.PortailEssai;
  const table = JSON.parse(fs.readFileSync(require.resolve('../revisions/revisions.json'), 'utf8')).cours;
  const r = revisionsDe(['python-1', 'cours-inconnu', 'python-1'], table);
  assert.equal(r.length, 1, 'python-1, une seule fois, et rien pour un cours inconnu');
  assert.deepEqual(Array.from(r[0].activites, a => a.genre), ["L'essentiel", 'Quiz', 'Cartes', 'Mots croisés']);
  const grille = r[0].activites[3];
  assert.equal(grille.url, 'https://root75.github.io/campin-public/mots-croises/?cours=python-1');
  assert.equal(grille.jeu, 'mots-croises', 'Les mots croisés se jouent dans le portail');
  assert.equal(r[0].activites[1].jeu, '', 'Le quiz reste un lien');
  assert.equal(revisionsDe([], table).length, 0); assert.equal(revisionsDe(undefined, table).length, 0);
  const piege = { x:{ titre:'Piège', activites:[{ genre:'A', chemin:'//ailleurs.example/' }, { genre:'B', chemin:'../../x' }, { genre:'', chemin:'ok/' }, { genre:'C', chemin:'javascript:alert(1)' }] } };
  assert.equal(revisionsDe(['x'], piege).length, 0, 'Un cours dont aucune activité ne tient sur le site ne s\'affiche pas');
  assert.equal(revisionsDe(['__proto__'], table).length, 0);
  assert.match(html, /id="revisions" hidden/, 'Le panneau des révisions est caché tant que le serveur n\'a pas répondu');
  assert.match(html, /id="jeu-portail" hidden/, 'La grille dans le portail est fermée au départ');
}
// « Je révise » mène à l'année de la classe.
{
  const q = lance({ email:'e@example.test', prenom:'A', classe:'2B', prof:false, mesCours:'https://x/exec', tableau:'', devoirs:'', cours:[], seance:null });
  assert.equal(q.$('porte-revise').href, 'https://root75.github.io/campin-public/revisions/?niveau=2');
}
