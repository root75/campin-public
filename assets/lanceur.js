(() => {
/* Le lanceur d'applis (Vincent, 27/11/2026) : la grille à 9 points des pages Google, à la même place (en haut à droite),
   pour que l'élève prenne ici le geste qu'il refera sur n'importe quelle page Google. En premier, « Mes cours » et la
   chouette de l'école : de n'importe où, il retrouve son cours. Ce n'est qu'une liste de liens : le poste et l'extension
   bloquent toujours ce que le mode du cours ferme.
   Une page le charge par son adresse absolue (Apps Script abîme un script écrit dans la page) :
     <script defer src="https://root75.github.io/campin-public/assets/lanceur.js"></script>
   Avec un <div data-lanceur-applis></div>, il se pose dedans (le bandeau du portail) ; sans, il flotte en haut à droite,
   à gauche de la cloche 🔔 quand la page en a une. */
if (document.getElementById("applis")) return;
const EXEC = "https://script.google.com/a/macros/arcampin.be/s/AKfycbyOPTaq-L1PuittB1rkkiL9OOtShFc2WpiD8H_pH_INaw9ePWenCzhlIPlHu4zBOgLk/exec";
// Le même ordre que la vraie grille Google d'un compte de l'école (capture de Vincent, 27/11/2026), « Mes cours » à la
// place de « Compte ». Icônes : celles de cette grille, détourées (assets/applis/). Ajouter ou retirer une appli = une ligne.
const ICO = "https://root75.github.io/campin-public/assets/applis/";
const APPLIS = [
  ["Mes cours", EXEC, "https://root75.github.io/campin-public/assets/logo-campin.png", "chouette"],
  ["Drive", "https://drive.google.com/", ICO + "drive.png"],
  ["Classroom", "https://classroom.google.com/", ICO + "classroom.png"],
  ["Docs", "https://docs.google.com/document/", ICO + "docs.png"],
  ["Sheets", "https://docs.google.com/spreadsheets/", ICO + "sheets.png"],
  ["Slides", "https://docs.google.com/presentation/", ICO + "slides.png"],
  ["Agenda", "https://calendar.google.com/", ICO + "agenda.png"],
  // Gmail ne marche pas pour les élèves et Gemini n'est pas pour eux (Vincent, 27/11/2026) : Forms et la recherche à leur place.
  ["Forms", "https://docs.google.com/forms/", "https://ssl.gstatic.com/images/branding/product/2x/forms_2020q4_48dp.png"],
  ["Recherche", "https://www.google.com/", "https://ssl.gstatic.com/images/branding/product/2x/googleg_48dp.png"]
];
// Les quatre applis Microsoft 365 du compte de l'école (Vincent, 28/11/2026) : la messagerie des élèves est Outlook, et
// leurs fichiers du labo sont dans OneDrive. Une rangée à part, sous la grille Google qui reste carrée. Icônes : celles de
// Microsoft (assets/applis/*.svg). OneDrive ouvre droit celui de l'école, sans passer par le choix d'un compte.
const MICROSOFT = [
  ["Outlook", "https://outlook.cloud.microsoft/mail/", ICO + "outlook.svg"],
  ["OneDrive", "https://arcampinbe-my.sharepoint.com/", ICO + "onedrive.svg"],
  ["Word", "https://word.cloud.microsoft/", ICO + "word.svg"],
  ["Excel", "https://excel.cloud.microsoft/", ICO + "excel.svg"]
];

const css = `
.applis{--g-fond:#e9eef6;--g-carte:#fff;--g-texte:#1f1f1f;--g-survol:#e8ebee;position:relative;flex:none;z-index:40}
.applis.flotte{position:fixed;top:10px;right:max(12px,env(safe-area-inset-right,0px))}
:root[data-theme="dark"] .applis{--g-fond:#1b1c1d;--g-carte:#282a2c;--g-texte:#e3e3e3;--g-survol:#37393b}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .applis.suit-systeme{--g-fond:#1b1c1d;--g-carte:#282a2c;--g-texte:#e3e3e3;--g-survol:#37393b}}
.applis-bouton{width:48px;height:48px;border-radius:50%;border:0;background:transparent;display:grid;place-items:center;cursor:pointer;
  color:var(--lanceur-icone,#5f6368);padding:0}
.applis.flotte .applis-bouton{background:var(--g-carte);box-shadow:0 1px 3px rgba(0,0,0,.25)}
.applis-bouton:hover,.applis-bouton[aria-expanded="true"]{background:rgba(127,140,170,.22)}
.applis-bouton svg{width:24px;height:24px;fill:currentColor}
.applis-panneau{position:absolute;right:0;top:54px;width:min(340px,calc(100vw - 24px));padding:8px;border-radius:28px;
  background:var(--g-fond);box-shadow:0 4px 8px 3px rgba(0,0,0,.15),0 1px 3px rgba(0,0,0,.3);max-height:calc(100vh - 70px);overflow-y:auto}
.applis-panneau[hidden]{display:none}
.applis-grille{list-style:none;margin:0;padding:14px 8px;border-radius:20px;background:var(--g-carte);display:grid;grid-template-columns:repeat(3,1fr);gap:4px}
.applis-grille.microsoft{grid-template-columns:repeat(4,1fr);gap:0;margin-top:8px;padding:8px}
.applis-grille a{display:flex;flex-direction:column;align-items:center;gap:8px;padding:12px 4px 10px;border-radius:16px;text-decoration:none;
  color:var(--g-texte);font:400 14px/1.2 "Google Sans",Roboto,Arial,sans-serif}
.applis-grille a:hover,.applis-grille a:focus-visible{background:var(--g-survol)}
.applis-grille.microsoft a{font-size:13px;padding:10px 0 8px}
.applis-grille img{width:40px;height:40px;object-fit:contain}
.applis-grille.microsoft img{width:44px;height:44px;margin:-2px 0}
.applis-grille img.chouette{border-radius:50%;background:#fff;padding:2px}
@media print{.applis{display:none}}`;
const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);

const ici = document.querySelector("[data-lanceur-applis]");
const boite = document.createElement("div");
boite.className = "applis" + (ici ? "" : " flotte suit-systeme");
const tuile = ([nom, url, ico, cl]) =>
  `<li><a target="_top" href="${url}"><img src="${ico}" alt="" width="40" height="40" loading="lazy"${cl ? ` class="${cl}"` : ""}>${nom}</a></li>`;
const points = [6, 12, 18].flatMap(y => [6, 12, 18].map(x => `<circle cx="${x}" cy="${y}" r="2"/>`)).join("");
boite.innerHTML = `<button class="applis-bouton" id="applis" type="button" aria-label="Applications" title="Applications" aria-expanded="false" aria-controls="applis-panneau">
<svg viewBox="0 0 24 24" aria-hidden="true">${points}</svg></button>
<div class="applis-panneau" id="applis-panneau" hidden><ul class="applis-grille">${APPLIS.map(tuile).join("")}</ul>
<ul class="applis-grille microsoft" aria-label="Microsoft 365">${MICROSOFT.map(tuile).join("")}</ul></div>`;
(ici || document.body).appendChild(boite);

/* Sur une page de cours, la cloche 🔔 tient déjà le coin : le lanceur se range à sa gauche, centré sur elle. */
function range(){
  if (ici) return;
  const a = document.getElementById("aide"), r = a && getComputedStyle(a).position === "fixed" ? a.getBoundingClientRect() : null;
  if (r && r.width) { boite.style.right = (innerWidth - r.left + 8) + "px"; boite.style.top = Math.max(4, r.top + (Math.min(r.height, 58) - 48) / 2) + "px"; }
}
range(); addEventListener("resize", range); addEventListener("load", range);
{ const a = document.getElementById("aide"); if (a && typeof ResizeObserver === "function") new ResizeObserver(range).observe(a); }

const b = boite.querySelector("#applis"), pan = boite.querySelector("#applis-panneau");
// Sur un écran étroit, le panneau se décale pour ne jamais sortir par la gauche.
const ouvre = o => { pan.hidden = !o; b.setAttribute("aria-expanded", String(o)); if (!o) return;
  pan.style.right = ""; const g = pan.getBoundingClientRect().left; if (g < 12) pan.style.right = (parseFloat(getComputedStyle(pan).right) - (12 - g)) + "px";
  pan.querySelector("a").focus(); };
b.addEventListener("click", e => { e.stopPropagation(); ouvre(pan.hidden); });
document.addEventListener("click", e => { if (!pan.hidden && !boite.contains(e.target)) ouvre(false); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !pan.hidden) { ouvre(false); b.focus(); } });
})();
