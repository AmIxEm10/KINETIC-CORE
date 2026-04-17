# 🛠 KINETIC-CORE : Architecture & Roadmap

> Ce document sert de guide maître pour l'IA. Chaque étape doit être validée par l'agent `performance-engineer` et `ui-ux-pro-max`.

## 🏗 Stack Technique
- **Engine**: Next.js 14 (App Router) + React Three Fiber (R3F).
- **Physics**: Rapier (pour Three.js) ou calculs de vecteurs custom (plus performant pour des milliers d'ennemis).
- **State Management**: Zustand (Store global pour les ressources, PV, et vagues).
- **VFX**: Custom Shaders (GLSL) pour le noyau et les explosions.

## 🎮 Game Design (Par `game-design`)
- **Le Core**: Possède une barre de vie et un bouclier. Il pulse en fonction de la "tension" de la vague actuelle.
- **Les Tours**: Placement orbital. L'utilisateur place des modules de défense sur des anneaux rotatifs autour du noyau.
- **Les Ennemis**: Types variés (Eclaireurs rapides, Tanks lents, Boss fragmentables).

## 🚀 Phases de Développement

### Phase 1 : Système de Particules & Physique
- Implémenter un `EnemyManager` utilisant `InstancedMesh` pour gérer > 5000 ennemis à 60 FPS.
- Créer la logique de mouvement radial (Bord -> Centre).

### Phase 2 : Système de Défense
- Implémenter le drag-and-drop de tours sur les orbites.
- Créer 3 types de tours : Laser (mono-cible), Flak (AoE), Slow (champ de force).

### Phase 3 : Polish & Feedback (Rôle `ui-ux-pro-max`)
- Chaque impact doit générer une secousse de caméra (Screen Shake) et des débris physiques.
- Ajouter des transitions de vagues cinématiques avec GSAP.

### Phase 4 : Équilibrage Automatique (Rôle `chaos-engineer`)
- Créer un script de simulation qui fait tourner le jeu en accéléré pour ajuster les stats des ennemis et le coût des tours.

### Phase 5 : "X-Factor" (Généré par l'IA)
- L'agent `game-design` est autorisé et encouragé à modifier l'équilibrage ou à ajouter de nouvelles classes de tours/ennemis s'il estime que cela rend le jeu plus "Satisfying".
- Tout ajout de feature non listé initialement doit être documenté dans un fichier `AI_FEATURES_ADDED.md` à la racine du projet pour que je puisse voir ce qui a été inventé.

## 📈 Critères de Succès
- Score Lighthouse Performance > 90.
- Expérience utilisateur "Ultra-Satisfying" (Transitions fluides, sons visuels).
- Code propre, documenté et modulaire.
