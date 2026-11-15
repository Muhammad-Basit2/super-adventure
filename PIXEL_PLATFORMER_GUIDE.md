# Pixel Platformer Asset Guide & Level Design 🗺️

All assets from `kenney_pixel-platformer` have been integrated into this project inside:
📁 `src/assets/pixel-platformer/`

---

## 🎨 Loaded Sprite Sheets & Texture Keys

In Phaser, these sheets are now automatically preloaded and ready to use in your game scenes:

| Texture Key | File Path | Frame Size | Grid Dimensions | Description |
|---|---|---|---|---|
| `'pixel_tiles'` | `assets/pixel-platformer/Tilemap/tilemap_packed.png` | **18×18 px** | 20 cols × 9 rows (180 tiles) | Grass, dirt, stone, mushrooms, wood, water, signs, spikes, ladders |
| `'pixel_characters'` | `assets/pixel-platformer/Tilemap/tilemap-characters_packed.png` | **24×24 px** | 9 cols × 3 rows (27 frames) | Playable aliens (green, pink, blue, yellow), enemies (spiky balls, flying bats, robots) |
| `'pixel_backgrounds'` | `assets/pixel-platformer/Tilemap/tilemap-backgrounds_packed.png` | **24×24 px** | 8 cols × 3 rows (24 frames) | Hills, trees, clouds, mountains, and skies |

---

## 🛠️ How to Add Game Objects Using These Sprites

### 1. In a Scene (`this.add.sprite`)
```javascript
// Add a pixel character sprite (frame 0 = green alien idle)
const player = this.physics.add.sprite(200, 300, 'pixel_characters', 0);
player.setScale(2); // Scale up for crisp pixel art look

// Add an 18x18 tile (e.g. grass block at index 0)
const groundTile = this.add.image(100, 200, 'pixel_tiles', 0);
groundTile.setScale(2);
```

### 2. Creating Pixel Character Animations
```javascript
// Green Alien Walking
this.anims.create({
  key: 'alien_green_walk',
  frames: this.anims.generateFrameNumbers('pixel_characters', { frames: [0, 1] }),
  frameRate: 6,
  repeat: -1
});

// Pink Alien Walking
this.anims.create({
  key: 'alien_pink_walk',
  frames: this.anims.generateFrameNumbers('pixel_characters', { frames: [2, 3] }),
  frameRate: 6,
  repeat: -1
});

// Blue Alien Walking
this.anims.create({
  key: 'alien_blue_walk',
  frames: this.anims.generateFrameNumbers('pixel_characters', { frames: [4, 5] }),
  frameRate: 6,
  repeat: -1
});
```

---

## 📐 Using Tiled Map Editor (Drag & Drop Level Painting)

Your pack includes pre-made Tiled examples located at:
`src/assets/pixel-platformer/Tiled/`

To visually paint levels:
1. Download [Tiled Map Editor](https://www.mapeditor.org/) (Free & Open Source).
2. Open `src/assets/pixel-platformer/Tiled/tilemap-example-a.tmx`.
3. Paint your ground, ladders, spikes, and coins visually.
4. Export as **JSON** (`level1.json`).
5. Load in Phaser in 2 lines:
   ```javascript
   this.load.tilemapTiledJSON('my_level', 'assets/pixel-platformer/Tiled/level1.json');
   ```
