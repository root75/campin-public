/* Haut du tableau prof (24/11/2026) : trois onglets, « quoi et qui », une bande de cases (séance, mode cours, chat,
   cours collectif), le trésor avec les compteurs. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const js=fs.readFileSync(require.resolve('../pas-a-pas/tableau.js'),'utf8'),html=fs.readFileSync(require.resolve('../pas-a-pas/tableau.html'),'utf8');
const bout=(a,b)=>{const i=js.indexOf(a),j=js.indexOf(b,i);assert.ok(i>=0&&j>i,a);return js.slice(i,j);};
const tete=html.slice(html.indexOf('<header>'),html.indexOf('</header>'));
// Les onglets : dans l'ordre, et plus de lien caché dans « ⚙ Plus ».
const rang=['id="onglet-seance"','id="gestion-classes-lien"','id="gestion-eleves-lien"','id="plus"'].map(x=>tete.indexOf(x));
assert.ok(rang.every((v,k)=>v>=0&&(!k||v>rang[k-1])),'Séance, Cours et classes, Élèves, puis ⚙ Plus');
assert.doesNotMatch(tete,/target="_blank"[^>]*id="gestion-/,'les onglets ne s’ouvrent plus dans un nouvel onglet du navigateur');
// La bande : une case par geste, dans l'ordre de la séance.
const cases=['id="case-seance"','id="case-mode"','id="case-chat"','id="case-collectif"'].map(x=>tete.indexOf(x));
assert.ok(cases.every((v,k)=>v>=0&&(!k||v>cases[k-1])),'séance, mode cours, chat, cours collectif');
for(const id of ['nouvelle','terminer','reprendre-seance','etat-seance'])assert.ok(tete.indexOf('id="'+id+'"')>cases[0]&&tete.indexOf('id="'+id+'"')<cases[1],id+' dans la case Séance');
assert.ok(tete.indexOf('id="chat-seance"')>cases[2]&&tete.indexOf('id="seq-etat"')>cases[3]);
assert.doesNotMatch(tete,/id="tresor"|id="titre-classe"/,'le trésor a rejoint les compteurs, la classe n’est plus répétée dans le titre');
// Un seul bouton plein : celui du geste attendu.
const etat=bout('function etatTerminer','$("seance").addEventListener("change", ()=>{etatTerminer()');
assert.match(etat,/\$\("nouvelle"\)\.classList\.toggle\("vide",ouverte\)/,'séance en cours : « Ouvrir pour une autre classe… » passe en bouton vide');
assert.match(bout('function dessineEtatSeq','function repeter'),/b\("Lancer le cours collectif", ouverte \? "" : "vide"/);
// Mode cours et chat de la classe de la séance.
const bloc=bout('function dessineBlocSeance','/* Les devoirs Classroom');
assert.match(bloc,/classList\.contains\("vue-onglet"\) \|\| !\$\("bande"\)/,'pas sur les autres onglets (les cartes y gardent le fil du chat), ni sur une page en cache');
assert.match(bloc,/caseModeCours\(c, d, cours\)/,'le cours du mode cours est celui du menu du haut');
assert.match(bout('function caseModeCours','function chargeChat'),/if\(impose && ouverts\.some\(c=>c\.cle === impose\)\)\{ quoi\.value = impose; quoi\.hidden = true; \}/,'… seulement s’il est ouvert à la classe');
assert.match(bloc,/enSeance \? \[\] : classes\.map\(c=>\{ const b = caseChat\(c, d\)/,'séance en cours : le chat de la séance ; sinon l’interrupteur avec durée');
assert.match(bloc,/Number\(m\.jusqua\) > maintenant/,'un mode cours dont l’heure est passée ne s’affiche plus');
assert.match(bloc,/if\(signature !== signatureBloc\)/,'pas de reconstruction toutes les 15 s : un menu de durée ouvert ne se referme pas');
assert.match(bloc,/\$\("chat-classe-fil"\)/,'le fil du chat prend toute la largeur, sous la bande');
assert.match(bout('function dessineChatSeance','function caseChat'),/z\.replaceChildren\(\.\.\.pieces\);\n  dessineBlocSeance\(\);/);
assert.match(bout('function dessineClasses','function caseRecompense'),/signatureBloc = null;.*\n  dessineBlocSeance\(\);/);
// Changer d'onglet ne recharge pas la page : le suivi et le compte des cloches continuent.
const onglets=bout('function montreOnglet','// L\'URL extérieure');
assert.match(onglets,/ev\.preventDefault\(\);montreOnglet\(nom\)/);
assert.match(onglets,/montreOnglet\(parametres\.onglet\);\n  chargeCatalogue\(\);/,'?onglet=classes ouvre l’onglet, et le tableau démarre quand même');
console.log('Haut du tableau : onglets, bande de cases, mode cours et chat de la séance, trésor avec les compteurs.');
