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

function noeud(id){ return { id, hidden: /^(compte|maintenant|meteo|lien-prof|devoirs)$/.test(id), textContent:'', href:'', children:[],
  addEventListener(){}, replaceChildren(...e){ this.children = e; } }; }
function lance(reponse, { suivi = true, devoirs } = {}){
  const els = new Map(), ajoutes = [];
  const $ = id => { if(!els.has(id)) els.set(id, noeud(id)); return els.get(id); };
  const pont = { withSuccessHandler(f){ this.f = f; return this; }, withFailureHandler(){ return this; }, portail(){ this.f(reponse); } };
  if(devoirs !== undefined) pont.mesDevoirs = function(){ this.f({ liste: devoirs }); };
  const ctx = { document:{ documentElement:{ dataset:{} }, getElementById:$, createElement:t=>({ tag:t, textContent:'', enfants:[], append(...e){ this.enfants.push(...e); } }), head:{ append:s=>ajoutes.push(s) } },
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
// Mes devoirs : ce que le portail écrit à partir de la liste du serveur.
{
  const { devoirsA } = lance({ email:'' }).ctx.PortailEssai;
  const t = Date.UTC(2026, 10, 23, 9, 0);   // lundi 23 novembre 2026, 10 h à Bruxelles
  const l = Array.from(devoirsA([
    { titre:'Portrait', lien:'https://classroom.google.com/c/x/a/1', echeance:t - 3 * 86400000, etat:'retard' },
    { titre:'Pour ce soir', lien:'https://classroom.google.com/c/x/a/2', echeance:t + 3600000, etat:'a-rendre' },
    { titre:'Pour demain', lien:'https://ailleurs.example/', echeance:t + 86400000, etat:'a-rendre' },
    { titre:'Sans date', lien:'', echeance:0, etat:'a-rendre' },
    { titre:'Déjà rendu', lien:'https://classroom.google.com/c/x/a/5', echeance:t - 86400000, etat:'rendu' },
    { titre:'Corrigé', lien:'https://classroom.google.com/c/x/a/6', echeance:0, etat:'corrige' },
    { titre:'État inventé', lien:'', echeance:0, etat:'constructor' }, { titre:'  ', etat:'rendu' }, null
  ], t), x => ({ ...x }));
  assert.deepEqual(l.map(x => x.mot), ['En retard', 'À rendre', 'À rendre', 'À rendre', 'Rendu', 'Corrigé']);
  assert.equal(l[0].quand, "c'était pour le vendredi 20 novembre"); assert.equal(l[1].quand, "pour aujourd'hui");
  assert.equal(l[2].quand, 'pour demain'); assert.equal(l[2].lien, '', 'Un lien hors Classroom est retiré');
  assert.equal(l[3].quand, ''); assert.equal(l[4].quand, '', 'Un devoir rendu ne rappelle plus son échéance');
  assert.equal(l[4].classe, 'fait'); assert.equal(l[0].classe, 'retard');
  assert.equal(devoirsA(null, t).length, 0);
  assert.match(html, /id="devoirs" hidden/, 'Le panneau des devoirs est caché tant que le serveur n\'a rien donné');
}
// Le panneau s'ouvre quand le serveur donne une liste ; il reste caché sans service Classroom, et sur un ancien serveur.
{
  const d = { email:'e@example.test', prenom:'A', classe:'3F', prof:false, mesCours:'https://x/exec', tableau:'', devoirs:'https://classroom.google.com/w/x/t/all', cours:[], seance:null };
  let q = lance(d, { devoirs:[{ titre:'Portrait', lien:'https://classroom.google.com/c/x/a/1', echeance:0, etat:'a-rendre' }] });
  assert.equal(q.$('devoirs').hidden, false); assert.equal(q.$('devoirs-liste').children.length, 1);
  assert.match(html, /Pour les autres cours, ouvre <a target="_top" href="http:\/\/arcampin\.ecoleenligne\.be\/">École en ligne<\/a>/);
  q = lance(d, { devoirs:[] }); assert.equal(q.$('devoirs').hidden, false, 'Liste vide : « Aucun devoir pour le moment »');
  q = lance(d, { devoirs:null }); assert.notEqual(q.$('devoirs').hidden, false, 'Sans service Classroom, pas de panneau');
  q = lance(d); assert.notEqual(q.$('devoirs').hidden, false, 'Ancien serveur sans mesDevoirs : pas d\'erreur, pas de panneau');
  q = lance({ ...d, prof:true }, { devoirs:[] }); assert.notEqual(q.$('devoirs').hidden, false);
}
