/* Messagerie 01 — Mon premier email. DONNÉES seulement : le moteur est pas-a-pas/blocs.js (depuis le 16/11/2026 ;
   avant, cette fiche avait son propre moteur). Mode d'emploi : pas-a-pas/MOTEUR.md.
   Questions de preuve : preuves.json, corrigées par le serveur (blocs 8 à 12 : 3 variantes, une par élève).
   Le mail d'entraînement se construit de bloc en bloc : état partagé du moteur (PARTAGE, rédactions « commun »). */
const COURS = 'messagerie-1';
const VERSION_PARCOURS = 'v1';
const PRESENTATION = 'missions';
const CONFETTIS = true;
const PREUVES = 'https://root75.github.io/campin-public/messagerie/pas-a-pas/preuves.json?v=20261105b';
const HORS_SUIVI = 'Entraînement libre : aucun résultat ni appel à l’aide n’est transmis au professeur. En classe, ouvre Mes cours avec ton compte scolaire.';
/* Mode séquence commun (pas-a-pas/sequence-eleve.js) : les textes des écrans viennent de sequences.json,
   les visuels « adresse » et « email » de visuels.js. */
const SEQUENCE = { contenus:true, classe:'messagerie-scene' };

/* ===== Les contrôles du mail d'entraînement (dans la page ; le serveur corrige ensuite la preuve courte) ===== */
const M1 = (() => {
  const DEST = 'camille.martin@example.org';
  const propre = s => String(s||'').normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[’]/g,"'").replace(/\s+/g,' ').trim();
  const html = s => String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const CLASSE = /(?:^|[\s,:])([1-7]\s*[a-z](?:\d)?)(?=$|[\s,.;])/i;
  /* La classe : celle de la séance (serveur), sinon celle écrite dans la signature (1B, 2F…). Sans séance et sans
     classe de cette forme (aperçu professeur, classe d'essai « TEST »), ce qui suit le prénom et le nom dans la
     signature : la page ne connaît pas la classe, elle vérifie seulement qu'il y en a une. */
  const resteSignature = d => { const noms = propre(d.nom).split(/[^a-z0-9'-]+/).filter(Boolean);
    return noms.length<2 ? '' : String(d.signature||'').split(/[\s,;:.]+/).filter(m => m && !noms.includes(propre(m))).join(' ').trim(); };
  const classeDe = (d, classe) => String(classe||'').trim() || (CLASSE.exec(String(d.signature||'').trim())||[])[1] || resteSignature(d);
  /* La salutation « Bonjour Camille, » : un mot du modèle, une majuscule, le prénom avec sa majuscule, une virgule.
     seule=true : rien d'autre sur la ligne (bloc 4) ; sinon on ne lit que le début (réponse du bloc 8). */
  function erreurSalutation(brut, seule){
    const t = String(brut||'').trim(), m = /^([^\s,.!:;?]+)\s*([^\s,.!:;?]*)\s*([,.!:;?]?)/.exec(t) || ['','','',''];
    const [,mot,prenom,ponct] = m;
    if(!/^(bonjour|salut|bonsoir)$/.test(propre(mot))) return 'Commence par la salutation du modèle : « Bonjour Camille, » (Salut ou Bonsoir conviennent aussi). Les autres formes (Coucou, Hello, Yo…) ne sont pas acceptées ici.';
    if(mot[0]!==mot[0].toUpperCase()) return 'La salutation commence par une majuscule : « Bonjour », pas « '+mot+' ».';
    if(!prenom) return 'Après « '+mot+' », écris le prénom de la personne, puis une virgule : « Bonjour Camille, ».';
    if(propre(prenom)!=='camille') return 'Salue Camille par son prénom : « Bonjour Camille, ».';
    if(prenom[0]!==prenom[0].toUpperCase()) return 'Le prénom prend une majuscule : « Camille », pas « '+prenom+' ».';
    if(ponct!==',') return 'Mets une virgule juste après le prénom : « Bonjour Camille, ».';
    if(seule && t.length>m[0].length) return 'Écris seulement la salutation sur cette ligne : « Bonjour Camille, ». La suite vient à l’étape suivante.';
    return '';
  }
  /* Bloc 8 : les cinq critères de la réponse à Camille, contrôlés TOUS ensemble (12/11/2026 : un critère à la fois
     faisait buter de correction en correction — ~85 refus pour 18 élèves). La liste se coche pendant la frappe. */
  function criteresReponse(reponse, d, classe){
    const v = propre(reponse), mots = propre(d.nom).split(/[^a-z0-9'-]+/).filter(Boolean);
    const cl = classeDe(d, classe) || (CLASSE.exec(String(reponse||'').trim())||[])[1] || '';
    const c = (nom, err) => ({ nom, err:err||'' });
    return [
      c('« Bonjour Camille, » au début', erreurSalutation(reponse, false)),
      c('Une phrase complète sur ton sport ou ton loisir', !/loisir|sport|activite|pratique|aime|joue|lecture|lire|musique|dessin|danse|anime/.test(v) ? 'Réponds à la question de Camille : écris une phrase complète sur ton sport ou ton loisir, par exemple « Je pratique le football. »' : v.length<35 ? 'Ta réponse est trop courte. Il faut, dans l’ordre : la salutation, une phrase complète sur ton loisir, une formule de fin et ta signature.' : ''),
      c('Une formule de fin : « Bonne journée, »', !/bonne journee|a bientot|merci|cordialement|bonne soiree/.test(v) ? 'Avant ta signature, ajoute une formule de fin du modèle : « Bonne journée, » ou « À bientôt, » (Merci, Cordialement ou Bonne soirée conviennent aussi).' : ''),
      c('Ta signature : ton prénom et ton nom', !mots.length ? 'Écris d’abord ton prénom et ton nom dans la case « Ton prénom et ton nom », juste au-dessus de ta réponse.' : !mots.every(m=>v.split(/[^a-z0-9'-]+/).includes(m)) ? 'Dans ta signature, reprends le prénom et le nom du bloc 6 : '+String(d.nom).trim()+'.' : ''),
      c('Ta classe, après ton nom', !cl ? 'Ajoute ta classe dans ta signature, après ton prénom et ton nom (exemple : 2B).' : !v.replace(/\s/g,'').includes(propre(cl).replace(/\s/g,'')) ? 'Dans ta signature, reprends la classe du bloc 6 : '+cl+'.' : '')
    ];
  }
  /* Un champ du mail : '' si tout va bien, sinon ce qu'il faut corriger. d = les valeurs partagées. */
  function verifie(k, d, classe){
    d = Object.assign({ a:'', objet:'', salutation:'', message:'', fin:'', signature:'', nom:'', locale:'', domaine:'', reponse:'', questionProf:'' }, d);
    const v = propre(d[k]);
    if(k==='locale') return v==='camille.martin' ? '' : 'La partie locale est ce qui se trouve avant @ : elle identifie la boîte dans ce domaine.';
    if(k==='domaine') return v==='example.org' ? '' : 'Le domaine est ce qui se trouve après @. Ici, recopie example.org.';
    if(k==='reponse') return (criteresReponse(d.reponse, d, classe).find(c=>c.err)||{}).err || '';
    if(k==='questionProf') return String(d.questionProf).trim().length>=8 ? '' : 'Recopie la question du message de ton professeur, en entier : elle te sera rappelée à l’étape suivante.';
    if(k==='a') return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.a.trim()) && d.a.trim().toLowerCase()===DEST ? '' : 'Écris l’adresse de Camille indiquée dans la mission. Vérifie chaque lettre : un @ et une adresse plausible ne suffisent pas.';
    if(k==='objet'){
      if(!v) return 'Ajoute un titre qui annonce le sujet.';
      if(/[\r\n]/.test(d.objet) || d.objet.length>80 || /bonjour|merci|cordialement|\?/.test(v)) return 'Garde un titre court dans Objet. La salutation et la demande vont dans le message.';
      return /\b(loisir|loisirs|sport|sports|activite|activites|passion|passions)\b/.test(v) ? '' : 'L’objet doit annoncer les loisirs. Un prénom seul, « Bonjour » ou « Mon message » ne suffit pas.';
    }
    if(k==='salutation') return erreurSalutation(d.salutation, true);
    if(k==='message'){
      const m = String(d.message);
      if(/\[|\]|\b(ma reponse|ta reponse|ton texte|votre texte)\b/.test(v)) return 'Remplace les indications du modèle par ta propre demande.';
      if(m.length>190) return 'Garde une demande courte : une ou deux phrases, jusqu’à 190 caractères.';
      if(v.length<25) return 'Écris une demande complète : demande quel loisir Camille pratique.';
      if(!/\b(loisir|loisirs|sport|sports|activite|activites|passion|passions)\b/.test(v)) return 'Ta demande doit parler du sport ou des loisirs de Camille.';
      if(!/\?|\b(peux|pourrais|quelle|quel|dis|proposes|proposer|voudrais|souhaites|aimerais)\b/.test(v)) return 'Formule une demande adressée à Camille, plutôt qu’une simple affirmation.';
      if(!/[.!?…]$/.test(m.trim())) return 'Termine ta phrase par une ponctuation.';
      if(!/^[A-ZÀ-ÖØ-Þ]/.test(m.trim())) return 'Commence ta phrase par une majuscule.';
      return '';
    }
    if(k==='fin') return /^(bonne journee|bonne soiree|a bientot|merci|merci d'avance|cordialement|bien a toi|bien a vous|bon week.end)[\s!,.]*$/.test(v) ? '' : 'Ajoute une formule de fin adaptée, par exemple Bonne journée, ou À bientôt,.';
    if(k==='signature'){
      const cl = classeDe(d, classe);
      if(!d.nom.trim() || d.nom.trim().split(/\s+/).length<2) return 'Renseigne ton prénom et ton nom au-dessus de la signature.';
      // La classe de la séance fait foi, quel que soit son nom (« 3F », « Test ») ; sans elle, celle lue dans la signature.
      if(!cl) return 'Ajoute ta classe dans ta signature, après ton prénom et ton nom'+(String(classe||'').trim() ? '' : ' (exemple : 1B)')+'.';
      if(/\[|\]|\b(prenom|classe|signature)\b/.test(v)) return 'Écris tes informations dans la signature, sans conserver les indications du modèle.';
      const mots = propre(d.nom).split(/[^a-z0-9'-]+/).filter(Boolean), sig = v.split(/[^a-z0-9'-]+/).filter(Boolean);
      if(!mots.every(m=>sig.includes(m))) return 'La signature doit contenir ton prénom, ton nom et ta classe.';
      return v.replace(/\s/g,'').includes(propre(cl).replace(/\s/g,'')) ? '' : 'Dans ta signature, écris ta classe : '+cl+'.';
    }
    return '';
  }
  /* Les erreurs de plusieurs champs, toutes ensemble (le contrôle d'une rédaction du moteur). */
  const erreurs = champs => (texte, d, ctx) => champs.map(k=>verifie(k, d, ctx && ctx.classe)).filter(Boolean);
  /* L'enveloppe en plein écran (visuels.js). Sans elle (script pas chargé, tests), rien : la fiche continue. */
  const enveloppe = o => { if(typeof window!=='undefined' && typeof window.MessagerieEnvol==='function') window.MessagerieEnvol(o); };
  const noeud = (tag, cls, texte) => { const n = document.createElement(tag); if(cls) n.className = cls; if(texte!=null) n.textContent = texte; return n; };
  /* « Prénom Nom » lu dans une adresse scolaire (prenom.nom@…) : sans accent, l'adresse n'en porte pas. */
  const nomDe = email => String(email||'').split('@')[0].replace(/\d+/g,'').split('.').filter(Boolean)
    .map(m => m.split('-').map(p => p.charAt(0).toUpperCase()+p.slice(1)).join('-')).join(' ');

  /* Bloc 1 — « Le mail raté » : six lignes, quatre à réparer. Un clic sur une ligne fautive la répare et dit le rôle
     de cette partie ; sur une ligne juste, il dit pourquoi elle l'est. Rien n'est envoyé au serveur : la preuve du
     bloc reste la question sur l'adresse. Sans script, le mail réparé est déjà dans la page (texte de repli). */
  const RATE = [
    ['À', 'camille.martin@example.org', '', 'Cette ligne est juste. Le destinataire : son adresse, recopiée lettre par lettre, sans espace.'],
    ['Objet', '(rien)', 'Une question sur tes loisirs', 'L’objet : un titre court. Il annonce le sujet et aide à retrouver le mail dans la liste.'],
    ['', 'slt', 'Bonjour Camille,', 'La salutation : « Bonjour », le prénom avec sa majuscule, une virgule. Pour un professeur : « Bonjour Monsieur, » ou « Bonjour Madame, ».'],
    ['', 'tu fé koi kom sport', 'Quel sport ou quel loisir pratiques-tu ?', 'Le message : une phrase complète, sans abréviation. Le destinataire doit pouvoir répondre.'],
    ['', 'Bonne journée,', '', 'Cette ligne est juste. La formule de fin : elle termine le message poliment.'],
    ['', 'moi', 'Lina Dupont, 2B', 'La signature : le prénom, le nom et la classe. « moi » ne dit pas qui écrit.']
  ];
  function mailRate(zone){
    const cible = zone && zone.querySelector('.mail-rate'); if(!cible) return;
    const total = RATE.filter(l => l[2]).length, dit = noeud('p','rate-dit'), compte = noeud('p','rate-compte');
    dit.setAttribute('role','status');
    const encore = noeud('button','btn vide rate-encore','↻ Recommencer'); encore.type = 'button';
    encore.addEventListener('click', () => mailRate(zone));
    let trouve = 0, clics = total;   // autant de clics que de lignes à réparer : cliquer partout ne marche pas
    const fini = () => trouve>=total, perdu = () => !fini() && clics<=0;
    const maj = () => {
      compte.textContent = fini() ? '✔ Mail réparé, sans un clic de trop ! À, Objet, puis un corps en quatre parties : salutation, message, formule de fin, signature. Clique sur une ligne pour relire à quoi elle sert.'
        : perdu() ? 'Plus de clic : '+trouve+' ligne'+(trouve>1 ? 's' : '')+' réparée'+(trouve>1 ? 's' : '')+' sur '+total+'. Relis chaque ligne avant de cliquer, puis recommence.'
        : 'Lignes réparées : '+trouve+' sur '+total+' · Clics restants : '+clics;
      cible.classList.toggle('repare', fini()); cible.classList.toggle('perdu', perdu()); encore.hidden = !perdu();
    };
    const lignes = RATE.map(([champ, mauvais, bon, role]) => {
      const b = noeud('button','rate-ligne'); b.type = 'button';
      const texte = noeud('span', null, mauvais);
      if(champ) b.append(noeud('b', null, champ+' : '));
      b.append(texte);
      b.addEventListener('click', () => {
        if(perdu()) return;
        if(fini() || b.classList.contains('reparee') || b.classList.contains('juste')){ dit.textContent = role; return; }   // déjà vue, ou partie gagnée : on relit, sans rien dépenser
        clics--;
        if(bon){ texte.textContent = bon; b.classList.add('reparee'); trouve++; dit.textContent = role; if(fini() && typeof confettis==='function') confettis(); }
        else { b.classList.add('juste'); dit.textContent = 'Un clic perdu. '+role; }
        maj();
      });
      return b;
    });
    dit.textContent = 'Lis tout le mail, puis clique sur une ligne à réparer.';
    cible.replaceChildren(...lignes, dit, compte, encore); maj();
  }

  /* Bloc 10 — le correspondant tiré au sort par le serveur (Code.gs, correspondant) : chaque élève présent écrit à
     un camarade et reçoit un message d'un autre. Gardé dans l'état partagé ; le serveur redonne le même nom sur un
     autre poste. Un élève seul à cette étape attend le suivant : on redemande toutes les 8 s, vingt fois au plus.
     Hors suivi, en aperçu ou avec un serveur pas encore à jour : le texte d'origine reste (« demande à ton professeur »). */
  function correspondant(api, essai){
    const repere = api.zone.querySelector('.correspondant');
    if(!api.suivi || !repere || api.valeurs().corrAdresse) return;
    api.serveur('correspondant', COURS).then(r => {
      if(!repere.isConnected) return;   // l'élève a changé de bloc
      if(r && r.adresse){ api.garde('corrNom', String(r.nom||'')); api.garde('corrPrenom', String(r.prenom||'')); api.garde('corrAdresse', String(r.adresse)); api.rappels(); }
      else if(r && r.attente && (essai||0)<20) setTimeout(() => correspondant(api, (essai||0)+1), 8000);
    }).catch(() => {});
  }

  /* Écran de fin — le « permis de mail » : le nom de l'élève, les cinq gestes de la leçon, un tampon. */
  const GESTES_PERMIS = ['Je lis une adresse : la partie locale, @, le domaine.', 'J’écris un objet court, qui annonce le sujet.',
    'Je salue, je termine et je signe.', 'J’envoie un mail avec mon professeur en copie (Cc).', 'Je réponds avec « Répondre à tous ».'];
  function permis(ctx){
    if(typeof document==='undefined') return null;
    const d = ctx.valeurs || {}, nom = String(d.nom||'').trim() || nomDe(ctx.email) || 'Élève', classe = classeDe(d, ctx.classe);
    const p = noeud('section','permis'), liste = noeud('ul');
    p.setAttribute('aria-label','Mon permis de mail');
    GESTES_PERMIS.forEach(g => liste.append(noeud('li', null, g)));
    p.append(noeud('p','permis-tete','🪪 Permis de mail'), noeud('p','permis-nom', nom+(classe ? ' · '+classe : '')), liste,
      noeud('p','permis-date','Délivré le '+new Date().toLocaleDateString('fr-BE', { day:'numeric', month:'long', year:'numeric' })),
      noeud('span','permis-tampon','Validé'),
      noeud('p','note','Ce permis dit ce que tu sais faire. Ta cote, c’est ton professeur qui la donne, en lisant tes deux mails.'));
    return p;
  }
  const TOUS = ['a','objet','salutation','message','fin','signature'];
  const corps = d => [d.salutation, d.message, d.fin, d.signature].map(x=>x||'').join('\n\n');
  /* L'aperçu en direct, à droite : blocs 1 à 7 et 9 à 12, le mail d'entraînement ; bloc 8, la réponse à Camille
     (destinataire et objet repris de la conversation, comme avec « Répondre »). */
  function apercu(d, i){
    const rep = i===7, ligne = (n, t) => '<div class="ligne-mail"><b>'+n+'</b><span>'+t+'</span></div>';
    return '<h2>'+(rep ? 'Ma réponse se construit' : 'Mon mail se construit')+'</h2><div class="outlookbar">Messagerie d’entraînement · '+(rep ? 'Réponse' : 'Nouveau message')+'</div>'
      +'<div class="email">'+(rep ? ligne('À', DEST)+ligne('Objet', 'RE : '+html(d.objet))+'<div class="corps"><span class="tag">Corps de ma réponse</span><p>'+(html(d.reponse)||'…')+'</p></div>'
        : ligne('À', html(d.a)||'…')+ligne('Objet', html(d.objet)||'…')+'<div class="corps"><span class="tag">Corps du message</span><p>'+(html(corps(d)).trim()||'…')+'</p></div>')+'</div>'
      +'<p class="note">La salutation, la demande et la signature vont toutes dans le corps du message.</p>';
  }
  /* Le brouillon gardé par l'ancienne fiche (avant le 16/11/2026) : relu une fois, pour que l'élève retrouve son mail. */
  function ancienBrouillon(email){
    try{
      const a = JSON.parse(localStorage.getItem('messagerie-01-v20261103'+(email ? ':'+email : '')) || 'null') || {}, d = {};
      ['a','objet','salutation','message','fin','signature','nom','locale','domaine','reponse','questionProf'].forEach(k=>{ if(typeof a[k]==='string' && a[k]) d[k] = a[k]; });
      return d;
    }catch(e){ return {}; }
  }
  /* Le nom à taper dans Cc : Outlook trouve la personne dans l'annuaire de l'école. */
  const prof = classe => { const c = String(classe||'').replace(/\s/g,'').toUpperCase(); return /^2E/.test(c) ? 'Michiels' : c ? 'Louviaux' : ''; };
  return { DEST, propre, html, classeDe, erreurSalutation, criteresReponse, verifie, erreurs, TOUS, corps, apercu, ancienBrouillon, prof, enveloppe, nomDe, RATE, mailRate, correspondant, GESTES_PERMIS, permis };
})();

const PARTAGE = { depart:M1.ancienBrouillon, apercu:M1.apercu };
/* Rappels : <span data-rappel="prof">…</span> dans un texte. Sans valeur, le texte d'origine reste. */
const RAPPELS = {
  prof:(d, ctx) => M1.prof(ctx.classe),
  classe:(d, ctx) => String(ctx.classe||'').trim(),
  prenom:d => { const p = String(d.nom||'').trim().split(/\s+/)[0]; return p ? ' '+p : ''; },   // « Bonjour Lina, » ou « Bonjour, »
  signature:(d, ctx) => { const n = String(d.nom||'').trim(), c = M1.classeDe(d, ctx.classe); return n && c ? n+', '+c : ''; }
};

const PROF_M1 = '<span data-rappel="prof">Louviaux (2B, 2F) ou Michiels (2E)</span>';
const MISSION = '<aside class="repere mission"><b>Ta mission d’entraînement</b><p>Écris à Camille pour lui demander quel sport ou quel loisir elle pratique.</p><p>Camille est fictive. Son adresse : <b>camille.martin@example.org</b>.</p></aside>';
const COTE = rappel => '<aside class="repere cote"><b>'+(rappel ? 'Avant d’envoyer : la grille de ton message, coté sur 5' : '⚠ Ton message au camarade est coté sur 5')+'</b><p>Ton professeur est <b>en copie (Cc)</b> : il reçoit ton message et le cote avec cette grille. Un point par ligne.</p><table class="grille-cote"><tr><th>Dans ton message</th><th>Points</th></tr><tr><td><b>À</b> : l’adresse de ton camarade · <b>Cc</b> : ton professeur, '+PROF_M1+'</td><td>1</td></tr><tr><td><b>Objet</b> : un titre court qui annonce ta question.</td><td>1</td></tr><tr><td><b>Salutation</b> : « Bonjour », le prénom de ton camarade avec sa majuscule, puis une virgule. Par exemple « Bonjour Lucas, ».</td><td>1</td></tr><tr><td><b>Message</b> : la question de ton professeur, posée à ton camarade, avec une majuscule et un point d’interrogation.</td><td>1</td></tr><tr><td><b>Fin et signature</b> : une formule de fin, puis ton prénom, ton nom et ta classe.</td><td>1</td></tr></table><p>Sans ton professeur en Cc, il ne reçoit pas ton message et ne peut pas le coter.</p></aside>';
const COTE_REPONSE = '<aside class="repere cote"><b>⚠ Ta réponse est cotée sur 5, elle aussi</b><p>Ton premier message, envoyé à l’étape 11, est coté sur 5. Cette réponse l’est aussi, avec cette grille. Un point par ligne.</p><table class="grille-cote"><tr><th>Dans ta réponse</th><th>Points</th></tr><tr><td><b>Répondre à tous</b> : ton camarade dans À, ton professeur, '+PROF_M1+', toujours en Cc.</td><td>1</td></tr><tr><td><b>Objet</b> : celui de la conversation, gardé tel quel, avec « RE: » devant.</td><td>1</td></tr><tr><td><b>Salutation</b> : « Bonjour », le prénom de ton camarade avec sa majuscule, puis une virgule.</td><td>1</td></tr><tr><td><b>Réponse</b> : tu réponds à sa question par une phrase complète, avec une majuscule et un point.</td><td>1</td></tr><tr><td><b>Fin et signature</b> : une formule de fin, puis ton prénom, ton nom et ta classe.</td><td>1</td></tr></table><p>Avec « Répondre » tout court, ton professeur ne reçoit pas ta réponse et ne peut pas la coter.</p></aside>';

/* Un champ du mail d'entraînement : une rédaction « commun » sans grande zone, collée sous la consigne. */
const champMail = (etiquette, champs, controle, reponse, juste, plus) => Object.assign({ serveur:true, type:'redaction', commun:true, colle:true, zone:false,
  etiquette, champs, controle:M1.erreurs(controle), reponse, juste }, plus);

const BLOCS = [
 {partie:'A — Je comprends', titre:'Réparer un mail raté', min:3,
  veux:'Avant de toucher Outlook : reconnaître les parties d’un mail et les deux parties d’une adresse.',
  arrive:api=>M1.mailRate(api.zone),
  avant:'<p><b>Lina a écrit ce mail trop vite.</b> Quatre lignes sont à réparer, et tu as <b>quatre clics</b>, pas un de plus. Lis d’abord tout le mail. Un clic sur une ligne fautive la répare ; un clic sur une ligne juste est perdu.</p><div class="email mail-rate"><div class="ligne-mail"><b>À</b><span>camille.martin@example.org</span></div><div class="ligne-mail"><b>Objet</b><span>Une question sur tes loisirs</span></div><div class="corps"><p>Bonjour Camille,\n\nQuel sport ou quel loisir pratiques-tu ?\n\nBonne journée,\nLina Dupont, 2B</p></div></div><p class="note">Le corps du mail réunit la salutation, le message, la formule de fin et la signature.</p>'
   +'<h3>Comprendre une adresse email</h3><div class="email"><div class="ligne-mail"><b>camille.martin</b><b>@</b><b>example.org</b></div></div><ul><li><b>Partie locale :</b> avant @, elle identifie une boîte dans le domaine. Ce peut être une personne ou un service, comme secretariat.</li><li><b>@, l’arobase :</b> sépare les deux parties ; on peut le lire « chez ».</li><li><b>Domaine :</b> après @, il indique le domaine auquel appartient la boîte. Il n’est pas nécessairement le nom du serveur technique.</li></ul><p>Dans ton adresse scolaire, le domaine est <b>arcampin.be</b>. Recopie l’adresse fournie exactement, sans ajouter d’espace. Une adresse bien écrite ne prouve pas que la boîte existe ni que son propriétaire est fiable.</p><p class="note">example.org est utilisé ici pour les personnages fictifs. On ne lui envoie aucun message réel.</p>',
  fais:'<p>Dans <b>camille.martin@example.org</b>, repère les deux parties de l’adresse et écris-les dans les deux cases.</p>',
  coince:['La partie locale, c’est tout ce qui est écrit AVANT le signe @. Le domaine, c’est tout ce qui est écrit APRÈS.','N’écris pas le signe @ dans les cases : il sépare les deux parties, il n’appartient à aucune.','Pas d’espace et pas de majuscule : recopie lettre par lettre.'],
  q:champMail('Les deux parties de l’adresse',
    [{cle:'locale', nom:'Repère la partie locale', aide:'Dans camille.martin@example.org, écris seulement ce qui précède @.', max:120},
     {cle:'domaine', nom:'Repère le domaine', aide:'Écris seulement ce qui suit @.', max:120}],
    ['locale','domaine'], d=>d.locale+'@'+d.domaine, 'Tu distingues la partie locale et le domaine.', {bouton:'Vérifier les deux parties de l’adresse'})},

 {partie:'B — J’écris mon mail d’entraînement', titre:'Choisir le destinataire', min:2,
  veux:'Dire à qui j’écris : l’adresse complète de Camille, dans le champ À.',
  avant:MISSION,
  fais:'<p><b>À qui écris-tu ?</b> Écris l’adresse complète de Camille dans le champ <b>À</b>.</p>',
  extra:'<p class="note">Les adresses qui posent problème sont travaillées ensemble, avec le professeur.</p>',
  coince:['L’adresse est dans l’encadré « Ta mission d’entraînement » : recopie-la lettre par lettre.','Vérifie : un point entre camille et martin, un seul @, example.org à la fin, aucun espace.'],
  q:champMail('Mon mail : le champ À', [{cle:'a', nom:'À — adresse du destinataire', aide:'Recopie l’adresse de la mission. Le message viendra dans le corps du mail.', max:120}],
    ['a'], d=>d.a, 'Tu as écrit l’adresse exacte du destinataire.')},

 {partie:'B — J’écris mon mail d’entraînement', titre:'Donner un objet', min:2,
  veux:'Donner un titre à mon mail : l’objet annonce le sujet, en quelques mots.',
  avant:MISSION,
  fais:'<p>Donne un <b>titre</b> à ton email. Le texte de la demande viendra après.</p>',
  coince:['Un objet, c’est quelques mots, comme le titre d’un livre : pas de « Bonjour », pas de question entière.','Ton objet doit contenir le sujet du mail : le sport, les loisirs, une activité.'],
  q:champMail('Mon mail : l’objet', [{cle:'objet', nom:'Objet', aide:'Le titre doit parler des loisirs. Tu peux trouver ta propre formulation.', max:120}],
    ['objet'], d=>d.objet, 'Ton objet annonce les loisirs sans contenir tout le message.')},

 {partie:'B — J’écris mon mail d’entraînement', titre:'Saluer', min:1,
  veux:'Commencer le corps du message en saluant Camille.',
  avant:MISSION,
  fais:'<p>Commence le corps du message en <b>saluant Camille</b>. Choisis une seule formulation.</p>',
  coince:['Le modèle : « Bonjour Camille, » — une majuscule à Bonjour, une majuscule à Camille, puis une virgule.','Écris seulement la salutation ici : la demande vient à l’étape suivante.'],
  q:champMail('Mon mail : la salutation', [{cle:'salutation', nom:'Salutation', aide:'Commence ton message en saluant Camille.', max:120}],
    ['salutation'], d=>d.salutation, 'Une seule salutation pour commencer le message.')},

 {partie:'B — J’écris mon mail d’entraînement', titre:'Rédiger la demande', min:3,
  veux:'Écrire ma demande en une ou deux phrases : Camille doit comprendre ce que je lui demande, et pouvoir me répondre.',
  avant:MISSION,
  fais:'<p>Rédige ta demande en une ou deux phrases.</p><ul><li>Demande quel <b>sport</b> ou quel <b>loisir</b> Camille pratique.</li><li>Tu peux lui demander ce qui lui plaît dans cette activité.</li><li>Relis : une <b>majuscule</b> au début et une <b>ponctuation</b> à la fin.</li></ul>',
  extra:'<p class="note">Le contrôle repère les éléments de la mission. Il ne remplace pas la lecture du professeur : des mots-clés présents ne prouvent pas, à eux seuls, qu’une phrase est claire.</p>',
  coince:['Un exemple de demande : « Quel sport ou quel loisir pratiques-tu ? » Écris la tienne, avec tes mots.','Ta phrase doit parler du sport ou des loisirs, et poser une question à Camille.','La salutation et la signature ne vont pas ici : elles ont leur propre étape.'],
  q:champMail('Mon mail : la demande', [{cle:'message', nom:'Ton message', aide:'Écris ta propre phrase. La salutation et la signature sont préparées aux autres étapes.', lignes:4, max:700}],
    ['message'], d=>d.message, 'Relis ta phrase : Camille comprend-elle ce que tu demandes ?')},

 {partie:'B — J’écris mon mail d’entraînement', titre:'Terminer et signer', min:3,
  veux:'Terminer poliment, puis signer : Camille doit savoir qui lui écrit.',
  fais:'<p>Termine ton message par une <b>formule de fin</b>, puis <b>signe</b> avec tes informations d’élève : ton prénom, ton nom et ta classe.</p><p class="note">Ta classe : <b><span data-rappel="classe">celle de ton horaire, par exemple 2B</span></b>.</p>',
  coince:['Une formule de fin : « Bonne journée, » ou « À bientôt, ».','La signature reprend exactement le prénom et le nom écrits dans la case du milieu, puis ta classe : « Lina Dupont, 2B ».','Écris ta classe avec son chiffre et sa lettre, sans rien entre les deux : 2B.'],
  q:champMail('Mon mail : la fin et la signature',
    [{cle:'fin', nom:'Formule de fin', aide:'Exemples : Bonne journée, ou À bientôt,', max:120},
     {cle:'nom', nom:'Ton prénom et ton nom', aide:'Utilisés pour vérifier ta signature.', max:120},
     {cle:'signature', nom:'Signature', aide:'Signe avec ton prénom, ton nom et ta classe.', max:120}],
    ['fin','signature'], d=>d.fin+' | '+d.signature, 'La formule de fin et la signature sont en place.')},

 {partie:'B — J’écris mon mail d’entraînement', titre:'Relire le mail complet', min:2,
  veux:'Relire mon mail en entier avant la suite : le destinataire, le titre et chacune des parties du corps.',
  avant:'<p>Voici ton mail complet, dans « Mon mail se construit ». Vérifie chaque point :</p><ul class="controle"><li>Le destinataire est bien Camille.</li><li>L’objet annonce le sujet des loisirs.</li><li>Je la salue une seule fois.</li><li>Je lui demande son sport ou son loisir.</li><li>Je termine et je signe.</li></ul>',
  fais:'<p>Un champ est <b>vide</b> ou à <b>corriger</b> ? Change-le dans les cases ci-dessous, puis vérifie.</p>',
  coince:['Un champ est vide (tu reprends sur un autre poste) : réécris-le dans sa case, ici même.','La liste « Pas encore » nomme chaque champ à corriger : corrige-les tous, puis vérifie à nouveau.'],
  q:champMail('Mon mail complet',
    [{cle:'a', nom:'À', max:120},{cle:'objet', nom:'Objet', max:120},{cle:'salutation', nom:'Salutation', max:120},
     {cle:'message', nom:'Message', lignes:3, max:700},{cle:'fin', nom:'Formule de fin', max:120},
     {cle:'nom', nom:'Ton prénom et ton nom', max:120},{cle:'signature', nom:'Signature', max:120}],
    M1.TOUS, (d, t, ctx)=>ctx.refus ? M1.TOUS.filter(k=>M1.verifie(k, d, ctx.classe)).join(',') : d.objet,   // refus : les champs en cause, pour « Où le groupe bute »
    'L’adresse, l’objet et les parties du corps sont en place. Tu peux maintenant lire la réponse fictive de Camille.',
    {q:'Relis chaque champ de ton mail. « Vérifier » contrôle cet entraînement : aucun email ne sera envoyé.', bouton:'Vérifier mon mail d’entraînement'}),
  fete:()=>M1.enveloppe({vole:true, titre:'Ton mail d’entraînement s’envole vers Camille…', texte:'C’est une simulation : aucun vrai email n’est envoyé.'})},

 {partie:'C — Je réponds', titre:'Répondre au message reçu', min:5,
  veux:'Camille m’a répondu, et elle me pose une question : je lui réponds, dans la même conversation.',
  avant:'<p>Dans cette simulation, Camille a reçu ta question et t’a répondu. <b>Clique sur l’enveloppe</b> pour ouvrir son message, puis lis-le.</p><details class="enveloppe"><summary><span class="enveloppe-dessin" aria-hidden="true">📬</span> Un nouveau message de Camille — clique pour l’ouvrir</summary><div class="email"><div class="ligne-mail"><b>De</b><span>Camille Martin &lt;camille.martin@example.org&gt;</span></div><div class="ligne-mail"><b>Objet</b><span>RE : <span data-rappel="objet">ta question sur les loisirs</span></span></div><div class="corps"><p>Bonjour<span data-rappel="prenom"></span>,\n\nJe pratique la boxe thaï. Et toi, quel sport ou quel loisir pratiques-tu ?\n\nBonne journée,\nCamille</p></div></div></details>',
  fais:'<p><b>Utilise Répondre :</b> le destinataire et l’objet de la conversation sont conservés. Écris seulement ta réponse au-dessus du message précédent.</p><p class="note"><b>Signature à reprendre :</b> <span data-rappel="signature">ton prénom, ton nom et ta classe, comme au bloc 6</span>.</p>',
  extra:'<p class="note">Les contrôles vérifient des éléments de forme. Le professeur vérifie aussi que la réponse a du sens et répond bien à la question.</p>',
  fete:()=>M1.enveloppe({vole:false, emoji:'🏁', titre:'Première partie réussie !', texte:'Tu sais écrire un mail et y répondre. La suite se passe dans Outlook, pour de vrai.', duree:4500}),
  coince:['Le message de Camille est dans l’enveloppe 📬, au-dessus : clique dessus pour l’ouvrir.','La liste sous ta réponse se coche pendant que tu écris : un point reste ○ ? C’est lui qu’il faut ajouter ou corriger.','Dans l’ordre : « Bonjour Camille, », une phrase complète sur ton sport ou ton loisir, « Bonne journée, », puis ton prénom, ton nom et ta classe.','Tu peux inventer un loisir si tu préfères.'],
  q:{serveur:true, type:'mixte', colle:true, ouvre:'↶ Répondre à Camille',
     activite:{type:'redaction', commun:true, etiquette:'Ma réponse à Camille', q:'Écris ta réponse. La liste, en dessous, se coche pendant que tu écris.',
       champs:[{cle:'nom', siVide:true, nom:'Ton prénom et ton nom', aide:'Tu reprends sur un autre poste : écris-les ici, ta signature sera vérifiée avec eux.', max:120}],
       zone:{cle:'reponse', nom:'Corps de ta réponse', aide:'Commence par la salutation du modèle, « Bonjour Camille, ». Réponds à sa question par une phrase complète, puis ajoute une formule de fin (« Bonne journée, ») et ta signature.', lignes:6, max:700},
       criteres:(texte, d, ctx)=>M1.criteresReponse(texte, d, ctx.classe), bouton:'Vérifier ma réponse',
       juste:'Les cinq points y sont. Une dernière question, juste en dessous.'},
     validation:{juste:'Tu as préparé les parties de ta réponse. Explique au professeur comment tu réponds à la question de Camille.'}}},

 {partie:'D — Dans Outlook, pour de vrai', titre:'Ouvrir et lire dans Outlook', min:4,
  veux:'À partir d’ici, tout est réel : j’ouvre Outlook avec mon compte scolaire et je lis le message de mon professeur, en entier.',
  avant:'<p>Tu ne réponds pas à ton professeur : tu vas te servir de <b>sa question</b> à l’étape suivante.</p><p><a class="btn plein" href="https://outlook.office.com/" target="_blank" rel="noopener">Ouvrir Outlook ↗</a></p>',
  gestes:['Ouvre <b>Boîte de réception</b>, à gauche.',
   'Cherche le message « <b>Bienvenue dans ta boîte de l’école</b> ». Pas là ? Regarde l’onglet <b>Autres</b>, ou tape le nom du professeur dans <b>Rechercher</b>, tout en haut.',
   {geste:'Clique sur le message pour l’ouvrir, puis <b>lis-le jusqu’au bout</b>.', attention:'⚠️ Ici, tu lis seulement. Tu ne réponds pas au professeur et tu n’écris aucun message : cela vient à l’étape 10.'},
   'Repère son nom, son adresse, l’objet et <b>la question qu’il te pose</b>.',
   '<b>Recopie cette question</b> dans la case ci-dessous : l’étape suivante te la rappellera.'],
  vois:'Dans Outlook, le message de ton professeur est ouvert. Sa question est recopiée dans la case ci-dessus.',
  extra:'<p><b>Repères :</b> les messages reçus sont dans Boîte de réception ; les messages commencés restent dans Brouillons ; les envois sont dans Éléments envoyés.</p>',
  coince:['Outlook demande un compte : c’est ton adresse scolaire, celle qui finit par @arcampin.be.','Le message n’est pas dans la liste : regarde l’onglet Autres, juste au-dessus de la liste, ou tape le nom de ton professeur dans Rechercher.','La question du professeur est la phrase qui finit par un point d’interrogation.'],
  q:{serveur:true, type:'mixte', colle:true,
     activite:{type:'redaction', commun:true, zone:false, etiquette:'La question de mon professeur', q:'Recopie-la en entier, avec son point d’interrogation.',
       champs:[{cle:'questionProf', nom:'La question de ton professeur', aide:'Elle t’est rappelée à l’étape suivante, quand tu écris à ton camarade.', max:120}],
       controle:M1.erreurs(['questionProf']), reponse:d=>d.questionProf, bouton:'Garder cette question',
       juste:'Ta question est gardée. Une dernière question, juste en dessous.'},
     validation:{juste:'Tu as trouvé ce que ton professeur demande. À l’étape suivante, tu poses sa question à ton camarade.'}}},

 {partie:'D — Dans Outlook, pour de vrai', titre:'Rédiger dans le corps du message', min:8,
  veux:'Écrire un vrai message à un camarade tiré au sort, avec mon professeur en copie.',
  avant:'<aside class="repere correspondant"><b>🎲 Ton correspondant, tiré au sort</b><p class="corr-nom"><span data-rappel="corrNom">Pas encore de nom : le tirage se fait en classe, pendant la séance. Rien ne s’affiche après quelques secondes ? Demande à ton professeur à qui écrire.</span></p><p class="corr-adresse"><span data-rappel="corrAdresse"></span></p><p class="note">Un autre camarade a tiré ton nom : toi aussi, tu vas recevoir un message. Son prénom porte un accent ? Écris-le comme lui.</p></aside>',
  arrive:api=>M1.correspondant(api),
  gestes:[{geste:'Lis le nom et l’<b>adresse scolaire</b> de ton correspondant, dans l’encadré 🎲 juste au-dessus.', attention:'⚠️ N’utilise pas l’adresse fictive de Camille : tu écris à un vrai camarade.'},
   'Outlook ▸ onglet <b>Accueil</b> ▸ bouton bleu <b>Nouveau message</b> (touche N).',
   'Dans <b>À</b>, écris l’adresse de ton correspondant et choisis-la dans la liste proposée.',
   {geste:'Dans <b>Cc</b>, juste sous la ligne À, tape simplement le <b>nom</b> de ton professeur : '+PROF_M1+'. Outlook te propose plusieurs lignes : clique sur celle dont l’adresse finit par <b>@arcampin.be</b>. Pas une ligne marquée « Externe », pas une adresse en @arcampin.com ou @gmail.com.',
    sous:'<p class="note"><b>Pour écrire à n’importe quel professeur de l’école</b> : tape son nom dans À ou dans Cc, puis choisis dans la liste la ligne dont l’adresse finit par <b>@arcampin.be</b>. Outlook trouve son adresse tout seul : pas besoin de la connaître par cœur.</p>'},
   'Laisse <b>Cci</b> vide.',
   'Dans <b>Objet</b>, écris un titre court qui annonce ta question.',
   '<b>Clique dans la grande zone sous l’objet.</b> Écris « Bonjour », le prénom de ton correspondant avec une majuscule et une virgule (« Bonjour <span data-rappel="corrPrenom">Lucas</span>, »), puis passe à la ligne.',
   'Pose-lui <b>la question que ton professeur t’a posée</b> (étape 9) : <span class="rappel-question" data-rappel="questionProf">rouvre son message dans Outlook, Boîte de réception, pour la relire</span>. Passe à la ligne.',
   {geste:'Ajoute une <b>formule de fin</b>, puis ton prénom, ton nom et ta classe.', attention:'⚠️ Attention : n’envoie pas encore ! Tu relis d’abord, à l’étape suivante.'}],
  demos:{'6':['nouveau']},
  vois:'Dans Outlook, ton message est écrit, et pas encore envoyé.',
  extra:COTE(false)+'<details><summary>Voir les champs dans Outlook</summary><img loading="lazy" src="https://root75.github.io/campin-public/messagerie/pas-a-pas/capture.webp?v=20261110" alt="Vue adaptée d’Outlook : À, Cc, Objet et corps du message."><p>Vue adaptée à partir de la capture fournie.</p></details>',
  coince:['Je ne vois pas la ligne Cc : elle est juste sous la ligne À. Sinon, clique sur « Cc », à droite de la ligne À.','Outlook ne propose pas mon camarade : vérifie son adresse avec lui, lettre par lettre ; elle finit par @arcampin.be.','Je ne sais plus la question du professeur : rouvre son message dans Boîte de réception.'],
  q:{serveur:true}},

 {partie:'D — Dans Outlook, pour de vrai', titre:'Envoyer et retrouver son mail', min:4,
  veux:'Relire mon mail, corriger l’orthographe, l’envoyer, puis vérifier qu’il est bien parti.',
  avant:'<p>Avant l’envoi, relis ton mail dans Outlook.</p><ul class="controle"><li><b>À</b> : l’adresse de ton camarade.</li><li><b>Cc</b> : ton professeur, '+PROF_M1+', avec une adresse qui finit par @arcampin.be.</li><li><b>Objet</b> : il annonce ta question.</li><li>Le corps contient la salutation, la question du professeur, une formule de fin et ta signature (prénom, nom, classe).</li><li>Tu as relu l’orthographe : majuscule au début, point d’interrogation à la fin de ta question.</li></ul>'+COTE(true),
  gestes:['Cherche les mots <b>soulignés en rouge</b> dans ton mail : Outlook pense qu’ils sont mal écrits.',
   '<span class="droit">🖱️ Clic <b>DROIT</b></span> (le bouton de <b>droite</b> de la souris) sur un mot souligné ▸ <b>Orthographe</b> ▸ clique sur le bon mot proposé. Un prénom souligné ? Laisse-le, il est juste.',
   'Clique sur <b>Envoyer</b>.',
   'Clique sur <b>Éléments envoyés</b>, à gauche, et ouvre ton mail : ton professeur doit apparaître dans la ligne Cc. S’il est encore dans <b>Brouillons</b>, il n’est pas parti.',
   'Ton camarade te répond à l’étape 12. Pas de mail reçu chez lui ? Vérifiez ensemble <b>l’adresse dans la ligne À</b>.'],
  vois:'Dans Outlook, ton message est dans Éléments envoyés.',
  coince:['Mon mail est dans Brouillons : il n’est pas parti. Ouvre-le, puis clique sur Envoyer.','Mon camarade n’a rien reçu : comparez l’adresse de la ligne À avec son adresse scolaire, lettre par lettre.','J’ai oublié mon professeur en Cc : écris un nouveau message, avec lui en Cc cette fois.'],
  q:{serveur:true}},

 {partie:'D — Dans Outlook, pour de vrai', titre:'Répondre à son camarade', min:6,
  veux:'Répondre au mail reçu de mon camarade, avec « Répondre à tous » : mon professeur reste en copie.',
  avant:'<p>Ouvre le mail reçu de ton camarade.</p>'+COTE_REPONSE,
  gestes:['Lis <b>sa question</b> en entier.',
   'Clique sur <b>Répondre à tous</b> (et pas Répondre) : ton professeur reste en Cc et reçoit ta réponse.',
   'Garde l’<b>objet</b> de la conversation (« RE: »).',
   'Dans le corps, salue ton camarade puis <b>réponds à sa question</b> par une phrase complète.',
   'Ajoute une <b>formule de fin</b> et ta <b>signature</b>.',
   'Relis, envoie, et vérifie dans <b>Éléments envoyés</b>. Vérifie aussi que tu as reçu sa réponse à ton premier mail.'],
  vois:'Dans Outlook, ta réponse est dans Éléments envoyés.',
  extra:'<p class="note">Cette page ne voit pas Outlook. La vraie preuve, c’est ton professeur en Cc : il reçoit ton message et ta réponse.</p>',
  coince:['Je n’ai pas encore reçu le mail de mon camarade : il est peut-être à l’étape 10 ou 11. En attendant, relis ton message dans Éléments envoyés.','« Répondre à tous » est à côté de « Répondre » : une flèche double ↩↩, sous le message ou en haut à droite.','Le mail n’arrive toujours pas : vérifiez ensemble, dans ses Éléments envoyés, l’adresse de la ligne À.'],
  q:{serveur:true}}
];

const FIN = {
  titre:'Bravo pour ce parcours !',
  bulle:'Parcours terminé !',
  texte:'Ton professeur, en copie, a reçu ton message et ta réponse : il va les coter.',
  diplome:ctx=>M1.permis(ctx),
  revision:{titre:'Mon premier message — je révise ↗', texte:'Réponds aux questions, puis retourne les cartes mémoire.', url:'https://root75.github.io/campin-public/messagerie/'},
  citation:{texte:'Ce que l’on conçoit bien s’énonce clairement,\nEt les mots pour le dire arrivent aisément.', auteur:'Nicolas Boileau', source:'L’Art poétique, chant I (1674)', lien:'Un bon mail aussi : je sais ce que je veux dire, puis je l’écris simplement.'},
  plus:'Donne ton avis, juste au-dessus : trois phrases courtes. Bonus : agrandis le ruban d’Outlook. Le ruban, en haut, tient sur une seule ligne et ses boutons n’ont pas de nom ? Clique sur la petite flèche ˅ tout en bas à droite du ruban (« Changer de disposition ») : il s’agrandit, avec le nom sous chaque bouton. Si ton professeur te le propose, deviens aidant : va voir un camarade qui a sonné la cloche 🔔. Tu expliques avec des mots, tu ne touches pas sa souris.',
  lien:'<a href="https://root75.github.io/campin-public/messagerie/" target="_blank" rel="noopener">la page « Mon premier message — je révise »</a>'
};

if(typeof module!=='undefined') module.exports = { M1, BLOCS, FIN, COURS, PARTAGE, RAPPELS };
