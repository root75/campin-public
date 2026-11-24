/* Chat de la classe : un fil très simple, façon IRC — l'heure, le nom, le message. Texte et smileys seulement.
   Le même script sert l'élève (portail) et le professeur (tableau : masquer, couper la parole).
   Le serveur ne pousse rien : la page redemande les nouveaux messages toutes les RYTHME ms, seulement tant que
   l'onglet est visible. Rien de ce qu'un élève tape n'est lu comme du HTML : tout passe par textContent.

     CampinChat.monte(element, { appel, classe, prof, rythme })
       appel(fn, ...args) ▸ Promise : chatLire(depuis, classe), chatEcrire(texte, depuis, classe),
                                      chatMasquer(classe, id, oui), chatParole(classe, adresse, coupee)
       rend { arrete() }                                                                                        */
(function(racine){
  "use strict";
  const RYTHME = 5000, LONGUEUR = 300, SMILEYS = ["🙂", "😀", "😅", "🤔", "👍", "👏", "🙏", "❤️"];
  const STYLE = ".chat{display:grid;gap:8px;font:inherit;text-align:left}"
    + ".chat-fil{list-style:none;margin:0;padding:8px 10px;height:16rem;overflow-y:auto;border:1px solid rgba(128,128,128,.45);border-radius:8px;"
    + "font-family:ui-monospace,Consolas,Menlo,monospace;font-size:.95rem;line-height:1.45;overflow-wrap:anywhere;background:rgba(128,128,128,.08)}"
    + ".chat-fil li{margin:0;padding:1px 0}.chat-fil time{opacity:.7;margin-right:.5em}.chat-fil b{margin-right:.4em}"
    + ".chat-fil .moi b{text-decoration:underline}.chat-fil .masque .chat-texte{text-decoration:line-through;opacity:.6}"
    + ".chat-fil .info{opacity:.75;font-style:italic}"
    + ".chat-fil button,.chat-muets button{font:inherit;font-size:.8rem;margin-left:.5em;padding:1px 6px;cursor:pointer}"
    + ".chat-saisie{display:flex;gap:6px;flex-wrap:wrap}.chat-saisie input{flex:1 1 12rem;min-width:0;font:inherit;padding:8px 10px;border-radius:8px;border:1px solid rgba(128,128,128,.6)}"
    + ".chat-saisie button{font:inherit;padding:8px 14px;border-radius:8px;cursor:pointer}"
    + ".chat-smileys{display:flex;gap:4px;flex-wrap:wrap}.chat-smileys button{font:inherit;font-size:1.15rem;padding:2px 6px;background:none;border:1px solid rgba(128,128,128,.4);border-radius:6px;cursor:pointer}"
    + ".chat-note,.chat-etat,.chat-muets{margin:0;font-size:.85rem}.chat-note{opacity:.8}.chat-etat{min-height:1.2em;font-weight:700}";
  function el(tag, classe, texte){ const e = document.createElement(tag); if(classe) e.className = classe; if(texte != null) e.textContent = texte; return e; }
  function heure(t){ const d = new Date(t); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }
  function style(){
    if(document.getElementById("chat-style")) return;
    const s = el("style"); s.id = "chat-style"; s.textContent = STYLE; document.head.append(s);
  }

  function monte(boite, o){
    o = o || {};
    const prof = !!o.prof, classe = o.classe || "", rythme = o.rythme || RYTHME, appel = o.appel;
    let dernier = 0, salon = 0, ouvert = null, enCours = false, arrete = false, minuterie = 0;
    const lignes = new Map();   // id ▸ { li, m }
    style();
    const fil = el("ul", "chat-fil"), etat = el("p", "chat-etat"), muets = el("p", "chat-muets");
    const saisie = el("form", "chat-saisie"), champ = el("input"), envoyer = el("button", null, "Envoyer"), smileys = el("div", "chat-smileys");
    fil.setAttribute("aria-live", "polite"); fil.setAttribute("aria-label", "Messages du chat"); fil.tabIndex = 0;
    etat.setAttribute("role", "status");
    champ.type = "text"; champ.maxLength = LONGUEUR; champ.autocomplete = "off"; champ.placeholder = "Ton message";
    champ.setAttribute("aria-label", "Ton message"); envoyer.type = "submit";
    SMILEYS.forEach(s => { const b = el("button", null, s); b.type = "button"; b.setAttribute("aria-label", "Ajouter " + s);
      b.addEventListener("click", () => { if(champ.disabled) return; champ.value = (champ.value + s).slice(0, LONGUEUR); champ.focus(); }); smileys.append(b); });
    saisie.append(champ, envoyer);
    const note = el("p", "chat-note", prof
      ? "Les élèves voient ton message sous le nom « Le professeur ». Un message masqué reste dans la feuille « Chat »."
      : "Ton nom est affiché à côté de chaque message. Tout ce qui s'écrit ici est enregistré, et ton professeur le lit.");
    boite.classList.add("chat");
    boite.replaceChildren(fil, smileys, saisie, etat, ...(prof ? [muets] : []), note);

    function bouton(texte, quoi, action){
      const b = el("button", null, texte); b.type = "button"; b.setAttribute("aria-label", quoi);
      b.addEventListener("click", () => { b.disabled = true; appel(...action).then(r => recoit(r, true), dit); });
      return b;
    }
    function dessine(m){
      const li = el("li", (m.moi ? "moi " : "") + (m.masque ? "masque" : ""));
      const t = el("time", null, heure(m.t)), texte = el("span", "chat-texte", m.texte);
      li.append(t, el("b", null, m.nom + " :"), texte);
      if(prof){
        li.append(bouton(m.masque ? "Réafficher" : "Masquer", (m.masque ? "Réafficher" : "Masquer") + " le message de " + m.nom, ["chatMasquer", classe, m.id, !m.masque]));
        if(!m.moi && m.email) li.append(bouton("Couper la parole", "Couper la parole à " + m.nom, ["chatParole", classe, m.email, true]));
      }
      return li;
    }
    function info(texte){ fil.append(el("li", "info", texte)); }
    function dit(e){ etat.textContent = (e && e.message ? String(e.message) : String(e || "")).replace(/^(Exception|Error): /, ""); }
    function verrou(oui, pourquoi){
      champ.disabled = envoyer.disabled = oui;
      smileys.hidden = oui;
      champ.placeholder = oui ? pourquoi : "Ton message";
    }
    /* tout = la réponse porte tout le fil (après un masquage) ; sinon seulement ce qui suit « dernier ». */
    function recoit(r, tout){
      if(arrete || !r) return;
      if(!r.ouvert){
        if(ouvert !== false){ if(ouvert) info("Le chat est fermé."); verrou(true, "Le chat est fermé."); }
        ouvert = false; if(o.surEtat) o.surEtat(false); return;
      }
      const bas = fil.scrollHeight - fil.scrollTop - fil.clientHeight < 40;
      if(r.salon !== salon || tout){
        if(r.salon !== salon){ fil.replaceChildren(); info("Le chat de la classe " + (r.classe || "") + " est ouvert."); }
        else lignes.forEach(x => x.li.remove());
        lignes.clear(); if(!tout) dernier = 0; salon = r.salon;
      }
      ouvert = true; if(o.surEtat) o.surEtat(true);
      (r.messages || []).forEach(m => {
        if(lignes.has(m.id)) return;
        const li = dessine(m); lignes.set(m.id, { li, m }); fil.append(li);
        dernier = Math.max(dernier, m.id);
      });
      dernier = Math.max(dernier, Number(r.dernier) || 0);
      // Un message masqué après coup disparaît de l'écran de l'élève.
      if(!prof) (r.masques || []).forEach(id => { const x = lignes.get(id); if(x){ x.li.remove(); lignes.delete(id); } });
      if(prof){
        muets.replaceChildren(...((r.muets || []).length ? ["Parole coupée : "] : []),
          ...(r.muets || []).map(e => { const s = el("span", null, e.split("@")[0]); s.append(bouton("Rendre la parole", "Rendre la parole à " + e, ["chatParole", classe, e, false])); return s; }));
      }
      verrou(!!r.muet, "Ton professeur t'a coupé la parole. Tu peux toujours lire.");
      if(bas) fil.scrollTop = fil.scrollHeight;
    }
    function lis(){
      if(arrete || enCours || document.hidden) return;
      enCours = true;
      appel("chatLire", dernier, classe).then(r => { enCours = false; recoit(r); }, () => { enCours = false; });
    }
    saisie.addEventListener("submit", e => {
      e.preventDefault();
      const texte = champ.value.trim();
      if(!texte || champ.disabled) return;
      envoyer.disabled = true; etat.textContent = "";
      appel("chatEcrire", texte, dernier, classe).then(r => { champ.value = ""; envoyer.disabled = false; recoit(r); fil.scrollTop = fil.scrollHeight; champ.focus(); },
        err => { envoyer.disabled = champ.disabled; dit(err); });
    });
    const visible = () => { if(!document.hidden) lis(); };
    document.addEventListener("visibilitychange", visible);
    minuterie = setInterval(lis, rythme);
    lis();
    return { arrete(){ arrete = true; clearInterval(minuterie); document.removeEventListener("visibilitychange", visible); } };
  }
  racine.CampinChat = { monte, RYTHME };
})(typeof window !== "undefined" ? window : globalThis);
