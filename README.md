# Super Adventure 🎮

A complete, polished, playable 2D platformer desktop game built with **Phaser 3**, **Electron.js**, and **Kenney New Platformer Pack** assets.

---

## 🌟 Game Highlights

- **5 Unique Playable Worlds**:
  1. *Level 1: Green Forest* - Lush green hills, walking snails, basic obstacles & tutorial mechanics.
  2. *Level 2: Dark Cave* - Underground caverns, flying bees, hazardous spikes, and stone platforms.
  3. *Level 3: Desert Adventure* - Scorching sand dunes, moving platforms, and high-health fire slimes.
  4. *Level 4: Snow Mountains* - Icy peaks and floating ledges.
  5. *Level 5: Dark Castle* - Fortress showdown, difficult enemies, traps, and final BOSS FIGHT!
- **Fluid Player Movement & Mechanics**:
  - Smooth acceleration with drag (not hardcoded velocities).
  - **Coyote Time**: Jump briefly after leaving a platform edge.
  - **Jump Buffering**: Press jump slightly before landing to auto-jump.
  - Variable jump height (release early for short hops).
  - Double jump with mid-air puff particle feedback.
  - Enemy head stomping / bouncing attack.
  - Invulnerability frames (iframes) with visual flashing.
  - Respawn at checkpoints or start.
- **Special Platform Types**:
  - 💥 **Bouncing Platforms**: Trampoline-like launch.
  - ⬇️ **Falling Platforms**: Drop after being stepped on.
  - 💔 **Breakable Platforms**: Shatter after a delay.
  - 👻 **One-Way Platforms**: Pass through upward only.
- **Enemy Animation Fixes & AI Improvements**:
  - All enemies now have proper **Idle** → **Walk** → **Hurt** → **Death** animations.
  - Correct sprite-sheet frame selection verified against `spritesheet-enemies-default.xml`.
  - Flying enemies bounce smoothly with sine-wave vertical movement.
  - Ground enemies turn around at edges and walls automatically.
  - Strong enemies flash red and require two stomps.
- **Final Boss Fight (Overlord Barnacle)**:
  - Large multi-phase boss in Level 5.
  - Health bar displayed during fight.
  - Phase 1: Basic fireball attacks.
  - Phase 2: Faster shooting patterns.
  - Phase 3: Dual fireballs + lob shots.
  - Defeatable by stomping (like regular enemies).
- **Power-Ups & Collectibles**:
  - 🪙 **Gold Coins**: +100 Score.
  - 💎 **Gems (Blue & Red)**: +300 Score.
  - ⚡ **Star (Speed Boost)**: 1.55x movement speed boost.
  - 🦘 **Spring (Super Jump)**: 1.25x jumping height.
  - 🛡️ **Shield**: Absorbs damage completely with visual glowing orb.
  - ❤️ **Extra Life**: Grants additional player life.
- **Complete Audio & Synth System**:
  - Interactive Kenney sound effects (jump, hurt, gem, coin, bump, magic, select).
  - Melodic retro synth BGM tailored per level theme.
  - Full volume controls for Master, Music, and SFX.
- **Robust Persistence & Settings**:
  - Electron IPC file persistence & LocalStorage fallback.
  - Saves unlocked levels, completed levels, coins stash, and high scores.
  - Includes reset data capability.

---

## 🕹️ Controls

| Action | Primary Key | Secondary Key |
|---|---|---|
| **Move Left** | `A` | `Left Arrow` |
| **Move Right** | `D` | `Right Arrow` |
| **Jump / Double Jump** | `SPACE` | `W` or `Up Arrow` |
| **Pause Game** | `ESC` | In-game HUD `❚❚` button |

---

## 🚀 Development & Running

### Requirements
- Node.js (v18+)
- npm

### 1. Run in Development Mode
```bash
npm start
# or
npm run dev
```

### 2. Build Packaged Windows Application
```bash
npm run build
```
The unpacked executable will be placed in `dist/win-unpacked/Super Adventure.exe`.

### 3. Create Windows NSIS Installer (EXE)
```bash
npm run dist
```
An installer (`Super Adventure-Setup-1.0.0.exe`) will be generated inside the `dist/` folder.

---

## 📁 Architecture Overview

```
super-adventure/
├── electron/
│   ├── main.js             # Electron main process & IPC handlers
│   └── preload.js          # Secure contextBridge API
├── src/
│   ├── assets/             # Kenney New Platformer Pack (Spritesheets & Sounds)
│   ├── entities/
│   │   ├── Player.js       # Player physics, coyote time, animation & powerups
│   │   ├── Enemy.js        # Walking, flying, strong + idle/hurt/death states
│   │   ├── Boss.js         # Final boss with health bar & attack phases
│   │   ├── Collectible.js  # Coins, gems, and powerup sprites
│   │   ├── MovingPlatform.js # Sine-based moving platforms
│   │   └── SpecialPlatform.js # Bounce/Fall/Break/Oneway platforms
│   ├── levels/
│   │   ├── LevelData.js    # Master config with all 5 worlds & boss
│   │   ├── LevelDataPart1.js # Levels 1 & 2 professional layouts
│   │   └── LevelDataPart2.js # Levels 3 & 4 professional layouts
│   ├── scenes/
│   │   ├── BootScene.js
│   │   ├── PreloadScene.js # Asset loading + animation creation
│   │   ├── MenuScene.js
│   │   ├── LevelSelectScene.js
│   │   ├── GameScene.js
│   │   ├── PauseScene.js
│   │   ├── GameOverScene.js
│   │   ├── VictoryScene.js
│   │   ├── SettingsScene.js
│   │   ├── HowToPlayScene.js
│   │   └── LevelEditorScene.js # In-game level editor & admin panel
│   ├── systems/
│   │   ├── AudioManager.js # SFX player and Web Audio synth BGM
│   │   ├── GameHUD.js      # Player stats display
│   │   └── SaveManager.js  # Cross-platform save system
│   ├── styles/
│   │   └── style.css       # Clean styling
│   ├── index.html          # Canvas host & CSP configuration
│   └── main.js             # Phaser game configuration
├── package.json
└── README.md
```
