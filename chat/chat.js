/* Chat de la classe : un fil de discussion en direct, comme sous une vidéo — le prénom en couleur, puis le message
   (Vincent, 24/11/2026 : « comme si on était en live, juste les prénoms »). Texte et smileys seulement.
   Le même script sert l'élève (portail) et le professeur (tableau : masquer, couper la parole).
   Le serveur ne pousse rien : la page redemande les nouveaux messages toutes les RYTHME ms, seulement tant que
   l'onglet est visible. Rien de ce qu'un élève tape n'est lu comme du HTML : tout passe par textContent.

     CampinChat.monte(element, { appel, classe, prof, rythme })
       appel(fn, ...args) ▸ Promise : chatLire(depuis, classe), chatEcrire(texte, depuis, classe),
                                      chatMasquer(classe, id, oui), chatParole(classe, adresse, coupee)
       rend { arrete() }
     CampinChat.bulle({ appel, classe }) ▸ { retire(), signale(dernier) }
       Dans une page de cours : un bouton « 💬 Chat » en bas à droite, qui ouvre le fil dans un panneau par-dessus
       la fiche. Le fil ne se relit que panneau ouvert ; fermé, la page qui l'héberge appelle signale(dernier) quand
       elle sait qu'il y a du nouveau, et le bouton porte une pastille.                                              */
(function(racine){
  "use strict";
  const RYTHME = 5000, LONGUEUR = 300, SMILEYS = ["🙂", "😀", "😅", "🤔", "👍", "👏", "🙏", "❤️"];
  /* Une couleur par prénom, toujours la même : on suit qui parle sans lire. Teintes lisibles sur fond clair et sombre. */
  const TEINTES = [200, 28, 150, 280, 340, 95, 230, 50, 175, 310];
  function teinte(nom){ let h = 0; for(const c of String(nom)) h = (h * 31 + c.codePointAt(0)) % 9973; return TEINTES[h % TEINTES.length]; }
  const STYLE = ".chat{display:grid;gap:8px;font:inherit;text-align:left}.chat [hidden],.chat-panneau[hidden]{display:none!important}"
    + ".chat-fil{list-style:none;margin:0;padding:10px 12px;height:17rem;overflow-y:auto;border:1px solid rgba(128,128,128,.45);border-radius:12px;"
    + "font-size:1rem;line-height:1.4;overflow-wrap:anywhere;background:rgba(128,128,128,.1);display:flex;flex-direction:column;gap:4px}"
    + ".chat-fil li{margin:0;padding:2px 6px;border-radius:6px}.chat-fil li:first-child{margin-top:auto}"
    + ".chat-fil time{float:right;opacity:.55;font-size:.75rem;margin-left:.6em}"
    + ".chat-fil b{margin-right:.4em;color:hsl(var(--t,200) 70% 38%)}"
    + "@media (prefers-color-scheme:dark){.chat-fil b{color:hsl(var(--t,200) 80% 72%)}}"
    + ":root[data-theme=dark] .chat-fil b{color:hsl(var(--t,200) 80% 72%)}:root[data-theme=light] .chat-fil b{color:hsl(var(--t,200) 70% 38%)}"
    + ".chat-fil .moi{background:rgba(128,128,128,.16)}.chat-fil .prof{border-left:3px solid currentColor}.chat-fil .prof b{color:inherit}"
    + ".chat-fil .masque .chat-texte{text-decoration:line-through;opacity:.6}"
    + ".chat-fil .info{opacity:.75;font-style:italic;font-size:.85rem;text-align:center}"
    + ".chat-fil button,.chat-muets button{font:inherit;font-size:.8rem;margin-left:.5em;padding:1px 6px;cursor:pointer}"
    + ".chat-saisie{display:flex;gap:6px;flex-wrap:wrap}.chat-saisie input{flex:1 1 12rem;min-width:0;font:inherit;padding:8px 12px;border-radius:20px;border:1px solid rgba(128,128,128,.6)}"
    + ".chat-saisie button{font:inherit;font-weight:700;padding:8px 16px;border-radius:20px;cursor:pointer}"
    + ".chat-smileys{display:flex;gap:4px;flex-wrap:wrap}.chat-smileys button{font:inherit;font-size:1.15rem;padding:2px 6px;background:none;border:1px solid rgba(128,128,128,.4);border-radius:6px;cursor:pointer}"
    + ".chat-note,.chat-etat,.chat-muets{margin:0;font-size:.85rem}.chat-note{opacity:.8}.chat-etat{min-height:1.2em;font-weight:700}"
    + ".chat-bulle{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:12px;z-index:19;font:inherit;font-weight:700;padding:10px 16px;border-radius:24px;"
    + "border:2px solid var(--encre-bouton,#1d5a73);background:var(--carte,#fff);color:var(--encre-bouton,#1d5a73);cursor:pointer;box-shadow:0 4px 14px #0003}"
    + ".chat-bulle.neuf::after{content:'';display:inline-block;width:.6em;height:.6em;border-radius:50%;background:#d6336c;margin-left:.5em;vertical-align:middle}"
    + ".chat-panneau{position:fixed;right:max(12px,env(safe-area-inset-right,0px));bottom:64px;z-index:19;width:min(24rem,calc(100vw - 24px));max-height:calc(100vh - 90px);overflow:auto;"
    + "background:var(--carte,#fff);color:var(--encre,#1f2a33);border:2px solid var(--encre-bouton,#1d5a73);border-radius:14px;padding:12px;box-shadow:0 8px 28px #0004}"
    + ".chat-panneau h2{margin:0 0 8px;font-size:1.05rem}.chat-panneau .chat-fil{height:min(15rem,40vh)}";
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
      : "Ton prénom est affiché à côté de chaque message. Tout ce qui s'écrit ici est enregistré, et ton professeur le lit.");
    boite.classList.add("chat");
    boite.replaceChildren(fil, smileys, saisie, etat, ...(prof ? [muets] : []), note);

    function bouton(texte, quoi, action){
      const b = el("button", null, texte); b.type = "button"; b.setAttribute("aria-label", quoi);
      b.addEventListener("click", () => { b.disabled = true; appel(...action).then(r => recoit(r, true), dit); });
      return b;
    }
    function dessine(m){
      const duProf = m.nom === "Le professeur";
      const li = el("li", (m.moi ? "moi " : "") + (duProf ? "prof " : "") + (m.masque ? "masque" : ""));
      const t = el("time", null, heure(m.t)), qui = el("b", null, m.nom), texte = el("span", "chat-texte", m.texte);
      qui.style.setProperty("--t", teinte(m.nom));
      li.append(t, qui, texte);
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
        // Salon fermé : plus rien à lire, ni ici ni après un rechargement (Vincent, 24/11/2026 : pas de messages
        // d'autres élèves à l'écran une fois le cours fini, à la maison notamment). Le serveur, lui, ne les rend plus.
        if(ouvert !== false){ fil.replaceChildren(); lignes.clear(); dernier = 0; salon = 0; if(prof) muets.replaceChildren();
          if(ouvert) info("Le chat est fermé."); verrou(true, "Le chat est fermé."); }
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
  function bulle(o){
    style();
    const b = el("button", "chat-bulle", "💬 Chat"), p = el("section", "chat-panneau"), zone = el("div");
    let fil = null, lu = 0, vu = 0;
    b.type = "button"; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "Ouvrir le chat de la classe");
    p.hidden = true; p.setAttribute("aria-label", "Le chat de la classe"); p.append(el("h2", null, "Le chat de la classe"), zone);
    const ferme = () => { p.hidden = true; b.setAttribute("aria-expanded", "false"); b.setAttribute("aria-label", "Ouvrir le chat de la classe"); if(fil){ fil.arrete(); fil = null; } lu = vu; };
    const ouvre = () => { p.hidden = false; b.classList.remove("neuf"); b.setAttribute("aria-expanded", "true"); b.setAttribute("aria-label", "Fermer le chat de la classe");
      fil = monte(zone, { appel: o.appel, classe: o.classe, surEtat: oui => { if(!oui && o.surFerme) o.surFerme(); } });
      const champ = zone.querySelector("input"); if(champ) champ.focus(); };
    b.addEventListener("click", () => { if(p.hidden) ouvre(); else ferme(); });
    document.addEventListener("keydown", e => { if(e.key === "Escape" && !p.hidden){ ferme(); b.focus(); } });
    document.body.append(p, b);
    return { retire(){ ferme(); p.remove(); b.remove(); },
      signale(dernier){ vu = Math.max(vu, Number(dernier) || 0); if(p.hidden && vu > lu) b.classList.add("neuf"); if(!p.hidden) lu = vu; } };
  }
  racine.CampinChat = { monte, bulle, RYTHME };
})(typeof window !== "undefined" ? window : globalThis);
