// Vie en ligne 01 — Derrière l'écran : la fiche, ses preuves (trois variantes), le catalogue, le conducteur avec son vote
// d'avis, et la page « je m'entraîne » (situations.json, jeu.js).
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const racine=path.resolve(__dirname,'..'),lis=f=>fs.readFileSync(path.join(racine,f),'utf8');
const base='derriere-lecran/pas-a-pas/';
const x=vm.createContext({module:{exports:{}},Map,Set,console});vm.runInContext(lis(base+'fiche.js'),x);
const F=JSON.parse(JSON.stringify(x.module.exports)),proofs=JSON.parse(lis(base+'preuves.json'));
const sansB=c=>c.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();

assert.equal(F.COURS,'vie-en-ligne-1');
assert.equal(F.BLOCS.length,proofs.blocs.length,'un bloc par liste de preuves');
F.BLOCS.forEach((B,i)=>{
  assert.ok(B.q&&B.q.serveur,'bloc '+(i+1)+' corrigé par le serveur');
  for(const k of ['partie','titre','min','veux','avant'])assert.ok(B[k],k+' '+(i+1));
  assert.ok(B.essai ? !B.vois : B.vois && B.vois.length<130 && !/^Je sais|^Je peux/.test(B.vois),'à vérifier '+(i+1));
  assert.ok(B.essai?(B.essai.q&&B.essai.choix.length===3&&B.essai.apres):(B.gestes.length>=2&&B.gestes.length<=6),'essai sur un exemple, ou 2 à 6 cases '+(i+1));
  assert.ok(B.coince&&B.coince.length>=2,'Ça coince ? '+(i+1));
  (B.gestes||[]).forEach(g=>{
    assert.ok(/<b[\s>]/.test(g),'case sans mot en gras : '+sansB(g).slice(0,60));
    assert.ok(!/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/.test(sansB(g)),'une interdiction dans une case : '+sansB(g).slice(0,60));
  });
});
const cat=JSON.parse(lis('pas-a-pas/cours.json')).cours.find(c=>c.id==='vie-en-ligne-1');
assert.ok(cat&&cat.etapes===F.BLOCS.length&&cat.preuves===base+'preuves.json'&&cat.chemin===base,'catalogue');
assert.equal(cat.criteres,F.GRILLE.criteres.length,'auto-évaluation : autant de critères au catalogue que dans la fiche');
assert.match(cat.titre,/^Vie en ligne 01 — /);
// L'auto-évaluation de fin : quatre critères de la grille « Sécurité » (U4), intitulés exacts, 2 et 3 incontournables.
assert.deepEqual(F.GRILLE.criteres.map(c=>c.regarde.replace('Critère : ','')),['Repérage des risques et des informations sensibles','Mise en œuvre de comportements de protection','Réaction face aux situations problématiques','Communication et justification']);
assert.deepEqual(F.GRILLE.criteres.map(c=>c.inc),[false,true,true,false]);
F.GRILLE.criteres.forEach(c=>['A','B','C','D'].forEach(l=>assert.ok(c[l]&&c[l].length>15,'niveau '+l+' de « '+c.n+' »')));
assert.ok(F.FIN.citation.texte&&F.FIN.citation.auteur&&F.FIN.revision.url.endsWith('/derriere-lecran/'));

// Un cours ne dépend pas de l'année ; ni photo ni téléphone dans une consigne ; touches en anglais.
const page=lis(base+'index.html'),texte=JSON.stringify(F.BLOCS)+JSON.stringify(F.FIN)+JSON.stringify(F.GRILLE)+JSON.stringify(proofs)+page;
assert.ok(!/\b[123][A-H]\b/.test(texte),'pas de nom de classe');
assert.ok(!/20\d\d|lundi|mardi|mercredi|jeudi|vendredi/i.test(JSON.stringify(F.BLOCS)+JSON.stringify(proofs)),'pas de date ni de jour');
assert.ok(!/\b(Suppr|Échap|Entrée|Maj)\b/.test(texte),'touches en anglais');
assert.ok(!/photo|smartphone|téléphone|selfie/i.test(texte.replace(page,page.slice(page.indexOf('<body>')))),'ni photo ni téléphone');
assert.ok(!/[a-z0-9.]+@arcampin\.be/i.test(texte),'aucune adresse');
assert.ok(page.includes('derriere-lecran/pas-a-pas/fiche.js')&&page.includes('pas-a-pas/blocs.js')&&page.includes('pas-a-pas/sequence-eleve.js')&&page.includes('pas-a-pas/cloche.js'),'scripts du moteur');
assert.ok(!/(src|href)="(?!https:\/\/|#)/.test(page.replace(/href="https:\/\/fonts[^"]*"/g,'')),'adresses absolues : la page est aussi servie par Apps Script');
assert.ok(page.includes('M. Louviaux'));

// Règle anti-recopie : trois variantes du même type, chacune avec sa bonne réponse.
proofs.blocs.forEach((l,i)=>{
  assert.equal(l.length,3,'3 variantes étape '+(i+1));
  assert.equal(new Set(l.map(v=>v.type)).size,1,'même type '+(i+1));
  l.forEach((v,k)=>{
    if(v.type==='qcm'){
      assert.ok(v.c.length===4&&v.p.length===4&&v.p[0]===null&&v.juste,'qcm '+(i+1)+'.'+(k+1));
      v.p.slice(1).forEach(t=>assert.ok(t&&t.length>10,'explication du piège '+(i+1)+'.'+(k+1)));
      assert.equal(new Set(v.c).size,4,'choix uniques');
      l.forEach((w,j)=>{if(j!==k){assert.notEqual(w.c[0],v.c[0],'réponse partagée '+(i+1));assert.notEqual(w.q,v.q);}});
    }else{
      assert.equal(v.type,'trous');
      assert.equal(v.texte.split('___').length-1,v.mots.length,'un mot par trou '+(i+1)+'.'+(k+1));
      assert.ok(v.mots.length>=2&&v.pieges.length>=2&&v.juste&&v.aide,'trous, pièges, juste, aide '+(i+1)+'.'+(k+1));
      assert.equal(new Set(v.mots.concat(v.pieges)).size,v.mots.length+v.pieges.length,'banque sans doublon '+(i+1)+'.'+(k+1));
      assert.equal(v.phrase||'',l[0].phrase||'','même phrase libre pour les trois variantes '+(i+1));
      if(v.phrase)assert.ok(v.phrase.endsWith('?'));
      l.forEach((w,j)=>{if(j!==k)assert.notEqual(w.mots.join('/'),v.mots.join('/'),'mots partagés '+(i+1));});
    }
  });
});
assert.deepEqual(proofs.blocs.map(l=>l[0].type),['trous','trous','qcm','qcm','qcm','trous']);
// Les deux mises en commun par « Leurs phrases » : le « Ok. » réécrit (étape 2), la règle du groupe (étape 6).
assert.deepEqual(proofs.blocs.map(l=>!!l[0].phrase),[false,true,false,false,false,true]);

// Le conducteur : des moments variés, deux ateliers qui couvrent toutes les étapes, des tris branchés sur une récolte.
const seq=JSON.parse(lis('pas-a-pas/sequences.json'))['vie-en-ligne-1'],M=seq.moments;
assert.ok(seq.ecransSurPostes===true&&seq.objectif.startsWith('L’élève est capable de')&&seq.competences.length>=4&&seq.preparation.length>=3);
for(const t of ['ecran','mots','tri','vote','atelier','fin'])assert.ok(M.some(m=>m.type===t),'un moment '+t);
M.forEach((m,i)=>{assert.ok(m.titre&&m.min>0&&m.methode,'moment '+(i+1));if(m.type==='tri')assert.equal(M[m.source].type,'mots','le tri '+(i+1)+' range une récolte de mots');});
assert.deepEqual(M.filter(m=>m.type==='atelier').map(m=>m.blocs),[[1,3],[4,6]]);
assert.equal(M[M.length-1].type,'fin');
// Le vote d'avis : huit familles, aucune « bonne », une explication par situation — et le moteur le sait.
const vote=M.find(m=>m.type==='vote');
assert.deepEqual(vote.choix,F.FAMILLES.map(f=>f[0]));
vote.situations.forEach(s=>{assert.ok(!('bonne' in s)&&s.texte&&s.explication.startsWith('Pas de bonne réponse'));});
assert.match(lis('pas-a-pas/tableau.js'),/s\.bonne != null\) \? "Montrer la bonne réponse" : "Montrer la mise en commun"/);
const sq=lis('pas-a-pas/sequence-eleve.js');
assert.match(sq,/if\(bon == null\)\{ if\(moi\[k\] != null\) d\.append\(el\("p", "sq-res", "Ton choix : "/);
assert.ok(sq.includes('"✗ La bonne réponse : "'),'un vote corrigé garde son verdict');
assert.ok(!/photo|smartphone|téléphone/i.test(JSON.stringify(seq)),'ni photo ni téléphone dans le déroulé');
assert.ok(!/\b[123][A-H]\b|20\d\d(?!\))|lundi|mardi|mercredi|jeudi|vendredi/.test(JSON.stringify(seq).replace('(1980)','')),'le déroulé ne dépend pas de l\'année');

// « Je m'entraîne » : dix situations en trois temps, sur les mêmes familles et les attendus cités.
const d=JSON.parse(lis('derriere-lecran/situations.json')),J=require('../derriere-lecran/jeu.js');
assert.deepEqual(d.emotions.map(e=>[e.nom,e.couleur]),F.FAMILLES.map(f=>[f[0],f[1]]),'la roue de la page et celle du cours sont la même');
const emos=new Set(d.emotions.map(e=>e.id)),ids=new Set();
assert.ok(d.situations.length>=2*J.MANCHE,'de quoi jouer deux manches sans répétition');
for(const s of d.situations){
  assert.match(s.id,/^[a-z0-9\-]+$/);assert.ok(!ids.has(s.id),s.id+' en double');ids.add(s.id);
  assert.ok(s.titre&&s.retenir&&d.attendus[s.attendu],s.id+' : titre, à retenir, attendu');
  const sc=s.scene;
  if(sc.genre==='discussion'){assert.ok(sc.lieu&&sc.detail&&sc.messages.length>=2,s.id);sc.messages.forEach(m=>assert.ok(m.info||(m.de&&m.texte&&m.heure),s.id+' : message incomplet'));}
  else{assert.equal(sc.genre,'publication');assert.ok(sc.compte&&sc.texte&&sc.bas,s.id);}
  assert.ok(s.percevoir.question&&s.percevoir.pourquoi&&s.percevoir.souvent.length>=2&&s.percevoir.souvent.every(e=>emos.has(e)),s.id+' : percevoir');
  assert.ok(!('bon' in s.percevoir),s.id+' : percevoir n\'a pas de bonne réponse');
  for(const t of ['comprendre','ajuster']){
    assert.ok(s[t].question&&s[t].choix.length===3,s.id+' ▸ '+t+' : trois choix');
    assert.equal(s[t].choix.filter(c=>c.bon).length,1,s.id+' ▸ '+t+' : un seul bon choix');
    s[t].choix.forEach(c=>assert.ok(c.texte&&c.retour&&c.retour.length>15&&typeof c.bon==='boolean',s.id+' ▸ '+t+' : chaque choix a son retour'));
  }
}
assert.ok(Object.keys(d.attendus).every(k=>d.situations.some(s=>s.attendu===k)),'chaque attendu cité sert à une situation');
// Le tirage : pas de doublon, les situations pas encore vues d'abord ; le bilan ne compte que le premier essai.
let g=1;const hasard=()=>(g=(g*16807)%2147483647)/2147483647;
const m1=J.tirage(d.situations,[],J.MANCHE,hasard),m2=J.tirage(d.situations,m1.map(s=>s.id),J.MANCHE,hasard);
assert.equal(new Set(m1.concat(m2).map(s=>s.id)).size,2*J.MANCHE,'deux manches de suite sans répétition');
assert.deepEqual(J.bilan([{comprendre:1,ajuster:2},{comprendre:3,ajuster:1}]),{situations:2,comprendre:1,ajuster:1});
const pj=lis('derriere-lecran/index.html'),js=lis('derriere-lecran/jeu.js');
assert.ok(pj.includes('id="essentiel"')&&pj.includes('id="jeu"')&&pj.includes('« M. Louviaux »')&&pj.includes('ConnectÉmoi')&&pj.includes('Plutchik'),'ancres, signature, sources');
assert.ok(!/smartphone|téléphone|selfie/i.test(pj+js)&&!/[a-z0-9.]+@arcampin\.be/i.test(pj),'ni téléphone ni adresse');
assert.ok(!/innerHTML/.test(js),'le jeu n\'écrit que du texte');
console.log('OK : Vie en ligne 01 — '+F.BLOCS.length+' étapes ('+F.BLOCS.reduce((t,B)=>t+B.min,0)+' min de travail seul), '+M.length+' moments ('+M.reduce((t,m)=>t+m.min,0)+' min), '+d.situations.length+' situations d\'entraînement.');
