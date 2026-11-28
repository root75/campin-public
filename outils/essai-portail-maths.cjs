/* « Un coup de pouce en maths » du portail, ouvert dans Chromium pour une 1re, une 2e, une 3e et la page publique :
   chaque classe voit droit son cours de Khan Academy, sans question ni score.
   node outils/essai-portail-maths.cjs   (demande Playwright ; le fichier lui-même : tests/portail-maths.cjs) */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const racine = path.join(__dirname, '..');
const t = JSON.parse(fs.readFileSync(path.join(racine, 'portail/maths.json'), 'utf8'));

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
    const liens = (page, sel) => page.locator('#maths-zone ' + sel).evaluateAll(l => l.map(a => a.href));
    const url = (...ids) => ids.map(c => t.cours[c].url);
    /** Ce que voit une classe : ses cours en gros boutons, puis les autres derrière « Voir les autres cours ». */
    const verifie = async (classe, miens, titre) => {
      const page = await ouvre(classe);
      assert.match(await texte(page), new RegExp('^' + titre));
      assert.deepEqual(await liens(page, 'a.bouton'), url(...miens), classe);
      assert.deepEqual(await liens(page, 'a'), url(...miens), classe + ' : rien d’autre au départ');
      assert.ok(await page.locator('#maths-zone a').evaluateAll(l => l.every(a => a.target === '_blank' && a.rel === 'noopener')));
      // Ni question, ni score, ni niveau : un lien direct et un encouragement.
      assert.doesNotMatch(await texte(page), /question|score|niveau|faux|\?/i);
      const lu = await texte(page);
      assert.ok(lu.includes('en plus de ton cours de maths') && t.encouragements.some(m => lu.includes(m)), 'une phrase d’encouragement');
      await page.getByRole('button', { name: 'Voir les autres cours' }).click();
      assert.deepEqual((await liens(page, 'a')).sort(), Object.values(t.cours).map(c => c.url).sort(), classe + ' : tous les cours après le clic');
      assert.deepEqual(await liens(page, 'a.bouton'), url(...miens));
      await page.close();
    };
    await verifie('1B', ['1'], 'Ton cours de maths sur Khan Academy');
    await verifie('2CB', ['2', 'ce1d'], 'Tes cours de maths sur Khan Academy');
    await verifie('3F', ['3'], 'Ton cours de maths sur Khan Academy');

    // Page publique (aucune classe) : la tuile est là, avec tous les cours.
    const page = await ouvre('');
    assert.match(await texte(page), /^Choisis ton cours sur Khan Academy/);
    assert.equal((await liens(page, 'a')).length, Object.keys(t.cours).length);
    assert.equal(await page.getByRole('button', { name: 'Voir les autres cours' }).count(), 0);
    await page.close();
    console.log('essai-portail-maths : tout passe');
  } finally { await nav.close(); }
})().catch(e => { console.error(e); process.exit(1); });
