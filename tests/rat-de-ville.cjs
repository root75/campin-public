// Le rat de ville : forme des cases à cocher. L'essai complet dans Chromium (vrai Code.gs) est dans le dépôt privé : outils/pas-a-pas/essai-rat.js.
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=__dirname+'/../rat-de-ville/pas-a-pas/';
const ETAPES=new Function(fs.readFileSync(base+'contenu.js','utf8')+';return ETAPES_RAT;')();
// Au moins un mot-clé en gras par case à cocher : l'œil accroche le geste avant de lire la phrase (Vincent, 13/11/2026).
// Les actions sont du texte (pas de HTML) : **mot** devient <b>mot</b> dans la fiche, [[texte]] le cadre « à écrire exactement ».
const actions=ETAPES.flatMap((e,i)=>e.actions.map(t=>[i+1,t]));
assert.ok(actions.length>=53,'cases lues : '+actions.length);
actions.forEach(([i,t])=>{
  assert.ok(/\*\*[^*]+\*\*/.test(t),'étape '+i+', case sans mot en gras : '+t.slice(0,70));
  assert.equal((t.match(/\*\*/g)||[]).length%2,0,'étape '+i+', ** non refermé : '+t.slice(0,70));
  assert.ok(!/\[\[[^\]]*\*\*/.test(t),'étape '+i+', pas de gras dans un texte à écrire : '+t.slice(0,70));
});
// Un « ne fais pas » = un encadré ⚠️ à côté du geste, jamais dans le texte d'une case (règle du 12/11/2026, comme le Labo 07).
const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/,sansB=c=>c.replace(/<[^>]+>/g,'').replace(/\*\*/g,'').replace(/\s+/g,' ').trim();
actions.forEach(([i,t])=>assert.ok(!interdit.test(sansB(t))&&!/^⚠/.test(t),'étape '+i+', une interdiction dans une case : '+t.slice(0,70)));
// La fiche élève rend **…** en gras ; le détail du tableau du professeur retire les astérisques.
assert.ok(/split\(\/\\\*\\\*\(\.\+\?\)\\\*\\\*\/\)/.test(fs.readFileSync(base+'fiche.js','utf8')),'fiche.js : **…** rendu en <b>');
assert.ok(/replace\(\/\\\*\\\*\/g,''\)/.test(fs.readFileSync(__dirname+'/../pas-a-pas/formatif-prof.js','utf8')),'formatif-prof.js : astérisques retirés');
console.log('OK Rat de ville : '+actions.length+' cases, chacune avec son mot-clé en gras.');
