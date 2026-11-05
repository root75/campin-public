/* Pas à pas — le mode séquence, côté élève. Partagé par toutes les fiches.
   Quand le professeur pilote une séquence depuis le tableau de bord, la fiche ne montre que le
   moment en cours : un seul geste à la fois. Elle le demande au serveur toutes les 5 s
   (moment(cours) dans Code.gs) ; sans séquence lancée, ou au dernier moment (« fin »),
   la fiche redevient la fiche.
   Utilisation, dans la fiche : <script defer src=".../sequence-eleve.js"> dans la page, et en fin
   du script de la fiche  window.PAS_A_PAS = { cours: COURS, envoie };  (envoie = celle de la fiche).
   Chargé en différé, il démarre après la fiche et ne peut jamais l'empêcher de s'afficher. */
(function(){
  const RYTHME = 5000;
  const css = `
#seq .sq-case{display:flex;gap:12px;align-items:center;cursor:pointer;text-align:left}#seq .sq-case input{width:22px;height:22px;flex-shrink:0;accent-color:#006f98}#seq .sq-case code{overflow-wrap:anywhere;font-size:1.1rem}#seq .sq-adresses{display:grid;gap:12px}
.en-sequence .page > :not(header):not(#seq):not(.aide-fixe){display:none!important}
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
#seq .sq-res.juste{color:var(--juste)} #seq .sq-res.faux{color:var(--faux)}`;

  const el = (tag, cls, t) => { const n = document.createElement(tag); if(cls) n.className = cls; if(t != null) n.textContent = t; return n; };

  let deja=false;
  function suivre(o){
    if(deja)return;deja=true;
    if(typeof google === "undefined" || !google.script || !google.script.run) return;
    const style = el("style"); style.textContent = css; document.head.append(style);
    const zone = el("section"); zone.id = "seq"; if(o.cours === "messagerie-1") zone.classList.add("messagerie-scene"); zone.hidden = true; zone.setAttribute("aria-live", "polite");
    const page = document.querySelector(".page"), tete = page.querySelector("header");
    tete ? tete.after(zone) : page.prepend(zone);

    let cle = "", courant = null;
    let contenus=null;
    fetch("https://root75.github.io/campin-public/pas-a-pas/sequences.json?v=domaine-20261103").then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{contenus=data[o.cours];cle="";}).catch(()=>{});
    const mes = {};   // ce que l'élève a envoyé, par moment de cette séquence

    function recoit(m){
      courant=m;
      if(!m || m.type === "fin" || m.type === "atelier"){
        document.getElementById('collectif').hidden=true;document.getElementById('individuel').hidden=false;document.getElementById('revoir-collectif').hidden=false;
        if(cle){ cle = ""; zone.hidden = true; document.body.classList.remove("en-sequence"); scrollTo(0, 0); }
        return;
      }
      const k = m.lance + ":" + m.n + ":" + m.phase;
      if(k === cle) return;            // rien n'a changé : on ne touche pas à ce qu'il tape
      cle = k; zone.hidden = false; document.body.classList.add("en-sequence");
      dessine(courant || m);
    }

    function dessine(m){
      if(!m||m.type==="fin"||m.type==="atelier")return;
      const id = m.lance + ":" + m.n, moi = mes[id] || (mes[id] = {});
      zone.replaceChildren(el("p", "sq-sur", m.titre));
      if(m.type === "mots") return mots(m, moi);
      if(m.type === "vote") return vote(m, moi);
      const support=contenus?.moments?.find(x=>x.titre===m.titre);
      if(support && o.cours === 'messagerie-1' && m.titre === 'Avant d’écrire : observe le mail' && window.MessagerieVisuels){
        zone.append(el('h2','sq-grand','Comment est construit cet email ?'),el('p','sq-note','ENSEMBLE — explore les parties, puis réponds au professeur.'),MessagerieVisuels.email());return;
      }
      if(support){zone.append(el("h2","sq-grand",m.titre),el("p","sq-note","ENSEMBLE — OBSERVE ET RÉPONDS AU PROFESSEUR"));
      for(const ligne of support.lignes||[])zone.append(el("p",null,ligne));
      for(const paire of support.paires||[])zone.append(el("p",null,Array.isArray(paire)?paire.join(" — "):JSON.stringify(paire)));
      if(support.exemple)zone.append(el("p",null,support.exemple));
      if(m.type==="tri"){zone.append(el("p",null,"Classement collectif : "+(support.colonnes||[]).map(x=>typeof x==='string'?x:x.titre||x.nom||'').join(" / ")),el("p","sq-note","Propose oralement où placer les mots et explique pourquoi. Le déplacement des mots est visible au tableau."));}
      return;}
      zone.append(el("p", "sq-oeil", "👀"), el("h2", "sq-grand", "Regarde le tableau"),
        el("p", "sq-note", m.type === "tri" ? "On range vos mots ensemble. Prépare-toi à dire pourquoi." : "Rien à taper pour le moment."));
    }

    function domaine(m, moi, support){
      const ferme = m.phase === 'clos' || m.phase === 'corrige';
      zone.append(el('h2','sq-grand',m.question),el('p','sq-note',m.phase === 'corrige' ? 'ENSEMBLE — compare ta réponse à la correction et explique.' : ferme ? 'ENSEMBLE — prépare ton explication et attends la correction.' : 'À TOI D’ÉCRIRE — propose ta réponse. Nous vérifierons ensemble.'));
      if(window.MessagerieVisuels)zone.append(MessagerieVisuels.adresse({corrige:m.phase==='corrige'}));
      else for(const ligne of support.lignes || []) zone.append(el('p',null,ligne));
      if(m.phase === 'corrige'){
        if(!window.MessagerieVisuels)for(const ligne of support.correction || []) zone.append(el('p',null,ligne));
        if(moi.reponse){
          const juste = moi.reponse.trim().toLowerCase() === 'arcampin.be';
          zone.append(el('p','sq-res', 'Ta réponse : ' + moi.reponse),el('p',juste?'sq-res juste':'sq-res faux',juste?'Ta réponse correspond au domaine complet.':'À corriger : le domaine complet est arcampin.be. Explique la différence.'));
        }
        return;
      }
      if(ferme){if(moi.reponse)zone.append(el('p','sq-res','Ta réponse envoyée : '+moi.reponse));return;}
      const f=el('form','sq-champs'),label=el('label',null,'Le domaine de mon adresse scolaire'),c=el('input'),b=el('button','sq-btn',moi.reponse?'Modifier ma réponse':'Envoyer ma réponse'),statut=el('p','sq-note',moi.reponse?'Réponse enregistrée. Elle sera vérifiée avec le professeur.':'');
      c.type='text';c.maxLength=30;c.autocomplete='off';c.spellcheck=false;c.id='sq-domaine';label.htmlFor=c.id;c.value=moi.brouillon ?? moi.reponse ?? '';c.addEventListener('input',()=>moi.brouillon=c.value);statut.setAttribute('role','status');b.type='submit';
      f.append(label,c,b,statut);zone.append(f);
      f.addEventListener('submit',async e=>{
        e.preventDefault();if(b.disabled)return;
        const reponse=c.value.trim();if(!reponse){c.focus();return;}
        if(reponse===moi.reponse)return;
        b.disabled=true;c.disabled=true;statut.textContent='Enregistrement…';
        try{await o.envoie({etape:m.n,type:'motcle',reponse});moi.reponse=reponse;dessine(courant || m);}
        catch(_){b.disabled=false;c.disabled=false;statut.textContent='Envoi non confirmé. Garde ta réponse et réessaie.';}
      });
    }

    function mots(m, moi){
      const support=contenus?.moments?.find(x=>x.titre===m.titre);
      if(o.cours==='messagerie-1' && m.titre==='Une adresse en trois parties' && !support){zone.append(el('p','sq-note','Chargement de la question…'));return;}
      if(support?.saisie==='domaine')return domaine(m,moi,support);
      zone.append(el("h2", "sq-grand", m.question));
      if(moi.mots && !moi.modifier){
        zone.append(el("p", "sq-res juste", "✓ Envoyé : " + moi.mots.join(" · ")), el("p", "sq-note", "Regarde le tableau."));
        const b = el("button", "sq-btn vide", "Modifier mes mots"); b.type = "button";
        b.addEventListener("click", () => { moi.modifier = true; dessine(courant || m); });
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
        moi.mots = l; moi.modifier = false;
        b.disabled=true;
        Promise.resolve(o.envoie({ etape: m.n, type: "motcle", reponse: l.join(" | ") })).then(()=>dessine(m)).catch(()=>{delete moi.mots;moi.modifier=true;b.disabled=false;b.textContent="Envoi non confirmé — réessayer";});
      });
      champs[0].focus();
    }

    function adresses(m,moi){
      const ouvert=m.phase==='ouvert';
      zone.append(el('h2','sq-grand',m.question),el('p','sq-note',ouvert?'À TOI DE TE POSITIONNER — coche toutes les adresses à écarter. La correction viendra avec le professeur.':m.phase==='clos'?'CHOIX FERMÉS — prépare ton explication orale.':'ENSEMBLE — lis la correction et explique le problème.'));
      const form=el('form','sq-adresses'),cases=[];zone.append(form);
      m.situations.forEach((adresse,k)=>{
        const ligne=el('div','sq-sit'),label=el('label','sq-case'),c=el('input');c.type='checkbox';c.checked=moi[k]===1;c.disabled=!ouvert||!!moi.soumis;c.setAttribute('aria-label','Écarter '+adresse);
        label.append(c,el('code',null,adresse));ligne.append(label);cases.push(c);
        if(m.bonnes){
          ligne.append(el('p','sq-res',m.bonnes[k]===1?'À écarter':'À utiliser'));
          const explication=contenus?.moments?.find(x=>x.titre===m.titre)?.situations?.[k]?.explication;
          if(explication)ligne.append(el('p','sq-note',explication));
          if(moi.soumis)ligne.append(el('p','sq-note',moi[k]===m.bonnes[k]?'Ton choix correspond à la correction.':'Ton choix était différent : explique ce que tu corriges.'));
        }
        form.append(ligne);
      });
      const statut=el('p','sq-note',m.phase==='corrige'?'Correction collective affichée : prépare ton explication.':moi.soumis?'Choix enregistrés. Attends le signal du professeur.':'');statut.setAttribute('role','status');form.append(statut);
      if(!ouvert)return;
      const b=el('button','sq-btn',moi.soumis?'Modifier mes choix':'Envoyer mes choix');b.type='submit';form.append(b);
      form.addEventListener('submit',async e=>{
        e.preventDefault();if(b.disabled)return;
        if(moi.soumis){moi.soumis=false;dessine(courant || m);return;}
        b.disabled=true;cases.forEach(c=>c.disabled=true);statut.textContent='Enregistrement…';
        const choix=cases.map(c=>c.checked?1:0);
        if(moi.derniersChoix===choix.join(':')){moi.soumis=true;dessine(courant || m);return;}
        try{await Promise.all(choix.map((j,k)=>o.envoie({etape:m.n,type:'vote',reponse:k+':'+j})));choix.forEach((j,k)=>moi[k]=j);moi.derniersChoix=choix.join(':');moi.soumis=true;dessine(courant || m);}
        catch(_){b.disabled=false;cases.forEach(c=>c.disabled=false);statut.textContent='Envoi non confirmé. Garde tes choix et réessaie.';}
      });
    }

    function vote(m, moi){
      if(o.cours==='messagerie-1'&&m.titre==='Quelle adresse pose problème ?')return adresses(m,moi);
      zone.append(el("h2", "sq-grand", m.question));
      const ouvert = m.phase === "ouvert";
      zone.append(el("p", "sq-note", ouvert ? "Un clic par situation. Tu peux changer d'avis tant que le vote est ouvert."
        : m.phase === "clos" ? "Le vote est clos. Regarde le tableau." : "Regarde le tableau : on corrige ensemble."));
      if(moi.enCours||moi.erreur)zone.append(el("p","sq-note",moi.enCours?"Enregistrement du choix…":moi.erreur));
      m.situations.forEach((s, k) => {
        const d = el("div", "sq-sit"), c = el("div", "sq-choix");
        if(o.cours.startsWith("python-")){
          const pre = el("pre", "sq-programme"); pre.append(el("code", null, s));
          d.append(el("p", null, "Programme " + (k+1)), pre, c);
        } else d.append(el("p", null, (k+1) + ". " + s), c);
        m.choix.forEach((t, j) => {
          const b = el("button", "sq-btn vide" + (moi[k] === j ? " pris" : ""), t); b.type = "button"; b.disabled = !ouvert || !!moi.enCours;
          b.addEventListener("click", async () => {
            if(moi.enCours||moi[k]===j)return;
            moi.enCours=true;dessine(courant || m);
            try{await o.envoie({etape:m.n,type:"vote",reponse:k+":"+j});moi[k]=j;moi.erreur="";}
            catch(_){moi.erreur="Choix non confirmé. Réessaie avant de continuer.";}
            finally{moi.enCours=false;dessine(courant || m);}
          });
          c.append(b);
        });
        if(m.bonnes){
          const bon = m.bonnes[k];
          d.append(moi[k] == null ? el("p", "sq-res", "Bonne réponse : " + m.choix[bon])
            : moi[k] === bon ? el("p", "sq-res juste", "✓ Juste : " + m.choix[bon])
            : el("p", "sq-res faux", "✗ La bonne réponse : " + m.choix[bon]));
        }
        if(m.bonnes){const explication=contenus?.moments?.find(x=>x.titre===m.titre)?.situations?.[k]?.explication;if(explication)d.append(el("p","sq-note",explication));}
        zone.append(d);
      });
    }

    const demande = () => google.script.run.withSuccessHandler(recoit).withFailureHandler(() => {}).moment(o.cours);
    demande(); setInterval(demande, RYTHME);
  }

  window.PasAPasSequence = { suivre };
  if(window.PAS_A_PAS) suivre(window.PAS_A_PAS);
})();


