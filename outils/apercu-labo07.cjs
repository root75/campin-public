// Aperçu local uniquement : adapte les URL absolues nécessaires à Apps Script.
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),base='https://root75.github.io/campin-public/';
const server=http.createServer((req,res)=>{
  const u=new URL(req.url,'http://localhost');
  let file=path.resolve(root,'.'+decodeURIComponent(u.pathname));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory()) file=path.join(file,'index.html');
  try{
    const ext=path.extname(file),mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.css':'text/css','.wasm':'application/wasm','.png':'image/png'}[ext]||'application/octet-stream';
    const raw=fs.readFileSync(file);
    res.writeHead(200,{'Content-Type':mime+'; charset=utf-8','Cache-Control':'no-store'});
    res.end(['.html','.js','.json','.css'].includes(ext)?raw.toString().replaceAll(base,'/'):raw);
  }catch{res.writeHead(404).end('Introuvable');}
});
server.listen(Number(process.env.LABO07_PORT)||8077,'127.0.0.1',()=>console.log(`Aperçu sans suivi : http://127.0.0.1:${server.address().port}/labo-07/pas-a-pas/#bloc=1`));
