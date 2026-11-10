const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const base=__dirname+'/../messagerie/pas-a-pas/';
const s=fs.readFileSync(base+'fiche.js','utf8');const proofs=JSON.parse(fs.readFileSync(base+'preuves.json'));
const x=vm.createContext({module:{exports:{}},Map,console});vm.runInContext(s,x);const {verifie,regle}=x.module.exports;
const good={locale:'camille.martin',domaine:'example.org',a:'camille.martin@example.org',objet:'Une question sur tes loisirs',salutation:'Bonjour Camille,',message:'Quel sport ou quel loisir pratiques-tu ?',fin:'Bonne journée,',nom:'Lina Dupont',classe:'2B',signature:'Lina Dupont, 2B',reponse:'Bonjour Camille, Je pratique le dessin. Bonne journée, Lina Dupont, 2B',erreur1:'Il manque un @',erreur2:'Il faut enlever un espace',erreur3:'Le domaine est différent : example.org est attendu.'};
for(const k of Object.keys(good).filter(k=>!['nom','classe'].includes(k)))assert.equal(verifie(k,good),'',k);
for(const [k,v] of Object.entries({a:'camille.martin@example.net',objet:'Bonjour Camille, quel sport pratiques-tu ?',salutation:'Bonjour Monsieur (ou Bonjour Madame)',message:'Le sport.',signature:'Lina, 2B',reponse:'football',erreur1:'rien',erreur2:'rien',erreur3:'net est interdit'}))assert.notEqual(verifie(k,{...good,[k]:v}),'',k);
const positives=[good.a,good.a,good.objet,good.salutation,good.message,good.fin+' | '+good.signature,good.objet,'Répondre','Bienvenue dans ta boîte de l’école','Corps du message','Éléments envoyés','Répondre à tous'];
assert.equal(proofs.blocs.length,12);
for(let i=0;i<12;i++){assert.ok(regle(proofs.blocs[i][0].regle,positives[i]),'preuve '+(i+1));assert.ok(!regle(proofs.blocs[i][0].regle,'n’importe quoi'),'preuve négative '+(i+1));}
// Règle anti-recopie : les preuves 8 à 12 ont 3 variantes du même type, chacune avec sa bonne réponse ; la réponse d'une variante ne valide pas les deux autres.
const variantes={7:['Répondre','RE :','À'],8:['Bienvenue dans ta boîte de l’école','vlouviaux@arcampin.be','Quelle matière préfères-tu cette année, et pourquoi ?'],9:['Corps du message','objet','la ligne Cc'],10:['Éléments envoyés','Brouillons','Envoyer'],11:['Répondre à tous','Boîte de réception','au-dessus']};
for(const [i,bons] of Object.entries(variantes)){const l=proofs.blocs[i];assert.equal(l.length,3,'3 variantes bloc '+(+i+1));assert.equal(new Set(l.map(v=>v.q)).size,3);
  l.forEach((v,k)=>{assert.ok(v.aide&&v.faux,'aide/faux '+i+'.'+k);bons.forEach((b,j)=>assert.equal(regle(v.regle,b),j===k,'bloc '+(+i+1)+' v'+(k+1)+' / '+b));});}
// Match deployed server normalization and 190-character truncation.
// Compatibility fixture: deployed generic proof evaluator.
vm.runInContext("function regle_(r, rep, email) {\n  const n = norm_(rep);\n  if (!n) return false;\n  if (r.sauf && new RegExp(r.sauf).test(n)) return false;\n  if (r.egal && !r.egal.some(function (x) { return norm_(x) === n; })) return false;\n  if (r.exact && r.exact.indexOf(rep.trim().toLowerCase()) < 0) return false;\n  if (r.contient && !r.contient.some(function (x) { return n.indexOf(norm_(x)) >= 0; })) return false;\n  if (r.motif && !new RegExp(r.motif).test(n)) return false;\n  if (r.prenom && email) {\n    // \u00ab marie-eve.dupont@\u2026 \u00bb : Marie-\u00c8ve, Marie Eve ou Marie suffisent.\n    const mots = function (s) { return s.replace(/-/g, ' ').split(' ').filter(Boolean); };\n    const p = mots(norm_(email.split('@')[0].split('.')[0])), m = mots(n);\n    const dans = function (a, b) { return a.every(function (x) { return b.indexOf(x) >= 0; }); };\n    if (!dans(m, p) && !dans(p, m)) return false;\n  }\n  return true;\n}\n\n/** Comme norm() dans les fiches : accents, majuscules, guillemets, points et espaces ignor\u00e9s. */\nfunction norm_(s) {\n  return String(s || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase()\n    .replace(/[\u2019']/g, \"'\").replace(/[\u00ab\u00bb\"\u201c\u201d.]/g, '').replace(/\\s+/g, ' ').trim();\n}\n\n",x);
for(let i=0;i<12;i++){x.rule=proofs.blocs[i][0].regle;x.answer=positives[i].slice(0,190);assert.equal(vm.runInContext('regle_(rule,answer,"")',x),true,'serveur '+i);}
for(const [i,bons] of Object.entries(variantes))proofs.blocs[i].forEach((v,k)=>{x.rule=v.regle;x.answer=bons[k];assert.equal(vm.runInContext('regle_(rule,answer,"")',x),true,'serveur variante '+i+'.'+k);});
// Simulate server responses: fail closed, duplicate suppression, changed-response retry.
assert.match(verifie('reponse',{...good,reponse:'Coucou Camille, je pratique le dessin. Bonne journée, Lina Dupont, 2B'}),/salutation du modèle/);
assert.match(verifie('reponse',{...good,reponse:'Bonjour Camille, je suis en vacances demain. Bonne journée, Lina Dupont, 2B'}),/question de Camille/);
assert.match(verifie('reponse',{...good,reponse:'Bonjour Camille, je pratique le dessin le mercredi. Lina Dupont, 2B'}),/formule de fin/);
assert.match(verifie('salutation',{...good,salutation:'Coucou Camille'}),/salutation du modèle/);
for(const [sal,motif] of [['bonjour Camille,',/majuscule : « Bonjour »/],['Bonjour camille,',/prénom prend une majuscule/],['Bonjour Camille',/virgule/],['Bonjour,',/écris le prénom/],['Bonjour Lucas,',/Salue Camille/],['Salut Camille,',/^$/],['Bonjour Camille, ça va ?',/seulement la salutation/]])assert.match(verifie('salutation',{...good,salutation:sal}),motif,sal);
assert.match(verifie('reponse',{...good,reponse:'bonjour camille, je pratique le dessin. Bonne journée, Lina Dupont, 2B'}),/majuscule/);
(async()=>{vm.runInContext('preuves='+JSON.stringify(proofs)+';Object.assign(state,'+JSON.stringify(good)+');',x);await vm.runInContext('valideServeur(0)',x);assert.ok(s.includes('dejaValide.get(e)===reponse'));assert.ok(s.includes('document.getElementById(\'suivant\').disabled)return'));assert.ok(s.includes("actuel?.q!==q.q"));console.log('OK : validations des champs, 12 preuves locales/serveur, réponses incorrectes rejetées.');})().catch(e=>{console.error(e);process.exitCode=1});

// Reprise au bloc 8 sur un autre poste : sans brouillon local, le prénom et le nom se redemandent au bloc 8.
assert.ok(/nomSiManquant\(\)\+champ\('reponse'/.test(s), 'bloc 8 : la case prénom et nom apparaît quand le brouillon manque');
assert.match(verifie('reponse',{...good,nom:'',reponse:'Bonjour Camille, je pratique le dessin le mercredi. Bonne journée, Lina Dupont, 2B'}),/juste au-dessus de ta réponse/);

// La barre des étapes : une pastille par étape, à la place du compteur et de la ligne de progression.
{
  const page = fs.readFileSync(__dirname + '/../messagerie/pas-a-pas/index.html', 'utf8');
  assert.ok(/<nav class="progres nav" id="pastilles"/.test(page), 'la page porte la barre des étapes');
  assert.ok(/<progress id="barre"[^>]*hidden/.test(page) && /<p id="compteur" hidden>/.test(page), 'l’ancienne ligne est cachée');
  assert.ok(/function pastilles\(e\)/.test(s) && /\n pastilles\(e\);/.test(s), 'fiche.js dessine les pastilles à chaque étape');
  assert.ok(/n\.disabled=i>state\.atteint/.test(s), 'on ne saute pas une étape non validée');
}

// La grille du message coté : un tableau sur 5 à l'étape 10, rappelé à l'étape 11 avant l'envoi ; l'étape 12 a sa grille sur 5.
{
  const grille = s.match(/const COTE=\(rappel=false\)=>`([\s\S]*?)<\/aside>`;/)[1];
  const points = [...grille.matchAll(/<td>(\d)<\/td>/g)].map(m => Number(m[1]));
  assert.equal(points.length, 5); assert.equal(points.reduce((a, x) => a + x, 0), 5, 'grille sur 5');
  assert.ok(/if\(e===9\)h\+=[^\n]*COTE\(\)/.test(s), 'étape 10 : la grille');
  assert.ok(/if\(e===10\)h\+=[^\n]*COTE\(true\)/.test(s), 'étape 11 : la grille rappelée avant Envoyer');
  // L'étape 12 (la réponse, par Répondre à tous) est cotée sur 5 elle aussi, avec sa propre grille.
  const reponse = s.match(/const COTE_REPONSE=\(\)=>`([\s\S]*?)<\/aside>`;/)[1];
  const pts = [...reponse.matchAll(/<td>(\d)<\/td>/g)].map(m => Number(m[1]));
  assert.equal(pts.length, 5); assert.equal(pts.reduce((a, x) => a + x, 0), 5, 'grille de la réponse sur 5');
  assert.match(reponse, /Répondre à tous/); assert.match(reponse, /RE:/);
  assert.ok(/if\(e===11\)h\+=[^\n]*COTE_REPONSE\(\)/.test(s), 'étape 12 : la grille de la réponse');
  assert.ok(!/n’est pas cotée/.test(s), 'plus aucune mention « pas cotée » dans la fiche');
}

// Le panneau de droite suit ce que l'élève tape : à l'étape 8, sa réponse à Camille.
assert.ok(/function apercuCote\(\)/.test(s) && !/innerHTML=apercu\(\);/.test(s), 'le panneau de droite passe par apercuCote()');
assert.ok(/state\.etape===7[\s\S]{0,700}escapeHtml\(state\.reponse\)/.test(s), 'étape 8 : le panneau montre la réponse en cours');

// Blocs ouverts (cadenas) : Messagerie 01 reçoit le plafond du serveur, comme le moteur commun.
{
  const seq = fs.readFileSync(__dirname + '/../messagerie/pas-a-pas/sequence.js', 'utf8');
  assert.ok(/if\(o\.plafond\) o\.plafond\(m && m\.plafond\)/.test(seq), 'sequence.js transmet le plafond reçu avec moment()');
  assert.ok(/plafond:recoitPlafond/.test(s) && /const p=etat\.plafond/.test(s), 'fiche.js lit le plafond d’etat() et l’offre à sequence.js');
  assert.ok(/const enPause=\(\)=>!!plafond&&!APERCU&&plafond\.bloc<TITRES\.length&&state\.etape>=plafond\.bloc&&state\.etape>=state\.atteint/.test(s), 'même règle que blocs.js');
}

// Étapes 9 à 12 : une case à cocher par consigne (les listes numérotées de l'étape deviennent des cases).
assert.ok(/function casesAGestes\(z,e\)/.test(s) && /z\.innerHTML=h;\n casesAGestes\(z,e\);/.test(s), 'les consignes des étapes Outlook portent une case');

// La vue d'Outlook est une image à part, demandée à l'ouverture du volet : plus de capture.js (1,28 Mo) au chargement.
{
  const dossier = __dirname + '/../messagerie/pas-a-pas/';
  const lire = f => fs.readFileSync(dossier + f, 'utf8');
  assert.ok(fs.existsSync(dossier + 'capture.webp') && !fs.existsSync(dossier + 'capture.js'), 'capture.webp remplace capture.js');
  assert.ok(fs.statSync(dossier + 'capture.webp').size < 500000, 'capture.webp reste sous 500 Ko');
  assert.ok(!/capture\.js/.test(lire('index.html')), 'la page ne charge plus capture.js');
  for (const f of ['fiche.js', 'visuels.js']) assert.ok(!/\bCAPTURE\b(?!_URL)/.test(lire(f)), f + ' ne lit plus la variable CAPTURE');
  assert.ok(/<img loading="lazy" src="[^"]*capture\.webp/.test(lire('fiche.js')), 'étape 10 : image chargée à l’ouverture du volet');
  console.log('OK : vue Outlook en image séparée, chargée à la demande.');
}
