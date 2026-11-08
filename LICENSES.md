# Licences des composants embarqués

| Composant | Version | Licence | Source |
|---|---|---|---|
| Three.js | 0.187 | MIT | https://github.com/mrdoob/three.js |
| KaTeX (+ polices KaTeX) | 0.19 | MIT | https://github.com/KaTeX/KaTeX |
| JetBrains Mono (sous-ensemble) | — | SIL Open Font License 1.1 | https://github.com/JetBrains/JetBrainsMono |
| Michroma (sous-ensemble) | — | SIL Open Font License 1.1 | https://fonts.google.com/specimen/Michroma |
| Noto Sans JP (sous-ensemble de ~70 kanji) | — | SIL Open Font License 1.1 | https://fonts.google.com/noto/specimen/Noto+Sans+JP |

Le texte complet de la SIL OFL 1.1 se trouve dans `src/assets/fonts/OFL.txt`.
Les sous-ensembles de polices ont été produits par l'API Google Fonts (`text=`) via `scripts/fetch-fonts.mjs`.

Outils de développement (non embarqués) : Vite, vite-plugin-singlefile, TypeScript, Vitest, playwright-core, fflate (MIT / Apache-2.0).
