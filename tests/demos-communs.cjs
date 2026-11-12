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
  const s=fs.readFileSync(html,'utf8');
  const pos=n=>{const m=s.indexOf('/pas-a-pas/'+n);return m;};
  const cours=[...s.matchAll(/campin-public\/([\w-]+\/pas-a-pas)\/demos\.js/g)].map(m=>m[1]);
  for(const c of cours){
    const src=fs.readFileSync(path.join(racine,c,'demos.js'),'utf8');
    const ici=s.indexOf(c+'/demos.js');
    assert.ok(pos('demo-lecteur.js')>=0&&pos('demo-lecteur.js')<ici,path.relative(racine,html)+' : demo-lecteur.js avant '+c+'/demos.js');
    if(/DemosCommuns/.test(src)){
      assert.ok(pos('demos-communs.js')>pos('demo-lecteur.js')&&pos('demos-communs.js')<ici,path.relative(racine,html)+' : demos-communs.js entre le lecteur et '+c+'/demos.js');
      pages++;
    }
  }
}
assert.ok(pages>=5,'au moins cinq pages sur les vues communes ('+pages+')');
// Pas de copie d'une vue commune dans le demos.js ou le style d'un cours.
// À MIGRER vers demos-communs.js (liste à vider, jamais à allonger) : la maquette Chrome des fiches Python et de « Se connecter ».
const A_MIGRER=['pas-a-pas/python-missions.css','se-connecter/demos.css'];
for(const f of fichiers(racine,'.js').concat(fichiers(racine,'.css'),fichiers(racine,'.html'))){
  const rel=path.relative(racine,f);
  if(rel.startsWith('pas-a-pas/demos-communs')||rel.startsWith('tests/')||A_MIGRER.includes(rel))continue;
  const s=fs.readFileSync(f,'utf8');
  assert.ok(!/\.md-ch-(onglets|menu|corps)\{/.test(s),rel+' : style de la vue Chrome recopié (il est dans demos-communs.js)');
  assert.ok(!/\.ol-[a-z-]+\{/.test(s),rel+' : style d’une vue Outlook recopié (il est dans demos-communs.js)');
  if(/demos\.js$/.test(rel))assert.ok(!/nouvelle vue fractionnée/.test(s),rel+' : menu de la vue fractionnée recopié (DemosCommuns.vueFractionnee)');
}
console.log('OK : vues de démo communes — '+pages+' pages les chargent dans le bon ordre, aucune copie dans un cours.');
