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

/* Les cours (identifiants de pas-a-pas/cours.json) où l'élève crée un document et le nomme « AAAAMMJJ Titre – Prénom Nom ».
   Ajouter un cours ici = la ligne « Pour nommer ton travail » apparaît pour les classes qui le suivent. */
const NOMMER = ["rat-de-ville-formatif"];

/* ----- État connecté : tout vient du serveur. ----- */
function affiche(d){
  if(!d || !d.email) return;            // compte hors école : la page reste dans son état public
  $("non-connecte").hidden = true;
  $("bonjour").textContent = "Bonjour " + (d.prenom || "") + ", par où commences-tu ?";
  $("compte").replaceChildren("Connecté avec ", gras(d.email), d.prof ? " · professeur" : d.classe ? " · classe " : " · classe à choisir dans « Mes cours »", d.prof || !d.classe ? "" : gras(d.classe));
  if(d.apercu) $("compte").replaceChildren("Aperçu : tu vois le portail comme un élève de ", gras(d.apercu), " (rien n'est enregistré)");
  $("compte").hidden = false;
  voirEnTantQue(d);
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
  const annee = /^[123]/.test(d.classe || "") ? d.classe[0] : "";
  if(annee) $("porte-revise").href = SITE + "revisions/?niveau=" + annee;
  mesRevisions(d.cours);
  // La date sous la forme AAAAMMJJ : seulement pour une classe qui suit un cours où l'on crée et nomme un document.
  if(Array.isArray(d.cours) && d.cours.some(c => NOMMER.includes(c))) $("date-nommer").hidden = false;
  if(!d.prof && d.devoirs && SUIVI){
    // Un serveur pas encore republié ne connaît pas mesDevoirs : la porte « Mes devoirs » suffit alors.
    try {
      const appel = google.script.run.withSuccessHandler(r => montreDevoirs(r && r.liste)).withFailureHandler(() => {});
      if(typeof appel.mesDevoirs === "function") appel.mesDevoirs();
    } catch(e) {}
    // Les dernières annonces du flux du cours ; même prudence pour un serveur qui ne connaît pas mesAnnonces.
    try {
      const appel = google.script.run.withSuccessHandler(r => montreAnnonces(r && r.liste, d.devoirs)).withFailureHandler(() => {});
      if(typeof appel.mesAnnonces === "function") appel.mesAnnonces();
    } catch(e) {}
  }
  // Le cours s'ouvre seul : ni chat ni défi du portail derrière lui (le cours a les siens).
  const suite = () => { chatPortail(d); defiConnecte(d); guetteSeance(d); };
  if(seanceAOuvrir(d)) ouvreSeance(d.seance).then(ouvert => { if(!ouvert) suite(); });
  else suite();
}

/* ----- La séance s'ouvre seule (Vincent, 26/11/2026 : « la séance devrait s'ouvrir », pas attendre un clic sur
   « Ouvrir ma séance »). Les élèves arrivent ici par ?vue=portail (lien « Me connecter », page publique redirigée) :
   ce n'est pas un choix de quitter le cours. Donc :
   - séance déjà ouverte au chargement ▸ le cours s'ouvre tout de suite ;
   - séance ouverte APRÈS l'arrivée ▸ en journée de classe, une question toutes les 30 s pendant l'heure qui suit le
     chargement, onglet visible seulement (même appel que « Mes cours », qui le fait toutes les 5 s).
   Une seule fois par cours et par jour dans cet onglet : l'élève qui revient au portail par « Mon portail » y reste,
   avec le bloc « En ce moment · Ouvrir ma séance ▸ » en haut. */
const GUET_SEANCE = 30000, GUET_SEANCE_MAX = 60 * 60000;
const heureDeClasse = t => { const d = new Date(t), h = d.getHours() + d.getMinutes() / 60; return d.getDay() >= 1 && d.getDay() <= 5 && h >= 7.5 && h < 17.5; };
const appelServeur = fn => new Promise((ok, ko) => {
  const pont = google.script.run.withSuccessHandler(ok).withFailureHandler(ko);
  if(typeof pont[fn] === "function") pont[fn](); else ko(new Error(fn));
});
const cleOuverte = s => "seance-ouverte:" + s.url + ":" + new Date().toDateString();
function dejaOuverte(s){ try { return sessionStorage.getItem(cleOuverte(s)) === "1"; } catch(e) { return false; } }
function ouvreSeance(s){
  if(dejaOuverte(s)) return Promise.resolve(false);
  try { sessionStorage.setItem(cleOuverte(s), "1"); } catch(e) {}
  return appelServeur("rejoindreSeance").then(html => html ? ouvreFiche(html).then(() => true) : false).catch(() => false);
}
const seanceAOuvrir = d => !!(SUIVI && d.seance && !d.prof && d.classe && !d.apercu && !dejaOuverte(d.seance));
function guetteSeance(d){
  if(!SUIVI || d.prof || !d.classe || d.seance || d.apercu) return;
  const depart = Date.now();
  let enCours = false, minuterie = 0;
  const regarde = () => {
    if(enCours || document.hidden || !heureDeClasse(Date.now())) return;
    if(Date.now() - depart > GUET_SEANCE_MAX){ clearInterval(minuterie); return; }
    enCours = true;
    appelServeur("mesCours").then(r => {
      if(!r || !r.seance) return;
      clearInterval(minuterie);
      $("seance-titre").textContent = r.seance.titre; $("seance-lien").href = r.seance.url; $("maintenant").hidden = false;
      return ouvreSeance(r.seance).then(ouvert => { if(!ouvert) chatPortail(Object.assign({}, d, { seance: r.seance })); });
    }).catch(() => {}).finally(() => { enCours = false; });
  };
  minuterie = setInterval(regarde, GUET_SEANCE);
}
/* La fiche remplace la page sans document.open : le pont Google garde ses écouteurs (même geste que « Mes cours »). */
async function ouvreFiche(html){
  const page = new DOMParser().parseFromString(html, "text/html");
  const scripts = [...page.querySelectorAll("script")];
  scripts.forEach(s => s.remove());
  document.head.replaceChildren(...page.head.childNodes);
  document.body.replaceChildren(...page.body.childNodes);
  for(const original of [...scripts.filter(s => !s.defer), ...scripts.filter(s => s.defer)]){
    const s = document.createElement("script");
    for(const a of original.attributes) s.setAttribute(a.name, a.value);
    s.removeAttribute("defer"); s.async = false;
    s.textContent = original.textContent;
    if(s.src) await new Promise((ok, ko) => { s.onload = ok; s.onerror = ko; document.body.append(s); });
    else document.body.append(s);
  }
}

/* ----- Le chat de la classe : ouvert et fermé par le professeur. -----
   Comme dans les cours (Vincent, 24/11/2026 : « en bas à droite aussi là ») : un bouton « 💬 Chat » en bas à droite,
   qui ouvre le fil dans un panneau par-dessus la page ; une pastille dit qu'il y a du nouveau.
   Le portail est la page d'accueil de toute l'école : il ne doit pas interroger le serveur en continu. Donc :
   chat ouvert ou séance en cours ▸ une question par minute (le fil, lui, ne se relit toutes les 5 s que panneau
   ouvert) ; ni l'un ni l'autre ▸ rien du tout (l'élève recharge la page quand le professeur ouvre). */
const GUET_CHAT = 60000;
function chatPortail(d){
  if(!SUIVI || d.prof || !d.classe || (!d.chat && !d.seance)) return;
  let bulle = null, charge = null;
  const appel = (fn, ...args) => new Promise((ok, ko) => {
    const pont = google.script.run.withSuccessHandler(ok).withFailureHandler(ko);
    // Un serveur pas encore republié ne connaît pas le chat : on se tait.
    if(typeof pont[fn] === "function") pont[fn](...args); else ko(new Error("Le chat n'est pas encore disponible."));
  });
  const retire = () => { if(bulle){ bulle.retire(); bulle = null; } };   // fermé : le bouton disparaît, messages compris
  function montre(dernier){
    if(bulle) return bulle.signale(dernier);
    charge = charge || new Promise((ok, ko) => {
      if(window.CampinChat) return ok();
      const s = document.createElement("script");
      s.src = SITE + "chat/chat.js?v=ferme-20261124"; s.onload = ok; s.onerror = ko;
      document.head.append(s);
    });
    charge.then(() => { if(!bulle){ bulle = window.CampinChat.bulle({ appel, surFerme: retire }); bulle.signale(dernier); } }, () => { charge = null; });
  }
  const regarde = () => { if(!document.hidden) appel("chatLire", 1e9).then(r => { if(r && r.ouvert) montre(r.dernier); else retire(); }, () => {}); };
  setInterval(regarde, GUET_CHAT);
  if(d.chat) montre(0);
}

/* ----- Mes devoirs : la liste lue par le serveur dans le cours Classroom de la classe. ----- */
const MOTS_DEVOIR = { "retard": "En retard", "a-rendre": "À rendre", "rendu": "Rendu", "corrige": "Corrigé" };
/** Une cote comme on l'écrit en classe : « 7,5 / 10 ». Rend "" si ce n'est pas une cote sur un total. */
function cote(note, sur){
  const n = Number(note), t = Number(sur);
  if(typeof note !== "number" || !Number.isFinite(n) || n < 0 || !Number.isFinite(t) || t <= 0) return "";
  const fr = v => String(Math.round(v * 100) / 100).replace(".", ",");
  return fr(n) + " / " + fr(t);
}
/** Ce que le portail écrit pour chaque devoir : [{ titre, lien, classe, mot, quand, cote }]. Un état inconnu ou un titre
 *  vide sont écartés ; un lien qui ne mène pas à Classroom est retiré (la ligne reste, sans lien). La cote ne s'écrit
 *  que sur un devoir corrigé : c'est celle que le professeur a rendue dans Classroom. */
function devoirsA(liste, maintenant){
  const sortie = [];
  for(const x of Array.isArray(liste) ? liste : []){
    if(!x || typeof x.titre !== "string" || !x.titre.trim() || !Object.prototype.hasOwnProperty.call(MOTS_DEVOIR, x.etat)) continue;
    const fait = x.etat === "rendu" || x.etat === "corrige";
    const e = Number(x.echeance) || 0;
    let quand = "";
    if(e && !fait){
      const jour = new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Brussels" }).format(new Date(e));
      const cle = t => new Intl.DateTimeFormat("fr-CA", { timeZone: "Europe/Brussels" }).format(new Date(t));
      quand = cle(e) === cle(maintenant) ? "pour aujourd'hui" : cle(e) === cle(maintenant + 86400000) ? "pour demain" : (e < maintenant ? "c'était pour le " : "pour le ") + jour;
    }
    sortie.push({ titre: x.titre.trim(), lien: typeof x.lien === "string" && x.lien.startsWith("https://classroom.google.com/") ? x.lien : "",
      classe: fait ? "fait" : x.etat, mot: MOTS_DEVOIR[x.etat], quand, cote: x.etat === "corrige" ? cote(x.note, x.sur) : "" });
  }
  return sortie;
}
/* Les points sont repliés à chaque ouverture de la page (Vincent, 24/11/2026 : « ils vont être trop focus sur leurs
   points ») : le devoir et son état restent visibles, la cote n'apparaît qu'après « Voir mes points ». */
let POINTS_VUS = false, DEVOIRS_LUS = null;
function montreDevoirs(liste){
  if(!Array.isArray(liste)) return;   // service Classroom absent ou en panne : la porte « Mes devoirs » suffit
  DEVOIRS_LUS = liste;
  const lignes = devoirsA(liste, Date.now());
  const ul = $("devoirs-liste");
  if(!lignes.length){
    const li = document.createElement("li"); li.className = "devoir"; li.textContent = "Aucun devoir pour le moment dans ce cours.";
    ul.replaceChildren(li);
  } else ul.replaceChildren(...lignes.map(d => {
    const li = document.createElement("li"); li.className = d.classe;
    const boite = document.createElement(d.lien ? "a" : "div");
    if(d.lien){ boite.href = d.lien; boite.target = "_top"; } else boite.className = "devoir";
    const etat = document.createElement("span"); etat.className = "etat"; etat.textContent = d.mot;
    const b = document.createElement("b"); b.textContent = d.titre;
    boite.append(etat, b);
    if(d.quand){ const q = document.createElement("span"); q.className = "quand"; q.textContent = d.quand; boite.append(q); }
    if(d.cote && POINTS_VUS){ const c = document.createElement("span"); c.className = "cote"; c.textContent = d.cote; boite.append(c); }
    li.append(boite); return li;
  }));
  // Dès qu'une cote est affichée, la page dit d'où elle vient et où lire le commentaire.
  const cotes = lignes.some(d => d.cote), voir = $("devoirs-voir");
  if($("devoirs-points")) $("devoirs-points").hidden = !(cotes && POINTS_VUS);
  if($("devoirs-plie")) $("devoirs-plie").hidden = !cotes;
  if(voir){
    voir.textContent = POINTS_VUS ? "Cacher mes points" : "Voir mes points";
    if(voir.setAttribute) voir.setAttribute("aria-expanded", String(POINTS_VUS));
    voir.onclick = () => { POINTS_VUS = !POINTS_VUS; montreDevoirs(DEVOIRS_LUS); };
  }
  $("devoirs").hidden = false;
}

/* ----- Les annonces : les dernières du flux Classroom du cours, lues par le serveur. ----- */
/** Ce que le portail écrit : [{ texte, quand, lien }], trois au plus. Une annonce sans texte est écartée ; un lien
 *  qui ne mène pas à Classroom est retiré (l'annonce reste, sans lien). */
function annoncesA(liste){
  const sortie = [];
  for(const x of Array.isArray(liste) ? liste : []){
    if(!x || typeof x.texte !== "string" || !x.texte.trim()) continue;
    const t = Number(x.date) || 0;
    sortie.push({ texte: x.texte.trim(),
      quand: t ? new Intl.DateTimeFormat("fr-BE", { weekday: "long", day: "numeric", month: "long", timeZone: "Europe/Brussels" }).format(new Date(t)) : "",
      lien: typeof x.lien === "string" && x.lien.startsWith("https://classroom.google.com/") ? x.lien : "" });
  }
  return sortie.slice(0, 3);
}
/** La mise en page d'une annonce, sans jamais lire son texte comme du HTML : des blocs { type: "p" | "ul", lignes },
 *  chaque ligne étant une suite de morceaux { t: "texte" | "gras" | "lien", v }. Reconnus : **gras**, les lignes qui
 *  commencent par « - », « * » ou « • » (une liste), les adresses http(s) (un lien), une ligne vide (un nouveau paragraphe). */
function morceaux(ligne){
  const sortie = [], motif = /\*\*([^*\n]+?)\*\*|https?:\/\/[^\s<>"']+/g;
  let fin = 0, m;
  const texte = v => { if(v) sortie.push({ t: "texte", v }); };
  while((m = motif.exec(ligne))){
    texte(ligne.slice(fin, m.index));
    if(m[1] !== undefined){ sortie.push({ t: "gras", v: m[1].trim() }); fin = motif.lastIndex; }
    else {
      const url = m[0].replace(/[.,;:!?)»…]+$/, "");   // la ponctuation de la phrase n'appartient pas à l'adresse
      sortie.push({ t: "lien", v: url }); fin = m.index + url.length; motif.lastIndex = fin;
    }
  }
  texte(ligne.slice(fin));
  return sortie;
}
function miseEnForme(texte){
  const blocs = [];
  let courant = null;
  for(const brute of String(texte || "").split("\n")){
    const ligne = brute.trim();
    if(!ligne){ courant = null; continue; }
    const puce = /^[-*•]\s+(.*)$/.exec(ligne);
    const type = puce ? "ul" : "p";
    if(!courant || courant.type !== type){ courant = { type, lignes: [] }; blocs.push(courant); }
    courant.lignes.push(morceaux(puce ? puce[1] : ligne));
  }
  return blocs;
}
function ecrisLigne(parent, ligne){
  for(const x of ligne){
    if(x.t === "gras"){ const b = document.createElement("b"); b.textContent = x.v; parent.append(b); }
    else if(x.t === "lien"){ const a = document.createElement("a"); a.href = x.v; a.target = "_top"; a.rel = "noopener"; a.textContent = x.v; parent.append(a); }
    else parent.append(x.v);
  }
}
function montreAnnonces(liste, cours){
  const lignes = annoncesA(liste);
  if(!lignes.length) return;          // rien à lire, ou service en panne : pas de panneau vide
  $("annonces-liste").replaceChildren(...lignes.map(a => {
    const li = document.createElement("li");
    // Une boîte, pas un lien : l'annonce porte ses propres liens, et un lien dans un lien ne marche pas.
    const boite = document.createElement("div"); boite.className = "annonce";
    if(a.quand){ const q = document.createElement("span"); q.className = "quand"; q.textContent = a.quand; boite.append(q); }
    const corps = document.createElement("div"); corps.className = "texte";
    for(const bloc of miseEnForme(a.texte)){
      const b = document.createElement(bloc.type);
      bloc.lignes.forEach((ligne, i) => {
        if(bloc.type === "ul"){ const item = document.createElement("li"); ecrisLigne(item, ligne); b.append(item); }
        else { if(i) b.append(document.createElement("br")); ecrisLigne(b, ligne); }
      });
      corps.append(b);
    }
    boite.append(corps);
    if(a.lien){ const s = document.createElement("a"); s.className = "suite"; s.href = a.lien; s.target = "_top"; s.textContent = "Lire dans Classroom"; boite.append(s); }
    li.append(boite); return li;
  }));
  $("annonces").hidden = false;
}

/* ----- Mes révisions : celles des cours ouverts pour la classe, dans l'ordre des cours. ----- */
const REVISIONS = "https://root75.github.io/campin-public/revisions/revisions.json";
const SITE = "https://root75.github.io/campin-public/";
/** Les révisions à proposer : seulement les cours de l'élève, sans doublon, et des chemins du site (jamais une autre adresse).
 *  Rend [{ id, titre, activites: [{ genre, url, jeu, suivi }] }] ; « jeu » = l'activité s'ouvre dans le portail,
 *  « suivi » = la clé de son « fait / à faire ». */
function revisionsDe(cours, table){
  const vus = new Set(), liste = [];
  for(const id of Array.isArray(cours) ? cours : []){
    if(vus.has(id) || !table || !Object.prototype.hasOwnProperty.call(table, id)) continue;
    vus.add(id);
    const c = table[id];
    if(!c || typeof c.titre !== "string" || !c.titre) continue;
    const activites = [];
    for(const x of Array.isArray(c.activites) ? c.activites : []){
      if(!x || typeof x.genre !== "string" || !x.genre || typeof x.chemin !== "string") continue;
      if(!/^[a-z0-9][a-z0-9\-\/.]*(\?(cours|jeu)=[a-z0-9\-]+)?(#[a-z]+)?$/.test(x.chemin) || x.chemin.includes("..")) continue;
      activites.push({ genre: x.genre, url: SITE + x.chemin, jeu: x.jeu === "mots-croises" ? "mots-croises" : "",
        suivi: typeof x.suivi === "string" && /^[a-z0-9:\-]{1,80}$/.test(x.suivi) ? x.suivi : "" });
    }
    if(activites.length) liste.push({ id, titre: c.titre, activites });
  }
  return liste;
}
/* Le « fait / à faire » de l'élève (Vincent, 24/11/2026 : « les 2 », dans « Mes révisions » et dans son tableau).
   Il vient du serveur (monProgres : ce qu'il a fait sur n'importe quel poste) et de ce navigateur (assets/progres.js,
   quand une grille vient d'être jouée ici). Une activité faite porte « ✓ », chaque carte dit où il en est. */
let PROGRES_SERVEUR = {}, REVISIONS_PEINTES = [];
function etatRevision(cle){
  let ici = ""; try { if(globalThis.Progres) ici = globalThis.Progres.etat(cle); } catch(e) {}
  const la = PROGRES_SERVEUR[cle];
  return ici === "fait" || la === "fait" ? "fait" : ici === "commence" || la === "commence" ? "commence" : "";
}
function peintRevisions(){
  for(const c of REVISIONS_PEINTES){
    let faits = 0;
    for(const a of c.activites){
      const e = etatRevision(a.suivi); if(e === "fait") faits++;
      a.noeud.textContent = (e === "fait" ? "✓ " : "") + a.texte;
      a.noeud.className = [a.classe, e].filter(Boolean).join(" ");
    }
    const total = c.activites.length;
    c.avancement.hidden = !total;
    c.avancement.textContent = faits === total ? "✓ Tout est fait" : faits + " sur " + total + " fait" + (faits > 1 ? "s" : "");
    c.avancement.className = "revision-avancement" + (faits === total ? " complet" : "");
  }
}
/** Note sur le serveur (« a~fait,b~commence », ou rien pour seulement lire) et repeint avec la réponse. */
function monProgres(m){
  return new Promise((ok, ko) => {
    let pont = null; try { pont = google.script.run.withSuccessHandler(ok).withFailureHandler(ko); } catch(e) {}
    if(pont && typeof pont.monProgres === "function") pont.monProgres(m || ""); else ko(new Error("pas de serveur"));   // serveur pas encore republié
  }).then(r => { if(r && typeof r === "object") { PROGRES_SERVEUR = r; peintRevisions(); } return r; });
}
function mesRevisions(cours){
  if(!Array.isArray(cours) || !cours.length || typeof fetch !== "function") return;
  fetch(REVISIONS).then(r => r.ok ? r.json() : Promise.reject()).then(t => {
    const liste = revisionsDe(cours, t.cours);
    if(!liste.length) return;
    REVISIONS_PEINTES = [];
    $("revisions-liste").replaceChildren(...liste.map(c => {
      const carte = document.createElement("div"); carte.className = "revision";
      const b = document.createElement("b"); b.textContent = c.titre;
      const acts = document.createElement("div"); acts.className = "revision-activites";
      const avancement = document.createElement("span"), suivies = [];
      REVISIONS_PEINTES.push({ avancement, activites: suivies });
      const suit = (noeud, a, classe) => { if(a.suivi) suivies.push({ noeud, suivi: a.suivi, texte: noeud.textContent, classe }); };
      for(const a of c.activites){
        if(a.jeu){
          // Les mots croisés se jouent ici même : l'élève ne quitte pas son portail.
          const bouton = document.createElement("button"); bouton.type = "button"; bouton.className = "jouer"; bouton.textContent = a.genre + " ▸ jouer ici";
          bouton.addEventListener("click", () => joue(c.id, c.titre, a.url));
          acts.append(bouton); suit(bouton, a, "jouer");
        } else {
          const lien = document.createElement("a"); lien.target = "_top"; lien.href = a.url; lien.textContent = a.genre;
          acts.append(lien); suit(lien, a, "");
        }
      }
      carte.append(b, avancement, acts); return carte;
    }));
    $("revisions").hidden = false;
    peintRevisions();
    if(SUIVI){
      monProgres("").catch(() => {});
      // Une grille finie ici : assets/progres.js l'envoie par ce pont, et la carte se met à jour.
      globalThis.ProgresPont = m => monProgres(m);
      if(document.addEventListener) document.addEventListener("campin-progres", peintRevisions);
    }
  }).catch(() => {});
}

/* ----- Jouer dans le portail : la grille du cours s'ouvre sous « Mes révisions ». ----- */
const JEU = SITE + "mots-croises/";
let outils = null;
/** Charge une seule fois le jeu (ses styles, le calcul de la grille, l'écran) et les mots de tous les cours. */
function outilsDuJeu(){
  if(outils) return outils;
  const script = src => new Promise((oui, non) => { const s = document.createElement("script"); s.src = src; s.onload = oui; s.onerror = non; document.head.append(s); });
  const style = document.createElement("link"); style.rel = "stylesheet"; style.href = JEU + "jeu.css"; document.head.append(style);
  outils = Promise.all([
    fetch(JEU + "grilles.json").then(r => r.ok ? r.json() : Promise.reject()),
    script(SITE + "assets/progres.js"), script(JEU + "grille.js").then(() => script(JEU + "jeu.js"))
  ]).then(([d]) => d.grilles).catch(e => { outils = null; throw e; });
  return outils;
}
function joue(id, titre, secours){
  const zone = $("jeu-portail");
  $("jeu-titre").textContent = "Mots croisés · " + titre;
  $("jeu-zone").textContent = "Chargement…";
  zone.hidden = false;
  if(zone.scrollIntoView) zone.scrollIntoView({ behavior: "smooth", block: "start" });
  outilsDuJeu().then(grilles => {
    if(!Object.prototype.hasOwnProperty.call(grilles, id)) throw new Error("grille absente");
    MotsCroises.monte($("jeu-zone"), id, grilles[id]);
  }).catch(() => {
    // Le jeu ne se charge pas ici : il reste sa page.
    const a = document.createElement("a"); a.target = "_top"; a.href = secours; a.textContent = "Ouvrir la grille dans sa page ▸";
    $("jeu-zone").replaceChildren("La grille ne s'ouvre pas ici. ", a);
  });
}
$("jeu-fermer").addEventListener("click", () => { $("jeu-portail").hidden = true; $("jeu-zone").replaceChildren(); });
function gras(t){ const b = document.createElement("b"); b.textContent = t; return b; }

/* ----- Le défi du jour (Vincent, 25/11/2026). -----
   Un défi de logique maison, le même pour tout le monde, qui change chaque jour d'école (lundi-vendredi ; le
   week-end garde celui du vendredi). Corrigé ici, sur la page : trois essais, puis la solution. Connecté, un défi
   réussi est noté sur le serveur (monProgres, clé « defi:AAAAMMJJ ») : un point portail, que l'élève et le
   professeur voient, et qui ne compte jamais dans une cote. « Pour aller plus loin » : une tâche du lab beOI,
   une par jour à tour de rôle (un lien, rien n'est recopié). */
const DEFIS = SITE + "defi/defis.json", DEFI_ESSAIS = 3;
/** Le jour d'école dont c'est le défi (samedi et dimanche ▸ le vendredi) et son rang depuis le lundi 31/08/2026. */
function jourDefi(d){
  const j = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const s = j.getDay(); if(s === 6) j.setDate(j.getDate() - 1); else if(s === 0) j.setDate(j.getDate() - 2);
  const jours = Math.round((Date.UTC(j.getFullYear(), j.getMonth(), j.getDate()) - Date.UTC(2026, 7, 31)) / 864e5);
  const semaines = Math.floor(jours / 7);
  return { jour: j, rang: semaines * 5 + (jours - semaines * 7), cle: "defi:" + dateNom(j) };
}
function aTour(liste, rang){ const n = Array.isArray(liste) ? liste.length : 0; return n ? liste[((rang % n) + n) % n] : null; }
/** Une réponse comme on la compare : sans majuscules, accents, espaces ni ponctuation. */
function normalise(t){ return String(t == null ? "" : t).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, ""); }
function reponseJuste(defi, r){
  if(!defi) return false;
  if(defi.type === "choix") return r === defi.reponse;
  if(defi.type === "nombre"){ const n = Number(String(r).trim().replace(",", ".")); return String(r).trim() !== "" && n === Number(defi.reponse); }
  return normalise(r) !== "" && normalise(r) === normalise(defi.reponse);
}
/** Le nombre de défis réussis, d'après ce que le serveur sait de l'élève. */
function pointsDefis(etats){ return Object.keys(etats || {}).filter(k => /^defi:\d{8}$/.test(k) && etats[k] === "fait").length; }

let DEFI = null, DEFI_ELEVE = false;
function etatDefiLocal(){ try { const x = JSON.parse(localStorage.getItem("portail-defi") || "null"); if(x && DEFI && x.cle === DEFI.cle) return x; } catch(e) {} return DEFI ? { cle: DEFI.cle, essais: 0, fini: "" } : null; }
function gardeDefi(x){ try { localStorage.setItem("portail-defi", JSON.stringify(x)); } catch(e) {} }
function peintDefi(){
  if(!DEFI) return;
  const d = DEFI.defi, local = etatDefiLocal(), serveur = PROGRES_SERVEUR[DEFI.cle] === "fait";
  const fini = serveur ? "reussi" : local.fini, form = $("defi-form"), retour = $("defi-retour");
  $("defi-titre").textContent = d.titre;
  $("defi-enonce").replaceChildren(...d.enonce.map(l => { const p = document.createElement("p"); p.textContent = l; return p; }));
  if(fini){
    form.replaceChildren(); form.hidden = true;
    retour.className = "defi-retour " + (fini === "reussi" ? "bravo" : "encore");
    retour.replaceChildren(gras(fini === "reussi" ? "Bravo, défi réussi ! " : "La réponse était : " + d.reponse + ". "), d.explication || "",
      fini === "reussi" && !DEFI_ELEVE ? " Connecte-toi avec ton compte de l'école pour gagner ton point." : "", " Un nouveau défi t'attend au prochain jour d'école.");
    retour.hidden = false;
  } else {
    form.hidden = false;
    let champ = null;
    const valide = r => {
      const x = etatDefiLocal();
      if(reponseJuste(d, r)){
        x.fini = "reussi"; gardeDefi(x);
        if(DEFI_ELEVE) monProgres(DEFI.cle + "~fait").catch(() => {});
      } else {
        x.essais++; if(x.essais >= DEFI_ESSAIS) x.fini = "rate"; gardeDefi(x);
        if(!x.fini){
          retour.className = "defi-retour encore";
          retour.replaceChildren(gras("Pas encore. "), "Indice : " + (d.indice || "relis l'énoncé ligne par ligne.") + " (" + (DEFI_ESSAIS - x.essais) + " essai" + (DEFI_ESSAIS - x.essais > 1 ? "s" : "") + " restant" + (DEFI_ESSAIS - x.essais > 1 ? "s" : "") + ")");
          retour.hidden = false;
          if(champ){ champ.value = ""; if(champ.focus) champ.focus(); }
          return;
        }
      }
      peintDefi();
    };
    if(d.type === "choix"){
      form.replaceChildren(...d.choix.map(c => { const b = document.createElement("button"); b.type = "button"; b.textContent = c; b.addEventListener("click", () => valide(c)); return b; }));
      form.onsubmit = e => e.preventDefault();
    } else {
      champ = document.createElement("input"); champ.type = "text"; champ.setAttribute("aria-label", "Ta réponse");
      if(d.type === "nombre") champ.setAttribute("inputmode", "numeric");
      champ.placeholder = "Ta réponse";
      const b = document.createElement("button"); b.type = "submit"; b.className = "valider"; b.textContent = "Vérifier";
      form.replaceChildren(champ, b);
      form.onsubmit = e => { e.preventDefault(); valide(champ.value); };
    }
  }
  const pts = pointsDefis(PROGRES_SERVEUR);
  $("defi-points").textContent = "🧩 " + pts + " point" + (pts > 1 ? "s" : "") + " défi" + (pts > 1 ? "s" : "") + " · ils ne comptent pas dans tes cotes";
  $("defi-points").hidden = !DEFI_ELEVE;
  $("defi").hidden = false;
}
function chargeDefi(maintenant){
  if(typeof fetch !== "function") return;
  fetch(DEFIS).then(r => r.ok ? r.json() : Promise.reject()).then(t => {
    const j = jourDefi(maintenant), defi = aTour(t.defis, j.rang);
    if(!defi || typeof defi.titre !== "string" || !Array.isArray(defi.enonce)) return;
    DEFI = { cle: j.cle, defi };
    const b = aTour(t.beoi, j.rang);
    if(b && typeof b.url === "string" && b.url.startsWith("https://lab.be-oi.be/")){
      $("defi-beoi").href = b.url; $("defi-beoi").textContent = b.titre + (b.annee ? " (Olympiade " + b.annee + ")" : "") + " ▸";
      $("defi-plus").hidden = false;
    }
    peintDefi();
  }).catch(() => {});
}
/** Professeur : « Voir en tant que » une classe, sous la ligne du compte. Chaque lien recharge le portail en aperçu. */
function voirEnTantQue(d){
  if(!d.prof || !Array.isArray(d.classes) || !d.classes.length || !d.mesCours) return;
  const p = document.createElement("p"); p.className = "compte voir-comme";
  p.append("Voir en tant que : ");
  const lien = (texte, url, actif) => { const a = document.createElement("a"); a.textContent = texte; a.href = url; a.target = "_top";
    if(actif) a.setAttribute("aria-current", "true"); p.append(a, " "); };
  d.classes.forEach(c => lien(c, d.mesCours + "?vue=portail&classe=" + encodeURIComponent(c), c === d.apercu));
  if(d.apercu) lien("Moi (professeur)", d.mesCours + "?vue=portail", false);
  $("compte").after(p);
}
/** Connecté : l'élève gagne son point ; ses points viennent du serveur. Un professeur joue sans point. */
function defiConnecte(d){
  if(d.prof || !SUIVI) return;
  DEFI_ELEVE = true;
  monProgres("").then(peintDefi, () => {});
  peintDefi();
}
chargeDefi(new Date());

if(SUIVI){
  google.script.run.withSuccessHandler(affiche).withFailureHandler(() => {}).portail((document.body && document.body.dataset && document.body.dataset.apercu) || "");
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
globalThis.PortailEssai = { tire, ciel, conseil, dateNom, dateJour, revisionsDe, devoirsA, annoncesA, miseEnForme, cote, jourDefi, aTour, reponseJuste, normalise, pointsDefis };
})();
