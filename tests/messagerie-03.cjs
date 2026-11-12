// Messagerie 03 : preuves (variantes anti-recopie), catalogue, règles des saisies identiques côté serveur.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const base=__dirname+'/../messagerie-3/pas-a-pas/';
const src=fs.readFileSync(base+'fiche.js','utf8');const proofs=JSON.parse(fs.readFileSync(base+'preuves.json'));
const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8');
const fonction=(s,n)=>{const i=s.indexOf('function '+n+'(');let p=s.indexOf('{',i),d=0,j=p;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'&&--d===0)break;}return s.slice(i,j+1);};
const x=vm.createContext({module:{exports:{}},Map,Set,console});vm.runInContext(src,x);
const F=x.module.exports;
// La règle locale du moteur (blocs.js), la même que regle_() de Code.gs.
vm.runInContext(moteur.slice(moteur.indexOf('const norm ='),moteur.indexOf('const melange'))+'\n'+fonction(moteur,'regle')+';globalThis.regleMoteur=regle;',x);
const regle=x.regleMoteur;

assert.equal(F.COURS,'messagerie-3');
assert.equal(F.BLOCS.length,proofs.blocs.length,'un bloc par liste de preuves');
F.BLOCS.forEach((B,i)=>{
  assert.ok(B.q&&B.q.serveur,'bloc '+(i+1)+' corrigé par le serveur');
  for(const k of ['partie','titre','min','veux','vois'])assert.ok(B[k],k+' '+(i+1));
  assert.ok(B.essai?(B.avant&&B.essai.q&&B.essai.choix.length>=2):(B.gestes&&B.gestes.length>=2),'essai sur un exemple, ou des cases '+(i+1));
  assert.ok(B.coince&&B.coince.length>=1,'Ça coince ? '+(i+1));
});
const cat=JSON.parse(fs.readFileSync(__dirname+'/../pas-a-pas/cours.json')).cours.find(c=>c.id==='messagerie-3');
assert.ok(cat&&cat.etapes===F.BLOCS.length&&cat.preuves==='messagerie-3/pas-a-pas/preuves.json','catalogue');
const minutes=F.BLOCS.reduce((t,B)=>t+B.min,0);
assert.ok(minutes>=40&&minutes<=55,'une période de 50 min ('+minutes+')');

// Un cours ne dépend pas de l'année : pas de nom de classe, pas de date.
const texte=JSON.stringify(F.BLOCS)+JSON.stringify(F.FIN)+fs.readFileSync(base+'index.html','utf8');
assert.ok(!/\b[123][A-H]\b/.test(texte.replace(/⊞ \+ L|Ctrl \+ [A-Z]/g,'')),'pas de nom de classe');
assert.ok(!/20\d\d|lundi|mardi|mercredi|jeudi|vendredi/i.test(JSON.stringify(F.BLOCS)),'pas de date ni de jour');
// Les touches en anglais, comme sur le clavier.
assert.ok(!/\b(Suppr|Échap|Entrée|Maj)\b/.test(texte),'touches en anglais');

// Règle anti-recopie : trois variantes du même type, chacune avec sa bonne réponse.
proofs.blocs.forEach((l,i)=>{
  assert.equal(l.length,3,'3 variantes étape '+(i+1));
  assert.equal(new Set(l.map(v=>v.type)).size,1,'même type '+(i+1));
  assert.equal(new Set(l.map(v=>v.q+'|'+(v.c?v.c[0]:v.mots?v.mots.join('/'):JSON.stringify(v.regle)))).size,3,'variantes distinctes '+(i+1));
  l.forEach((v,k)=>{
    if(v.type==='qcm'){
      assert.equal(v.p.length,v.c.length,'p/c '+(i+1)+'.'+(k+1));assert.equal(v.p[0],null);
      v.p.slice(1).forEach(t=>assert.ok(t&&t.length>10,'explication du piège '+(i+1)+'.'+(k+1)));
      assert.equal(new Set(v.c).size,v.c.length,'choix uniques');
      l.forEach((w,j)=>{if(j!==k)assert.notEqual(w.c[0],v.c[0],'réponse partagée '+(i+1));});
    }else if(v.type==='trous'){
      assert.equal(v.texte.split('___').length-1,v.mots.length,'un mot par trou '+(i+1)+'.'+(k+1));
      assert.ok(v.mots.length>=2&&v.pieges.length>=2,'trous et pièges '+(i+1)+'.'+(k+1));
      assert.equal(new Set(v.mots.concat(v.pieges)).size,v.mots.length+v.pieges.length,'banque sans doublon '+(i+1)+'.'+(k+1));
      assert.ok(v.juste&&v.aide,'juste, aide '+(i+1)+'.'+(k+1));
      assert.equal(v.phrase||'',l[0].phrase||'','même phrase libre pour les trois variantes '+(i+1));
      if(v.phrase)assert.ok(v.phrase.endsWith('?'));
      l.forEach((w,j)=>{if(j!==k)assert.notEqual(w.mots.join('/'),v.mots.join('/'),'mots partagés '+(i+1));});
    }else assert.ok(v.type==='saisie'&&v.faux&&v.aide,'faux/aide '+(i+1)+'.'+(k+1));
  });
});
assert.deepEqual(proofs.blocs.map(l=>l[0].type),['trous','saisie','trous','qcm','trous','saisie','trous','qcm','trous']);

// Chaque saisie accepte ce qu'un élève écrit vraiment, et refuse les réponses des deux autres variantes.
const BONS={
  2:[['Marquer','marquer'],['bleu','bleue','en bleu','Bleu'],['Boîte de réception','boite de reception','la boîte de réception','dans la Boîte de réception']],
  6:[['Cci','CCI','la ligne Cci','dans Cci','sur la ligne Cci'],['ana.dubois@arcampin.be','Ana.Dubois@arcampin.be'],['non','Non','non, il ne la voit pas']]
};
const MAUVAIS={2:[['Supprimer','Marquer comme lu'],['gras','rouge','vert'],['Courrier indésirable','Éléments envoyés']],6:[['Cc','À'],['ana.dubois@arcampin.com','ana.dubois@gmail.com','ana dubois@arcampin.be'],['oui','oui il la voit']]};
for(const [n,listes] of Object.entries(BONS)){
  const l=proofs.blocs[n-1];
  listes.forEach((bons,k)=>{
    bons.forEach(b=>assert.ok(regle(l[k].regle,b),'étape '+n+' v'+(k+1)+' doit accepter « '+b+' »'));
    listes.forEach((autres,j)=>{if(j!==k)assert.ok(!regle(l[k].regle,autres[0]),'étape '+n+' v'+(k+1)+' ne doit pas accepter la réponse de la v'+(j+1)+' « '+autres[0]+' »');});
    (MAUVAIS[n][k]||[]).forEach(m=>assert.ok(!regle(l[k].regle,m),'étape '+n+' v'+(k+1)+' ne doit pas accepter « '+m+' »'));
  });
}

// Compatibilité avec le serveur : regle_ et norm_ de Code.gs (copie), sur les mêmes réponses.
let gs='';try{gs=fs.readFileSync(__dirname+'/../../campin-pedagogique/outils/pas-a-pas/Code.gs','utf8');}catch(_){}
const extrait=n=>{const i=gs.indexOf('function '+n+'(');if(i<0)return '';let p=gs.indexOf('{',i),d=0,j=p;for(;j<gs.length;j++){if(gs[j]==='{')d++;else if(gs[j]==='}'&&--d===0)break;}return gs.slice(i,j+1);};
if(gs){
  vm.runInContext(extrait('norm_')+'\n'+extrait('regle_'),x);
  for(const [n,listes] of Object.entries(BONS))listes.forEach((bons,k)=>bons.forEach(b=>{
    x.rule=proofs.blocs[n-1][k].regle;x.answer=b;
    assert.equal(vm.runInContext('regle_(rule,answer,"")',x),true,'serveur étape '+n+' v'+(k+1)+' « '+b+' »');
  }));
  console.log('Code.gs lu : règles identiques côté serveur.');
}else console.log('Code.gs absent (campin-pedagogique non cloné à côté) : contrôle serveur sauté.');
console.log('OK : Messagerie 03 — '+proofs.blocs.length+' blocs ('+minutes+' min de travail), 3 variantes par preuve.');
