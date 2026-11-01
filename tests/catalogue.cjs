/* Métadonnées publiées et existence des fichiers ; aucun réseau ni compte scolaire. */
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),{valider}=require('../pas-a-pas/catalogue.js');
const catalogue=valider(JSON.parse(fs.readFileSync(path.join(root,'pas-a-pas/cours.json'),'utf8')));
for(const c of catalogue.cours){
  assert.ok(fs.statSync(path.join(root,c.chemin,'index.html')).isFile(),c.id+' : fiche absente');
  if(c.preuves) JSON.parse(fs.readFileSync(path.join(root,c.preuves),'utf8'));
}
console.log(`Catalogue valide : ${catalogue.cours.length} cours, fiches et fichiers de preuves présents.`);
