/* Le lanceur d'applis : sur le portail et sur chaque cours du catalogue, « Mes cours » en premier, neuf tuiles Google, puis quatre tuiles Microsoft 365. */
const fs = require('node:fs'), path = require('node:path'), assert = require('node:assert/strict');
const racine = path.join(__dirname, '..');
const js = fs.readFileSync(path.join(racine, 'assets/lanceur.js'), 'utf8');
const SCRIPT = '<script defer src="https://root75.github.io/campin-public/assets/lanceur.js"></script>';
const pages = JSON.parse(fs.readFileSync(path.join(racine, 'pas-a-pas/cours.json'), 'utf8')).cours.map(c => c.chemin + 'index.html');
pages.push('pas-a-pas/modele/index.html');
for (const p of new Set(pages)) assert.ok(fs.readFileSync(path.join(racine, p), 'utf8').includes(SCRIPT), `${p} charge le lanceur`);
const applis = js.match(/const APPLIS = \[([\s\S]*?)\n\];/)[1].split('\n').filter(l => l.trim().startsWith('['));
assert.equal(applis.length, 9, 'neuf tuiles : la grille reste carrée');
assert.match(applis[0], /^\s*\["Mes cours", EXEC, "https:\/\/root75\.github\.io\/campin-public\/assets\/logo-campin\.png"/);
// Sous la grille Google, la rangée Microsoft 365 du compte de l'école : quatre tuiles, icônes servies par le site.
const microsoft = js.match(/const MICROSOFT = \[([\s\S]*?)\n\];/)[1].split('\n').filter(l => l.trim().startsWith('['));
assert.deepEqual(microsoft.map(l => l.match(/\["([^"]+)"/)[1]), ['Outlook', 'OneDrive', 'Word', 'Excel']);
for (const l of microsoft) {
  const [, url, ico] = l.match(/\["[^"]+", "([^"]+)", ICO \+ "([^"]+)"\]/);
  assert.match(url, /^https:\/\/((outlook|word|excel)\.cloud\.microsoft|arcampinbe-my\.sharepoint\.com)\//, `${url} : une adresse Microsoft 365 de l'école`);
  assert.ok(fs.existsSync(path.join(racine, 'assets/applis', ico)), `${ico} est dans assets/applis/`);
}
assert.match(js, /target="_top"/, "les liens sortent de l'iframe Apps Script");
console.log(`Lanceur d'applis : ${new Set(pages).size} cours et le portail, « Mes cours » en premier, neuf tuiles Google et quatre Microsoft 365.`);
