// Vues de démo communes (Vincent, 12/11/2026) : une vue = un seul code, dans pas-a-pas/demos-communs.js.
// Ce test garde la règle : l'ordre de chargement des pages, et pas de copie d'une vue commune dans un cours.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const racine=path.join(__dirname,'..');
const fichiers=(d,ext)=>fs.readdirSync(d,{withFileTypes:true}).flatMap(e=>{
  const p=path.join(d,e.name);
  if(e.isDirectory())return ['node_modules','.git'].includes(e.name)?[]:fichiers(p,ext);
  return p.endsWith(ext)?[p]:[];
});
let pages=0;
for(const html of fichiers(racine,'.html')){
  const s=fs.readFileSync(html,'utf8'),rel=path.relative(racine,html);
  const pos=n=>s.indexOf('pas-a-pas/'+n);
  // Les démos du cours : …/demos.js (adresse absolue ou relative) et pas-a-pas/demos-python.js.
  const srcs=[...s.matchAll(/<script[^>]*src="([^"?]*(?:\/|")?(?:demos|demos-python)\.js)[?"]/g)].map(m=>m[1]).filter(x=>/(^|\/)(demos|demos-python)\.js$/.test(x));
  for(const src of srcs){
    const fichier=src.startsWith('https://root75.github.io/campin-public/')?path.join(racine,src.slice('https://root75.github.io/campin-public/'.length)):path.join(path.dirname(html),src);
    const code=fs.readFileSync(fichier,'utf8'),ici=s.indexOf('src="'+src);
    assert.ok(pos('demo-lecteur.js')>=0&&pos('demo-lecteur.js')<ici,rel+' : demo-lecteur.js avant '+src);
    if(/DemosCommuns/.test(code)){
      assert.ok(pos('demos-communs.js')>pos('demo-lecteur.js')&&pos('demos-communs.js')<ici,rel+' : demos-communs.js entre le lecteur et '+src);
      pages++;
    }
  }
}
assert.ok(pages>=9,'au moins neuf pages sur les vues communes ('+pages+')');
// Pas de copie d'une vue commune dans le demos.js ou le style d'un cours.
// À MIGRER vers demos-communs.js (liste à vider, jamais à allonger). Vidée le 12/11/2026 : Classroom, Chrome, gaufre, Windows.
const A_MIGRER=[];
for(const f of fichiers(racine,'.js').concat(fichiers(racine,'.css'),fichiers(racine,'.html'))){
  const rel=path.relative(racine,f);
  if(rel.startsWith('pas-a-pas/demos-communs')||rel.startsWith('tests/')||A_MIGRER.includes(rel))continue;
  const s=fs.readFileSync(f,'utf8');
  assert.ok(!/\.md-ch-(onglets|menu|corps)\{/.test(s),rel+' : style de la vue Chrome recopié (il est dans demos-communs.js)');
  assert.ok(!/\.ol-[a-z-]+\{/.test(s),rel+' : style d’une vue Outlook recopié (il est dans demos-communs.js)');
  assert.ok(!/\.md-cr-(carte|picker|dialogue|piece|menu)\{/.test(s),rel+' : style du devoir Classroom recopié (il est dans demos-communs.js)');
  assert.ok(!/\.md-(win-barre|win-start-menu|pmenu|apps|gaufre-ico|gaufre|taches|demarrer)\{/.test(s),rel+' : style de Windows, du profil Chrome ou de la gaufre recopié (il est dans demos-communs.js)');
  if(/\.js$/.test(rel)){
    assert.ok(!/'md-cr-(carte|picker|dialogue)'/.test(s),rel+' : maquette du devoir Classroom recopiée (DemosCommuns.devoir)');
    assert.ok(!/'md-(win-barre|win-start-menu|apps|pmenu|taches)'/.test(s),rel+' : maquette de Windows, de la gaufre ou du profil Chrome recopiée (vues win-bureau, g-gaufre, ch-nouvel)');
    assert.ok(!/'md-ch-onglets'/.test(s),rel+' : fenêtre de Chrome recopiée (DemosCommuns.chrome)');
  }
  if(/demos\.js$/.test(rel))assert.ok(!/nouvelle vue fractionnée/.test(s),rel+' : menu de la vue fractionnée recopié (DemosCommuns.vueFractionnee)');
}
console.log('OK : vues de démo communes — '+pages+' pages les chargent dans le bon ordre, aucune copie dans un cours.');
