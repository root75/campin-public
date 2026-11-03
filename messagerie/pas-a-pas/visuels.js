/* Supports communs aux écrans élèves et au tableau. Exemples fictifs. */
(() => {
  const style = document.createElement('style');
  style.textContent = `
.messagerie-scene{justify-items:stretch!important;text-align:left!important;gap:22px!important}
.messagerie-scene>.grand,.messagerie-scene .sq-grand{font-size:clamp(1.7rem,3.5vw,3rem)!important;text-align:left;max-width:100%;text-wrap:balance}
.messagerie-scene>p,.messagerie-scene>.sur{text-align:left!important;margin:0;line-height:1.45}
.messagerie-scene>.moyen{font-size:clamp(1.1rem,2vw,1.65rem)}
.mv{width:100%;box-sizing:border-box;text-align:left;color:#182d42;font:500 clamp(1rem,1.7vw,1.3rem)/1.45 system-ui,sans-serif}
.mv *{box-sizing:border-box}.mv p{margin:0}.mv h3{margin:0;font-size:1.15em}.mv small{font-size:.82em}
.mv-adresse{border:1px solid #c9d7e5;border-radius:18px;background:#fff;padding:clamp(16px,3vw,30px);display:grid;gap:22px;margin:0}
.mv-kicker{font-size:.75em;letter-spacing:.1em;text-transform:uppercase;font-weight:800;color:#526779}
.mv-decoupe{display:grid;grid-template-columns:minmax(0,1.4fr) minmax(65px,.35fr) minmax(0,1fr);gap:10px;align-items:stretch}
.mv-piece{display:grid;gap:14px;border:1px solid;border-radius:12px;padding:18px 12px;min-width:0}
.mv-piece code{font:750 clamp(1.1rem,2.8vw,2.35rem)/1.25 ui-monospace,SFMono-Regular,Consolas,monospace;overflow-wrap:anywhere}
.mv-piece strong{font-size:.85em}.mv-local{background:#e9f0ff;border-color:#a7bdeb;color:#153d7c}.mv-at{background:#fff0db;border-color:#dbb97b;color:#754305;text-align:center}.mv-domain{background:#e3f5ef;border-color:#8bc4b4;color:#145b4a}
.mv-guide{display:grid;grid-template-columns:1fr 1fr;gap:16px}.mv-guide p{border-left:4px solid #a8bddd;padding:0 0 0 14px}
.mv-tld{display:grid;grid-template-columns:1fr 1fr;gap:12px;background:#f2f6fa;border-radius:12px;padding:18px}.mv-tld p{font-size:.9em}.mv-tld strong{display:block;font-size:1.2em}.mv-tld mark{background:#ffd990;color:#583600;padding:1px 5px;border-radius:4px}
.mv-mail-layout{display:grid;grid-template-columns:minmax(0,1.65fr) minmax(200px,1fr);gap:24px;align-items:start}
.mv-window{border:1px solid #b9cadb;border-radius:14px;overflow:hidden;background:#fff;box-shadow:0 10px 28px #1c3a5910}
.mv-toolbar{background:#086b91;color:#fff;padding:12px 18px;font-weight:750;display:flex;justify-content:space-between;gap:12px;font-size:.85em}
.mv-toolbar small{opacity:.9}.mv-fields{padding:12px 16px;display:grid;gap:9px}
.mv .mv-part{display:block;width:100%;border:1px solid #c8d6e4;border-left:5px solid var(--part);border-radius:8px;background:#f8fafc;color:#182d42;padding:12px 14px;font:inherit;text-align:left;cursor:pointer;line-height:1.5;box-shadow:none}
.mv .mv-part:hover,.mv .mv-part[aria-pressed=true]{background:var(--tint);border-color:var(--part)}
.mv .mv-part:focus-visible{outline:3px solid #172d42;outline-offset:3px}
.mv-part b{font-size:.78em;text-transform:uppercase;letter-spacing:.05em;color:#526779;display:block;margin-bottom:3px}
.mv-body{padding:4px 16px 18px;display:grid;gap:10px}.mv-brace{padding:10px 16px;color:#526779;font-size:.78em;text-transform:uppercase;letter-spacing:.06em;border-top:1px solid #d6e1ec}
.mv-legend{display:grid;gap:14px}.mv-notice{background:#edf4fb;border:1px solid #c8d6e4;padding:20px;border-radius:12px;min-height:140px}.mv-notice h3{margin-bottom:8px}.mv-notice[role=status]{font-size:1em}
.mv-prompt{border-left:4px solid #116b91;padding-left:14px}.mv-real{border:1px solid #c8d6e4;border-radius:10px;padding:12px 16px;background:#fff}.mv-real summary{cursor:pointer;font-weight:700}.mv-real img{display:block;width:100%;height:auto;margin-top:14px;border:1px solid #d2dce6}.mv-real p{font-size:.8em;margin-top:10px;color:#526779}
@media(max-width:650px){.mv-mail-layout,.mv-guide,.mv-tld{grid-template-columns:1fr}.mv-decoupe{grid-template-columns:minmax(0,1fr) 48px minmax(0,1fr);gap:5px}.mv-piece{padding:12px 6px}.mv-piece code{font-size:clamp(.8rem,3.2vw,1.15rem)}.mv-piece strong{font-size:.7em}.mv-toolbar{flex-wrap:wrap}}
`;
  document.head.append(style);
  const el = (tag, cls, texte) => { const n=document.createElement(tag);if(cls)n.className=cls;if(texte!=null)n.textContent=texte;return n; };

  function adresse({corrige=false}={}) {
    const f=el('figure','mv mv-adresse');
    f.append(el('figcaption','mv-kicker',corrige?'La réponse · le domaine scolaire':'Une adresse · trois repères'));
    const ligne=el('div','mv-decoupe');
    for(const [cls,texte,titre] of [['mv-local','camille.martin','1 · Partie locale'],['mv-at','@','2 · Arobase'],['mv-domain',corrige?'arcampin.be':'example.org','3 · Domaine']]){
      const morceau=el('div','mv-piece '+cls);morceau.append(el('code',null,texte),el('strong',null,titre));ligne.append(morceau);
    }
    f.append(ligne);
    const guide=el('div','mv-guide');
    guide.append(el('p',null,'Avant @ : la partie locale identifie la boîte dans ce domaine.'),el('p',null,'Après @ : le domaine complet. L’arobase sépare les deux parties.'));f.append(guide);
    if(corrige){
      const tld=el('div','mv-tld'),a=el('div'),b=el('div'),code=el('strong');
      code.append('arcampin',el('mark',null,'.be'));a.append(code,el('p',null,'Domaine complet : arcampin.be. Ni @arcampin.be, ni .be tout seul.'));
      b.append(el('strong',null,'.be → Belgique'),el('p',null,'L’extension est un domaine de premier niveau : TLD, pour Top-Level Domain.'));tld.append(a,b);f.append(tld);
    }
    return f;
  }

  let capturePromise;
  function capture(){
    const details=el('details','mv-real');details.append(el('summary',null,'Retrouver les champs dans Outlook'));
    details.addEventListener('toggle',async()=>{
      if(!details.open||details.querySelector('img'))return;
      try{
        if(typeof CAPTURE==='undefined'){
          if(!capturePromise)capturePromise=new Promise((ok,ko)=>{const s=el('script');s.src='https://root75.github.io/campin-public/messagerie/pas-a-pas/capture.js?v=20261103';s.onload=ok;s.onerror=()=>{capturePromise=null;ko(Error());};document.head.append(s);});
          await capturePromise;
        }
        if(details.querySelector('img'))return;
        const img=el('img');img.src=CAPTURE;img.alt='Vue adaptée d’Outlook : le champ À, le champ Objet et la grande zone du corps du message.';img.loading='lazy';details.append(img,el('p',null,'Vue adaptée de l’interface Outlook. Accueil → Nouveau message.'));
      }catch(_){if(!details.querySelector('p'))details.append(el('p',null,'La vue Outlook ne s’est pas chargée. Ferme ce volet puis ouvre-le pour réessayer.'));}
    });return details;
  }

  function email(){
    const root=el('section','mv mv-mail-layout');root.setAttribute('aria-label','Les parties d’un email, exemple fictif');
    const fenetre=el('div','mv-window'),barre=el('div','mv-toolbar');barre.append(el('span',null,'Nouveau message'),el('small',null,'Exemple pédagogique'));
    const champs=el('div','mv-fields'),corps=el('div','mv-body'),legende=el('aside','mv-legend'),notice=el('div','mv-notice');notice.setAttribute('role','status');
    const parties=[
      ['1 · À','camille.martin@example.org','Le destinataire','Son adresse indique à quelle boîte envoyer le message.','#2563a6','#eaf2ff',champs],
      ['2 · Objet','Une question sur tes loisirs','Un titre court','L’objet annonce le sujet. Le texte du mail s’écrit dans le corps.','#a45b08','#fff1d9',champs],
      ['3 · Salutation','Bonjour Camille,','Je salue','La salutation commence le corps du message et s’adapte au destinataire.','#337568','#e7f6f0',corps],
      ['4 · Message','Quel sport ou quel loisir pratiques-tu ?','J’explique ma demande','Une ou deux phrases claires suffisent ici. Je les écris sous l’objet, dans le corps.','#5e53a8','#f0ecff',corps],
      ['5 · Formule de fin et signature','Bonne journée,\nLina Dupont, 2B','Je termine et je signe','La formule de fin et la signature sont aussi dans le corps. Le prénom, le nom et la classe identifient l’expéditeur.','#9a4367','#ffedf5',corps]
    ];
    const boutons=[];
    function selection(i){boutons.forEach((b,k)=>b.setAttribute('aria-pressed',String(k===i)));notice.replaceChildren(el('h3',null,parties[i][2]),el('p',null,parties[i][3]));}
    parties.forEach(([titre,texte,_,__,couleur,fond,dans],i)=>{const b=el('button','mv-part');b.type='button';b.style.setProperty('--part',couleur);b.style.setProperty('--tint',fond);b.setAttribute('aria-pressed','false');b.append(el('b',null,titre),el('span',null,texte));b.lastChild.style.whiteSpace='pre-line';b.addEventListener('click',()=>selection(i));boutons.push(b);dans.append(b);});
    fenetre.append(barre,champs,el('div','mv-brace','Corps du message · de la salutation à la signature'),corps);
    notice.append(el('h3',null,'Explore le mail'),el('p',null,'Sélectionne une partie colorée pour découvrir son rôle.'));
    legende.append(notice,el('p','mv-prompt','À l’oral : que garder dans Objet ? Où écrire la salutation et la signature ?'),capture());root.append(fenetre,legende);return root;
  }
  window.MessagerieVisuels={adresse,email};
})();
