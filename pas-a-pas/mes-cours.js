/* Mes cours — le script de mes-cours.html. Dans un fichier à part, chargé par son adresse absolue :
   Apps Script abîme le script écrit dans la page (voir outils/pas-a-pas/LISEZMOI.md, « Ajouter un cours »). */
const SUIVI = typeof google !== "undefined" && google.script && google.script.run;
const $ = id => document.getElementById(id);
const txt = (tag, cls, t) => { const n=document.createElement(tag); if(cls) n.className=cls; if(t!=null) n.textContent=t; return n; };

/* Un seul chemin vers le serveur ; sans Apps Script, une imitation pour l'aperçu. */
const DEMO = { classe:"", ouverts:{ "2B":["messagerie-1"], "2E":["messagerie-1"], "3F":["python-1","python-2"] },
  titres:{ "messagerie-1":"Mon premier message", "python-1":"Premiers pas en Python 1", "python-2":"Premiers pas en Python 2" } };
const DEMO_FN = {
  mesCours: () => ({ email:"eleve@arcampin.be", classe:DEMO.classe, classes:Object.keys(DEMO.ouverts),
    cours:(DEMO.ouverts[DEMO.classe]||[]).map(c=>({ cle:c, titre:DEMO.titres[c], url:"#" })) }),
  choisirClasse: c => { DEMO.classe = c; return DEMO_FN.mesCours(); }
};
function serveur(fn, ...args){
  if(SUIVI) return new Promise((ok, ko) => google.script.run.withSuccessHandler(ok).withFailureHandler(ko)[fn](...args));
  return Promise.resolve(DEMO_FN[fn](...args));
}

let choisie = "";
function affiche(d){
  ["attente","choisir","confirmer","mes-cours","erreur"].forEach(id => $(id).hidden = true);
  if(!d.email){ montreErreur("Ouvre ce lien avec ton compte de l'école (arcampin.be)."); return; }
  if(!d.classe){
    if(!d.classes.length){ montreErreur("Ton professeur n'a pas encore créé les classes. Attends sa consigne."); return; }
    $("classes").replaceChildren(...d.classes.map(c=>{
      const b = txt("button", "btn vide", c); b.type = "button";
      b.addEventListener("click", ()=>{ choisie = c; $("classe-choisie").textContent = c; $("choisir").hidden = true; $("confirmer").hidden = false; });
      return b; }));
    $("titre-classe").textContent = "";
    $("choisir").hidden = false;
    return;
  }
  $("titre-classe").textContent = " · " + d.classe;
  $("cours").replaceChildren(...d.cours.map(c=>{
    const a = txt("a", "btn cours", c.titre + " ▸"); a.href = c.url; a.target = "_top"; return a; }));
  $("aucun").hidden = d.cours.length > 0;
  $("mes-cours").hidden = false;
}
function montreErreur(m){ ["attente","choisir","confirmer","mes-cours"].forEach(id => $(id).hidden = true); $("erreur").textContent = m; $("erreur").hidden = false; }
const echec = err => montreErreur("Erreur : " + err.message + " — recharge la page (F5).");

$("non").addEventListener("click", ()=>{ $("confirmer").hidden = true; $("choisir").hidden = false; });
$("oui").addEventListener("click", ()=>{
  $("oui").disabled = true;
  serveur("choisirClasse", choisie).then(affiche, echec).finally(()=>{ $("oui").disabled = false; });
});

if(!SUIVI) $("demo").hidden = false;
serveur("mesCours").then(affiche, echec);
