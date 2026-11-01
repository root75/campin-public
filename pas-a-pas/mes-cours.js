/* Mes cours — le script de mes-cours.html. Dans un fichier à part, chargé par son adresse absolue :
   Apps Script abîme le script écrit dans la page (voir outils/pas-a-pas/LISEZMOI.md, « Ajouter un cours »). */
const SUIVI = typeof google !== "undefined" && google.script && google.script.run;
const $ = id => document.getElementById(id);
const txt = (tag, cls, t) => { const n=document.createElement(tag); if(cls) n.className=cls; if(t!=null) n.textContent=t; return n; };

/* Un seul chemin vers le serveur ; sans Apps Script, une imitation pour l'aperçu. */
const DEMO = { classe:"", ouverts:{ "2B":["messagerie-1"], "2E":["messagerie-1"], "3F":["python-1","python-2","labo-07"] },
  titres:{ "labo-07":"Labo 07 — Dans les coulisses du PC", "messagerie-1":"Mon premier message", "python-1":"Premiers pas en Python 1", "python-2":"Premiers pas en Python 2" } };
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
  // L’identité et la classe confirmée viennent du serveur.
  if(d.identite){
    document.querySelectorAll(".compte-adresse").forEach(n => n.textContent = d.identite.email || "Adresse indisponible");
    document.querySelectorAll(".compte-role").forEach(n => n.textContent = d.identite.libelle);
  }
  ["attente","choisir","confirmer","mes-cours","seance-en-cours","erreur"].forEach(id => { const n = $(id); if(n) n.hidden = true; });
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
  // Après le premier choix, le lien _top ouvre la séance avec un geste explicite,
  // nécessaire pour quitter l'iframe Google. Aux visites suivantes, doGet sert la fiche directement.
  // L'ancien HTML peut rester dix minutes dans le cache du serveur pendant la publication.
  if($("seance-en-cours") && $("seance")){
    $("seance").replaceChildren();
    if(d.seance){
      const a = txt("a", "btn cours", "Ouvrir ma séance · " + d.seance.titre + " ▸");
      a.href = d.seance.url; a.target = "_top"; $("seance").append(a);
    }
    $("seance-en-cours").hidden = !d.seance;
  }
  $("cours").replaceChildren(...d.cours.map(c=>{
    const a = txt("a", "btn cours", c.titre + " ▸"); a.href = c.url; a.target = "_top"; return a; }));
  $("aucun").hidden = d.cours.length > 0;
  $("mes-cours").hidden = false;
}
function montreErreur(m){ ["attente","choisir","confirmer","mes-cours","seance-en-cours"].forEach(id => { const n = $(id); if(n) n.hidden = true; }); $("erreur").textContent = m; $("erreur").hidden = false; }
const echec = err => montreErreur("Erreur : " + err.message + " — recharge la page (F5).");

$("non").addEventListener("click", ()=>{ $("confirmer").hidden = true; $("choisir").hidden = false; });
$("oui").addEventListener("click", ()=>{
  $("oui").disabled = true;
  serveur("choisirClasse", choisie).then(affiche, echec).finally(()=>{ $("oui").disabled = false; });
});

if(!SUIVI) $("demo").hidden = false;
serveur("mesCours").then(affiche, echec);
