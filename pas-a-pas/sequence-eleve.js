/* Pas à pas — le mode séquence, côté élève. Partagé par toutes les fiches.
   Quand le professeur pilote une séquence depuis le tableau de bord, la fiche ne montre que le
   moment en cours : un seul geste à la fois. Elle le demande au serveur toutes les 5 s
   (moment(cours) dans Code.gs) ; sans séquence lancée, ou au dernier moment (« fin »),
   la fiche redevient la fiche.
   Utilisation, dans la fiche : <script defer src=".../sequence-eleve.js"> dans la page, et en fin
   du script de la fiche  window.PAS_A_PAS = { cours: COURS, envoie };  (envoie = celle de la fiche).
   Chargé en différé, il démarre après la fiche et ne peut jamais l'empêcher de s'afficher.
   Champs facultatifs de PAS_A_PAS (Messagerie 01, 12/11/2026) :
   - plafond(p)    : la classe s'arrête après un bloc (blocs.js, ou la fiche) ;
   - classe        : une classe CSS de plus sur la zone #seq ;
   - contenus:true : lit sequences.json pour ce cours ; un écran ou un tri sans texte reçu du serveur montre
                     alors ses lignes, et la correction d'un vote ajoute l'explication de chaque situation ;
   - ecrans        : { "<titre du moment>": (zone, m, moi, outils) => true } — un écran propre au cours, dessiné à
                     la place de l'écran commun (rendre false pour garder l'écran commun) ;
                     outils = { el, envoie, redessine, support } (support = le moment de sequences.json, ou null) ;
   - horsSequence(): appelé au premier appel au serveur sans moment en cours, puis à chaque sortie de séquence.
   envoie peut rendre une promesse : un envoi refusé s'affiche (« non confirmé ») au lieu d'un faux ✓. */
(function(){
  const RYTHME = 5000;
  const css = `
.en-sequence .page > :not(header):not(#seq):not(#seq-commun):not(.aide-fixe):not(#tresor.pot-classe){display:none!important}
#seq-commun{background:var(--carte);border:1px solid var(--trait);border-radius:14px;padding:18px clamp(16px,4vw,32px);display:grid;gap:12px;margin-top:12px}
#seq-commun .sq-sur{font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;color:var(--doux);font-weight:700;margin:0;text-align:center}
#seq-commun h3{margin:0;font-size:1.2rem}#seq-commun p{margin:0}
#seq-commun .sq-nuage,#seq-commun .sq-jetons{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
#seq-commun .sq-jetons{justify-content:flex-start}
#seq-commun .sq-mot{border:1px solid var(--trait);border-radius:999px;padding:4px 12px;font-weight:700;overflow-wrap:anywhere}
#seq-commun .sq-mot sup{font-weight:400;color:var(--doux);margin-left:3px}
#seq-commun .sq-colonnes{display:grid;grid-template-columns:repeat(auto-fit,minmax(11rem,1fr));gap:10px}
#seq-commun .sq-colonne{border:1px solid var(--trait);border-radius:10px;padding:10px;display:grid;gap:8px;align-content:start}
#seq-commun .sq-vote{display:grid;gap:6px;border-top:1px solid var(--trait);padding-top:10px}
#seq-commun .sq-vb{display:grid;grid-template-columns:minmax(6rem,14rem) 1fr auto;gap:8px;align-items:center}
#seq-commun .sq-vb.bonne{font-weight:700;color:var(--juste)}
#seq-commun .sq-jauge{height:14px;border-radius:7px;background:var(--trait);overflow:hidden}
#seq-commun .sq-jauge i{display:block;height:100%;background:var(--encre-bouton,#1f4e79)}
#seq-commun .sq-vb.bonne .sq-jauge i{background:var(--juste)}
#seq-commun .sq-programme{white-space:pre;overflow-x:auto;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;background:#111827;color:#e5e7eb;border-radius:10px;padding:10px;margin:0}
#seq-commun .sq-paires{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:0}#seq-commun .sq-paires dt{font-weight:700}#seq-commun .sq-paires dd{margin:0}
#seq-commun ul{margin:0;padding-left:1.2em;display:grid;gap:4px}
#seq{background:var(--carte);border:1px solid var(--trait);border-radius:14px;padding:28px clamp(16px,4vw,32px);display:grid;gap:18px;text-align:center}
#seq .sq-sur{font-size:.85rem;letter-spacing:.08em;text-transform:uppercase;color:var(--doux);font-weight:700;margin:0}
#seq .sq-grand{font-family:var(--display);font-weight:800;font-size:clamp(2rem,6vw,2.8rem);line-height:1.1;margin:0}
#seq .sq-oeil{font-size:3.5rem;line-height:1;margin:0}
#seq .sq-note{color:var(--doux);margin:0}
#seq .sq-champs{display:grid;gap:10px;max-width:24rem;width:100%;margin:0 auto}
#seq input{font:inherit;font-size:1.3rem;padding:10px 14px;border-radius:10px;border:2px solid var(--trait);background:var(--carte);color:var(--encre);text-align:center}
#seq .sq-btn{font:inherit;font-weight:700;padding:10px 20px;border-radius:10px;cursor:pointer;border:2px solid var(--encre-bouton);background:var(--encre-bouton);color:var(--carte);justify-self:center}
#seq .sq-btn.vide{background:transparent;color:var(--encre-bouton)}
#seq .sq-btn:disabled{opacity:.5;cursor:default}
#seq .sq-sit{display:grid;gap:10px;text-align:left;border-top:1px solid var(--trait);padding-top:14px}
#seq .sq-sit p{margin:0;font-weight:700}
#seq .sq-programme{white-space:pre;text-align:left;font-family:"SFMono-Regular",Consolas,"Liberation Mono",monospace;font-size:clamp(1rem,3vw,1.4rem);line-height:1.55;background:#111827;color:#e5e7eb;border:1px solid #475569;border-radius:10px;padding:14px;margin:0;max-width:100%;min-width:0;overflow-x:auto;tab-size:4}
#seq .sq-programme code{font:inherit;color:inherit;white-space:inherit}
#seq .sq-choix{display:flex;flex-wrap:wrap;gap:10px}
#seq .sq-choix button{flex:1;min-width:8rem}
#seq .sq-choix button.pris{background:var(--fromage-pale,#ffd990);border-color:var(--fromage,#b7791f);color:var(--encre,#172b42);box-shadow:0 0 0 3px var(--fromage,#b7791f);transform:scale(1.03)}#seq .sq-choix button.pris::before{content:"✓ "}#seq .sq-case:has(input:checked){background:#ffe9a8;outline:3px solid #b7791f;border-radius:10px;padding:6px 10px}
#seq .sq-res{font-weight:700;margin:0}
#seq .sq-res.juste{color:var(--juste)} #seq .sq-res.faux{color:var(--faux)}
#seq .sq-copie{display:grid;gap:8px;text-align:left;border-top:1px solid var(--trait);padding-top:14px;font-size:1.1rem}
#seq .sq-copie h3{margin:0;font-size:1.3rem}#seq .sq-copie p{margin:0}
#seq .sq-sous{font-weight:700;color:var(--doux)}#seq .sq-questions{margin:0;padding-left:1.2em;display:grid;gap:4px}
#seq .sq-situation{margin:0;font-size:1.15rem;white-space:pre-line;text-align:left}#seq .sq-texte label{text-align:left;font-weight:700;margin-bottom:-6px}#seq .sq-texte input{text-align:left}
#seq .sq-paires{display:grid;grid-template-columns:auto 1fr;gap:4px 12px;margin:0}#seq .sq-paires dt{font-weight:700}#seq .sq-paires dd{margin:0}`;

  const el = (tag, cls, t) => { const n = document.createElement(tag); if(cls) n.className = cls; if(t != null) n.textContent = t; return n; };

  let deja = false;
  function suivre(o){
    if(deja) return;   // la fiche peut l'appeler elle-même, et ce fichier aussi en se chargeant
    if(typeof google === "undefined" || !google.script || !google.script.run) return;
    deja = true;
    const style = el("style"); style.textContent = css; document.head.append(style);
    const zone = el("section"); zone.id = "seq"; if(o.classe) zone.classList.add(o.classe); zone.hidden = true; zone.setAttribute("aria-live", "polite");
    const page = document.querySelector(".page"), tete = page.querySelector("header");
    tete ? tete.after(zone) : page.prepend(zone);
    // La mise en commun partagée par le professeur (« Aussi sur les postes ») : une boîte à part, sous le moment,
    // pour ne jamais toucher à ce que l'élève est en train de taper.
    const boite = el("section"); boite.id = "seq-commun"; boite.hidden = true; boite.setAttribute("aria-live", "polite");
    zone.after(boite);
    let sigCommun = "";

    let cle = "", courant = null, hors = null, contenus = null;
    const mes = {};   // ce que l'élève a envoyé, par moment de cette séquence
    const envoie = evt => Promise.resolve(o.envoie(evt));
    const support = m => (contenus && contenus.moments || []).find(x => x.titre === m.titre) || null;
    const redessine = () => dessine(courant);
    // Le « visuel » d'un moment (window.Visuels, chargé par la page) : remplace ses lignes et sa correction, qui en
    // sont la version texte. null si le cours n'en déclare pas ou si le script n'est pas chargé.
    const visuel = (m, s) => { const v = m.visuel || (s && s.visuel); return v && window.Visuels && Visuels[v] ? Visuels[v]({ corrige: m.phase === "corrige" }) : null; };
    if(o.contenus) fetch("https://root75.github.io/campin-public/pas-a-pas/sequences.json?v=sms-20261117")
      .then(r => { if(!r.ok) throw Error(); return r.json(); })
      .then(d => { contenus = d[o.cours] || null; cle = ""; }).catch(() => {});   // cle vide : redessiner au prochain appel

    function recoit(m){
      courant = m;
      if(window.Recompense) Recompense.montre(m);   // « Je m'occupe » ouvert : bandeau en bas (recompense.js)
      if(o.rappelDeSeance && m && m.tresorSeance) o.rappelDeSeance(m.tresorSeance);
      if(o.plafond) o.plafond(m && m.plafond);   // la classe s'arrête après un bloc
      if(!m || m.type === "fin" || m.type === "atelier"){
        if(hors !== true && o.horsSequence) o.horsSequence();
        hors = true;
        commun(null);
        if(cle){ cle = ""; zone.hidden = true; document.body.classList.remove("en-sequence"); scrollTo(0, 0); }
        return;
      }
      hors = false;
      commun(m);
      const k = m.lance + ":" + m.n + ":" + m.phase;
      if(k === cle) return;            // rien n'a changé : on ne touche pas à ce qu'il tape
      cle = k; zone.hidden = false; document.body.classList.add("en-sequence");
      dessine(m);
    }

    /* Ce que le professeur projette et partage. Rien tant que l'élève n'a pas envoyé sa propre réponse (sinon il
       recopie celle des autres) ; l'écran d'un cours qui affiche déjà son texte sur le poste n'est pas répété. */
    function commun(m){
      const c = m && m.commun, moi = (m && mes[m.lance + ":" + m.n]) || {};
      const ferme = m && (m.phase === "clos" || m.phase === "corrige");
      const attend = m && m.type === "mots" && !ferme && (!(moi.mots || moi.reponse) || moi.modifier);
      const blocs = [];
      if(c && !attend){
        const mot = x => { const s = el("span", "sq-mot", x.texte); if(x.n > 1) s.append(el("sup", null, "×" + x.n)); return s; };
        const e = c.ecran;
        if(e && !support(m) && !m.lignes && !m.questions){
          (e.lignes || []).forEach((l, k) => blocs.push(el(k ? "p" : "h3", null, l)));
          if(e.paires && e.paires.length){ const g = el("dl", "sq-paires"); e.paires.forEach(([a, b]) => g.append(el("dt", null, a), el("dd", null, b))); blocs.push(g); }
          if(e.exemple) blocs.push(el("p", "sq-note", e.exemple));
          if(e.questions && e.questions.length){ const q = el("ul"); e.questions.forEach(t => q.append(el("li", null, t))); blocs.push(q); }
        }
        if(c.mots){ const n = el("div", "sq-nuage"); c.mots.forEach(x => n.append(mot(x))); blocs.push(c.mots.length ? n : el("p", "sq-note", "Pas encore de mot.")); }
        if(c.tri){
          if(c.tri.reserve.length){ const r = el("div", "sq-nuage"); c.tri.reserve.forEach(x => r.append(mot(x))); blocs.push(el("p", "sq-note", "À ranger :"), r); }
          const cols = el("div", "sq-colonnes");
          c.tri.colonnes.forEach(k => { const d = el("div", "sq-colonne"), j = el("div", "sq-jetons"); k.mots.forEach(x => j.append(mot(x))); d.append(el("h3", null, k.titre), j); cols.append(d); });
          blocs.push(cols);
        }
        if(c.votes && m.situations && m.choix) m.situations.forEach((s, k) => {
          const d = el("div", "sq-vote"), l = c.votes[k] || [], tot = m.choix.reduce((a, _, j) => a + (l[j] || 0), 0);
          if(o.cours.startsWith("python-")){ const pre = el("pre", "sq-programme"); pre.append(el("code", null, s)); d.append(el("p", null, "Programme " + (k+1)), pre); }
          else d.append(el("p", null, (k+1) + ". " + s));
          m.choix.forEach((t, j) => {
            const v = l[j] || 0, ligne = el("div", "sq-vb" + (m.bonnes && m.bonnes[k] === j ? " bonne" : "")), jauge = el("div", "sq-jauge"), i = el("i");
            i.style.width = (tot ? v / tot * 100 : 0) + "%"; jauge.append(i);
            ligne.append(el("span", null, (m.bonnes && m.bonnes[k] === j ? "✓ " : "") + t), jauge, el("span", null, v + (tot ? " · " + Math.round(v / tot * 100) + " %" : "")));
            d.append(ligne);
          });
          blocs.push(d);
        });
      }
      // Même contenu qu'au dernier appel : on ne redessine pas (toutes les 5 s, l'écran ne doit pas sauter).
      const sig = blocs.length ? JSON.stringify(c) + "|" + (m.bonnes ? m.bonnes.join() : "") : "";
      if(sig === sigCommun) return;
      sigCommun = sig;
      boite.hidden = !blocs.length;
      boite.replaceChildren(...(blocs.length ? [el("p", "sq-sur", "Au tableau en ce moment"), ...blocs] : []));
    }

    function dessine(m){
      if(!m || m.type === "fin" || m.type === "atelier") return;
      const id = m.lance + ":" + m.n, moi = mes[id] || (mes[id] = {});
      zone.replaceChildren(el("p", "sq-sur", m.titre));
      const propre = o.ecrans && o.ecrans[m.titre];
      if(propre && propre(zone, m, moi, { el, envoie, redessine, support: support(m) })) return;
      // saisie lue aussi dans sequences.json (contenus:true) : un Code.gs pas encore redéployé ne l'envoie pas,
      // et l'élève recevait « Tape 1 à 3 mots » sans la situation.
      if(m.type === "mots" && (m.saisie || (support(m) || {}).saisie) === "texte") return texte(m, moi);
      if(m.type === "mots") return mots(m, moi);
      if(m.type === "vote") return vote(m, moi);
      const s = support(m);
      const vis = visuel(m, s);
      if(vis){ zone.append(el("h2", "sq-grand", (s && s.question) || m.question || m.titre), el("p", "sq-note", "ENSEMBLE — OBSERVE ET RÉPONDS AU PROFESSEUR"), vis); return; }
      if(s && !m.lignes && !m.questions){   // contenus:true : le texte de l'écran, lu dans sequences.json
        zone.append(el("h2", "sq-grand", m.titre), el("p", "sq-note", "ENSEMBLE — OBSERVE ET RÉPONDS AU PROFESSEUR"));
        (s.lignes || []).forEach(l => zone.append(el("p", null, l)));
        (s.paires || []).forEach(p => zone.append(el("p", null, Array.isArray(p) ? p.join(" — ") : JSON.stringify(p))));
        if(s.exemple) zone.append(el("p", null, s.exemple));
        if(m.type === "tri") zone.append(el("p", null, "Classement collectif : " + (s.colonnes || []).map(x => typeof x === "string" ? x : x.titre || x.nom || "").join(" / ")),
          el("p", "sq-note", "Propose oralement où placer les mots et explique pourquoi. Le déplacement des mots est visible au tableau."));
        return;
      }
      zone.append(el("p", "sq-oeil", "👀"), el("h2", "sq-grand", "Regarde le tableau"),
        el("p", "sq-note", m.type === "tri" ? "On range vos mots ensemble. Prépare-toi à dire pourquoi." : "Rien à taper pour le moment."));
      // Écran collectif recopié sur le poste (cours avec « ecransSurPostes ») : à relire de près.
      if(m.lignes || m.questions){
        const copie = el("div", "sq-copie");
        (m.lignes || []).forEach((l, k) => copie.append(el(k ? "p" : "h3", null, l)));
        if(m.paires){ const g = el("dl", "sq-paires"); m.paires.forEach(([a, b]) => g.append(el("dt", null, a), el("dd", null, b))); copie.append(g); }
        if(m.exemple) copie.append(el("p", "sq-note", m.exemple));
        if(m.questions && m.questions.length){ const q = el("ul", "sq-questions"); m.questions.forEach(t => q.append(el("li", null, t))); copie.append(el("p", "sq-sous", "On en parle ensemble :"), q); }
        zone.append(copie);
      }
    }

    function mots(m, moi){
      zone.append(el("h2", "sq-grand", m.question));
      if(moi.mots && !moi.modifier){
        zone.append(el("p", "sq-res juste", "✓ Envoyé : " + moi.mots.join(" · ")), el("p", "sq-note", "Regarde le tableau."));
        const b = el("button", "sq-btn vide", "Modifier mes mots"); b.type = "button";
        b.addEventListener("click", () => { moi.modifier = true; redessine(); });
        return zone.append(b);
      }
      const f = el("form", "sq-champs");
      zone.append(el("p", "sq-note", "Tape 1 à " + m.max + " mots. Un mot par case."), f);
      const champs = [];
      for(let i = 0; i < m.max; i++){
        const c = el("input"); c.maxLength = 30; c.autocomplete = "off"; c.placeholder = "Mot " + (i+1);
        c.setAttribute("aria-label", "Mot " + (i+1)); c.value = (moi.mots && moi.mots[i]) || "";
        champs.push(c); f.append(c);
      }
      const b = el("button", "sq-btn", "Envoyer mes mots"); f.append(b);
      f.addEventListener("submit", e => {
        e.preventDefault();
        const l = champs.map(c => c.value.replace(/\|/g, " ").replace(/\s+/g, " ").trim()).filter(Boolean);
        if(!l.length){ champs[0].focus(); return; }
        moi.mots = l; moi.modifier = false; b.disabled = true;
        envoie({ etape: m.n, type: "motcle", reponse: l.join(" | ") }).then(redessine)
          .catch(() => { delete moi.mots; moi.modifier = true; b.disabled = false; b.textContent = "Envoi non confirmé — réessayer"; });
      });
      champs[0].focus();
    }

    /* Réponse écrite (saisie: 'texte') : une case par champ (À, Cc, Objet…), majuscules gardées. Avec plusieurs
       cases, chacune part au tableau précédée de son nom (« À : … ») : un champ inversé s'y voit aussi. */
    function texte(m, moi){
      const s = support(m) || {}, champs = m.champs || s.champs || ["Ta réponse"], vis = visuel(m, s);
      zone.append(el("h2", "sq-grand", m.question));
      if(vis) zone.append(vis); else (m.lignes || s.lignes || []).forEach(l => zone.append(el("p", "sq-situation", l)));
      const envoyee = () => { const d = el("div", "sq-copie"); (moi.reponse || []).forEach(l => d.append(el("p", "sq-res", l))); return d; };
      if(m.phase === "corrige"){
        zone.append(el("p", "sq-note", "ENSEMBLE — compare ta réponse à la correction."));
        if(!vis){ const c = el("div", "sq-copie"); (m.correction || s.correction || []).forEach(l => c.append(el("p", null, l))); zone.append(c); }
        if(moi.reponse) zone.append(el("p", "sq-sous", "Ta réponse :"), envoyee());
        return;
      }
      if(m.phase === "clos"){
        zone.append(el("p", "sq-note", "RÉPONSES FERMÉES — juste ou faux ? Prépare ton explication."));
        if(moi.reponse) zone.append(el("p", "sq-sous", "Ta réponse :"), envoyee());
        return;
      }
      if(moi.reponse && !moi.modifier){
        zone.append(el("p", "sq-res juste", "✓ Envoyé"), envoyee(), el("p", "sq-note", "Regarde le tableau."));
        const b = el("button", "sq-btn vide", "Modifier ma réponse"); b.type = "button";
        b.addEventListener("click", () => { moi.modifier = true; redessine(); });
        return zone.append(b);
      }
      zone.append(el("p", "sq-note", "À TOI D’ÉCRIRE — chacun seul. On compare ensuite au tableau."));
      const f = el("form", "sq-champs sq-texte"), cases = [];
      moi.brouillon = moi.brouillon || [];
      champs.forEach((nom, k) => {
        const label = el("label", null, nom), c = el("input");
        c.type = "text"; c.maxLength = 60; c.autocomplete = "off"; c.spellcheck = false; c.id = "sq-champ-" + k; label.htmlFor = c.id;
        c.value = moi.brouillon[k] ?? ((moi.reponse && moi.valeurs) ? moi.valeurs[k] : "") ?? "";
        c.addEventListener("input", () => { moi.brouillon[k] = c.value; });
        cases.push(c); f.append(label, c);
      });
      const b = el("button", "sq-btn", moi.reponse ? "Modifier ma réponse" : "Envoyer ma réponse"), statut = el("p", "sq-note", "");
      statut.setAttribute("role", "status"); f.append(b, statut); zone.append(f);
      f.addEventListener("submit", e => {
        e.preventDefault(); if(b.disabled) return;
        const v = cases.map(c => c.value.replace(/\|/g, " ").replace(/\s+/g, " ").trim());
        const vide = v.findIndex(x => !x);
        if(vide >= 0){ statut.textContent = "Remplis aussi la case « " + champs[vide] + " »."; cases[vide].focus(); return; }
        const lignes = champs.length > 1 ? v.map((x, k) => champs[k] + " : " + x) : v;
        b.disabled = true; statut.textContent = "Envoi…";
        envoie({ etape: m.n, type: "motcle", reponse: lignes.join(" | ") })
          .then(() => { moi.reponse = lignes; moi.valeurs = v; moi.brouillon = []; moi.modifier = false; redessine(); })
          .catch(() => { b.disabled = false; statut.textContent = "Envoi non confirmé — garde ta réponse et réessaie."; });
      });
      cases[0].focus();
    }

    function vote(m, moi){
      zone.append(el("h2", "sq-grand", m.question));
      const ouvert = m.phase === "ouvert";
      zone.append(el("p", "sq-note", ouvert ? "Un clic par situation. Tu peux changer d'avis tant que le vote est ouvert."
        : m.phase === "clos" ? "Le vote est clos. Regarde le tableau." : m.bonnes && m.bonnes.every(b => b == null) ? "Regarde le tableau : on en parle ensemble." : "Regarde le tableau : on corrige ensemble."));
      if(moi.enCours || moi.erreur) zone.append(el("p", "sq-note", moi.enCours ? "Enregistrement du choix…" : moi.erreur));
      const sup = support(m);
      m.situations.forEach((s, k) => {
        const d = el("div", "sq-sit"), c = el("div", "sq-choix");
        if(o.cours.startsWith("python-")){
          const pre = el("pre", "sq-programme"); pre.append(el("code", null, s));
          d.append(el("p", null, "Programme " + (k+1)), pre, c);
        } else d.append(el("p", null, (k+1) + ". " + s), c);
        m.choix.forEach((t, j) => {
          const b = el("button", "sq-btn vide" + (moi[k] === j ? " pris" : ""), t); b.type = "button"; b.disabled = !ouvert || !!moi.enCours;
          b.addEventListener("click", () => {   // un seul envoi à la fois ; le ✓ attend la réponse du serveur
            if(moi.enCours || moi[k] === j) return;
            moi.enCours = true; redessine();
            envoie({ etape: m.n, type: "vote", reponse: k + ":" + j })
              .then(() => { moi[k] = j; moi.erreur = ""; }, () => { moi.erreur = "Choix non confirmé. Réessaie avant de continuer."; })
              .then(() => { moi.enCours = false; redessine(); });
          });
          c.append(b);
        });
        if(m.bonnes){
          const bon = m.bonnes[k];
          // Vote d'avis (sequences.json : une situation sans « bonne ») : rien n'est juste ni faux, on rappelle le choix.
          if(bon == null){ if(moi[k] != null) d.append(el("p", "sq-res", "Ton choix : " + m.choix[moi[k]])); }
          else d.append(moi[k] == null ? el("p", "sq-res", "Bonne réponse : " + m.choix[bon])
            : moi[k] === bon ? el("p", "sq-res juste", "✓ Juste : " + m.choix[bon])
            : el("p", "sq-res faux", "✗ La bonne réponse : " + m.choix[bon]));
          const ex = sup && sup.situations && sup.situations[k] && sup.situations[k].explication;
          if(ex) d.append(el("p", "sq-note", ex));
        }
        zone.append(d);
      });
    }

    const demande = () => google.script.run.withSuccessHandler(recoit).withFailureHandler(() => {}).moment(o.cours);
    demande(); setInterval(demande, RYTHME);
  }

  window.PasAPasSequence = { suivre };
  if(window.PAS_A_PAS) suivre(window.PAS_A_PAS);
})();
