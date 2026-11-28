/* « Un coup de pouce en maths » du portail, ouvert dans Chromium pour une 1re, une 2e, une 3e et la page publique :
   chaque classe voit droit son cours de Khan Academy et joue, dans la tuile, l'échauffement d'un chapitre de son année
   (tiré au sort, « Un autre chapitre » en donne un autre). Aucun score.
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
    /** Le texte de la tuile, sans l'échauffement (joué plus bas). */
    const texte = page => page.locator('#maths-zone').evaluate(z => { const c = z.cloneNode(true); c.querySelectorAll('.maths-exo').forEach(e => e.remove()); return c.textContent.trim(); });
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
      assert.doesNotMatch(await texte(page), /score|niveau|faux|point/i);
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

    // L'échauffement, joué dans la tuile par une 1re, une 2e et une 3e : un chapitre de son cours tiré au sort, une
    // question à la fois, un indice si ça coince, l'explication quand c'est trouvé, puis ce chapitre chez Khan Academy.
    for (const classe of ['1B', '2CB', '3F']) {
      const liste = t.exercices[classe[0]], variantes = new Map(liste.flatMap(e => e.questions).flatMap(q => q.variantes).map(x => [x.q, x]));
      const p = await ouvre(classe), boite = p.locator('.maths-exo');
      const titre = async () => (await boite.locator('.maths-exo-titre').innerText()).trim();
      assert.match(await boite.innerText(), /^Pour t.échauffer/);
      // « Un autre chapitre » : toujours un chapitre de l'année, jamais celui qu'on quitte.
      let dernier = await titre(); const vus = new Set([dernier]);
      for (let i = 0; i < 12; i++) {
        const avant = await titre();
        await boite.getByRole('button', { name: 'Un autre chapitre' }).click();
        dernier = await titre();
        assert.notEqual(dernier, avant); assert.ok(liste.some(e => e.titre === dernier), dernier); vus.add(dernier);
      }
      assert.ok(vus.size >= 4, classe + ' : le sort change de chapitre (' + vus.size + ')');
      const exo = liste.find(e => e.titre === dernier), n = exo.questions.length;
      const vues = [];
      const joue = async () => {
        for (let i = 1; i <= n; i++) {
          assert.ok((await boite.innerText()).includes(exo.titre + ' · question ' + i + ' sur ' + n));
          const q = (await boite.locator('.maths-question').innerText()).trim(); vues.push(q);
          const choix = (await boite.locator('.maths-choix button').allInnerTexts()).map(c => c.trim());
          const x = variantes.get(q); assert.ok(x, 'énoncé du fichier : ' + q);
          assert.deepEqual(choix.slice().sort(), x.choix.slice().sort(), q);
          const bon = x.reponse, autre = choix.find(c => c !== bon);
          const clic = c => boite.locator('.maths-choix button').nth(choix.indexOf(c)).click();
          if (i === 1) {   // à côté d'abord : un indice, pas de « faux », et on peut réessayer
            await clic(autre);
            assert.match(await boite.locator('.maths-retour').innerText(), /^Pas encore\. /);
            assert.equal(await boite.getByRole('button', { name: /Question suivante|Terminer/ }).count(), 0);
          }
          await clic(bon);
          assert.ok((await boite.locator('.maths-retour').innerText()).trim().startsWith('Oui ! ' + x.explication), q);
          await boite.getByRole('button', { name: i < n ? 'Question suivante' : 'Terminer' }).click();
        }
      };
      await boite.getByRole('button', { name: 'Essayer ' + n + ' questions' }).click();
      await joue();
      assert.match(await boite.innerText(), /Bravo/);
      assert.doesNotMatch(await boite.innerText(), /score|sur \d|point|\d\s*\/\s*\d/i);
      assert.equal(await boite.locator('a.bouton').getAttribute('href'), exo.suite);
      assert.equal(await boite.locator('a.bouton').getAttribute('target'), '_blank');
      // Recommencer : d'autres nombres à chaque question.
      const premier = vues.slice();
      await boite.getByRole('button', { name: 'Recommencer avec d\'autres nombres' }).click();
      vues.length = 0; await joue();
      for (let i = 0; i < n; i++) assert.notEqual(vues[i], premier[i]);
      // Depuis la fin, un autre chapitre : on revient à une invitation.
      await boite.getByRole('button', { name: 'Un autre chapitre' }).click();
      assert.match(await p.locator('.maths-exo').innerText(), /^Pour t.échauffer/); assert.notEqual(await titre(), exo.titre);
      // Rien n'est gardé : ni dans le navigateur, ni ailleurs.
      assert.equal(await p.evaluate(() => Object.keys(localStorage).filter(k => /math/i.test(k)).length), 0);
      await p.close();
    }

    // Page publique (aucune classe) : la tuile est là, avec tous les cours.
    const page = await ouvre('');
    assert.match(await texte(page), /^Choisis ton cours sur Khan Academy/);
    assert.equal((await liens(page, 'a')).length, Object.keys(t.cours).length);
    assert.equal(await page.getByRole('button', { name: 'Voir les autres cours' }).count(), 0);
    assert.equal(await page.locator('.maths-exo').count(), 0, 'sans classe connue, pas d’échauffement');
    await page.close();
    console.log('essai-portail-maths : tout passe');
  } finally { await nav.close(); }
})().catch(e => { console.error(e); process.exit(1); });
