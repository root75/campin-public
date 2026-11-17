/* Messagerie 01 — la fiche est en DONNÉES sur le moteur commun pas-a-pas/blocs.js (depuis le 16/11/2026).
   Ici : les contrôles du mail d'entraînement, l'accord entre la fiche et preuves.json, la forme des blocs.
   Le parcours dans Chromium : campin-pedagogique/outils/pas-a-pas/essai-messagerie-01.js. */
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const pareil=(a,b,m)=>assert.equal(JSON.stringify(a),JSON.stringify(b),m);   // les objets de la fiche viennent d'un autre contexte (vm)
const base=__dirname+'/../messagerie/pas-a-pas/';
const s=fs.readFileSync(base+'fiche.js','utf8'),page=fs.readFileSync(base+'index.html','utf8');
const proofs=JSON.parse(fs.readFileSync(base+'preuves.json'));
const moteur=fs.readFileSync(__dirname+'/../pas-a-pas/blocs.js','utf8');
const stock=new Map();
const x=vm.createContext({module:{exports:{}},Map,console,localStorage:{getItem:k=>stock.has(k)?stock.get(k):null,setItem:(k,v)=>stock.set(k,v)}});
vm.runInContext(s,x);
const {M1,BLOCS,FIN,COURS,PARTAGE,RAPPELS}=x.module.exports;
const verifie=(k,d)=>M1.verifie(k,d,d.classe);
const good={locale:'camille.martin',domaine:'example.org',a:'camille.martin@example.org',objet:'Une question sur tes loisirs',salutation:'Bonjour Camille,',message:'Quel sport ou quel loisir pratiques-tu ?',fin:'Bonne journée,',nom:'Lina Dupont',classe:'2B',signature:'Lina Dupont, 2B',reponse:'Bonjour Camille, Je pratique le dessin. Bonne journée, Lina Dupont, 2B',questionProf:'Quel est ton sport préféré ?'};

// Les contrôles du mail d'entraînement, champ par champ.
for(const k of Object.keys(good).filter(k=>!['nom','classe'].includes(k)))assert.equal(verifie(k,good),'',k);
for(const [k,v] of Object.entries({locale:'camille',domaine:'@example.org',a:'camille.martin@example.net',objet:'Bonjour Camille, quel sport pratiques-tu ?',salutation:'Bonjour Monsieur (ou Bonjour Madame)',message:'Le sport.',signature:'Lina, 2B',reponse:'football',questionProf:''}))assert.notEqual(verifie(k,{...good,[k]:v}),'',k);
assert.match(verifie('reponse',{...good,reponse:'Coucou Camille, je pratique le dessin. Bonne journée, Lina Dupont, 2B'}),/salutation du modèle/);
assert.match(verifie('reponse',{...good,reponse:'Bonjour Camille, je suis en vacances demain. Bonne journée, Lina Dupont, 2B'}),/question de Camille/);
assert.match(verifie('reponse',{...good,reponse:'Bonjour Camille, je pratique le dessin le mercredi. Lina Dupont, 2B'}),/formule de fin/);
assert.match(verifie('reponse',{...good,reponse:'bonjour camille, je pratique le dessin. Bonne journée, Lina Dupont, 2B'}),/majuscule/);
assert.match(verifie('salutation',{...good,salutation:'Coucou Camille'}),/salutation du modèle/);
for(const [sal,motif] of [['bonjour Camille,',/majuscule : « Bonjour »/],['Bonjour camille,',/prénom prend une majuscule/],['Bonjour Camille',/virgule/],['Bonjour,',/écris le prénom/],['Bonjour Lucas,',/Salue Camille/],['Salut Camille,',/^$/],['Bonjour Camille, ça va ?',/seulement la salutation/]])assert.match(verifie('salutation',{...good,salutation:sal}),motif,sal);
// La classe : celle de la séance, sinon celle écrite dans la signature.
assert.equal(M1.verifie('signature',good,''),'','sans classe connue : lue dans la signature');
assert.notEqual(M1.verifie('signature',{...good,signature:'Lina Dupont'},''),'','sans classe nulle part : demandée');
assert.notEqual(M1.verifie('signature',{...good,signature:'Lina Dupont, 2F'},'2B'),'','la classe de la séance fait foi');

/* Bloc 8 (12/11/2026) : tous les critères manquants sont donnés ensemble, pas un par un ; la liste se coche pendant la frappe. */
{const crit=(d)=>M1.criteresReponse(d.reponse,d,d.classe);
 const tous=crit({...good,reponse:'bonjour, je pratique le dessin tous les mercredis après-midi.'}).filter(c=>c.err);
 assert.equal(tous.length,4,'bloc 8 : salutation, fin, signature et classe signalées en même temps');
 assert.equal(crit(good).filter(c=>c.err).length,0,'bloc 8 : une bonne réponse coche les cinq critères');
 assert.equal(crit(good).length,5,'bloc 8 : cinq critères');
 assert.match(verifie('reponse',{...good,nom:'',reponse:'Bonjour Camille, je pratique le dessin le mercredi. Bonne journée, Lina Dupont, 2B'}),/juste au-dessus de ta réponse/);
 const q=BLOCS[7].q;
 assert.ok(q.serveur&&q.type==='mixte'&&q.ouvre&&q.activite.type==='redaction'&&q.activite.commun&&q.activite.zone.cle==='reponse'&&typeof q.activite.criteres==='function','bloc 8 : la réponse (critères en direct), puis la preuve du serveur');
 assert.equal(q.activite.criteres(good.reponse,good,{classe:'2B'}).filter(c=>c.err).length,0);
 // Reprise sur un autre poste : sans brouillon, le prénom et le nom se redemandent au bloc 8.
 assert.ok(q.activite.champs.some(c=>c.cle==='nom'&&c.siVide),'bloc 8 : le nom est redemandé quand il manque');}

// La forme des blocs : 12, comme au catalogue ; chacun a son but, son « À vérifier », son « Ça coince ? » et sa preuve du serveur.
{const cat=JSON.parse(fs.readFileSync(__dirname+'/../pas-a-pas/cours.json','utf8')).cours.find(c=>c.id===COURS);
 assert.equal(BLOCS.length,12);assert.equal(cat.etapes,12);assert.equal(cat.preuves,'messagerie/pas-a-pas/preuves.json');assert.equal(proofs.blocs.length,12);
 BLOCS.forEach((B,i)=>{assert.ok(B.partie&&B.titre&&B.min>0&&B.veux&&B.vois,'bloc '+(i+1)+' : partie, titre, durée, but, à vérifier');
  assert.ok(Array.isArray(B.coince)&&B.coince.length>=2,'bloc '+(i+1)+' : « Ça coince ? »');assert.ok(B.q&&B.q.serveur===true,'bloc '+(i+1)+' : preuve corrigée par le serveur');});
 pareil(BLOCS.map(B=>B.titre),['Observer un email','Choisir le destinataire','Donner un objet','Saluer','Rédiger la demande','Terminer et signer','Relire le mail complet','Répondre au message reçu','Ouvrir et lire dans Outlook','Rédiger dans le corps du message','Envoyer et retrouver son mail','Répondre à son camarade'],'les 12 étapes gardent leur place : les progressions enregistrées restent valables');
 for(let i=0;i<7;i++)assert.ok(BLOCS[i].q.type==='redaction'&&BLOCS[i].q.commun&&BLOCS[i].q.zone===false,'bloc '+(i+1)+' : un champ du mail, dans l’état partagé');
 pareil(BLOCS[6].q.champs.map(c=>c.cle),['a','objet','salutation','message','fin','nom','signature'],'bloc 7 : tout le mail se relit et se corrige');
 assert.ok(BLOCS[8].q.type==='mixte'&&BLOCS[8].q.activite.champs[0].cle==='questionProf','bloc 9 : la question du professeur est recopiée');
 assert.ok(FIN.titre&&FIN.texte&&FIN.citation&&FIN.revision,'écran de fin');}

// La fiche et preuves.json : ce que la fiche envoie pour un bon mail est accepté par la règle du serveur (même évaluateur que Code.gs).
vm.runInContext("function regle_(r, rep, email) {\n  const n = norm_(rep);\n  if (!n) return false;\n  if (r.sauf && new RegExp(r.sauf).test(n)) return false;\n  if (r.egal && !r.egal.some(function (x) { return norm_(x) === n; })) return false;\n  if (r.exact && r.exact.indexOf(rep.trim().toLowerCase()) < 0) return false;\n  if (r.contient && !r.contient.some(function (x) { return n.indexOf(norm_(x)) >= 0; })) return false;\n  if (r.motif && !new RegExp(r.motif).test(n)) return false;\n  if (r.prenom && email) {\n    // \u00ab marie-eve.dupont@\u2026 \u00bb : Marie-\u00c8ve, Marie Eve ou Marie suffisent.\n    const mots = function (s) { return s.replace(/-/g, ' ').split(' ').filter(Boolean); };\n    const p = mots(norm_(email.split('@')[0].split('.')[0])), m = mots(n);\n    const dans = function (a, b) { return a.every(function (x) { return b.indexOf(x) >= 0; }); };\n    if (!dans(m, p) && !dans(p, m)) return false;\n  }\n  return true;\n}\n\n/** Comme norm() dans les fiches : accents, majuscules, guillemets, points et espaces ignor\u00e9s. */\nfunction norm_(s) {\n  return String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()\n    .replace(/[\u2019']/g, \"'\").replace(/[\u00ab\u00bb\"\u201c\u201d.]/g, '').replace(/\\s+/g, ' ').trim();\n}\n\n",x);
const regle=(r,rep)=>{x.rule=r;x.answer=String(rep).slice(0,190);return vm.runInContext('regle_(rule,answer,"")',x);};
{const mauvais={...good,a:'camille.martin@example.net',locale:'camille',objet:'Bonjour',salutation:'Coucou',message:'Le sport.',fin:'Tchao',signature:'Lina'};
 for(let i=0;i<7;i++){const q=BLOCS[i].q,r=proofs.blocs[i][0].regle;
  assert.equal(proofs.blocs[i].length,1,'bloc '+(i+1)+' : une seule règle');
  assert.equal(q.controle('',good,{classe:'2B'}).length,0,'bloc '+(i+1)+' : un bon mail passe le contrôle de la page');
  assert.ok(regle(r,q.reponse(good,'',{classe:'2B',refus:false})),'bloc '+(i+1)+' : la réponse envoyée est acceptée par le serveur');
  assert.ok(q.controle('',mauvais,{classe:'2B'}).length>0,'bloc '+(i+1)+' : un mauvais mail est refusé dans la page');
  assert.ok(!regle(r,'n’importe quoi'),'bloc '+(i+1)+' : le serveur refuse n’importe quoi');}
 assert.equal(BLOCS[6].q.controle('',mauvais,{classe:'2B'}).length,6,'bloc 7 : les six champs fautifs nommés ensemble');
 assert.equal(BLOCS[6].q.reponse(mauvais,'',{classe:'2B',refus:true}),'a,objet,salutation,message,fin,signature','bloc 7 : un refus nomme les champs au Journal');}
// Règle anti-recopie : les preuves 8 à 12 ont 3 variantes du même type, chacune avec sa bonne réponse ; la réponse d'une variante ne valide pas les deux autres.
const variantes={7:['Répondre','RE :','À'],8:['Bienvenue dans ta boîte de l’école','vlouviaux@arcampin.be','Quelle matière préfères-tu cette année, et pourquoi ?'],9:['Corps du message','objet','la ligne Cc'],10:['Éléments envoyés','Brouillons','Envoyer'],11:['Répondre à tous','Boîte de réception','au-dessus']};
for(const [i,bons] of Object.entries(variantes)){const l=proofs.blocs[i];assert.equal(l.length,3,'3 variantes bloc '+(+i+1));assert.equal(new Set(l.map(v=>v.q)).size,3);
  l.forEach((v,k)=>{assert.ok(v.aide&&v.faux,'aide/faux '+i+'.'+k);bons.forEach((b,j)=>assert.equal(regle(v.regle,b),j===k,'bloc '+(+i+1)+' v'+(k+1)+' / '+b));});}
// La réponse ne quitte pas preuves.json : ni question ni message de refus recopiés dans la fiche ou la page.
{const fuites=proofs.blocs.flat().filter(v=>(s+page).includes(v.q)||(v.faux&&(s+page).includes(v.faux)));
 assert.equal(fuites.length,0,'question ou refus de preuves.json recopié dans la fiche : '+(fuites[0]||{}).q);}

// L'état partagé : l'aperçu en direct, les rappels, le brouillon de l'ancienne fiche.
{const h=PARTAGE.apercu(good,1,{classe:'2B'});
 assert.ok(/Mon mail se construit/.test(h)&&['camille.martin@example.org','Une question sur tes loisirs','Bonjour Camille,','Lina Dupont, 2B'].every(t=>h.includes(t)),'aperçu : le mail d’entraînement');
 const r=PARTAGE.apercu(good,7,{classe:'2B'});
 assert.ok(/Ma réponse se construit/.test(r)&&r.includes('RE : Une question sur tes loisirs')&&r.includes('Je pratique le dessin'),'aperçu au bloc 8 : la réponse à Camille, objet repris');
 assert.ok(!PARTAGE.apercu({...good,objet:'<img src=x onerror=alert(1)>'},1,{}).includes('<img'),'aperçu : ce que l’élève tape est affiché comme du texte');
 assert.ok(PARTAGE.apercu({},0,{}).includes('…'),'aperçu vide : des points de suspension');
 assert.equal(RAPPELS.prof({}, {classe:'2E'}),'Michiels');assert.equal(RAPPELS.prof({}, {classe:'2B'}),'Louviaux');assert.equal(RAPPELS.prof({}, {classe:''}),'');
 assert.equal(RAPPELS.signature(good,{classe:'2B'}),'Lina Dupont, 2B');assert.equal(RAPPELS.prenom(good),' Lina');assert.equal(RAPPELS.prenom({}),'');
 // Avant le 16/11/2026, la fiche gardait le brouillon sous « messagerie-01-v20261103:<adresse> » : il est relu une fois.
 stock.set('messagerie-01-v20261103:lina.dupont@arcampin.be',JSON.stringify({...good,etape:7,atteint:7,coches:{8:[0,1]},preuve:'x'}));
 const d=PARTAGE.depart('lina.dupont@arcampin.be');
 assert.ok(d.objet===good.objet&&d.nom==='Lina Dupont'&&d.reponse===good.reponse&&!('etape' in d)&&!('preuve' in d),'ancien brouillon : les champs du mail reviennent, pas l’avancement (il vient du serveur)');
 pareil(PARTAGE.depart('autre@arcampin.be'),{},'ancien brouillon : rien pour un autre élève');
 for(const m of ['function lisPartage','PARTAGE.depart','PARTAGE.apercu','Q.commun','Q.criteres','c.siVide','B.q.ouvre','typeof SEQUENCE'])assert.ok(moteur.includes(m),'moteur commun : '+m);}

// La page : le modèle commun, sans moteur propre.
{assert.ok(/pas-a-pas\/blocs\.js\?v=/.test(page)&&/pas-a-pas\/cloche\.js/.test(page)&&/pas-a-pas\/phrase-fin\.js/.test(page),'la page charge le moteur commun');
 assert.ok(page.indexOf('messagerie/pas-a-pas/fiche.js?')<page.indexOf('pas-a-pas/blocs.js?'),'la fiche (données) avant le moteur');
 assert.ok(/id="apercu-direct"/.test(page)&&/id="progres"/.test(page)&&/id="coince"/.test(page)&&/id="memo"/.test(page),'aperçu en direct, barre des blocs, « Ça coince ? », repères');
 assert.ok(!/function render|function pastilles|valideServeur|google\.script/.test(s),'fiche.js ne porte plus de moteur : des données et des contrôles');
 assert.ok(/const SEQUENCE = \{ contenus:true, classe:'messagerie-scene' \}/.test(s),'mode séquence commun : textes de sequences.json, habillage des visuels');
 assert.ok(/messagerie\/pas-a-pas\/visuels\.js/.test(page),'la page charge les visuels des moments collectifs');
 assert.ok(!/src="(?!https:\/\/root75\.github\.io\/)[^"]+\.js/.test(page),'adresses absolues : la page est aussi servie par Apps Script');}

// Le code commun que la Messagerie 01 a fait naître : plafond, « On écrit ensemble », tri du tableau, visuels.
{
  const seq = fs.readFileSync(__dirname + '/../pas-a-pas/sequence-eleve.js', 'utf8');
  assert.ok(/if\(o\.plafond\) o\.plafond\(m && m\.plafond\)/.test(seq), 'sequence-eleve.js transmet le plafond reçu avec moment()');
  // « On écrit ensemble » (15/11/2026) : sans `saisie` envoyée par le serveur, la page la lit dans sequences.json —
  // sinon l'élève reçoit « Tape 1 à 3 mots » sans la mise en situation.
  assert.ok(/\(m\.saisie \|\| \(support\(m\) \|\| \{\}\)\.saisie\) === "texte"/.test(seq), 'sequence-eleve.js lit saisie:"texte" dans sequences.json');
  // Tableau (15/11/2026) : les réponses écrites suivent l'ordre des champs, pas l'ordre alphabétique du serveur.
  {
    const tab = fs.readFileSync(__dirname + '/../pas-a-pas/tableau.js', 'utf8');
    const corps = tab.match(/const rang = (x => \{[^\n]*\});\n\s*mots\.sort\(([^\n]*)\);/);
    assert.ok(corps, 'tableau.js trie les réponses écrites par champ');
    const m = { champs: ['Salutation', 'Formule de fin', 'Signature'] };
    const mots = [{ texte: 'Formule de fin : Amitié', n: 1 }, { texte: 'Salutation : Salut Léo,', n: 1 },
      { texte: 'Signature : Vincent', n: 1 }, { texte: 'Salutation : Bonjour Léo,', n: 3 }];
    const rang = eval(corps[1]); mots.sort(eval('(a, b) => ' + corps[2].replace(/^\(a, b\) => /, '')));
    assert.deepStrictEqual(mots.map(x => x.texte), ['Salutation : Bonjour Léo,', 'Salutation : Salut Léo,', 'Formule de fin : Amitié', 'Signature : Vincent']);
  }
  // Mode séquence commun (12/11/2026) : plus de copie propre au cours.
  assert.ok(!fs.existsSync(__dirname + '/../messagerie/pas-a-pas/sequence.js'), 'plus de sequence.js propre à la Messagerie 01');
  const page = fs.readFileSync(__dirname + '/../messagerie/pas-a-pas/index.html', 'utf8');
  assert.ok(/pas-a-pas\/sequence-eleve\.js/.test(page) && !/messagerie\/pas-a-pas\/sequence\.js/.test(page), 'la page charge le mode séquence commun');
  const seqData = JSON.parse(fs.readFileSync(__dirname + '/../pas-a-pas/sequences.json', 'utf8'))['messagerie-1'];
  // « Quelle adresse pose problème ? » : le vote commun (16/11/2026), plus d'écran propre à cases à cocher.
  const adr = seqData.moments.find(x => x.titre === 'Quelle adresse pose problème ?');
  assert.ok(adr.type === 'vote' && adr.choix.join('|') === 'À utiliser|À écarter' && adr.situations.length === 4 && adr.situations.every(x => x.explication), 'le vote sur les adresses : deux choix, quatre adresses, une explication chacune');
  assert.ok(!/coche/i.test(adr.question) && !/ECRANS_SEQUENCE|ecrans *:/.test(s), 'plus d’écran propre : la consigne ne parle plus de cases, la fiche ne déclare aucun écran');
  // Depuis le 14/11 : « observe le mail » et « une adresse en trois parties » passent par le moteur commun, avec un visuel.
  const mo = t => seqData.moments.find(x => x.titre === t);
  assert.ok(mo('Avant d’écrire : observe le mail').visuel === 'email' && !s.includes("'Avant d’écrire : observe le mail':"), 'observe le mail : visuel « email », plus d’écran propre');
  const dom = mo('Une adresse en trois parties');
  assert.ok(dom.visuel === 'adresse' && dom.saisie === 'texte' && dom.champs.join() === 'Domaine' && !s.includes("'Une adresse en trois parties':"), 'le domaine : réponse écrite commune, visuel « adresse »');
  const vis = fs.readFileSync(__dirname + '/../messagerie/pas-a-pas/visuels.js', 'utf8');
  assert.ok(/window\.Visuels=Object\.assign\(window\.Visuels\|\|\{\},\{adresse,email,sms\}\)/.test(vis) && !/MessagerieVisuels/.test(vis), 'visuels.js s’inscrit au registre commun Visuels');
  // 17/11 : « Du message au mail » (le message du téléphone devient un mail) remplace « Choisir l’outil » — même rang, la Bascule reste le moment 13.
  const sms = mo('Du message au mail');
  assert.ok(seqData.moments.indexOf(sms) === 4 && seqData.moments.length === 13 && !seqData.moments.some(m => /Choisir l’outil/.test(m.titre)), 'Du message au mail : cinquième moment, treize moments en tout');
  assert.ok(sms.type === 'mots' && sms.saisie === 'texte' && sms.visuel === 'sms' && sms.champs.length === 1 && sms.correction.length === 4 && sms.lignes.length, 'Du message au mail : réponse écrite, visuel « sms », version texte et correction');
  assert.ok(/function sms\(/.test(vis) && /window\.MessagerieEnvol=envol/.test(vis) && /prefers-reduced-motion/.test(vis), 'visuels.js : le téléphone, l’enveloppe, et pas d’animation pour qui n’en veut pas');
  // L’enveloppe : le mail d’entraînement s’envole à l’étape 7, la réponse de Camille s’ouvre à l’étape 8, qui clôt la première partie.
  assert.ok(typeof BLOCS[6].fete === 'function' && typeof BLOCS[7].fete === 'function' && BLOCS.filter(B => B.fete).length === 2, 'une fête aux étapes 7 et 8 seulement');
  assert.doesNotThrow(() => { BLOCS[6].fete(); BLOCS[7].fete(); }, 'sans visuels.js, la fête ne casse rien');
  assert.ok(/<details class="enveloppe"><summary>[\s\S]*<\/summary><div class="email">[\s\S]*<\/div><\/details>$/.test(BLOCS[7].avant), 'étape 8 : le message de Camille est dans une enveloppe à ouvrir');
  assert.ok(/typeof BLOCS\[ici\]\.fete==="function"/.test(fs.readFileSync(__dirname + '/../pas-a-pas/blocs.js', 'utf8')), 'le moteur appelle la fête du bloc à sa première réussite');
  for (const f of ['tableau.js', 'sequence-eleve.js'])
    assert.ok(!/MessagerieVisuels|'domaine'|value *===? *["'][a-z0-9-]+["']/.test(fs.readFileSync(__dirname + '/../pas-a-pas/' + f, 'utf8')),
      f + ' : aucun test sur le nom d’un cours');
}

// La grille du message coté : un tableau sur 5 au bloc 10, rappelé au bloc 11 avant l'envoi ; le bloc 12 a sa grille sur 5.
{const points=h=>[...h.matchAll(/<td>(\d)<\/td>/g)].map(m=>Number(m[1]));
 for(const [i,champ] of [[9,'extra'],[10,'avant'],[11,'avant']]){const p=points(BLOCS[i][champ]);assert.equal(p.length,5,'bloc '+(i+1)+' : cinq lignes');assert.equal(p.reduce((a,v)=>a+v,0),5,'bloc '+(i+1)+' : grille sur 5');}
 assert.match(BLOCS[10].avant,/Avant d’envoyer/);assert.match(BLOCS[11].avant,/Répondre à tous/);assert.match(BLOCS[11].avant,/RE:/);
 assert.ok(!/n’est pas cotée/.test(s),'plus aucune mention « pas cotée » dans la fiche');}

// La vue d'Outlook est une image à part, demandée à l'ouverture du volet.
{assert.ok(fs.existsSync(base+'capture.webp')&&!fs.existsSync(base+'capture.js'),'capture.webp remplace capture.js');
 assert.ok(fs.statSync(base+'capture.webp').size<500000,'capture.webp reste sous 500 Ko');
 assert.ok(/<details><summary>Voir les champs dans Outlook<\/summary><img loading="lazy" src="[^"]*capture\.webp/.test(BLOCS[9].extra),'bloc 10 : image chargée à l’ouverture du volet');}

/* Bloc 9 → 10 (12/11/2026) : la question du professeur est recopiée, puis rappelée ; « n'envoie pas » en avertissement. */
{const g=BLOCS[9].gestes;
 assert.ok(g.some(c=>/data-rappel="questionProf"/.test(c.geste||c)),'bloc 10 : la question recopiée au bloc 9 est rappelée');
 assert.ok(/n’envoie pas encore/.test(g[g.length-1].attention)&&/adresse fictive de Camille/.test(g[0].attention),'bloc 10 : deux avertissements ⚠️, hors des cases');
 pareil(BLOCS[9].demos,{'6':['nouveau']},'bloc 10 : démo Nouveau message sous la case Objet');
 assert.ok(/Dans <b>Objet<\/b>/.test(g[5]),'bloc 10 : la 6e case est celle de l’objet');}

// Blocs 9 à 12 (dans le vrai Outlook) : une case à cocher par consigne, au moins un mot-clé en gras par case (Vincent, 13/11/2026).
// Un « ne fais pas » = un encadré ⚠️ à côté du geste, jamais dans le texte d'une case (règle du 12/11/2026).
{const cases=BLOCS.slice(8).flatMap(B=>B.gestes.map(c=>c.geste||c));
 pareil(BLOCS.slice(8).map(B=>B.gestes.length),[5,9,5,6],'les cases des blocs 9 à 12');
 const interdit=/(?:^|[.;:!?]\s+)(?:Ne|N[’'])\s?\S+ (?:pas|jamais|ni|aucun|rien)/,sansB=c=>c.replace(/<[^>]+>/g,'').replace(/\s+/g,' ').trim();
 cases.forEach(c=>{assert.ok(/<b[\s>]/.test(c),'case sans mot en gras : '+sansB(c).slice(0,70));
  assert.ok(!/<b[^>]*>[^<]*<span data-rappel/.test(c),'pas de rappel dans un gras : '+sansB(c).slice(0,70));
  assert.ok(!interdit.test(sansB(c))&&!/^⚠|class="attention"/.test(sansB(c)+c),'une interdiction dans une case : '+sansB(c).slice(0,70));});}
console.log('OK : Messagerie 01 sur le moteur commun — contrôles, 12 preuves, état partagé, cases, page.');
