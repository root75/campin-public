(() => {
/* Mon portail — le script de portail/index.html.
   Servie par Apps Script, la page demande « portail » au serveur et se remplit avec l'élève reconnu.
   Ouverte sur GitHub Pages, elle reste publique et pose une seule question au serveur : « ce navigateur
   a-t-il un compte de l'école ? » (réponse oui / non, sans identité). Si oui, elle passe à la page connectée. */
const EXEC = "https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec";
const SUIVI = typeof google !== "undefined" && google.script && google.script.run;
const $ = id => document.getElementById(id);

/* ----- Mode clair / sombre : un confort par navigateur, la page marche sans. ----- */
const racine = document.documentElement;
function theme(t){ racine.dataset.theme = t; $("theme").textContent = t === "light" ? "Mode sombre" : "Mode clair"; }
let garde = ""; try { garde = localStorage.getItem("portail-theme") || ""; } catch(e) {}
theme(garde === "light" ? "light" : "dark");
$("theme").addEventListener("click", () => {
  const t = racine.dataset.theme === "light" ? "dark" : "light";
  theme(t); try { localStorage.setItem("portail-theme", t); } catch(e) {}
});

/* ----- La date du jour, en toutes lettres, et sous la forme qui sert à nommer un travail. ----- */
function dateNom(d){ return String(d.getFullYear()) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0"); }
function dateJour(d){ const t = d.toLocaleDateString("fr-BE", { weekday:"long", day:"numeric", month:"long", year:"numeric" }); return t.charAt(0).toUpperCase() + t.slice(1); }
{ const d = new Date(); $("date-jour").textContent = dateJour(d); $("date-nom").textContent = dateNom(d); $("date").hidden = false; }

/* ----- État connecté : tout vient du serveur. ----- */
function affiche(d){
  if(!d || !d.email) return;            // compte hors école : la page reste dans son état public
  $("non-connecte").hidden = true;
  $("coince-compte").hidden = true;
  $("bonjour").textContent = "Bonjour " + (d.prenom || "") + ", par où commences-tu ?";
  $("compte").replaceChildren("Connecté avec ", gras(d.email), d.prof ? " · professeur" : d.classe ? " · classe " : " · classe à choisir dans « Mes cours »", d.prof || !d.classe ? "" : gras(d.classe));
  $("compte").hidden = false;
  $("porte-cours").href = d.mesCours;
  if(d.devoirs){
    $("porte-devoirs").href = d.devoirs;
    $("devoirs-detail").textContent = "Classroom, directement dans le cours de " + d.classe;
  }
  if(d.seance){
    $("seance-titre").textContent = d.seance.titre;
    $("seance-lien").href = d.seance.url;
    $("maintenant").hidden = false;
  }
  if(d.prof && d.tableau){ $("lien-prof").href = d.tableau; $("lien-prof").hidden = false; }
  mesRevisions(d.cours);
}

/* ----- Mes révisions : celles des cours ouverts pour la classe, dans l'ordre des cours. ----- */
const REVISIONS = "https://root75.github.io/campin-public/revisions/revisions.json";
const SITE = "https://root75.github.io/campin-public/";
/** Les révisions à proposer : seulement les cours de l'élève, sans doublon, et des chemins du site (jamais une autre adresse). */
function revisionsDe(cours, table){
  const vues = new Set(), liste = [];
  for(const id of Array.isArray(cours) ? cours : []){
    const r = table && Object.prototype.hasOwnProperty.call(table, id) ? table[id] : null;
    for(const x of Array.isArray(r) ? r : []){
      if(!x || typeof x.titre !== "string" || !x.titre || typeof x.chemin !== "string") continue;
      if(!/^[a-z0-9][a-z0-9\-\/.]*(\?cours=[a-z0-9\-]+)?$/.test(x.chemin) || x.chemin.includes("..") || vues.has(x.chemin)) continue;
      vues.add(x.chemin);
      liste.push({ genre: typeof x.genre === "string" ? x.genre : "", titre: x.titre, url: SITE + x.chemin });
    }
  }
  return liste;
}
function mesRevisions(cours){
  if(!Array.isArray(cours) || !cours.length || typeof fetch !== "function") return;
  fetch(REVISIONS).then(r => r.ok ? r.json() : Promise.reject()).then(t => {
    const liste = revisionsDe(cours, t.cours);
    if(!liste.length) return;
    $("revisions-liste").replaceChildren(...liste.map(x => {
      const a = document.createElement("a"); a.target = "_top"; a.href = x.url;
      const g = document.createElement("small"); g.textContent = x.genre;
      const b = document.createElement("b"); b.textContent = x.titre;
      a.append(g, b); return a;
    }));
    $("revisions").hidden = false;
  }).catch(() => {});
}
function gras(t){ const b = document.createElement("b"); b.textContent = t; return b; }

if(SUIVI){
  google.script.run.withSuccessHandler(affiche).withFailureHandler(() => {}).portail();
} else if(location.protocol === "https:" && !/[?&]public\b/.test(location.search)){
  // « ?public » garde la page publique, pour la montrer sans être redirigé.
  // Sans compte de l'école, Google répond par sa page de connexion : le navigateur la refuse comme script, rien ne se passe.
  window.campinConnecte = oui => { if(oui === true) location.replace(EXEC + "?vue=portail"); };
  const s = document.createElement("script");
  s.src = EXEC + "?vue=connecte"; s.async = true; s.onerror = () => {};
  document.head.append(s);
}

/* ----- Météo : Open-Meteo, sans clé ni compte. Si le poste la bloque, le panneau reste caché. ----- */
const CIEL = [[0,"ciel dégagé"],[2,"quelques nuages"],[3,"ciel couvert"],[48,"brouillard"],[57,"bruine"],[67,"pluie"],[77,"neige"],[82,"averses"],[86,"averses de neige"],[99,"orage"]];
function ciel(code){ for(const [max, mot] of CIEL) if(code <= max) return mot; return ""; }
function conseil(t, code){
  if(code >= 51 && code <= 67 || code >= 80 && code <= 82 || code >= 95) return "Pour la récré : prends de quoi te couvrir de la pluie.";
  if(t <= 5) return "Pour la récré : il fait froid, prends ta veste.";
  if(t >= 25) return "Pour la récré : il fait chaud, pense à boire de l'eau.";
  return "";
}
if(typeof fetch === "function"){
  fetch("https://api.open-meteo.com/v1/forecast?latitude=50.6056&longitude=3.3878&current=temperature_2m,weather_code&timezone=Europe%2FBrussels")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(m => {
      const t = Math.round(m.current.temperature_2m), code = m.current.weather_code;
      if(!Number.isFinite(t)) return;
      $("meteo-temp").textContent = t + "°";
      $("meteo-ciel").textContent = ciel(code);
      $("meteo-conseil").textContent = conseil(t, code);
      $("meteo").hidden = false;
    }).catch(() => {});
}
/* ----- Quelques nouvelles : un titre différent à chaque visite, et à chaque clic sur « Une autre ». ----- */
const ACTUS = "https://root75.github.io/campin-public/portail/actus.json";
/** Un titre au hasard, jamais celui qu'on vient de voir quand il y en a d'autres. Seuls les liens https passent. */
function tire(actus, dernier, hasard = Math.random){
  const bons = (Array.isArray(actus) ? actus : []).filter(a => a && typeof a.titre === "string" && a.titre && /^https:\/\//.test(a.lien || ""));
  const choix = bons.length > 1 ? bons.filter(a => a.lien !== dernier) : bons;
  return choix.length ? choix[Math.floor(hasard() * choix.length)] : null;
}
if(typeof fetch === "function"){
  fetch(ACTUS).then(r => r.ok ? r.json() : Promise.reject()).then(d => {
    let dernier = ""; try { dernier = localStorage.getItem("portail-nouvelle") || ""; } catch(e) {}
    const vus = new Set();
    const montre = () => {
      // Pendant la visite, on fait le tour de tous les titres avant d'en revoir un.
      let reste = (d.actus || []).filter(x => x && !vus.has(x.lien));
      if(!reste.length){ vus.clear(); reste = d.actus; }
      const a = tire(reste, dernier); if(!a) return;
      vus.add(a.lien);
      dernier = a.lien; try { localStorage.setItem("portail-nouvelle", dernier); } catch(e) {}
      $("nouvelle-lien").textContent = a.titre; $("nouvelle-lien").href = a.lien;
      $("nouvelle-source").textContent = a.source || "";
      $("nouvelle").hidden = false; $("nouvelle-repli").hidden = true;
    };
    $("nouvelle-autre").addEventListener("click", montre);
    montre();
  }).catch(() => {});
}
globalThis.PortailEssai = { tire, ciel, conseil, dateNom, dateJour, revisionsDe };
})();
