/* « Un coup de pouce en maths » du portail, joué de bout en bout dans Chromium : une question à la fois, le point de
   départ, « Refaire », « Choisir un autre cours », pour une 1re, une 2e, une 3e et la page publique.
   node outils/essai-portail-maths.cjs   (demande Playwright ; le fichier et les calculs : tests/portail-maths.cjs) */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const racine = path.join(__dirname, '..');
const t = JSON.parse(fs.readFileSync(path.join(racine, 'portail/maths.json'), 'utf8'));
const { calcule } = require('../tests/portail-maths.cjs');

(async () => {
  const { chromium } = require('playwright');
  const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.css': 'text/css' };
  const nav = await chromium.launch();
  try {
    /** Le portail comme le voit une classe : le faux serveur répond à portail() ; sans classe, la page publique. */
    const ouvre = async classe => {
      const page = await nav.newPage();
      await page.route('**/*', route => {
        const u = new URL(route.request().url());
        if (u.hostname !== 'root75.github.io') return route.abort();
        const f = path.join(racine, decodeURIComponent(u.pathname.replace(/^\/campin-public\//, '')).replace(/\/$/, '/index.html'));
        if (!f.startsWith(racine) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) return route.fulfill({ status: 404, body: '' });
        route.fulfill({ status: 200, contentType: types[path.extname(f)] || 'application/octet-stream', body: fs.readFileSync(f) });
      });
      if (classe) await page.addInitScript(c => {
        const run = { withSuccessHandler(f){ this.ok = f; return this; }, withFailureHandler(){ return this; },
          portail(){ const ok = this.ok; setTimeout(() => ok({ email: 'eleve.essai@arcampin.be', prenom: 'Essai', classe: c, mesCours: 'https://root75.github.io/campin-public/pas-a-pas/mes-cours.html', cours: [] }), 0); } };
        window.google = { script: { run } };
      }, classe);
      await page.goto('https://root75.github.io/campin-public/portail/?public');
      await page.waitForSelector('#maths:not([hidden])');
      return page;
    };
    const texte = page => page.locator('#maths-zone').innerText();
    /** Répond à la question affichée : juste, ou à côté. */
    const reponds = async (page, juste) => {
      const q = (await page.locator('.maths-question').innerText()).trim();
      const bon = String(calcule(q)).replace('-', '−');
      const choix = await page.locator('.maths-choix button').allInnerTexts();
      assert.equal(choix.length, 3); assert.ok(choix.includes(bon), q);
      await page.locator('.maths-choix button', { hasText: new RegExp('^' + (juste ? bon : choix.find(c => c !== bon)) + '$') }).click();
    };
    const khan = page => page.locator('#maths-zone a.bouton').getAttribute('href');

    // 1re : pas de question, son cours tout de suite.
    let page = await ouvre('1B');
    assert.match(await texte(page), /Ton cours de maths sur Khan Academy\s+1re année secondaire/);
    assert.equal(await khan(page), t.cours['1'].url);
    assert.equal(await page.locator('#maths-zone', { hasText: 'Refaire les questions' }).count(), 0);
    await page.close();

    // 3e : la première question à côté ▸ les révisions du CE1D ; aucun « faux », aucun score à l'écran.
    page = await ouvre('3F');
    assert.match(await texte(page), /Quelques questions, deux minutes\./);
    await page.getByRole('button', { name: 'Trouver mon point de départ' }).click();
    assert.match(await texte(page), /Question 1 · 4 au plus/);
    await reponds(page, false);
    assert.match(await texte(page), /Ton point de départ\s+Révisions pour le CE1D/);
    assert.equal(await khan(page), t.cours.ce1d.url);
    assert.doesNotMatch(await texte(page), /faux|erreur|score|\/ ?4|niveau/i);
    assert.equal(await page.locator('#maths-zone a.bouton').getAttribute('target'), '_blank');
    // Le point de départ est retrouvé à la visite suivante, dans ce navigateur.
    await page.reload(); await page.waitForSelector('#maths:not([hidden])');
    assert.match(await texte(page), /Ton point de départ\s+Révisions pour le CE1D/);
    // Refaire : quatre réponses justes ▸ le cours de 3e.
    await page.getByRole('button', { name: 'Refaire les questions' }).click();
    for (let i = 1; i <= 4; i++) { assert.match(await texte(page), new RegExp('Question ' + i + ' · 4 au plus')); await reponds(page, true); }
    assert.match(await texte(page), /Ton point de départ\s+3e année secondaire\s+Tu as les bases/);
    assert.equal(await khan(page), t.cours['3'].url);
    // Une question du second palier arrête encore vers le CE1D ; « Je ne sais pas encore » vaut une question qui résiste.
    await page.getByRole('button', { name: 'Refaire les questions' }).click();
    await reponds(page, true); await reponds(page, true);
    await page.getByRole('button', { name: 'Je ne sais pas encore' }).click();
    assert.equal(await khan(page), t.cours.ce1d.url);
    // Choisir un autre cours : les quatre cours, tous chez Khan Academy, puis retour.
    await page.getByRole('button', { name: 'Choisir un autre cours' }).click();
    assert.deepEqual(await page.locator('.maths-cours a').evaluateAll(l => l.map(a => a.href)), Object.values(t.cours).map(c => c.url));
    await page.getByRole('button', { name: 'Retour' }).click();
    assert.match(await texte(page), /Ton point de départ/);
    await page.close();

    // 2e : deux questions ; à côté ▸ le cours de 1re, tout juste ▸ le cours de 2e.
    page = await ouvre('2CB');
    await page.getByRole('button', { name: 'Trouver mon point de départ' }).click();
    assert.match(await texte(page), /Question 1 · 2 au plus/);
    await reponds(page, true); await reponds(page, false);
    assert.equal(await khan(page), t.cours['1'].url);
    await page.getByRole('button', { name: 'Refaire les questions' }).click();
    await reponds(page, true); await reponds(page, true);
    assert.equal(await khan(page), t.cours['2'].url);
    await page.close();

    // Page publique (aucune classe) : la tuile est là ; tout juste ▸ à l'élève de choisir son cours.
    page = await ouvre('');
    await page.getByRole('button', { name: 'Trouver mon point de départ' }).click();
    for (let i = 0; i < 4; i++) await reponds(page, true);
    assert.match(await texte(page), /Tu as les bases : choisis ton cours/);
    assert.equal(await page.locator('.maths-cours a').count(), 4);
    await page.close();
    console.log('essai-portail-maths : tout passe');
  } finally { await nav.close(); }
})().catch(e => { console.error(e); process.exit(1); });
