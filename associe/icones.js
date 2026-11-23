/* Associe l'image — les dessins. Tracés à la main pour ce site (aucune image reprise d'un logiciel) :
   chacun rappelle la forme du bouton ou de l'élément, sans jamais écrire son nom. */
(function (racine) {
  const lignes = xs => xs.map(([x1, x2, y]) => `<path d="M${x1} ${y}H${x2}"/>`).join('');
  const lettre = (c, style) => `<text x="24" y="35" text-anchor="middle" font-size="32" ${style} fill="currentColor" stroke="none">${c}</text>`;
  const ICONES = {
    gras: lettre('B', 'font-family="Arial, sans-serif" font-weight="900"'),
    italique: lettre('I', 'font-family="Georgia, serif" font-style="italic"'),
    souligne: lettre('U', 'font-family="Arial, sans-serif"') + '<path d="M11 42H37"/>',
    'aligner-gauche': lignes([[8, 40, 12], [8, 28, 20], [8, 36, 28], [8, 24, 36]]),
    centrer: lignes([[8, 40, 12], [14, 34, 20], [10, 38, 28], [16, 32, 36]]),
    'aligner-droite': lignes([[8, 40, 12], [20, 40, 20], [12, 40, 28], [24, 40, 36]]),
    puces: '<circle cx="10" cy="13" r="2.5" fill="currentColor"/><circle cx="10" cy="24" r="2.5" fill="currentColor"/><circle cx="10" cy="35" r="2.5" fill="currentColor"/>' + lignes([[18, 40, 13], [18, 40, 24], [18, 40, 35]]),
    numeros: [1, 2, 3].map((n, i) => `<text x="10" y="${17 + i * 11}" text-anchor="middle" font-size="11" font-family="Arial, sans-serif" font-weight="700" fill="currentColor" stroke="none">${n}</text>`).join('') + lignes([[18, 40, 13], [18, 40, 24], [18, 40, 35]]),
    annuler: '<path d="M16 12 8 20l8 8"/><path d="M8 20h18a11 11 0 0 1 0 22H16"/>',
    dossier: '<path d="M6 14h13l4 5h19v20H6z"/>',
    fichier: '<path d="M13 6h15l8 8v28H13z"/><path d="M28 6v8h8"/><path d="M18 24h13M18 31h13"/>',
    corbeille: '<path d="M10 14h28M19 14V9h10v5M13 14l2 27h18l2-27"/><path d="M21 21v14M27 21v14"/>',
    pointeur: '<path d="M14 6v30l8-7 5 12 5-2-5-12h11z"/>',
    curseur: '<path d="M18 8h12M18 40h12M24 8v32"/>',
    fermer: '<rect x="7" y="7" width="34" height="34" rx="4"/><path d="M17 17l14 14M31 17 17 31"/>',
    reduire: '<rect x="7" y="7" width="34" height="34" rx="4"/><path d="M15 31h18"/>',
    agrandir: '<rect x="7" y="7" width="34" height="34" rx="4"/><rect x="16" y="16" width="16" height="16"/>',
    actualiser: '<path d="M38 24a14 14 0 1 1-4-10"/><path d="M36 6v9h-9"/>',
    precedent: '<path d="M40 24H10M22 12 10 24l12 12"/>',
    onglet: '<path d="M4 38h6V16a4 4 0 0 1 4-4h20a4 4 0 0 1 4 4v22h6"/><path d="M28 21l5 5M33 21l-5 5"/>',
    loupe: '<circle cx="21" cy="21" r="12"/><path d="M30 30l11 11"/>'
  };
  /** Le dessin complet, prêt à poser dans la page. La clé vient de jeux.json ; une clé inconnue ne rend rien. */
  function dessin(cle) {
    if (!Object.prototype.hasOwnProperty.call(ICONES, cle)) return '';
    return '<svg viewBox="0 0 48 48" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">' + ICONES[cle] + '</svg>';
  }
  const api = { dessin, cles: Object.keys(ICONES) };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else racine.IconesAssocie = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
