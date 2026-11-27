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
assert.equal(BLOCS.filter(B=>B.avant.includes('class="repere agir"')).length,0,'le rappel est présenté en début de séance');
assert.match(new Function(fiche+';return RAPPEL_DEBUT_SEANCE;')(),/annuler\.png.*Ctrl.*Z/);assert.ok(!fiche.includes('↶'),'↶ : mettre l’icône annuler.png');assert.ok(fs.existsSync(base+'icones/annuler.png'));
// La grille « Moi » : une carte par critère, on clique sur la phrase de son niveau. Pas de tableau : à cinq colonnes
// il demandait 1 047 px dans une page de 648 px, donc un défilement de côté (mesuré dans Chromium le 17/11/2026).
const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8'),gm=moteur.slice(moteur.indexOf('function grilleMoi'),moteur.indexOf('/* Humeur du jour'));
assert.ok(gm.includes('rond.type = "radio"')&&gm.includes('el("fieldset")'),'grille « Moi » : une carte par critère, un bouton radio par niveau');
assert.ok(!/el\("(table|select)"\)|overflow/.test(gm),'grille « Moi » : ni tableau, ni liste déroulante, ni défilement de côté');
assert.ok(!/colonne/.test(FIN.texte)&&!actions.some(([,t])=>/colonne « Moi »/.test(t)),'la fiche ne parle plus de colonnes');
// Légende : chaque couleur du bulletin est une pastille de sa couleur (Vincent, 17/11/2026).
['bleu','vert','jaune','orange'].forEach(c=>{assert.ok(GRILLE.legende.includes('class="couleur '+c+'"'),'légende : pastille '+c);assert.ok(gm.includes('.grille-moi .'+c+'{background:'),'moteur : couleur '+c);});
// Étape 10 : un bouton vers « Travaux et devoirs » de la classe, en plus du chemin par les menus (Vincent, 24/11/2026 :
// la gaufre n'est pas toujours visible). Le moteur remplace l'adresse par celle du cours Classroom de la classe.
{
  const remise=BLOCS[5].gestes[12];   // 6 étapes depuis le 27/11/2026 : la remise suit les 11 vérifications
  assert.match(remise.sous,/<a [^>]*data-classroom="travaux"[^>]*href="https:\/\/classroom\.google\.com\/"[^>]*target="_blank"/,'étape 6 : le lien Travaux et devoirs');
  assert.ok(/03 EVAL Formatif Le rat de ville/.test(remise.geste),'étape 6 : la case nomme le devoir à ouvrir');
  assert.ok(/gaufre/.test(remise.sous)&&/classroom\.google\.com<\/b>/.test(remise.sous),'étape 6 : la gaufre et l’adresse restent en secours');
  const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8');
  const lienTravaux=new Function(moteur.match(/const lienTravaux = .*\n/)[0]+';return lienTravaux;')();
  assert.equal(lienTravaux({devoirs:'https://classroom.google.com/w/ABC/t/all'}),'https://classroom.google.com/w/ABC/t/all');
  assert.equal(lienTravaux({devoirs:''}),'');assert.equal(lienTravaux(null),'');
  assert.equal(lienTravaux({devoirs:'https://ailleurs.example/'}),'','un lien hors Classroom est refusé');
  assert.ok(/liensClassroom\(z\);/.test(moteur)&&page.includes('blocs.js?v=accord-pose2-20261124'),'le moteur branche les liens, la page charge la nouvelle version');
}
// Accord du professeur : un accord donné pour une autre étape ne vaut pas pour celle qu'on attend (24/11/2026 : la case
// 10.1 s'était cochée seule avec l'accord de l'étape 3). L'essai complet, écriture lente comprise : essai-rat.js (dépôt privé).
{
  const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8');
  const accordPour=new Function(moteur.match(/const accordPour = .*\n/)[0]+';return accordPour;')();
  assert.equal(accordPour({active:false,accord:true,bloc:10},'10.1'),true);
  assert.equal(accordPour({active:false,accord:true,bloc:3},'10.1'),false,'l’accord de l’étape 3 ne vaut pas pour la remise');
  assert.equal(accordPour({active:false,accord:false,bloc:10},'10.1'),false,'une aide traitée n’est pas un accord');
  assert.equal(accordPour({active:false},'10.1'),true,'ancien serveur : fermé = accordé');
  assert.ok(/const poseAvant = accordPose;/.test(moteur)&&/if\(attendAccord && !poseAvant\)return;/.test(moteur),'un état lu avant l’écriture de la demande est ignoré');
}
// Vues regroupées (Vincent, 25/11/2026) : un geste de sens = une vue. Les cases ne bougent pas (clés « étape.rang »),
// seules leurs vues changent : 61 cases sur 45 vues. Une case appartient à une seule vue.
{
  let vues=0;
  BLOCS.forEach((b,i)=>{
    const vu=new Set();
    (b.ensembles||[]).forEach(e=>e.forEach(n=>{assert.ok(Number.isInteger(n)&&n>=1&&n<=b.gestes.length,'étape '+(i+1)+' : case '+n+' hors de l’étape');assert.ok(!vu.has(n),'étape '+(i+1)+' : case '+n+' dans deux vues');vu.add(n);}));
    vues+=(b.ensembles||[]).length+b.gestes.length-vu.size;
    (b.ensembles||[]).forEach(e=>assert.ok(e.every((n,k)=>k===0||n===e[k-1]+1),'étape '+(i+1)+' : une vue = des cases qui se suivent'));
  });
  assert.equal(vues,45,'vues du Rat de ville');
  const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8');
  assert.ok(/BLOCS\[ici\]\.ensembles/.test(moteur)&&/ECRAN_LEGER/.test(moteur)&&/ECRAN_LEGER = true/.test(fiche),'le moteur lit les ensembles ; le Rat est en écran léger');
  assert.ok(/id="texte" data-etapes="2"/.test(page),'le texte à recopier ne s’affiche qu’à l’étape 2');
  console.log('OK Rat de ville : '+vues+' vues.');
}
// Une seule case par vue (Vincent, 25/11/2026) : le bouton « C'est fait » coche en coulisse les cases d'origine ;
// une vue qui porte l'accord du professeur garde ses cases.
{const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8');
assert.ok(/"fait-vue"/.test(moteur)&&/g && g\.accord; \}\)\) return;/.test(moteur),'le moteur : une case par vue, sauf accord');
BLOCS.forEach((b,i)=>(b.ensembles||[]).forEach(e=>{if(e.length>1)assert.ok(!e.some(n=>b.gestes[n-1].accord),'étape '+(i+1)+' : l’accord reste seul dans sa vue');}));}
