#!/usr/bin/env node
/* Vérification automatique de chaque cours pas à pas, avant mise en ligne.

   node outils/verifier-cours.cjs                 tous les cours du catalogue (pas-a-pas/cours.json)
   node outils/verifier-cours.cjs rat-de-ville-6  un seul cours (ou plusieurs)
     --reseau        teste aussi les liens vers d'autres sites (signalés, jamais bloquants)
     --connus        réécrit outils/verifier-cours.connus.json avec les constats du jour
     --json <f>      écrit tous les constats dans un fichier

   Chaque étape de chaque cours est ouverte dans Chromium comme la voit un élève connecté qui y est arrivé
   (faux serveur : aucune donnée, aucun réseau ; le site est lu dans le dépôt local). Rien n'est propre à un
   cours : le catalogue dit quoi ouvrir, la page dit ce qu'elle contient.

   Ce qui est contrôlé, étape par étape :
     erreur        une erreur JavaScript, ou le bandeau rouge « Erreur dans la page »
     absent        un fichier du site demandé par la page et qui n'existe pas
     lien          un lien vers une page du site qui n'existe pas (ou une ancre absente)
     image         une image qui ne s'affiche pas
     etapes        le nombre d'étapes du catalogue ≠ celui de la page
     haut          au travail (étape 2 et suivantes), un bouton ou un lien affiché au-dessus de la tâche qui
                   n'est pas dans la liste HAUT_PERMIS (le « Retrouver mon document » de la PR 313)
     coince        une étape sans aucune réponse dans « Ça coince ? »
     deborde       un défilement horizontal à 375 px de large
   Et une mesure, sans échec : à quelle hauteur commence la tâche sur un écran de 1366 × 768.

   Un constat déjà accepté est écrit dans outils/verifier-cours.connus.json avec sa raison : seul un constat
   NOUVEAU fait échouer la vérification. Un constat connu qui a disparu est signalé, pour nettoyer la liste. */
const fs = require('node:fs'), path = require('node:path'), { execFile } = require('node:child_process');
const RACINE = path.resolve(__dirname, '..'), BASE = 'https://root75.github.io/campin-public/';
const CONNUS = path.join(__dirname, 'verifier-cours.connus.json');
const ECRAN = { width: 1366, height: 768 }, ETROIT = { width: 375, height: 700 };

/* Ce qui a le droit d'être affiché au-dessus de la tâche quand l'élève travaille (Vincent, 27/11/2026 :
   « haut de page minimal »). Tout le reste est un constat « haut ». */
const HAUT_PERMIS = [
  '.campin-menu > summary',      // ☰ Menu (replié)
  '#progres *',                  // les pastilles des étapes
  '#aide-btn', '#aide *',        // la cloche 🔔
  '#applis', '#applis *',        // la grille des applis
  '#humeur.faite *',             // le smiley de l'humeur choisie
  '#tresor', '#tresor *',        // le pot de classe
];

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.cjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif',
  '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.mp3': 'audio/mpeg' };

/* L'adresse d'un fichier du site → son chemin dans le dépôt, ou null s'il n'existe pas. */
function fichierLocal(adresse) {
  const u = new URL(adresse);
  let f = path.join(RACINE, decodeURIComponent(u.pathname.replace(/^\/campin-public\//, '')));
  if (!f.startsWith(RACINE)) return null;
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  return fs.existsSync(f) ? f : null;
}

/* Le faux serveur, posé dans la page avant ses scripts : etat() place l'élève à l'étape demandée, humeur déjà
   choisie ; toute autre fonction répond « rien ». Les noms appelés sont gardés dans window.__appels. */
function fauxServeur({ etape }) {
  window.__appels = [];
  const reponse = nom => nom === 'etat' ? { email: 'eleve.essai@arcampin.be', classe: 'Essai', humeur: 'Bien',
    atteint: etape - 1, position: etape, cases: {}, moi: {}, reponses: {} }
    : nom === 'etatAide' ? { active: false } : null;
  const fabrique = (ok, ko) => new Proxy({}, { get(_, nom) {
    if (nom === 'withSuccessHandler') return f => fabrique(f, ko);
    if (nom === 'withFailureHandler') return f => fabrique(ok, f);
    if (nom === 'withUserObject') return () => fabrique(ok, ko);
    if (typeof nom !== 'string') return undefined;
    return () => { window.__appels.push(nom); setTimeout(() => { if (ok) ok(reponse(nom)); }, 0); };
  } });
  window.google = { script: { run: fabrique(null, null),
    history: { push() {}, replace() {}, setChangeHandler() {} },
    url: { getLocation(f) { f({ hash: '', parameter: {}, parameters: {} }); } } } };
}

/* Dans la page : ce qu'on relève à une étape. */
function releve({ permis, base }) {
  const z = document.querySelector('#bloc');
  const haut = z ? z.getBoundingClientRect().top + scrollY : 0;
  const visible = e => e.checkVisibility({ visibilityProperty: true, opacityProperty: true, contentVisibilityAuto: true })
    && e.getBoundingClientRect().width > 0 && e.getBoundingClientRect().height > 0;
  const nom = e => (e.getAttribute('aria-label') || e.textContent || e.title || e.id || e.tagName).trim().replace(/\s+/g, ' ').slice(0, 50);
  const intrus = !z ? [] : [...document.querySelectorAll('a[href],button,summary,select,input,textarea')]
    .filter(e => !z.contains(e) && visible(e) && e.getBoundingClientRect().bottom + scrollY <= haut + 2
      && !permis.some(s => e.matches(s))).map(nom);
  return {
    blocs: (() => { try { return BLOCS.length; } catch (e) { return null; } })(),   // une fiche en erreur ne déclare pas BLOCS
    bandeau: [...document.querySelectorAll('body > p')].map(p => p.textContent).filter(t => /^⚠ Erreur dans la page/.test(t)).map(t => t.slice(0, 160)),
    haut: Math.round(haut), intrus: [...new Set(intrus)],
    liens: [...new Set([...document.querySelectorAll('a[href]')].map(a => a.href).filter(h => /^https?:/.test(h)))],
    images: [...document.images].filter(i => i.complete && !i.naturalWidth && i.getAttribute('src')).map(i => i.currentSrc || i.src).filter(u => u.startsWith(base)),
    coince: document.querySelector('#coince') ? document.querySelectorAll('#coince-liste li, #coince .aide-outils > *').length : null,
    fini: !!z && z.childElementCount > 0,
  };
}

const code = url => new Promise(ok => execFile('curl', ['-sS', '-L', '-o', '/dev/null', '-w', '%{http_code}', '--max-time', '20',
  '-A', 'Mozilla/5.0 (verification des liens)', url], (e, sortie) => ok(e ? 0 : Number(sortie) || 0)));

(async () => {
  const args = process.argv.slice(2), option = n => args.includes(n);
  const fichierJson = option('--json') ? args[args.indexOf('--json') + 1] : null;
  const demandes = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--json');
  const catalogue = JSON.parse(fs.readFileSync(path.join(RACINE, 'pas-a-pas/cours.json'), 'utf8')).cours;
  const cours = demandes.length ? catalogue.filter(c => demandes.includes(c.id)) : catalogue;
  const inconnus = demandes.filter(d => !catalogue.some(c => c.id === d));
  if (inconnus.length) { console.error('Cours absent du catalogue : ' + inconnus.join(', ')); process.exit(2); }

  let playwright; try { playwright = require('playwright'); } catch (e) { playwright = require('playwright-core'); }
  const navigateur = await playwright.chromium.launch(process.env.CHROME_CANAL ? { channel: process.env.CHROME_CANAL } : {});
  const constats = [], mesures = {}, externes = new Map();
  const note = (c, etape, type, detail) => { if (!constats.some(k => k.cours === c && k.type === type && k.detail === detail && k.etape === etape)) constats.push({ cours: c, etape, type, detail }); };

  for (const c of cours) {
    const adresse = BASE + c.chemin.replace(/\/?$/, '/');
    const hauteurs = []; let n = Math.max(1, Number(c.etapes) || 1), compte = false;
    for (let etape = 1; etape <= n; etape++) {
      const contexte = await navigateur.newContext({ viewport: ECRAN, locale: 'fr-BE', timezoneId: 'Europe/Brussels' });
      await contexte.route('**/*', r => {
        const u = r.request().url();
        if (!u.startsWith(BASE)) { if (r.request().resourceType() === 'image' && !externes.has(u)) externes.set(u, c.id + ' ' + etape); return r.abort(); }   // rien ne sort
        const f = fichierLocal(u);
        if (!f) { note(c.id, etape, 'absent', u.replace(BASE, '').replace(/[?#].*$/, '')); return r.fulfill({ status: 404, body: 'absent' }); }
        return r.fulfill({ status: 200, contentType: TYPES[path.extname(f).toLowerCase()] || 'application/octet-stream', body: fs.readFileSync(f) });
      });
      const page = await contexte.newPage();
      await page.addInitScript(fauxServeur, { etape });
      page.on('pageerror', e => note(c.id, etape, 'erreur', String(e.message).slice(0, 160)));
      try {
        await page.goto(adresse, { waitUntil: 'load', timeout: 30000 });
        await page.waitForFunction(() => { const z = document.querySelector('#bloc'); return z && z.childElementCount > 0; }, null, { timeout: 8000 }).catch(() => {});
        await page.waitForTimeout(250);
        const r = await page.evaluate(releve, { permis: HAUT_PERMIS, base: BASE });
        if (!r.fini) note(c.id, etape, 'erreur', 'l’étape ne s’affiche pas (zone #bloc vide)');
        r.bandeau.forEach(t => note(c.id, etape, 'erreur', t));
        r.images.forEach(i => note(c.id, etape, 'image', i.replace(BASE, '')));
        if (!compte && r.blocs !== null) { compte = true;
          if (r.blocs !== Number(c.etapes)) note(c.id, 0, 'etapes', 'catalogue : ' + c.etapes + ' étape(s) ; page : ' + r.blocs);
          n = Math.min(Math.max(n, r.blocs), 60); }
        if (r.coince === 0) note(c.id, etape, 'coince', '« Ça coince ? » est vide');
        if (etape >= 2) { hauteurs.push(r.haut); r.intrus.forEach(t => note(c.id, etape, 'haut', t)); }
        for (const l of r.liens) {
          if (!l.startsWith(BASE)) { if (!externes.has(l)) externes.set(l, c.id + ' ' + etape); continue; }
          const f = fichierLocal(l), ancre = decodeURIComponent(new URL(l).hash.slice(1));
          if (!f) note(c.id, etape, 'lien', l.replace(BASE, '') + ' : page absente');
          else if (ancre && /\.html$/.test(f) && !/^bloc=\d+$/.test(ancre) && path.resolve(f) !== path.resolve(fichierLocal(adresse) || '')
            && !new RegExp('id=["\']' + ancre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '["\']').test(fs.readFileSync(f, 'utf8')))
            note(c.id, etape, 'lien', l.replace(BASE, '') + ' : ancre absente de la page');
        }
        await page.setViewportSize(ETROIT); await page.waitForTimeout(120);
        const large = await page.evaluate(() => document.documentElement.scrollWidth);
        if (large > ETROIT.width + 1) note(c.id, etape, 'deborde', 'défilement horizontal à 375 px de large');   // sans le nombre de pixels : il dépend des polices de la machine
      } catch (e) { note(c.id, etape, 'erreur', 'la page ne s’ouvre pas : ' + String(e.message).split('\n')[0].slice(0, 120)); }
      await contexte.close();
    }
    hauteurs.sort((a, b) => a - b);
    mesures[c.id] = { etapes: n, haut: hauteurs.length ? { min: hauteurs[0], mediane: hauteurs[hauteurs.length >> 1], max: hauteurs[hauteurs.length - 1] } : null };
  }
  await navigateur.close();

  const signales = [];
  if (option('--reseau')) {
    const liste = [...externes.keys()]; let i = 0;
    await Promise.all(Array.from({ length: 6 }, async () => { while (i < liste.length) { const l = liste[i++], k = await code(l);
      // 401/403/429 : le site existe et refuse un robot ; seuls « introuvable » et « ne répond pas » sont signalés
      if (k === 0 || k === 404 || k === 410 || k >= 500) signales.push({ lien: l, code: k, vu: externes.get(l) }); } }));
  }

  /* Les constats connus : une clé « cours | type | détail » (sans le numéro d'étape, qui bouge) et sa raison. */
  const cle = k => [k.cours, k.type, k.detail].join(' | ');
  const connus = fs.existsSync(CONNUS) ? JSON.parse(fs.readFileSync(CONNUS, 'utf8')) : {};
  const groupes = new Map();
  for (const k of constats) { const g = groupes.get(cle(k)) || { ...k, etapes: [] }; if (k.etape) g.etapes.push(k.etape); groupes.set(cle(k), g); }
  if (option('--connus')) {
    const neuf = {}; [...groupes.keys()].sort().forEach(k => { neuf[k] = connus[k] || 'à trancher'; });
    Object.keys(connus).forEach(k => { if (!groupes.has(k) && demandes.length && !demandes.includes(k.split(' | ')[0])) neuf[k] = connus[k]; });
    fs.writeFileSync(CONNUS, JSON.stringify(neuf, null, 2) + '\n');
  }
  const nouveaux = [...groupes.values()].filter(g => !(cle(g) in connus));
  const disparus = Object.keys(connus).filter(k => !groupes.has(k) && cours.some(c => c.id === k.split(' | ')[0]));

  const lignes = [];
  lignes.push('Vérification des cours : ' + cours.length + ' cours, ' + Object.values(mesures).reduce((t, m) => t + m.etapes, 0) + ' étapes ouvertes.');
  lignes.push('');
  lignes.push('| Cours | Étapes | La tâche commence à (px, écran 1366 × 768) | Constats nouveaux | Connus |');
  lignes.push('|---|---|---|---|---|');
  for (const c of cours) { const m = mesures[c.id], g = [...groupes.values()].filter(x => x.cours === c.id);
    lignes.push('| ' + c.id + ' | ' + m.etapes + ' | ' + (m.haut ? m.haut.mediane + ' (de ' + m.haut.min + ' à ' + m.haut.max + ')' : '—') + ' | '
      + g.filter(x => !(cle(x) in connus)).length + ' | ' + g.filter(x => cle(x) in connus).length + ' |'); }
  const ecrit = (titre, liste) => { if (!liste.length) return; lignes.push('', titre);
    liste.forEach(g => lignes.push('- ' + g.cours + ' · ' + g.type + ' · ' + g.detail + (g.etapes && g.etapes.length ? ' (étape' + (g.etapes.length > 1 ? 's ' : ' ') + g.etapes.join(', ') + ')' : ''))); };
  ecrit('Constats nouveaux (à corriger, ou à accepter dans outils/verifier-cours.connus.json avec une raison) :', nouveaux);
  if (disparus.length) { lignes.push('', 'Constats connus qui ont disparu (à retirer de verifier-cours.connus.json) :'); disparus.forEach(k => lignes.push('- ' + k)); }
  if (option('--reseau')) { lignes.push('', 'Liens vers d’autres sites : ' + externes.size + ' testés, ' + signales.length + ' à regarder.');
    signales.forEach(s => lignes.push('- ' + s.lien + ' → ' + (s.code || 'pas de réponse') + ' (vu dans ' + s.vu + ')')); }
  console.log(lignes.join('\n'));
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, lignes.join('\n') + '\n');
  if (fichierJson) fs.writeFileSync(fichierJson, JSON.stringify({ mesures, constats, externes: [...externes.keys()], signales }, null, 1));
  process.exit(nouveaux.length && !option('--connus') ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });
