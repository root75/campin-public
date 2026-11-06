/* Catalogue public : métadonnées de cours uniquement, jamais des autorisations ou réponses.
 * Exécutable aussi dans Node pour vérifier le fichier avant publication. */
(function(root){
  const BASE='https://root75.github.io/campin-public/';
  function valider(data){
    if(!data || data.version!==1 || !Array.isArray(data.cours) || !data.cours.length || data.cours.length>200)
      throw Error('Le catalogue doit contenir une liste de cours (version 1).');
    if(Object.keys(data).some(k=>!['version','cours'].includes(k))) throw Error('Champ de catalogue inconnu.');
    const ids=new Set();
    const cours=data.cours.map(c=>{
      if(!c || typeof c!=='object' || Object.keys(c).some(k=>!['id','titre','chemin','etapes','preuves','cases','criteres'].includes(k)))
        throw Error('Métadonnées de cours invalides.');
      if(typeof c.id!=='string' || !/^[a-z][a-z0-9-]{0,63}$/.test(c.id) || ids.has(c.id)) throw Error('Identifiant absent, invalide ou répété.');
      if(typeof c.titre!=='string' || !c.titre.trim() || c.titre.length>150 || /[\x00-\x1f]/.test(c.titre)) throw Error('Titre de cours invalide.');
      if(typeof c.chemin!=='string' || !/^(?:[a-z0-9][a-z0-9_-]*\/)+$/.test(c.chemin)) throw Error('La fiche doit être un dossier de campin-public.');
      if(!Number.isInteger(c.etapes) || c.etapes<1 || c.etapes>500) throw Error('Nombre d’étapes invalide.');
      if(c.preuves!==undefined && (typeof c.preuves!=='string' || !/^(?:[a-z0-9][a-z0-9_-]*\/)*[a-z0-9][a-z0-9_-]*\.json$/.test(c.preuves)))
        throw Error('Chemin du fichier de preuves invalide.');
      // Formatif : « cases » = { id d'étape : nombre de cases } ; mêmes règles que validerCatalogue_ dans Code.gs.
      if(c.cases!==undefined){const k=c.cases&&typeof c.cases==='object'&&!Array.isArray(c.cases)?Object.keys(c.cases):[];
        if(!k.length||k.length>50||k.some(e=>!/^[1-9]\d?$/.test(e)||!Number.isInteger(c.cases[e])||c.cases[e]<1||c.cases[e]>50))throw Error('Cases du formatif invalides.');}
      if(c.criteres!==undefined&&(!Number.isInteger(c.criteres)||c.criteres<1||c.criteres>20))throw Error('Nombre de critères invalide.');
      ids.add(c.id);
      const out={id:c.id,titre:c.titre.trim(),chemin:c.chemin,etapes:c.etapes};
      if(c.preuves!==undefined) out.preuves=c.preuves;
      if(c.cases!==undefined) out.cases=Object.assign({},c.cases);
      if(c.criteres!==undefined) out.criteres=c.criteres;
      return out;
    });
    const dataValidee={version:1,cours};
    if(encodeURIComponent(JSON.stringify(dataValidee)).replace(/%[A-F\d]{2}/g,'x').length>80000) throw Error('Catalogue trop volumineux.');
    return dataValidee;
  }
  async function charger(frais=false){
    const url=BASE+'pas-a-pas/cours.json'+(frais?'?catalogue='+Date.now():'');
    const r=await fetch(url,{cache:frais?'no-store':'default'});
    if(!r.ok)throw Error('Le catalogue publié ne se charge pas.');
    return valider(await r.json());
  }
  const api={BASE,valider,charger};
  if(typeof module!=='undefined' && module.exports)module.exports=api;
  else root.CatalogueCours=api;
})(globalThis);
