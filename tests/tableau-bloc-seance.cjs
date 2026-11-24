/* Vue cours du tableau prof : le bloc « Mode cours » et « Chat de la classe » de la carte de classe, sous le menu. */
const fs=require('node:fs'),assert=require('node:assert/strict');
const js=fs.readFileSync(require.resolve('../pas-a-pas/tableau.js'),'utf8');
const bout=(a,b)=>{const i=js.indexOf(a),j=js.indexOf(b,i);assert.ok(i>=0&&j>i,a);return js.slice(i,j);};
const bloc=bout('function dessineBlocSeance','/* Les devoirs Classroom');
assert.match(bloc,/classList\.contains\("vue-onglet"\)/,'pas sur les pages Cours et classes / Gestion des élèves : les cartes y gardent le fil du chat');
assert.match(bloc,/caseModeCours\(c, d\)/,'le même mode cours que sur la carte');
assert.match(bloc,/enSeance \? \[\] : classes\.map\(c=>\{ const b = caseChat\(c, d\)/,'séance en cours : le chat de la séance ; sinon l’interrupteur avec durée');
assert.match(bloc,/ligne\.append\(txt\("span", "cl-etiquette", "Chat de la classe"\), \$\("chat-seance"\)\)/,'le chat de la séance est rangé dans le bloc');
assert.match(bloc,/Number\(m\.jusqua\) > maintenant/,'un mode cours dont l’heure est passée ne s’affiche plus');
assert.match(bloc,/if\(signature !== signatureBloc\)/,'pas de reconstruction toutes les 15 s : un menu de durée ouvert ne se referme pas');
assert.match(bout('function dessineChatSeance','function caseChat'),/z\.replaceChildren\(\.\.\.pieces\);\n  dessineBlocSeance\(\);/);
assert.match(bout('function dessineClasses','function caseRecompense'),/signatureBloc = null;.*\n  dessineBlocSeance\(\);/);
console.log('Vue cours : bloc mode cours et chat de la classe sous le menu.');
