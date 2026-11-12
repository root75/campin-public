/* Fiche de révision à imprimer — pour une page « je révise » (messagerie/, messagerie-2/).
   Rien n'est recopié : la fiche se construit à partir de la page elle-même
   (ol.resume, ol.etapes, QUIZ), donc elle suit toute retouche du « je révise ».
   À l'écran : un bouton « Imprimer ma fiche de révision ». À l'impression : une page A4 recto.
   Dans la page :  <script src="…/assets/fiche-revision.js" data-pied="Activités Info — M. Louviaux — Messagerie 01"></script>
   à placer APRÈS le script qui déclare QUIZ. */
(function () {
  const moi = document.currentScript;
  const pied = (moi && moi.dataset.pied) || document.title;
  const adresse = (moi && moi.dataset.adresse) || "";
  const txt = sel => { const n = document.querySelector(sel); return n ? n.textContent.trim() : ""; };
  const el = (tag, cls, html) => { const n = document.createElement(tag); if (cls) n.className = cls; if (html != null) n.innerHTML = html; return n; };
  const propre = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;");

  const css = `
#fiche-papier{display:none}
.fp-note{font-size:.95rem;margin:0}
@page{size:A4;margin:10mm 13mm 14mm;
  @bottom-left{content:"${pied.replace(/"/g, "'")}";font:8pt Calibri,Arial,sans-serif;color:#666;border-top:.5pt solid #999;padding-top:2mm;vertical-align:top}
  @bottom-right{content:"Page " counter(page) " / " counter(pages);font:8pt Calibri,Arial,sans-serif;color:#666;border-top:.5pt solid #999;padding-top:2mm;vertical-align:top}}
@media print{
  html,body{background:#fff!important;color:#000!important;padding:0!important;margin:0!important}
  body>*:not(#fiche-papier){display:none!important}
  #fiche-papier{display:block;font:10pt/1.28 "Atkinson Hyperlegible","Segoe UI",Arial,sans-serif;color:#000}
  #fiche-papier *{box-sizing:border-box}
  .fp-champs{display:flex;gap:8mm;font-size:10pt;margin-bottom:2.5mm}
  .fp-champs span{flex:1;border-bottom:.5pt solid #000;padding-bottom:1mm}
  .fp-champs span:first-child{flex:2}
  .fp-sur{font-size:8.5pt;letter-spacing:.06em;text-transform:uppercase;color:#444}
  #fiche-papier h1{font:800 17pt/1.1 "Alegreya",Georgia,serif;margin:0 0 2mm}
  #fiche-papier h2{font:800 11.5pt/1.2 "Alegreya",Georgia,serif;margin:3mm 0 1mm;break-after:avoid}
  #fiche-papier ol{margin:0;padding-left:6mm}
  #fiche-papier li{margin:0 0 .7mm;break-inside:avoid}
  #fiche-papier .touche{border:.6pt solid #000;border-radius:3px;padding:0 .3em;font-weight:700;white-space:nowrap}
  .fp-cadre{border:.8pt solid #000;border-radius:3mm;padding:2mm 4mm}
  .fp-test li{margin-bottom:0}
  .fp-ligne{display:block;border-bottom:.5pt dotted #000;height:6.5mm}
  .fp-consigne{font-size:9.5pt;margin:0 0 1.5mm}
  .fp-reponses{margin-top:3mm;border-top:.5pt dashed #000;padding-top:2mm;font-size:8.5pt;transform:rotate(180deg);break-inside:avoid}
  .fp-reponses ol{padding-left:5mm}
  .fp-reponses li{margin:0}
  .fp-enligne{font-size:9pt;margin:2mm 0 0}
}`;
  document.head.append(el("style", null, css));

  const fiche = el("section"); fiche.id = "fiche-papier"; fiche.setAttribute("aria-hidden", "true");
  const titre = (document.querySelector(".page h1") || document.querySelector("h1")).cloneNode(true);
  titre.querySelectorAll("em").forEach(e => e.remove());
  fiche.append(
    el("div", "fp-champs", "<span>Nom :</span><span>Classe :</span><span>Date :</span>"),
    el("div", "fp-sur", propre(txt(".surtitre")) + " · fiche de révision"),
    el("h1", null, propre(titre.textContent.trim()))
  );

  const resume = document.querySelector("ol.resume");
  if (resume) {
    fiche.append(el("h2", null, "1. L'essentiel"));
    const ol = el("ol", "fp-cadre"); ol.style.paddingLeft = "9mm";
    resume.querySelectorAll(":scope > li").forEach(li => ol.append(el("li", null, li.innerHTML)));
    fiche.append(ol);
  }
  const gestes = document.querySelector(".coince ol.etapes");
  if (gestes) {
    fiche.append(el("h2", null, "2. Les gestes, toujours dans cet ordre"));
    const ol = el("ol");
    gestes.querySelectorAll(":scope > li").forEach(li => ol.append(el("li", null, li.innerHTML)));
    fiche.append(ol);
  }
  const quiz = (typeof QUIZ !== "undefined" && Array.isArray(QUIZ)) ? QUIZ : [];
  if (quiz.length) {
    fiche.append(el("h2", null, "3. Je me teste"),
      el("p", "fp-consigne", "Réponds par écrit, sans regarder le haut de la feuille. Ensuite, tourne la feuille tête en bas : les réponses sont au bas de la page."));
    const ol = el("ol", "fp-test");
    quiz.forEach(q => ol.append(el("li", null, propre(q.q) + '<span class="fp-ligne"></span>')));
    fiche.append(ol);
    if (adresse) fiche.append(el("p", "fp-enligne", "Pour t'entraîner encore (quiz et cartes) : <b>" + propre(adresse) + "</b>"));
    const rep = el("div", "fp-reponses", "<b>Réponses</b>");
    const olr = el("ol");
    quiz.forEach(q => olr.append(el("li", null, propre(q.c[0]))));
    rep.append(olr); fiche.append(rep);
  }
  document.body.append(fiche);

  const actions = document.querySelector("#p-resume .actions");
  if (actions) {
    const b = el("button", "btn vide", "🖨 Imprimer ma fiche de révision"); b.type = "button"; b.id = "imprimer-fiche";
    b.addEventListener("click", () => window.print());
    actions.append(b);
    actions.after(el("p", "note fp-note", "Une page à imprimer, pour réviser sur papier. Aussi : <span class=\"touche\">Ctrl</span> + <span class=\"touche\">P</span>. Pour un PDF : Destination ▸ <strong>Enregistrer au format PDF</strong>."));
  }
})();
