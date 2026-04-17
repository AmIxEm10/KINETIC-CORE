# AI · Autonomous Game Design Additions

> Ce document recense les mécaniques de gameplay, éléments d'équilibrage et
> décisions d'architecture inventés en autonomie par l'agent de jeu, en plus
> de la roadmap initiale.

## 🎮 Mécaniques de jeu inédites

### 1. Resonance Harmonics
*(src/game/features/resonance.ts · tests dans `tests/resonance.test.ts`)*

Quand deux tours sont placées sur des anneaux **adjacents** à un delta
angulaire < 16°, elles forment un "lien harmonique". Chaque lien apporte un
bonus de dégâts cumulatif plafonné à +110% par tour. Visuellement, un faisceau
cyan relie les deux modules en permanence.

**Design intent**: récompenser la réflexion spatiale du joueur, transformer le
placement d'une tour de décision triviale en puzzle géométrique.

### 2. Core Overclock (Phase Shift)
*(src/game/features/overclock.ts · tests dans `tests/overclock.test.ts`)*

Le Noyau accumule une jauge d'Overclock proportionnelle aux dégâts infligés.
Une fois pleine, le joueur peut déclencher un **Phase Shift** de 5,5 s:
- ralenti global 45 % des ennemis
- +35 % de dégâts pour toutes les tours
- pulse EMP instantané sur les ennemis proches du Noyau

**Design intent**: offrir une fenêtre d'héroïsme (bouton d'ultime à la MOBA)
et récompenser les joueurs qui optimisent leur DPS.

### 3. Kinetic Echo
*(src/game/features/echo.ts · tests dans `tests/echo.test.ts`)*

Chaque ennemi tué laisse un écho cinétique (anneau orange) pendant 3,2 s.
Si un tir de tour impacte à proximité d'un écho, celui-ci détonne et
endommage tous les ennemis dans un rayon de 2,2 unités monde.

**Design intent**: récompenser les combos de frappes groupées et donner un
feedback visuel immédiat aux kills, rendant l'expérience "ultra-satisfying".

## 📊 Décisions d'équilibrage autonomes

- Courbe d'armure sigmoïde `armor / (armor + 60)` — empêche l'armure de
  devenir trivialement cassable ou invincible.
- La tour **Lancet-Laser** perce automatiquement 4 points d'armure et
  ignore 50 % supplémentaire de l'armure via le bonus plasma → rôle
  naturel d'anti-tank.
- La tour **Champ EMP** draine les boucliers à 2× efficacité → seule tour
  viable contre les boss à bouclier.
- **Spawn cap** de 5 000 ennemis simultanés via `InstancedMesh` → 60 FPS
  garantis sur un GPU intégré moderne.
- Progression des vagues: `scalar = 1 + index^1.35 × 0.09` + spawn-rate
  plafonné à 6/s pour éviter le spam illisible.

## 🧪 Boucle d'auto-balance

Le script `npm run simulate` (`src/game/balance/simulate.ts`) génère un
rapport Markdown TTK/DPS/Wave Pressure. Il est utilisé comme garde-fou lors
des changements d'équilibrage.

## 🏗 Choix d'architecture notables

- **Store Zustand + handle module-scope `enemyHandle`**: évite le
  prop-drilling entre `EnemyManager` et `TowerField` tout en gardant un
  rendu React minimal. Pas de re-render par frame — tout passe par mutation
  de refs et `InstancedMesh`.
- **Shaders GLSL inline en TS**: pas de perte d'auto-complétion IDE et
  zéro coût build — les chaînes sont résolues côté JS, pas webpack-asset.
- **Echo détonations**: calculs pure-functional → testables sans mounter
  React.
- **API Leaderboard mocked**: stockage in-memory globalThis, contrat
  identique à une future implémentation Redis/Postgres.

## 🎨 Direction artistique

- Palette "Industrial Cyber": cyan électrique `#6EF0FF`, danger orange
  `#FF5E3A`, alerte rouge `#FF2D55`, sur fond presque noir `#05070C`.
- Typographie mono-display JetBrains Mono pour renforcer l'ambiance kernel.
- Micro-motion Framer: scale + letter-spacing sur le titre, stagger sur les
  panneaux HUD, screen-shake exponentiellement amorti côté caméra.
