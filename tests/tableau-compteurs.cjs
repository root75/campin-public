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
assert.equal(blocDe(e({atteint:4})),5,'bloc en cours = atteint + 1');assert.equal(blocDe(e({atteint:4,aide:{bloc:6}})),6,'la cloche dit son bloc');
console.log('Compteurs et bandeau : coincés sans sonner, inactifs, butent, bloc de chaque élève vérifiés.');
