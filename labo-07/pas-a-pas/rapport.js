/* Aide à la production : ne lit ni Google Docs ni Classroom, ne stocke aucun document. */
(function(){
  const dialog=document.getElementById('rapport'),trame=document.getElementById('trame-rapport');
  const copier=document.getElementById('copier-trame'),statut=document.getElementById('rapport-statut');
  document.getElementById('rapport-btn').addEventListener('click',()=>dialog.showModal());
  fetch('https://root75.github.io/campin-public/labo-07/pas-a-pas/trame-rapport.txt?v=gimp-20261104')
    .then(r=>{if(!r.ok)throw Error('chargement');return r.text();})
    .then(t=>{trame.value=t;copier.disabled=false;})
    .catch(()=>{statut.textContent='La trame ne se charge pas. Ouvre le lien « Trame en texte brut » ci-dessous pour la sélectionner et la copier.';});
  copier.addEventListener('click',async()=>{
    try{await navigator.clipboard.writeText(trame.value);statut.textContent='Trame copiée. Dans ton document, colle-la avec Édition ▸ Coller sans mise en forme (Ctrl + Shift + V).';}
    catch{trame.focus();trame.select();statut.textContent='Copie automatique indisponible : le texte est sélectionné. Utilise Ctrl + C, puis Ctrl + Shift + V dans ton document.';}
  });
  /* Le même bouton dans l'étape « Préparer mon rapport » : la fiche est redessinée à chaque étape, d'où la délégation. */
  document.addEventListener('click',async e=>{
    const b=e.target.closest('[data-copier-trame]');if(!b)return;
    const s=b.parentElement.querySelector('.trame-statut')||statut;
    const repli='Copie impossible : clique sur le lien « Trame en texte brut » ▸ Ctrl + A ▸ Ctrl + C.';
    if(!trame.value){s.textContent=repli;return;}
    try{await navigator.clipboard.writeText(trame.value);s.textContent='✅ Trame copiée. Dans ton document : Édition ▸ Coller sans mise en forme (Ctrl + Shift + V).';}
    catch{s.textContent=repli;}
  });
})();
