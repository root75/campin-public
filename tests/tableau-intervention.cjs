/* « J'ai intervenu » au tableau prof (Vincent, 25/11/2026) : un bouton par ligne, motif dans une fenêtre, Annuler 10 s,
   total de l'année dans l'onglet Élèves. Le serveur est essayé dans campin-pedagogique (essai-intervention.cjs). */
const fs=require('node:fs'),assert=require('node:assert/strict');
const js=fs.readFileSync(require.resolve('../pas-a-pas/tableau.js'),'utf8'),html=fs.readFileSync(require.resolve('../pas-a-pas/tableau.html'),'utf8');
const bout=(a,b)=>{const i=js.indexOf(a),j=js.indexOf(b,i);assert.ok(i>=0&&j>i,a);return js.slice(i,j);};
const ligne=bout('vus.forEach(e=>{','const h = td("hum"');
assert.match(ligne,/boutonIntervention\(e, d\)/,'un bouton sur chaque ligne, cloche ou pas');
assert.doesNotMatch(ligne,/if\(e\.aide\)[^\n]*boutonIntervention/,'pas réservé aux élèves qui ont sonné');
const b=bout('function boutonIntervention','function choisirMotif');
assert.match(b,/typeof google\.script\.run\.intervenir !== "function"\) return null/,'serveur antérieur : pas de bouton');
assert.match(b,/intervenir\(cours, e\.email, seance\.debut, bloc, motif\)/);
assert.match(b,/e\._seance \|\| choisie\(\)/,'« Voir aussi » : la séance de SA classe');
const m=bout('function choisirMotif','let minuterieIntervention');
for(const v of ['consigne','technique','comportement'])assert.match(m,new RegExp('value="'+v+'"'),v);
assert.match(m,/createElement\("dialog"\)/,'une fenêtre : le tableau se redessine toutes les 15 s, un menu dans la ligne se refermerait');
const a=bout('function annonceIntervention','const DEMO_INTERVENTIONS');
assert.match(a,/\$\("chiffres"\)\.before\(z\)/,'le bandeau Annuler est hors de la ligne');
assert.match(a,/10000/);assert.match(a,/annulerIntervention\(cours, e\.email, id\)/);
const el=bout('let INTERV = null','const chargeClasses');
assert.match(el,/typeof google\.script\.run\.interventionsEleves !== "function"\) return/);
assert.match(js,/if\(nom==='eleves'\)chargeInterventions\(\);/,'lu à l’ouverture de l’onglet Élèves seulement');
assert.match(html,/<th>Interventions<\/th>/);
console.log('Tableau : « J’ai intervenu » — bouton par ligne, motif, Annuler, total dans l’onglet Élèves.');
