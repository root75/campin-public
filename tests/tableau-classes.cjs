/* Page « Cours et classes » du tableau prof : une carte par classe, les actions près du nom, les cours repliés. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const js=fs.readFileSync(require.resolve('../pas-a-pas/tableau.js'),'utf8'),html=fs.readFileSync(require.resolve('../pas-a-pas/tableau.html'),'utf8');
const bout=(a,b)=>{const i=js.indexOf(a),j=js.indexOf(b,i);assert.ok(i>=0&&j>i,a);return js.slice(i,j);};
assert.match(html,/id="cl-liste"/,'la page porte la liste de cartes');
assert.doesNotMatch(html,/id="cl-corps"/,'plus de tableau classes × cours : il partait au bout de la ligne');
const carte=bout('function carteClasse','function dessineClasses');
const ordre=['"cl-tete"','caseModeCours(n, d)','caseChat(n, d)','"cl-ouverts"','"details"'].map(x=>carte.indexOf(x));
assert.ok(ordre.every(i=>i>=0),'nom, mode cours, chat, cours ouverts, liste repliée');
assert.match(carte,/carte\.append\(tete, .*actions.*, puces, pli\)/,'ordre de la carte : nom ▸ actions ▸ cours ouverts ▸ liste complète');
assert.match(carte,/PLIS_CL\.has\(n\)/,'une liste dépliée le reste après une case cochée');
// Le cours du mode cours se choisit dans la carte : le menu du haut n'est pas affiché sur cette page.
const mode=bout('function caseModeCours','function caseChat');
assert.match(mode,/appelCl\("modeCours", n, quoi\.value, Number\(sel\.value\)\)/);
assert.match(mode,/if\(!d\.modes\) return null/,'serveur antérieur : pas de mode cours, pas d’erreur');
// La place du chat de classe : rien tant que le serveur n'envoie pas « chats ».
assert.match(bout('function caseChat','const CHOIX_MODE'),/if\(!d\.chats\) return null/);
assert.match(bout('function dessineClasses','function caseRecompense'),/\$\("cl-corps"\)\.closest\("\.defile"\)\.replaceWith\(liste\)/,'page en cache avec l’ancien tableau : remplacé sur place');
console.log('Cours et classes : cartes par classe, mode cours et place du chat près du nom, cours repliés.');
