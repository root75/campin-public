/* Compteurs cliquables du tableau prof : qui est « coincé sans sonner », qui est « inactif ». */
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2]||require.resolve('../pas-a-pas/tableau.js'),'utf8');
const bout=(a,b)=>{const i=source.indexOf(a),j=source.indexOf(b,i);assert.ok(i>=0&&j>i,a);return source.slice(i,j);};
const c=vm.createContext({});
vm.runInContext(bout('const INACTIF','const ilya')+bout('const estInactif','function filtreCompteur'),c);
const m=60000,d={maintenant:100*m},e=x=>Object.assign({fini:false,aide:null,erreursIci:0,derniere:99*m,depuisBloc:95*m},x);
const F=vm.runInContext('FILTRES',c);
assert.equal(F.silencieux.garde(e({depuisBloc:85*m}),d),true,'15 min sur le bloc, actif, sans cloche');
assert.equal(F.silencieux.garde(e({depuisBloc:95*m}),d),false,'5 min : pas encore');
assert.equal(F.silencieux.garde(e({depuisBloc:85*m,aide:{bloc:3}}),d),false,'a sonné : ce n’est plus silencieux');
assert.equal(F.silencieux.garde(e({depuisBloc:85*m,derniere:80*m}),d),false,'inactif : compté à part');
assert.equal(F.silencieux.garde(e({depuisBloc:0}),d),false,'serveur sans depuisBloc : rien');
assert.equal(F.inactif.garde(e({derniere:80*m}),d),true);assert.equal(F.inactif.garde(e({derniere:80*m,fini:true}),d),false,'fini : pas inactif');
assert.equal(F.bute.garde(e({erreursIci:3}),d),true);
// Bandeau « corriger ensemble » : qui coince, et à quel bloc.
vm.runInContext(bout('const SEUIL_COMMUN','function ouEstLaClasse'),c);
const coince=vm.runInContext('estCoince',c),blocDe=vm.runInContext('blocDe',c);
assert.equal(vm.runInContext('SEUIL_COMMUN',c),4);
assert.equal(coince(e({aide:{bloc:6}}),d),true);assert.equal(coince(e({erreursIci:3}),d),true);assert.equal(coince(e({depuisBloc:85*m}),d),true);
assert.equal(coince(e({}),d),false);assert.equal(coince(e({aide:{bloc:6},fini:true}),d),false,'fini : jamais coincé');
assert.equal(coince(e({aide:{bloc:6,motif:'consigne'}}),d),true,'motif consigne : coincé');assert.equal(coince(e({aide:{bloc:9,motif:'accord'}}),d),false,'demande d’accord avant la remise : pas coincé');
assert.equal(coince(e({aide:{bloc:9,motif:'accord'},erreursIci:3}),d),true,'accord demandé mais bute encore : coincé');assert.equal(F.aide.garde(e({aide:{bloc:9,motif:'accord'}})),true,'un accord attend quand même le professeur');
assert.equal(blocDe(e({atteint:4})),5,'bloc en cours = atteint + 1');assert.equal(blocDe(e({atteint:4,aide:{bloc:6}})),6,'la cloche dit son bloc');
console.log('Compteurs et bandeau : coincés sans sonner, inactifs, butent, bloc de chaque élève vérifiés.');
{ // Mesure affichée à côté de « Mis à jour à … »
  const m=vm.createContext({});vm.runInContext(bout('const secondes','const resume'),m);
  const f=vm.runInContext('mesure',m);
  assert.equal(f({}),'','pas d’aller-retour (démo) : rien');
  assert.match(f({_allerRetour:1800,mesure:{ms:420,lignes:2400}}),/^ · 1,8 s \(serveur 0,4 s, 2.400 lignes lues\)$/);
  assert.match(f({_allerRetour:900}),/^ · 0,9 s$/,'ancien serveur sans mesure : l’aller-retour seul');
  console.log('Mesure du chargement : affichage vérifié.');
}
{ // Grille « Qui a rendu ? » : le nom sans le suffixe du compte, la cote seulement si on la demande.
  const g=vm.createContext({});vm.runInContext(bout('const DEVOIRS_VUS','let POINTS_VISIBLES')+bout('const frCote','function chargeDevoirs'),g);
  const r={travaux:[{id:'a',titre:'Labo 05',sur:20}],eleves:[{nom:'Aaron MALIGO (élève)',remises:{a:{etat:'corrige',note:8}}},{nom:'Charly CARON (student)',remises:{a:{etat:'retard'}}},{nom:'Léa Dupont',remises:{}}]};
  const f=vm.runInContext('grilleDevoirs',g);
  assert.deepEqual(f(r,false).eleves.map(e=>e.nom),['Aaron MALIGO','Charly CARON','Léa Dupont']);
  assert.deepEqual(f(r,false).eleves.map(e=>e.cases[0].mot),['Corrigé','En retard','—']);
  assert.equal(f(r,true).eleves[0].cases[0].mot,'8 / 20');assert.equal(f(r,true).travaux[0].rendus,1);
  assert.match(source,/th\.title = w\.titre/,'le titre entier au survol');
  // Un devoir choisi : sa colonne seule, ceux qui n'ont pas rendu en haut, et le bilan en une ligne.
  const r2={travaux:[{id:'a',titre:'Labo 05',sur:20},{id:'b',titre:'Python 02',sur:0,lien:'https://classroom.google.com/c/x/a/b'}],eleves:[
    {nom:'Zoé A',remises:{a:{etat:'rendu'},b:{etat:'corrige'}}},{nom:'Basil B',remises:{a:{etat:'rendu'},b:{etat:'rendu'}}},{nom:'Alex C',remises:{a:{etat:'rendu'},b:{etat:'rendu'}}},
    {nom:'Yan D',remises:{b:{etat:'a-rendre'}}},{nom:'Aaron E',remises:{b:{etat:'retard'}}},{nom:'Hors F',remises:{a:{etat:'rendu'}}}]};
  const u=f(r2,false,'b');
  assert.deepEqual(u.travaux.map(w=>w.id),['b']);assert.equal(u.seul.lien,'https://classroom.google.com/c/x/a/b');
  assert.deepEqual(u.eleves.map(e=>e.nom),['Aaron E','Yan D','Alex C','Basil B','Zoé A','Hors F']);
  assert.equal(u.bilan,'1 en retard · 1 à rendre · 2 rendus · 1 corrigé');
  assert.equal(f(r2,false,'').travaux.length,2);assert.equal(f(r2,false,'disparu').seul,undefined,'devoir inconnu : toute la grille');
  assert.deepEqual(f(r2,false).eleves.map(e=>e.nom)[0],'Zoé A','toute la grille : l’ordre du serveur');
  console.log('Grille des devoirs : noms sans suffixe, cotes sur demande, un devoir à la fois.');
}
{ // « Où en sont-ils ? » : les révisions de la classe, d'après la feuille « Progrès ».
  const g=vm.createContext({});vm.runInContext(bout('function nomsRevisions','function chargeRevisions'),g);
  const noms=vm.runInContext('nomsRevisions',g)(JSON.parse(fs.readFileSync(require.resolve('../revisions/revisions.json'),'utf8')));
  assert.deepEqual({...noms['quiz:python-1']},{cours:'Python 01',genre:'Quiz'});
  const f=vm.runInContext('grilleRevisions',g);
  const r={activites:['quiz:python-1','mots-croises:python-1','inconnue:x'],eleves:[{nom:'Zoé A',etats:{}},{nom:'Basil B',etats:{'quiz:python-1':'commence'}},
    {nom:'Alex C',etats:{'quiz:python-1':'fait','mots-croises:python-1':'fait'}},{nom:'Yan D',etats:{'quiz:python-1':'fait'}}]};
  const u=f(r,noms);
  assert.deepEqual(u.eleves.map(e=>e.nom),['Alex C','Yan D','Basil B','Zoé A'],'les plus avancés en haut, ceux qui n’ont rien ouvert en bas');
  assert.equal(u.muets,1);assert.deepEqual(u.activites.map(a=>a.cours+'|'+a.genre+'|'+a.faits),['inconnue:x||0','Python 01|Mots croisés|1','Python 01|Quiz|2']);
  assert.deepEqual(u.eleves[2].cases.map(c=>c.mot),['—','—','Commencé']);assert.deepEqual(u.eleves[0].cases.map(c=>c.mot),['—','✓ Fait','✓ Fait']);
  assert.equal(f({activites:[],eleves:[{nom:'A',etats:{}}]},{}).activites.length,0);
  assert.match(source,/if\(!d\.progres\) return null/,'serveur pas encore republié : pas de bouton');
  console.log('Révisions de la classe : avancement par élève vérifié.');
}
