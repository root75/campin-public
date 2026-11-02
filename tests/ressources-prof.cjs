const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(process.argv[2] || require.resolve('../pas-a-pas/tableau.js'),'utf8');
const script=source.slice(source.indexOf('let demandeRessources = 0;'),source.indexOf('/* La liste des séances'));
const zone={children:[],replaceChildren(){this.children=[];this.textContent='';},append(n){this.children.push(n);}};
const selection={value:'messagerie-1'}, appels=[];
const pont={withSuccessHandler(ok){return {withFailureHandler(ko){return {ressourcesProf(cours){appels.push({cours,ok,ko});}};}};}};
const c=vm.createContext({SUIVI:true,URL,google:{script:{run:pont}},$:id=>id==='cours'?selection:zone,txt:(tag,cls,textContent)=>({tag,cls,textContent})});
vm.runInContext(script,c);
(async()=>{
 const ancien=c.chargeRessourcesProf();
 selection.value='python-1';const actuel=c.chargeRessourcesProf();
 appels[1].ok({preparation:'https://docs.google.com/document/d/python/edit',dossier:'https://drive.google.com/drive/folders/python'});await actuel;
 assert.equal(zone.children.length,2);assert.ok(zone.children.every(n=>n.target==='_blank'&&n.rel.includes('noopener')));
 appels[0].ok({preparation:'https://docs.google.com/document/d/messagerie/edit'});await ancien;
 assert.match(zone.children[0].href,/python/,'Une réponse tardive ne remplace pas le cours sélectionné');
 const absent=c.chargeRessourcesProf();assert.equal(zone.children.length,0,'L’ancien lien disparaît immédiatement');appels[2].ok({});await absent;assert.match(zone.textContent,/non renseignée/);
 const invalide=c.chargeRessourcesProf();appels[3].ok({preparation:'javascript:alert(1)',dossier:'https://evil.example/'});await invalide;assert.equal(zone.children.length,0);
 console.log('Liens professeur : choix du cours, réponses tardives, nouvel onglet, absence et URL invalide vérifiés.');
})().catch(e=>{console.error(e);process.exitCode=1;});
