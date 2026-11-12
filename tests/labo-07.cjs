// Labo 07 : structure du parcours, règles du dépôt, rappels, encadrés ⚠️, prolongements hors du fil, conducteur dégressif.
// L'essai complet dans Chromium (vrai Code.gs) est dans le dépôt privé : outils/pas-a-pas/essai-labo07.js.
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=__dirname+'/../labo-07/pas-a-pas/';
const src=fs.readFileSync(base+'fiche.js','utf8'),page=fs.readFileSync(base+'index.html','utf8');
const trame=fs.readFileSync(base+'trame-rapport.txt','utf8'),demos=fs.readFileSync(base+'demos.js','utf8');
const F=new Function(src+';return {COURS,BLOCS,PARCOURS,FIN,RAPPELS,email:e=>{EMAIL=e;}};')();
const sans=h=>String(h||'').replace(/<[^>]+>/g,' ');
let n=0;const ok=()=>n++;

assert.equal(F.COURS,'labo-07');
// Les numéros de blocs ne bougent pas : le serveur compte les blocs validés (une séance en cours ne doit pas glisser).
assert.equal(F.BLOCS.length,11);ok();
const cat=JSON.parse(fs.readFileSync(__dirname+'/../pas-a-pas/cours.json')).cours.find(c=>c.id==='labo-07');
assert.ok(cat&&cat.etapes===11,'catalogue');ok();
assert.equal(F.PARCOURS.at(-1).fin,11);ok();
F.PARCOURS.forEach((g,k)=>k&&assert.equal(g.debut,F.PARCOURS[k-1].fin,'groupes jointifs'));ok();

// Un cours ne dépend pas de l'année : ni nom de classe, ni date, ni jour. Touches en anglais.
const texte=JSON.stringify(F.BLOCS)+JSON.stringify(F.FIN)+page+trame;
assert.ok(!/\b[123][A-H]\b/.test(texte.replace(/Ctrl \+ [A-Z]|Shift \+ [A-Z]|Windows \+ [A-Z]|LABO07/g,'')),'pas de nom de classe');ok();
assert.ok(!/lundi|mardi|mercredi|jeudi|vendredi|novembre|décembre/i.test(texte),'pas de date ni de jour');ok();
assert.ok(!/\b(Suppr|Échap|Entrée|Maj)\b/.test(texte+demos),'touches en anglais');ok();

// Des gestes, pas un clic à la fois : 7 cases au plus (créer le rapport, le remettre), 6 ailleurs.
const cases=h=>(String(h).match(/type="checkbox"/g)||[]).length;
F.BLOCS.forEach((B,i)=>{assert.ok(cases(B.fais)<=([0,10].includes(i)?7:6),'cases du bloc '+(i+1)+' : '+cases(B.fais));});ok();
// Une hypothèse se lit d'un seul tenant : la question et sa zone de réponse juste sous les cases.
F.BLOCS.forEach((B,i)=>{if(B.q.type==='enquete'){assert.ok(B.q.colle&&B.q.etiquette,'colle, bloc '+(i+1));assert.ok(!/« Mon hypothèse », sous les cases|Enregistre avant de tester/.test(B.fais));}});ok();
assert.match(F.BLOCS[1].q.q,/À ton avis/);ok();

// Chaque animation pointe une case qui existe, et une liste d'images du cours.
const listes=new Set([...demos.matchAll(/^ {4}(\w+): /gm)].map(m=>m[1]));
F.BLOCS.forEach((B,i)=>Object.entries(B.demos||{}).forEach(([cle,[liste]])=>{
  assert.ok(listes.has(liste),'animation « '+liste+' », bloc '+(i+1));
  const m=cle.match(/^(?:(\w+) (\d+)\.)?(\d+)$/);assert.ok(m,cle);
  let ou=B.fais;
  if(m[1]){const parts=String(B.extra).split('class="'+m[1]+'"');assert.ok(parts.length>Number(m[2]),cle+' : carte absente');ou=parts[m[2]].split('class="'+m[1]+'"')[0];}
  const lis=String(ou).split('<li>').length-1;assert.ok(Number(m[3])<=lis,'bloc '+(i+1)+' : la case '+cle+' n’existe pas');
}));ok();

// Un « ne fais pas » = un encadré ⚠️ à lui seul, jamais dans le texte d'une case à cocher.
const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N’)\s?\S+ (?:pas|jamais|ni|aucun)/;
F.BLOCS.forEach((B,i)=>{
  const labels=[...String(B.fais+(B.extra||'')).matchAll(/<label>([\s\S]*?)<\/label>/g)].map(m=>sans(m[1]).replace(/\s+/g,' ').trim());
  labels.forEach(t=>assert.ok(!interdit.test(t),'bloc '+(i+1)+', une interdiction dans une case : '+t.slice(0,80)));
  (String(B.fais+(B.extra||'')).match(/<p class="attention">[^<]*/g)||[]).forEach(a=>assert.ok(a.includes('⚠️'),'⚠️ en tête'));
});ok();
assert.ok((page.match(/class="attention"/g)||[]).length>=6,'les interdictions de la page aussi');ok();

// Les prolongements vivent hors du fil des blocs, dans <details id="plus-loin">.
assert.ok(!/Prolongement/.test(JSON.stringify(F.BLOCS)),'plus de prolongement dans les blocs');ok();
const loin=page.slice(page.indexOf('<details id="plus-loin" hidden>'),page.indexOf('</details>',page.indexOf('<details id="plus-loin" hidden>')));
assert.ok(loin.length>100&&/Après la mission 1/.test(loin)&&/Après la mission 3/.test(loin));ok();
assert.ok(page.indexOf('id="plus-loin"')>page.indexOf('id="bloc"'),'sous le bloc, pas dedans');ok();
// Caché pendant le travail ; le moteur l'affiche à l'écran du cadenas et à la fin.
assert.ok(/<details id="plus-loin" hidden>/.test(page));ok();
// Le Banc d'essai, toujours à portée de clic en tête de fiche (reprise en cours de mission).
assert.ok(/<div class="actions">[^\n]*essai-charge\.html[^\n]*Banc d’essai/.test(page),'Banc d’essai en tête');ok();

// Rappels : chaque information rappelée a été demandée plus tôt, par un champ qui existe.
const champs={};F.BLOCS.forEach((B,i)=>{const q=B.q.type==='enquete'?B.q:null;if(q)champs[i+1]=q.champs.map(c=>c.cle);});
const refs=[];
F.BLOCS.forEach((B,i)=>{
  (B.rappel||[]).forEach(r=>refs.push([i+1,r.de]));
  [...String(B.fais+(B.extra||'')).matchAll(/data-rappel="([^"]+)"/g)].forEach(m=>refs.push([i+1,m[1]]));
});
[...page.matchAll(/data-rappel="([^"]+)"/g)].forEach(m=>refs.push([99,m[1]]));
assert.ok(refs.length>=10,'des rappels ('+refs.length+')');ok();
refs.forEach(([ici,ref])=>{
  const [b,c]=ref.split(':');
  if(c===undefined){assert.equal(typeof F.RAPPELS[b],'function','RAPPELS.'+b);return;}
  assert.ok(Number(b)<ici,'bloc '+ici+' rappelle le bloc '+b+', qui doit venir avant');
  assert.ok(champs[b]&&champs[b].includes(c),'bloc '+b+' : champ '+c);
});ok();
// Le nom du rapport, tiré de l'adresse scolaire (déjà sans accents) ; sans adresse, le texte de la fiche reste.
F.email('');assert.equal(F.RAPPELS.rapport(),'');
F.email('jean-luc.dupont@arcampin.be');assert.equal(F.RAPPELS.rapport(),'LABO07_CoulissesPC_Jean-Luc_Dupont');
F.email('ana.martin@arcampin.be');assert.equal(F.RAPPELS.rapport(),'LABO07_CoulissesPC_Ana_Martin');ok();
// La réponse la plus longue tient dans les 200 caractères du Journal.
Object.values(F.BLOCS).forEach((B,i)=>{if(B.q.type==='enquete'){const t=B.q.champs.reduce((s,c)=>s+c.cle.length+1+c.max,0)+3*(B.q.champs.length-1);assert.ok(t<=200,'bloc '+(i+1)+' : '+t);}});ok();

// Les déclarations nomment ce qu'il faut vérifier, point par point (tous les manques d'un coup).
F.BLOCS.forEach((B,i)=>{const q=B.q.type==='mixte'?B.q.validation:B.q;if(q.type==='rapport')assert.ok(q.liste&&q.liste.length>=2,'liste du bloc '+(i+1));});ok();

// Conducteur : guidage dégressif. La mission 1 ferme après le bloc 5 ; ensuite, tout est ouvert jusqu'à la remise.
const seq=JSON.parse(fs.readFileSync(__dirname+'/../pas-a-pas/sequences.json'))['labo-07'];
const ateliers=seq.moments.filter(m=>m.type==='atelier');
assert.deepEqual(ateliers[0].blocs,[1,5]);
ateliers.slice(1).forEach(m=>assert.equal(m.blocs[1],11,m.titre));ok();

console.log('Labo 07 : '+n+' contrôles réussis.');
