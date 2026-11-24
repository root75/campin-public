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
assert.match(html, /Professeur : M\. Louviaux/);
// Le hibou de l'école, par son adresse absolue (la page est aussi servie par Apps Script), et la place de l'extension.
assert.match(html, /src="https:\/\/root75\.github\.io\/campin-public\/assets\/logo-campin\.png"/);
assert.ok(fs.existsSync(require.resolve('../assets/logo-campin.png')));
assert.match(html, /id="bandeau-extension" hidden/);

function noeud(id){ return { id, hidden: /^(compte|maintenant|meteo|lien-prof|devoirs|annonces|date-nommer|devoirs-plie)$/.test(id), textContent:'', href:'', children:[],
  addEventListener(){}, replaceChildren(...e){ this.children = e; } }; }
function lance(reponse, { suivi = true, devoirs, annonces } = {}){
  const els = new Map(), ajoutes = [];
  const $ = id => { if(!els.has(id)) els.set(id, noeud(id)); return els.get(id); };
  const pont = { withSuccessHandler(f){ this.f = f; return this; }, withFailureHandler(){ return this; }, portail(){ this.f(reponse); } };
  if(devoirs !== undefined) pont.mesDevoirs = function(){ this.f({ liste: devoirs }); };
  if(annonces !== undefined) pont.mesAnnonces = function(){ this.f({ liste: annonces }); };
  const ctx = { document:{ documentElement:{ dataset:{} }, getElementById:$, createElement:t=>({ tag:t, textContent:'', enfants:[], append(...e){ this.enfants.push(...e); } }), head:{ append:s=>ajoutes.push(s) } },
    location:{ protocol:'https:', search:'', replace(u){ ctx.parti = u; } }, localStorage:{ getItem(){ throw Error('bloqué'); }, setItem(){} } };
  ctx.guets = []; ctx.setInterval = (f, ms) => ctx.guets.push({ f, ms }); ctx.clearInterval = () => {}; ctx.document.hidden = false;
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
  // La cote : seulement sur un devoir corrigé, avec son total ; écrite à la française.
  const { cote } = lance({ email:'' }).ctx.PortailEssai;
  assert.equal(cote(7.5, 10), '7,5 / 10'); assert.equal(cote(0, 10), '0 / 10'); assert.equal(cote(16, 20), '16 / 20');
  for (const [n, s] of [[undefined, 10], [null, 10], ['7', 10], [7, 0], [7, undefined], [-1, 10], [NaN, 10]]) assert.equal(cote(n, s), '');
  const c = Array.from(devoirsA([
    { titre:'Corrigé coté', lien:'', echeance:0, etat:'corrige', note:7.5, sur:10 },
    { titre:'Corrigé sans cote', lien:'', echeance:0, etat:'corrige' },
    { titre:'Rendu, cote glissée par erreur', lien:'', echeance:0, etat:'rendu', note:4, sur:10 }], t), x => x.cote);
  assert.deepEqual(c, ['7,5 / 10', '', ''], 'Pas de cote hors d\'un devoir corrigé');
  assert.ok(l.every(x => x.cote === ''));
  assert.match(html, /id="devoirs-points" hidden/, 'La phrase sur les points reste cachée tant qu\'aucune cote n\'est affichée');
  assert.equal(devoirsA(null, t).length, 0);
  assert.match(html, /id="devoirs" hidden/, 'Le panneau des devoirs est caché tant que le serveur n\'a rien donné');
}
// Le panneau s'ouvre quand le serveur donne une liste ; il reste caché sans service Classroom, et sur un ancien serveur.
{
  const d = { email:'e@example.test', prenom:'A', classe:'3F', prof:false, mesCours:'https://x/exec', tableau:'', devoirs:'https://classroom.google.com/w/x/t/all', cours:[], seance:null };
  let q = lance(d, { devoirs:[{ titre:'Portrait', lien:'https://classroom.google.com/c/x/a/1', echeance:0, etat:'a-rendre' }] });
  assert.equal(q.$('devoirs').hidden, false); assert.equal(q.$('devoirs-liste').children.length, 1);
  assert.equal(q.$('devoirs-points').hidden, true, 'Aucune cote : pas de phrase sur les points');
  q = lance(d, { devoirs:[{ titre:'Portrait', lien:'https://classroom.google.com/c/x/a/1', echeance:0, etat:'corrige', note:8, sur:10 }] });
  // Les points sont repliés à l'ouverture : le devoir et son état se lisent, la cote attend « Voir mes points ».
  assert.equal(q.$('devoirs-plie').hidden, false); assert.equal(q.$('devoirs-voir').textContent, 'Voir mes points');
  assert.equal(q.$('devoirs-points').hidden, true); assert.ok(!JSON.stringify(q.$('devoirs-liste').children).includes('8 / 10'), 'Repliés : aucune cote à l\'écran');
  assert.ok(JSON.stringify(q.$('devoirs-liste').children).includes('Corrigé'));
  q.$('devoirs-voir').onclick();
  assert.equal(q.$('devoirs-points').hidden, false); assert.equal(q.$('devoirs-voir').textContent, 'Cacher mes points');
  assert.ok(JSON.stringify(q.$('devoirs-liste').children).includes('8 / 10'), 'La cote est écrite dans la ligne du devoir');
  q.$('devoirs-voir').onclick(); assert.ok(!JSON.stringify(q.$('devoirs-liste').children).includes('8 / 10'));
  assert.ok(html.indexOf('id="annonces"') < html.indexOf('id="devoirs"'), 'Les annonces passent avant les devoirs et les points');
  assert.match(html, /Pour les autres cours, ouvre <a target="_top" href="http:\/\/arcampin\.ecoleenligne\.be\/">École en ligne<\/a>/);
  q = lance(d, { devoirs:[] }); assert.equal(q.$('devoirs').hidden, false, 'Liste vide : « Aucun devoir pour le moment »');
  q = lance(d, { devoirs:null }); assert.notEqual(q.$('devoirs').hidden, false, 'Sans service Classroom, pas de panneau');
  q = lance(d); assert.notEqual(q.$('devoirs').hidden, false, 'Ancien serveur sans mesDevoirs : pas d\'erreur, pas de panneau');
  q = lance({ ...d, prof:true }, { devoirs:[] }); assert.notEqual(q.$('devoirs').hidden, false);
}
// Les annonces du flux : ce que le portail écrit, et quand le panneau s'ouvre.
{
  const { annoncesA } = lance({ email:'' }).ctx.PortailEssai;
  const l = Array.from(annoncesA([
    { texte:'Interro lundi', date:Date.UTC(2026, 10, 20, 8), lien:'https://classroom.google.com/c/x/p/1' },
    { texte:'Lien douteux', date:0, lien:'https://ailleurs.example/' }, { texte:'  ' }, null,
    { texte:'Trois', date:1, lien:'' }, { texte:'Quatre, de trop', date:1, lien:'' }
  ]), x => ({ ...x }));
  assert.deepEqual(l.map(x => x.texte), ['Interro lundi', 'Lien douteux', 'Trois']);
  assert.equal(l[0].quand, 'vendredi 20 novembre'); assert.equal(l[1].quand, ''); assert.equal(l[1].lien, '', 'Un lien hors Classroom est retiré');
  assert.match(html, /id="annonces" hidden/, 'Le panneau des annonces est caché tant que le serveur n\'a rien donné');
  const d = { email:'e@example.test', prenom:'A', classe:'3F', prof:false, mesCours:'https://x/exec', tableau:'', devoirs:'https://classroom.google.com/w/x/t/all', cours:[], seance:null };
  let q = lance(d, { annonces:[{ texte:'Interro lundi', date:1, lien:'https://classroom.google.com/c/x/p/1' }] });
  assert.equal(q.$('annonces').hidden, false); assert.equal(q.$('annonces-liste').children.length, 1);
  const boite = q.$('annonces-liste').children[0].enfants[0];
  assert.equal(boite.tag, 'div', 'Une boîte, pas un lien : l\'annonce porte ses propres liens');
  assert.equal(boite.enfants.at(-1).tag, 'a'); assert.equal(boite.enfants.at(-1).href, 'https://classroom.google.com/c/x/p/1');
  // La mise en page : gras, paragraphes, puces, liens ; tout le reste est du texte, jamais du HTML.
  const { miseEnForme } = q.ctx.PortailEssai;
  const f = JSON.parse(JSON.stringify(miseEnForme('**Journal de classe 2F**\njeudi 26 novembre\n\n- Révise la feuille\n• et le site : https://root75.github.io/campin-public/x/.\n\n<img src=x onerror=alert(1)> **pas fermé')));
  assert.deepEqual(f.map(b => b.type), ['p', 'ul', 'p']);
  assert.deepEqual(f[0].lignes, [[{ t:'gras', v:'Journal de classe 2F' }], [{ t:'texte', v:'jeudi 26 novembre' }]]);
  assert.deepEqual(f[1].lignes[1], [{ t:'texte', v:'et le site : ' }, { t:'lien', v:'https://root75.github.io/campin-public/x/' }, { t:'texte', v:'.' }], 'Le point final ne fait pas partie de l\'adresse');
  assert.deepEqual(f[2].lignes, [[{ t:'texte', v:'<img src=x onerror=alert(1)> **pas fermé' }]], 'Du HTML dans une annonce reste du texte');
  assert.ok(!/innerHTML|insertAdjacentHTML/.test(script), 'Le portail n\'écrit jamais de HTML à partir d\'un texte');
  assert.equal(JSON.stringify(miseEnForme('javascript:alert(1) et ftp://x')).includes('"lien"'), false, 'Seules les adresses http(s) deviennent des liens');
  q = lance(d, { annonces:[{ texte:'**Titre**\nligne\n- a\n- b', date:0, lien:'' }] });
  const corps = q.$('annonces-liste').children[0].enfants[0].enfants[0];
  assert.deepEqual(corps.enfants.map(x => x.tag), ['p', 'ul']); assert.deepEqual(corps.enfants[0].enfants.map(x => x.tag || x), ['b', 'br', 'ligne']);
  assert.equal(corps.enfants[1].enfants.length, 2);
  q = lance(d, { annonces:[] }); assert.notEqual(q.$('annonces').hidden, false, 'Aucune annonce : pas de panneau vide');
  q = lance(d, { annonces:null }); assert.notEqual(q.$('annonces').hidden, false);
  q = lance(d); assert.notEqual(q.$('annonces').hidden, false, 'Ancien serveur sans mesAnnonces : pas d\'erreur, pas de panneau');
  q = lance({ ...d, prof:true }, { annonces:[{ texte:'x', date:1, lien:'' }] }); assert.notEqual(q.$('annonces').hidden, false);
}
// « Pour nommer ton travail » : seulement pour une classe qui suit un cours où l'on crée et nomme un document.
{
  const d = { email:'e@example.test', prenom:'A', classe:'1B', prof:false, mesCours:'https://x/exec', tableau:'', devoirs:'', seance:null };
  assert.match(html, /id="date-nommer" hidden/);
  let q = lance({ ...d, cours:['rat-de-ville-formatif'] }); assert.equal(q.$('date-nommer').hidden, false); assert.equal(q.$('date').hidden, false);
  q = lance({ ...d, classe:'3F', cours:['python-1'] }); assert.equal(q.$('date-nommer').hidden, true, 'Pas de document à nommer en Python');
  assert.equal(q.$('date').hidden, false, 'La date du jour reste pour tout le monde');
  q = lance({ ...d, prof:true, cours:[] }); assert.equal(q.$('date-nommer').hidden, true);
  q = lance({ email:'' }); assert.equal(q.$('date-nommer').hidden, true, 'Page publique : la date seule');
}

/* ----- Le chat de la classe : le portail (page d'accueil de toute l'école) n'interroge pas le serveur sans raison. ----- */
(async () => {
  assert.doesNotMatch(html, /id="chat"/, 'plus de section dans la page : le chat est un bouton en bas à droite');
  const d = { email:'eleve@example.test', prenom:'Camille', classe:'1B', prof:false, mesCours:'https://x/exec', cours:[] };
  const tic = () => new Promise(r => setImmediate(r));
  // Ni chat ni séance : rien n'est chargé, rien n'est programmé.
  let q = lance(d); assert.equal(q.ctx.guets.length, 0);
  assert.ok(!q.ajoutes.some(s => /chat\.js/.test(s.src || '')));
  // Séance en cours, chat fermé : une question par minute, et le script du chat n'est pas chargé.
  q = lance({ ...d, seance:{ titre:'Messagerie 01', url:'https://x' } });
  assert.deepEqual(q.ctx.guets.map(g => g.ms), [60000]); assert.ok(!q.ajoutes.some(s => /chat\.js/.test(s.src || '')));
  // Chat ouvert : le script est chargé depuis le site, et le bouton « 💬 Chat » est posé (pas de fil dans la page).
  q = lance({ ...d, chat:true });
  assert.deepEqual(q.ctx.guets.map(g => g.ms), [60000], 'toujours une seule question par minute');
  const s = q.ajoutes.find(x => /^https:\/\/root75\.github\.io\/campin-public\/chat\/chat\.js/.test(x.src || '')); assert.ok(s, 'chat.js chargé à la demande');
  let bulle = null; q.ctx.CampinChat = { monte(){ throw Error('le fil ne se monte plus dans la page'); },
    bulle: o => (bulle = { o, vus:[], signale(n){ this.vus.push(n); }, retire(){ this.retiree = true; } }) };
  s.onload(); await tic(); assert.ok(bulle, 'bouton en bas à droite'); assert.deepEqual(bulle.vus, [0]);
  // La question de la minute : du nouveau ▸ la pastille ; le professeur a fermé ▸ le bouton disparaît.
  let rep = { ouvert:true, dernier:7 }; const lus = [];
  q.ctx.google.script.run.chatLire = function(depuis){ lus.push(depuis); this.f(rep); };
  q.ctx.guets[0].f(); await tic(); assert.deepEqual(lus, [1e9], 'on ne demande que le numéro du dernier message'); assert.deepEqual(bulle.vus, [0, 7]);
  rep = { ouvert:false }; q.ctx.guets[0].f(); await tic(); assert.equal(bulle.retiree, true, 'chat fermé : le bouton disparaît');
  // Le salon se ferme pendant que le panneau est ouvert : même effet.
  const premier = bulle; rep = { ouvert:true, dernier:9 }; q.ctx.guets[0].f(); await tic(); assert.notEqual(bulle, premier, 'rouvert : un nouveau bouton');
  bulle.o.surFerme(); assert.equal(bulle.retiree, true);
  // Onglet caché : aucune question.
  q.ctx.document.hidden = true; q.ctx.guets[0].f(); await tic(); assert.equal(lus.length, 3);
  // Le professeur et l'élève sans classe n'ont pas de chat sur le portail.
  assert.equal(lance({ ...d, prof:true, chat:true }).ajoutes.some(x => /chat\.js/.test(x.src || '')), false);
  assert.equal(lance({ ...d, classe:'', chat:true }).ajoutes.some(x => /chat\.js/.test(x.src || '')), false);
  console.log('Portail : chat de la classe en bas à droite, chargé seulement quand il est ouvert.');
})().catch(e => { console.error(e); process.exit(1); });

