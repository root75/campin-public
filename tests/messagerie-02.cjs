// Messagerie 02 : preuves (variantes anti-recopie), contrôle de la réponse au professeur, compatibilité serveur.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const base=__dirname+'/../messagerie-2/pas-a-pas/';
const src=fs.readFileSync(base+'fiche.js','utf8');const proofs=JSON.parse(fs.readFileSync(base+'preuves.json'));
const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8');
const fonction=(s,n)=>{const i=s.indexOf('function '+n+'(');let p=s.indexOf('{',i),d=0,j=p;for(;j<s.length;j++){if(s[j]==='{')d++;else if(s[j]==='}'&&--d===0)break;}return s.slice(i,j+1);};
const x=vm.createContext({module:{exports:{}},Map,Set,console});vm.runInContext(src,x);
const F=x.module.exports;
// La règle locale du moteur (blocs.js), la même que regle_() de Code.gs.
vm.runInContext(moteur.slice(moteur.indexOf('const norm ='),moteur.indexOf('const melange'))+'\n'+fonction(moteur,'regle')+';globalThis.regleMoteur=regle;',x);
F.regle=x.regleMoteur;
assert.equal(F.BLOCS.length,proofs.blocs.length,'un bloc par liste de preuves');
F.BLOCS.forEach((B,i)=>{assert.ok(B.q&&B.q.serveur,'bloc '+(i+1)+' corrigé par le serveur');for(const k of ['partie','titre','min','veux','vois'])assert.ok(B[k],k+' '+(i+1));assert.ok((B.gestes||[]).length>=3,'gestes '+(i+1));assert.ok(B.coince.length,'coince '+(i+1));});
assert.equal(F.BLOCS[7].q.type,'redaction');assert.equal(typeof F.BLOCS[7].q.controle,'function');
const cat=JSON.parse(fs.readFileSync(__dirname+'/../pas-a-pas/cours.json')).cours.find(c=>c.id==='messagerie-2');
assert.ok(cat&&cat.etapes===F.BLOCS.length&&cat.preuves==='messagerie-2/pas-a-pas/preuves.json','catalogue');
assert.ok(JSON.parse(fs.readFileSync(__dirname+'/../pas-a-pas/sequences.json'))['messagerie-2'].moments.length>=3,'conducteur');
const minutes=F.BLOCS.reduce((t,B)=>t+B.min,0);

// Règle anti-recopie : toutes les étapes sauf le brouillon (8) ont 3 variantes, chacune avec sa bonne réponse.
proofs.blocs.forEach((l,i)=>{
  if(i===7){assert.equal(l.length,1);return;}
  assert.equal(l.length,3,'3 variantes étape '+(i+1));
  assert.equal(new Set(l.map(v=>v.q+'|'+(v.c?v.c[0]:JSON.stringify(v.regle)))).size,3,'variantes distinctes '+(i+1));
  assert.equal(new Set(l.map(v=>v.type)).size,1,'même type '+(i+1));
  l.forEach((v,k)=>{
    if(v.type==='qcm'){
      assert.equal(v.p.length,v.c.length,'p/c '+(i+1)+'.'+(k+1));assert.equal(v.p[0],null);
      v.p.slice(1).forEach(t=>assert.ok(t&&t.length>10,'explication du piège '+(i+1)+'.'+(k+1)));
      assert.equal(new Set(v.c).size,v.c.length,'choix uniques');
      // La bonne réponse d'une variante n'est pas celle des deux autres (sauf étape 1 : même piège impossible).
      l.forEach((w,j)=>{if(j!==k&&w.c.includes(v.c[0]))assert.notEqual(w.c[0],v.c[0],'réponse partagée '+(i+1));});
    }else assert.ok(v.faux&&v.aide,'faux/aide '+(i+1)+'.'+(k+1));
  });
});
// Étape 3 : chaque saisie n'accepte que sa propre réponse.
const bons3=['Ta fiche à compléter','vlouviaux@arcampin.be','Ma fiche a completer.docx'];
proofs.blocs[2].forEach((v,k)=>bons3.forEach((b,j)=>assert.equal(F.regle(v.regle,b),j===k,'étape 3 v'+(k+1)+' / '+b)));
assert.ok(F.regle(proofs.blocs[2][1].regle,'alexia.michiels@arcampin.be'));

// Étape 8 : la réponse au professeur.
const ok='Bonjour Monsieur,\nVoici ma fiche complétée, en pièce jointe.\nMa réponse préférée est le plat, parce que j’adore les lasagnes.\nBonne journée,\nLina Dupont, 2B';
assert.deepEqual([...F.erreursReponse(ok,'Lina Dupont','2B')],[]);
assert.deepEqual([...F.erreursReponse(ok.replace('Monsieur','Madame'),'Lina Dupont','')],[]);
const cas=[
  [ok.replace('Bonjour Monsieur,','Coucou,'),/salutation/],
  [ok.replace('Bonjour','bonjour'),/« Bonjour » prend une majuscule/],
  [ok.replace('Monsieur,','monsieur,'),/Monsieur.*majuscule/],
  [ok.replace('Monsieur,','Monsieur'),/virgule/],
  [ok.replace('Monsieur,\n','Monsieur, voici\n'),/seulement la salutation/],
  [ok.replace(', en pièce jointe',''),/pièce jointe/],
  [ok.replace('Ma réponse préférée est le plat, parce que j’adore les lasagnes.','[Une phrase]'),/crochets/],
  [ok.replace('lasagnes.','lasagnes'),/point/],
  [ok.replace('Ma réponse','ma réponse'),/majuscule/],
  [ok.replace('parce que','pk'),/SMS/],
  [ok.replace('Bonne journée,\n',''),/formule de fin/],
  [ok.replace(', 2B',''),/classe/],
  [ok.replace('Lina Dupont','Lina'),/prénom et ton nom/],
  ['Bonjour Monsieur, voici ma fiche.',/plusieurs lignes/]
];
for(const [t,m] of cas)assert.match(F.erreursReponse(t,'Lina Dupont','2B').join(' | '),m,t);
// « c’est » ne doit pas être pris pour du langage SMS.
assert.deepEqual([...F.erreursReponse(ok.replace('Ma réponse préférée est le plat','C’est le plat que je préfère'),'Lina Dupont','2B')],[]);

// Compatibilité avec le serveur : regle_ et norm_ de Code.gs (copie), réponse tronquée à 190 caractères.
let gs='';try{gs=fs.readFileSync(__dirname+'/../../campin-pedagogique/outils/pas-a-pas/Code.gs','utf8');}catch(_){}
const extrait=n=>{const i=gs.indexOf('function '+n+'(');if(i<0)return '';let p=gs.indexOf('{',i),d=0,j=p;for(;j<gs.length;j++){if(gs[j]==='{')d++;else if(gs[j]==='}'&&--d===0)break;}return gs.slice(i,j+1);};
if(gs){
  vm.runInContext(extrait('norm_')+'\n'+extrait('regle_'),x);
  x.rule=proofs.blocs[7][0].regle;x.answer=ok.trim().slice(0,190);
  assert.equal(vm.runInContext('regle_(rule,answer,"")',x),true,'serveur : brouillon');
  proofs.blocs[2].forEach((v,k)=>{x.rule=v.regle;x.answer=bons3[k];assert.equal(vm.runInContext('regle_(rule,answer,"")',x),true,'serveur étape 3 v'+(k+1));});
  console.log('Code.gs lu : règles identiques côté serveur.');
}else console.log('Code.gs absent (campin-pedagogique non cloné à côté) : contrôle serveur sauté.');
assert.ok(F.regle(proofs.blocs[7][0].regle,ok.slice(0,190)),'brouillon : règle locale');
assert.ok(!F.regle(proofs.blocs[7][0].regle,'Salut, voici ma fiche'),'brouillon : règle refuse');

// Le contrôle du bloc 8, tel que le moteur l'appelle : controle(texte, valeurs, {classe}).
assert.deepEqual([...F.BLOCS[7].q.controle(ok,{nom:'Lina Dupont'},{classe:'2B'})],[]);
assert.ok(F.BLOCS[7].q.controle('Salut',{nom:''},{classe:''}).length>0);
console.log('OK : Messagerie 02 — '+proofs.blocs.length+' blocs ('+minutes+' min de travail), variantes, réponse au professeur, '+cas.length+' erreurs repérées.');
