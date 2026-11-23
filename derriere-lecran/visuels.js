/* Derrière l'écran — les visuels des moments collectifs (champ « visuel » d'un moment, pas-a-pas/sequences.json).
   Chargé après emotions.js, par le tableau du professeur et par la page du cours (écrans sur les postes).
   « roue-emotions » : la roue cliquable et, à côté, les huit personnages avec leurs nuances. Tout tient dans
   l'écran projeté, quelle que soit sa taille : la roue se règle sur la hauteur, la légende passe dessous si c'est étroit. */
(() => {
  if (typeof window === 'undefined' || !window.Emotions) return;
  const style = document.createElement('style');
  style.textContent = `
.vr{display:flex;flex-wrap:wrap;gap:clamp(6px,2vh,24px) clamp(12px,3vw,48px);align-items:center;justify-content:center;width:100%;text-align:left}
.vr .emo-roue{flex:0 1 auto;width:min(100%,46vh,34rem);min-width:min(100%,11rem);gap:.8vh}
.vr .emo-roue.emo-choix .emo-part{opacity:.6}
.vr .emo-disque{max-width:none}
.vr .emo-detail{font-size:clamp(1rem,2.2vh,1.5rem);min-height:2.5em;text-align:center}
.vr-legende{flex:1 1 20rem;max-width:44rem;margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,15rem),1fr));gap:clamp(4px,1.4vh,14px) clamp(10px,2vw,28px)}
.vr-legende li{display:grid;grid-template-columns:auto minmax(0,1fr);column-gap:10px;align-items:center;min-width:0}
.vr-legende .emo-visage{grid-row:span 2;width:clamp(34px,6.5vh,64px);height:auto}
.vr-legende b{font-size:clamp(1.05rem,2.6vh,1.7rem);line-height:1.15}
.vr-legende span{font-size:clamp(.9rem,2vh,1.25rem);line-height:1.2;overflow-wrap:anywhere}
.vr-note{flex-basis:100%;margin:0;text-align:center;font-style:italic;font-size:clamp(1rem,2.4vh,1.6rem)}
#seq .vr .emo-roue{width:min(100%,20rem)}`;
  document.head.appendChild(style);
  const roueEmotions = () => {
    const E = window.Emotions, d = document.createElement('div'); d.className = 'vr';
    d.innerHTML = E.roue(E.FAMILLES) + '<ul class="vr-legende">' + E.FAMILLES.map(f =>
      '<li>' + E.visage(f.id, f.couleur, 56) + '<b></b><span></span></li>').join('') + '</ul><p class="vr-note"></p>';
    d.querySelectorAll('.vr-legende li').forEach((li, k) => { li.querySelector('b').textContent = E.FAMILLES[k].nom; li.querySelector('span').textContent = E.FAMILLES[k].nuances; });
    d.querySelector('.vr-note').textContent = 'Plusieurs émotions peuvent exister en même temps.';
    return d;
  };
  window.Visuels = Object.assign(window.Visuels || {}, { 'roue-emotions': roueEmotions });
})();
