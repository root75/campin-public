/* Humeur du jour et avis de fin pour les fiches qui n'utilisent pas pas-a-pas/blocs.js
   (Messagerie 01, Mise en forme 03). Mêmes listes que blocs.js, tableau.js et Code.gs.
   La fiche fournit envoie(valeur) → Promise : seule une réponse du serveur confirme l'envoi. */
(function(){
  const HUMEURS = [["😄","Super"],["🙂","Bien"],["😐","Bof"],["🙁","Pas top"],["😣","Pas bien"]];
  const AVIS = [["plu","Ce qui m'a plu"],["progres","Ce qui m'a aidé à progresser"],["gene","Ce qui m'a gêné dans le cours en ligne"]];
  const el = (tag, cls, t) => { const n = document.createElement(tag); if(cls) n.className = cls; if(t != null) n.textContent = t; return n; };

  if(!document.getElementById("ha-style")){
    const s = el("style"); s.id = "ha-style";
    s.textContent = ".ha-humeur{background:#fff;border:2px solid #c5d7e2;border-radius:12px;padding:12px 16px;margin:0 0 16px}"
      + ".ha-humeur.faite{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:8px 16px;border-width:1px}"
      + ".ha-humeur .ha-q{margin:0 0 8px;font-weight:700}.ha-smileys{display:flex;gap:8px;flex-wrap:wrap}"
      + ".ha-smileys button{display:flex;flex-direction:column;align-items:center;gap:2px;min-width:72px;padding:8px 10px;border:2px solid #c5d7e2;border-radius:10px;background:#fff;color:inherit;font:inherit;cursor:pointer}"
      + ".ha-smileys button:hover,.ha-smileys button:focus-visible{border-color:#006f98}.ha-smileys .ha-emoji{font-size:28px;line-height:1}"
      + ".ha-lien{background:none;border:0;padding:0;color:#006f98;text-decoration:underline;font:inherit;cursor:pointer}"
      + ".ha-note{margin:6px 0 0;font-size:14px;color:#53697c}"
      + ".ha-avis{background:#fff;border:2px solid #c5d7e2;border-radius:12px;padding:14px 16px;margin:16px 0}"
      + ".ha-avis h3{margin:0 0 6px}.ha-avis label{display:block;margin:10px 0 0}.ha-avis label span{display:block;font-weight:700}"
      + ".ha-avis textarea{box-sizing:border-box;width:100%;font:inherit;padding:6px 8px;border:1px solid #9fb3c2;border-radius:6px}"
      + ".ha-avis .ha-actions{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:10px}";
    document.head.append(s);
  }

  /* Un clic, puis l'élève commence. Rien n'est compté, rien n'est bloqué. */
  function humeur(zone, opts){
    let valeur = opts.valeur || "";
    function dessine(changer, message){
      zone.replaceChildren(); zone.hidden = false;
      if(valeur && !changer){
        zone.className = "ha-humeur faite";
        zone.append(el("span", null, "Mon humeur du jour : " + valeur));
        const c = el("button", "ha-lien", "changer"); c.type = "button";
        c.addEventListener("click", () => dessine(true));
        zone.append(c); return;
      }
      zone.className = "ha-humeur";
      zone.append(el("p", "ha-q", "Comment je me sens aujourd'hui ?"));
      const l = el("div", "ha-smileys");
      HUMEURS.forEach(([e, t]) => {
        const b = el("button"); b.type = "button"; b.setAttribute("aria-label", t);
        b.append(el("span", "ha-emoji", e), el("span", null, t));
        b.addEventListener("click", async () => {
          l.querySelectorAll("button").forEach(x => x.disabled = true);
          try { await opts.envoie(e + " " + t); valeur = e + " " + t; dessine(false); }
          catch(err){ dessine(true, "Non envoyé : " + (err && err.message || "connexion indisponible") + " Réessaie."); }
        });
        l.append(b);
      });
      zone.append(l, el("p", "ha-note", message || (opts.suivi ? "Un clic, puis je commence. Mon professeur voit l'humeur de la classe." : "Un clic, puis je commence.")));
    }
    dessine(false);
  }

  /* Trois questions ouvertes, à la fin. Une case peut rester vide. */
  function avis(zone, opts){
    const f = el("form", "ha-avis");
    f.append(el("h3", null, "💬 Mon avis sur ce cours"), el("p", "ha-note", "Quelques mots suffisent. Je peux laisser une case vide."));
    const champs = AVIS.map(([k, t]) => {
      const lab = el("label"), ta = el("textarea"); ta.rows = 2; ta.maxLength = 200; ta.value = (opts.valeur || {})[k] || "";
      lab.append(el("span", null, t), ta); f.append(lab); return ta;
    });
    const ok = el("button", opts.classeBouton || "", opts.valeur ? "Modifier mon avis" : "Envoyer mon avis"); ok.type = "submit";
    const merci = el("p", "ha-note", opts.valeur ? "✅ Avis envoyé. Merci !" : "");
    const act = el("div", "ha-actions"); act.append(ok, merci); f.append(act);
    f.addEventListener("submit", async e => {
      e.preventDefault();
      const a = {}; AVIS.forEach(([k], i) => { a[k] = champs[i].value.trim(); });
      if(!Object.values(a).some(Boolean)){ merci.textContent = "J'écris au moins quelques mots dans une des cases."; return; }
      ok.disabled = true; merci.textContent = "Envoi…";
      try {
        await opts.envoie(a);
        ok.textContent = "Modifier mon avis";
        merci.textContent = opts.suivi ? "✅ Avis envoyé à mon professeur. Merci !" : "✅ Merci ! (Rien n'est envoyé : la fiche n'est pas suivie.)";
      } catch(err){ merci.textContent = "Non envoyé : " + (err && err.message || "connexion indisponible") + " Réessaie."; }
      finally { ok.disabled = false; }
    });
    zone.replaceChildren(f); zone.hidden = false;
  }

  window.HumeurAvis = { HUMEURS, AVIS, humeur, avis };
})();
