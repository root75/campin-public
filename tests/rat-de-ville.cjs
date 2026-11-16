// Le rat de ville, sur le moteur commun (pas-a-pas/blocs.js, mode déclaratif) : la fiche ne porte que des données.
// L'essai complet dans Chromium (vrai Code.gs) est dans le dépôt privé : outils/pas-a-pas/essai-rat.js.
const assert=require('node:assert/strict'),fs=require('node:fs');
const base=__dirname+'/../rat-de-ville/pas-a-pas/';
const fiche=fs.readFileSync(base+'fiche.js','utf8'),page=fs.readFileSync(base+'index.html','utf8');
const {BLOCS,GRILLE,FIN,MODE}=new Function(fiche+';return {BLOCS,GRILLE,FIN,MODE};')();
// Moteur commun : la page charge blocs.js et le mode séquence ; la fiche ne parle pas au serveur elle-même.
assert.equal(MODE,'declaratif');
for(const f of ['pas-a-pas/blocs.js','pas-a-pas/sequence-eleve.js','pas-a-pas/cloche.js','pas-a-pas/recompense.js','pas-a-pas/demo-lecteur.js'])assert.ok(page.includes(f),'index.html charge '+f);
assert.ok(!/google\.script|addEventListener|suiviFormatif/.test(fiche),'fiche.js : des données, pas de moteur');
assert.ok(!fs.existsSync(base+'contenu.js')&&!fs.existsSync(__dirname+'/../pas-a-pas/formatif-prof.js'),'ancien moteur retiré');
// Les cases sont enregistrées sous « étape.rang » : le catalogue (lu par le serveur) doit compter les mêmes.
const c=JSON.parse(fs.readFileSync(__dirname+'/../pas-a-pas/cours.json','utf8')).cours.find(x=>x.id==='rat-de-ville-formatif');
assert.equal(c.etapes,BLOCS.length);
assert.deepEqual(c.cases,Object.fromEntries(BLOCS.map((b,i)=>[i+1,b.gestes.length])),'cours.json « cases » = cases de fiche.js');
assert.equal(c.criteres,GRILLE.criteres.length);assert.deepEqual(Object.keys(GRILLE.niveaux),['A','B','C','D']);
// Au moins un mot-clé en gras par case à cocher : l'œil accroche le geste avant de lire la phrase (Vincent, 13/11/2026).
const texte=g=>typeof g==='string'?g:g.geste,sansB=t=>t.replace(/<span class="a-ecrire".*?<\/span>/g,'').replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
const actions=BLOCS.flatMap((b,i)=>b.gestes.map(g=>[i+1,texte(g)]));
assert.ok(actions.length>=53,'cases lues : '+actions.length);
actions.forEach(([i,t])=>{
  assert.ok(/<b>[^<]+<\/b>/.test(t),'étape '+i+', case sans mot en gras : '+sansB(t).slice(0,70));
  assert.ok(!/class="a-ecrire"[^>]*>[^<]*<b>/.test(t),'étape '+i+', pas de gras dans un texte à écrire : '+sansB(t).slice(0,70));
});
// Un « ne fais pas » = un encadré ⚠️ à côté du geste, jamais dans le texte d'une case (règle du 12/11/2026, comme le Labo 07).
const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/;
actions.forEach(([i,t])=>assert.ok(!interdit.test(sansB(t))&&!/^⚠/.test(sansB(t)),'étape '+i+', une interdiction dans une case : '+sansB(t).slice(0,70)));
// Une case à l'impératif, comme dans les autres cours : pas de « je… » (règle du 05/11/2026, appliquée au Rat le 13/11/2026).
actions.forEach(([i,t])=>assert.ok(!/(^|[.:] )(Je|J’)\b|\b(je|j’|mon|ma|mes)\b/.test(sansB(t)),'étape '+i+', case pas à l’impératif : '+sansB(t).slice(0,70)));
// Chaque bloc a ce que le moteur attend, et les textes à trous d'entraînement sont complets.
BLOCS.forEach((b,i)=>{
  assert.ok(b.titre&&b.partie&&b.min&&b.vois&&Array.isArray(b.coince)&&b.coince.length,'étape '+(i+1)+' : titre, partie, min, vois, coince');
  assert.ok(!b.q,'étape '+(i+1)+' : pas de question de preuve en mode déclaratif');
  b.gestes.forEach(g=>g.trous&&g.trous.variantes.forEach(v=>assert.equal(v.texte.split('___').length-1,v.mots.length,'étape '+(i+1)+' : un mot par trou')));
});
assert.ok(FIN.titre&&FIN.citation&&FIN.citation.auteur,'écran final : la grille et la phrase de la fin');
console.log('OK Rat de ville : '+actions.length+' cases, chacune avec son mot-clé en gras ; catalogue et fiche d’accord.');
// Barre d'outils des démos : les vraies icônes Google Docs (B, I, U), jamais des lettres françaises G / S (Vincent, 16/11/2026).
const demos=fs.readFileSync(base+'demos.js','utf8');
['gras','italique','souligne'].forEach(n=>{assert.ok(demos.includes("ico('"+n+"'"),'demos.js : bouton '+n+' sans son icône');assert.ok(fs.existsSync(base+'icones/'+n+'.png'),'icône manquante : '+n);});
assert.ok(!/'md-btn[^']*',\s*'[GS]'/.test(demos),'demos.js : bouton en lettre G ou S');
// Sous chaque étape : « À la sonnerie », puis « Je reprends mon cours » (Vincent, 16/11/2026). Pas d'encadré de reprise en haut : il est en bas, et chacun reprend à son étape.
const BAS=new Function(fiche+';return BAS_ETAPE;')();
assert.deepEqual(BAS.map(e=>e.classe),['sonnerie','reprise'],'« Je reprends » juste sous « À la sonnerie »');
assert.deepEqual(BAS.flatMap(e=>e.gestes.map(g=>g.demo)),['fermer','deconnecter','retrouver','cote']);
assert.ok(!/\bconst REPRISE\b/.test(fiche),'pas d’encadré « Je reprends » en haut de l’étape');
// « À moi dans Docs ! » : un encadré, avec l'icône Annuler de la barre d'outils (pas un caractère ↶).
assert.equal(BLOCS.filter(B=>B.avant.includes('class="repere agir"')).length,9);assert.ok(!fiche.includes('↶'),'↶ : mettre l’icône annuler.png');assert.ok(fs.existsSync(base+'icones/annuler.png'));
