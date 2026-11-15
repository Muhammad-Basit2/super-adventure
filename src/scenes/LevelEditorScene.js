import { audioManager } from '../systems/AudioManager.js';
import { LEVEL_DEFINITIONS } from '../levels/LevelData.js';

// Helper: map enemy type string → spritesheet frame name
const ENEMY_FRAME_MAP = {
  walking: 'slime_normal_walk_a',
  walking_snail: 'snail_walk_a',
  flying: 'bee_a',
  flying_buzz: 'fly_a',
  strong: 'slime_fire_walk_a',
  spike_slime: 'slime_spike_walk_a',
  walking_mouse: 'mouse_walk_a',
  frog: 'frog_idle',
  ladybug: 'ladybug_walk_a',
  boss_turret: 'barnacle_attack_rest'
};

// Helper: map special platform type → outline color
const SPECIAL_PLATFORM_COLOR = {
  bouncing: 0x10b981,
  falling: 0xf56565,
  breakable: 0xed8936
};

// Helper: theme keys
const THEME_KEYS = {
  forest: { bgKey: 'background_color_trees', cloudKey: 'background_clouds', tilePrefix: 'terrain_grass' },
  castle: { bgKey: 'background_color_desert', cloudKey: null, tilePrefix: 'terrain_stone' },
  desert: { bgKey: 'background_color_hills', cloudKey: 'background_clouds', tilePrefix: 'terrain_sand' },
  snow: { bgKey: 'background_color_mushrooms', cloudKey: 'background_clouds', tilePrefix: 'terrain_snow' }
};

export class LevelEditorScene extends Phaser.Scene {
  constructor() {
    super('LevelEditorScene');
  }

  create() {
    try {
      this.gridSize = 32;
      this.levelWidth = 3200;
      this.levelHeight = 900;

      // Current selection
      this.selectedTool = 'platform';
      this.placedObjects = [];
      this.isDraggingCam = false;

      // Reference panels for live-updating UI
      this.propPanel = {};

      // Load initial template or saved custom level
      this.loadCustomOrTemplate();

      // Setup world & camera
      this.setupWorldAndCamera();

      // Render grid
      this.renderGrid();

      // Render initial objects
      this.renderAllObjects();

      // Setup interaction listeners
      this.setupEditorControls();

      // Build HUD & Toolbar UI (Fixed to screen)
      this.buildToolbarUI();
      this.buildPropertiesPanel();
    } catch (e) {
      console.error('LevelEditorScene.create() failed:', e);
      this.scene.start('MenuScene');
    }
  }

  loadCustomOrTemplate() {
    try {
      const saved = localStorage.getItem('super_adventure_custom_level');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          this.currentLevelConfig = parsed;
          ['specialPlatforms', 'movingPlatforms'].forEach(k => {
            if (!this.currentLevelConfig[k]) this.currentLevelConfig[k] = [];
          });
          return;
        } catch (parseErr) {
          console.warn('Failed parsing saved custom level, using default');
        }
      }
    } catch (e) {
      console.warn('Failed reading localStorage:', e);
    }

    try {
      const base = LEVEL_DEFINITIONS[1];
      if (!base) throw new Error('Level 1 not found');
      this.currentLevelConfig = JSON.parse(JSON.stringify(base));
      this.currentLevelConfig.title = 'Custom Created Level';
      if (!this.currentLevelConfig.specialPlatforms) this.currentLevelConfig.specialPlatforms = [];
      if (!this.currentLevelConfig.movingPlatforms) this.currentLevelConfig.movingPlatforms = [];
    } catch (e) {
      console.error('Failed to load default level template:', e);
      this.currentLevelConfig = {
        number: 1, title: 'Custom Created Level', bgKey: 'background_color_trees', cloudKey: 'background_clouds',
        theme: 'forest', tilePrefix: 'terrain_grass', playerColor: 'green', levelWidth: 3200, levelHeight: 900,
        spawn: { x: 120, y: 700 }, exit: { x: 3000, y: 700 }, checkpoint: { x: 1500, y: 720 },
        platforms: [{ x: 0, y: 768, w: 900, h: 132 }], movingPlatforms: [], specialPlatforms: [],
        spikes: [], enemies: [], collectibles: []
      };
    }
  }

  setupWorldAndCamera() {
    const cfg = this.currentLevelConfig;
    this.levelWidth = cfg.levelWidth || 3200;
    this.levelHeight = cfg.levelHeight || 900;

    this.cameras.main.setBounds(0, 0, this.levelWidth, this.levelHeight);
    this.cameras.main.setScroll(0, 200);

    // Apply theme (this also rebuilds backgrounds)
    this.applyTheme(cfg.theme || 'forest');

    // Clouds
    if (cfg.cloudKey) {
      const cloudCount = Math.ceil(this.levelWidth / 384) + 1;
      for (let i = 0; i < cloudCount; i++) {
        const cx = i * 384 + Phaser.Math.Between(-60, 60);
        const cy = Phaser.Math.Between(40, 200);
        const cloud = this.add.image(cx, cy, 'backgrounds', cfg.cloudKey)
          .setScale(Phaser.Math.FloatBetween(0.6, 1.2))
          .setAlpha(0.6)
          .setScrollFactor(0.4)
          .setDepth(-8);
        this.placedObjects.push(cloud);
      }
    }
  }

  applyTheme(themeName) {
    const keys = THEME_KEYS[themeName] || THEME_KEYS.forest;
    this.bgKey = keys.bgKey;
    this.tilePrefix = keys.tilePrefix;
    this.currentLevelConfig.bgKey = keys.bgKey;
    this.currentLevelConfig.cloudKey = keys.cloudKey;
    this.currentLevelConfig.theme = themeName;
    this.currentLevelConfig.tilePrefix = keys.tilePrefix;

    // Rebuild backgrounds
    this.bgGroup?.clear(true, true);
    const count = Math.ceil(this.levelWidth / 256) + 2;
    for (let i = 0; i < count; i++) {
      const bg = this.add.image(i * 256, this.levelHeight - 128, 'backgrounds', this.bgKey)
        .setOrigin(0, 1)
        .setDisplaySize(256, this.levelHeight)
        .setDepth(-10);
      this.bgGroup.add(bg);
    }
  }

  renderGrid() {
    this.gridGfx = this.add.graphics();
    this.gridGfx.lineStyle(1, 0xffffff, 0.08);

    for (let x = 0; x <= this.levelWidth; x += this.gridSize) {
      this.gridGfx.moveTo(x, 0);
      this.gridGfx.lineTo(x, this.levelHeight);
    }
    for (let y = 0; y <= this.levelHeight; y += this.gridSize) {
      this.gridGfx.moveTo(0, y);
      this.gridGfx.lineTo(this.levelWidth, y);
    }
    this.gridGfx.strokePath();
    this.gridGfx.setDepth(-5);
  }

  renderAllObjects() {
    this.clearRenderedObjects();
    const cfg = this.currentLevelConfig;

    // 1. Platforms
    cfg.platforms.forEach((p, idx) => {
      this.renderPlatformItem(p, idx);
    });

    // 2. Spawn
    if (cfg.spawn) {
      const spr = this.add.image(cfg.spawn.x, cfg.spawn.y, 'characters', `character_${cfg.playerColor || 'green'}_idle`)
        .setScale(0.8)
        .setDepth(5);
      spr.setData('editorType', 'spawn');
      this.placedObjects.push(spr);
    }

    // 3. Exit Flag
    if (cfg.exit) {
      const spr = this.add.image(cfg.exit.x, cfg.exit.y, 'tiles', 'flag_green_a')
        .setDepth(5);
      spr.setData('editorType', 'exit');
      this.placedObjects.push(spr);
    }

    // 4. Checkpoint
    if (cfg.checkpoint) {
      const spr = this.add.image(cfg.checkpoint.x, cfg.checkpoint.y, 'tiles', 'flag_off')
        .setDepth(5);
      spr.setData('editorType', 'checkpoint');
      this.placedObjects.push(spr);
    }

    // 5. Spikes
    if (cfg.spikes) {
      cfg.spikes.forEach((sp, idx) => {
        const spr = this.add.image(sp.x, sp.y, 'tiles', 'spikes').setDepth(4);
        spr.setData('editorType', 'spikes');
        spr.setData('index', idx);
        this.placedObjects.push(spr);
      });
    }

    // 6. Enemies
    if (cfg.enemies) {
      cfg.enemies.forEach((e, idx) => {
        let frame = ENEMY_FRAME_MAP[e.type] || 'slime_normal_walk_a';

        const spr = this.add.image(e.x, e.y, 'enemies', frame).setDepth(6);
        spr.setData('editorType', 'enemy');
        spr.setData('index', idx);
        this.placedObjects.push(spr);
      });
    }

    // 7. Special Platforms (bouncing / falling / breakable)
    if (cfg.specialPlatforms) {
      cfg.specialPlatforms.forEach((sp, idx) => {
        const color = SPECIAL_PLATFORM_COLOR[sp.type] || 0xffffff;
        // Draw colored platform outline
        const gfx = this.add.graphics().setDepth(3);
        gfx.lineStyle(3, color, 0.9);
        gfx.strokeRect(sp.x + 4, sp.y + 4, sp.w - 8, sp.h - 8);
        // Fill with low opacity
        gfx.fillStyle(color, 0.12);
        gfx.fillRect(sp.x + 4, sp.y + 4, sp.w - 8, sp.h - 8);
        // Label - follows camera (scrollFactor 1 is default)
        const label = this.add.text(sp.x + sp.w / 2, sp.y + sp.h / 2, sp.type.toUpperCase(), {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '10px',
          fontStyle: 'bold',
          color: '#' + color.toString(16).padStart(6, '0'),
          backgroundColor: '#000000'
        }).setOrigin(0.5).setDepth(4);
        gfx.setData('editorType', 'special_platform');
        gfx.setData('index', idx);
        label.setData('editorType', 'special_platform_label');
        label.setData('index', idx);
        this.placedObjects.push(gfx, label);
      });
    }

    // 8. Moving Platforms
    if (cfg.movingPlatforms) {
      cfg.movingPlatforms.forEach((mp, idx) => {
        const tileW = 64;
        const count = Math.ceil((mp.w || 128) / tileW);
        for (let i = 0; i < count; i++) {
          const tx = mp.x + i * tileW;
          let frame = `${this.tilePrefix}_horizontal_middle`;
          if (i === 0) frame = `${this.tilePrefix}_horizontal_left`;
          else if (i === count - 1) frame = `${this.tilePrefix}_horizontal_right`;

          const tile = this.add.image(tx + 32, mp.y + 24, 'tiles', frame).setDepth(2);
          tile.setData('editorType', 'moving_platform');
          tile.setData('index', idx);
          this.placedObjects.push(tile);
        }
        // Arrow indicator for movement direction
        const arrowX = mp.x + (mp.w || 128) / 2;
        const arrow = this.add.text(arrowX, mp.y - 18, mp.vertical ? '▲▼' : '◄►', {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '12px',
          color: '#a78bfa',
          fontStyle: 'bold'
        }).setOrigin(0.5).setDepth(4);
        arrow.setData('editorType', 'moving_platform_label');
        arrow.setData('index', idx);
        this.placedObjects.push(arrow);
        // Distance label
        const distLabel = this.add.text(arrowX, mp.y - 6, `${mp.distance || 100}px`, {
          fontFamily: 'Segoe UI, sans-serif',
          fontSize: '9px',
          color: '#94a3b8'
        }).setOrigin(0.5).setDepth(4);
        distLabel.setData('editorType', 'moving_platform_dist');
        distLabel.setData('index', idx);
        this.placedObjects.push(distLabel);
      });
    }

    // 9. Boss spawn marker
    if (cfg.hasBoss && cfg.bossSpawn) {
      const bspr = this.add.circle(cfg.bossSpawn.x, cfg.bossSpawn.y, 18, 0xff0000, 0.35)
        .setStrokeStyle(2, 0xff0000, 1)
        .setDepth(5);
      bspr.setData('editorType', 'boss_spawn');
      this.placedObjects.push(bspr);
      const blabel = this.add.text(cfg.bossSpawn.x, cfg.bossSpawn.y - 28, '👑 BOSS', {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: '#ef4444',
        backgroundColor: '#0f172a'
      }).setOrigin(0.5).setDepth(5);
      blabel.setData('editorType', 'boss_spawn_label');
      this.placedObjects.push(blabel);
    }

    // 10. Collectibles
    if (cfg.collectibles) {
      cfg.collectibles.forEach((c, idx) => {
        let frame = 'coin_gold';
        if (c.type === 'gem_blue') frame = 'gem_blue';
        else if (c.type === 'gem_red') frame = 'gem_red';
        else if (c.type === 'powerup_speed') frame = 'star';
        else if (c.type === 'powerup_jump') frame = 'spring';
        else if (c.type === 'powerup_shield') frame = 'lock_blue';
        else if (c.type === 'life') frame = 'heart';

        const spr = this.add.image(c.x, c.y, 'tiles', frame).setDepth(6);
        spr.setData('editorType', 'collectible');
        spr.setData('index', idx);
        this.placedObjects.push(spr);
      });
    }
  }

  renderPlatformItem(p, idx) {
    const tileW = 64;
    const count = Math.ceil(p.w / tileW);
    const group = [];

    for (let i = 0; i < count; i++) {
      let frame = `${this.tilePrefix}_horizontal_middle`;
      if (i === 0) frame = `${this.tilePrefix}_horizontal_left`;
      else if (i === count - 1) frame = `${this.tilePrefix}_horizontal_right`;

      const tile = this.add.image(p.x + i * tileW + 32, p.y + 24, 'tiles', frame).setDepth(2);
      tile.setData('editorType', 'platform');
      tile.setData('index', idx);
      group.push(tile);
    }
    this.placedObjects.push(...group);
  }

  clearRenderedObjects() {
    this.placedObjects.forEach(obj => {
      if (obj && obj.destroy) obj.destroy();
    });
    this.placedObjects = [];
  }

  setupEditorControls() {
    this.keys = this.input.keyboard.addKeys({
      LEFT: Phaser.Input.Keyboard.KeyCodes.LEFT,
      RIGHT: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      UP: Phaser.Input.Keyboard.KeyCodes.UP,
      DOWN: Phaser.Input.Keyboard.KeyCodes.DOWN,
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      S: Phaser.Input.Keyboard.KeyCodes.S
    });

    // Panning with drag or middle click
    this.input.on('pointerdown', (pointer) => {
      // Ignore if clicking on HUD toolbar (top 70px or bottom 80px)
      if (pointer.y < 75 || pointer.y > this.scale.height - 85) return;

      if (pointer.middleButtonDown() || pointer.rightButtonDown()) {
        this.isDraggingCam = true;
        this.dragStartX = pointer.x;
        this.dragStartY = pointer.y;
        this.camStartX = this.cameras.main.scrollX;
        this.camStartY = this.cameras.main.scrollY;
        return;
      }

      if (pointer.leftButtonDown()) {
        const worldX = pointer.worldX;
        const worldY = pointer.worldY;
        this.handleCanvasClick(worldX, worldY);
      }
    });

    this.input.on('pointermove', (pointer) => {
      if (this.isDraggingCam) {
        const dx = pointer.x - this.dragStartX;
        const dy = pointer.y - this.dragStartY;
        this.cameras.main.scrollX = Phaser.Math.Clamp(this.camStartX - dx, 0, this.levelWidth - this.scale.width);
        this.cameras.main.scrollY = Phaser.Math.Clamp(this.camStartY - dy, 0, this.levelHeight - this.scale.height);
      }
    });

    this.input.on('pointerup', () => {
      this.isDraggingCam = false;
    });
  }

  update() {
    const camSpeed = 16;
    if (this.keys.LEFT.isDown || this.keys.A.isDown) {
      this.cameras.main.scrollX = Math.max(0, this.cameras.main.scrollX - camSpeed);
    }
    if (this.keys.RIGHT.isDown || this.keys.D.isDown) {
      this.cameras.main.scrollX = Math.min(this.levelWidth - this.scale.width, this.cameras.main.scrollX + camSpeed);
    }
    if (this.keys.UP.isDown || this.keys.W.isDown) {
      this.cameras.main.scrollY = Math.max(0, this.cameras.main.scrollY - camSpeed);
    }
    if (this.keys.DOWN.isDown || this.keys.S.isDown) {
      this.cameras.main.scrollY = Math.min(this.levelHeight - this.scale.height, this.cameras.main.scrollY + camSpeed);
    }
  }

  handleCanvasClick(worldX, worldY) {
    const snapX = Math.floor(worldX / this.gridSize) * this.gridSize;
    const snapY = Math.floor(worldY / this.gridSize) * this.gridSize;
    const cfg = this.currentLevelConfig;

    if (this.selectedTool === 'eraser') {
      // Find and remove item at snap position
      this.eraseAt(snapX, snapY);
      this.renderAllObjects();
      audioManager.playSfx('sfx_bump');
      return;
    }

    if (this.selectedTool === 'platform') {
      cfg.platforms.push({ x: snapX, y: snapY, w: 192, h: 48 });
    } else if (this.selectedTool === 'spawn') {
      cfg.spawn = { x: snapX, y: snapY };
    } else if (this.selectedTool === 'exit') {
      cfg.exit = { x: snapX, y: snapY };
    } else if (this.selectedTool === 'checkpoint') {
      cfg.checkpoint = { x: snapX, y: snapY };
    } else if (this.selectedTool === 'spikes') {
      cfg.spikes.push({ x: snapX, y: snapY });
    } else if (['walking_snail', 'walking', 'flying', 'strong', 'flying_buzz', 'spike_slime', 'walking_mouse', 'frog', 'ladybug', 'boss_turret'].includes(this.selectedTool)) {
      const range = (this.selectedTool === 'flying' || this.selectedTool === 'flying_buzz') ? 130 : 120;
      cfg.enemies.push({ type: this.selectedTool, x: snapX, y: snapY, range });
    } else if (this.selectedTool === 'special_bouncing' || this.selectedTool === 'special_falling' || this.selectedTool === 'special_breakable') {
      const spType = this.selectedTool.replace('special_', '');
      cfg.specialPlatforms.push({ x: snapX, y: snapY, w: 128, h: 32, type: spType });
    } else if (this.selectedTool === 'moving_platform') {
      cfg.movingPlatforms.push({ x: snapX, y: snapY, w: 128, distance: 100, duration: 2000 });
    } else if (this.selectedTool === 'boss_spawn') {
      cfg.hasBoss = true;
      cfg.bossSpawn = { x: snapX, y: snapY };
    } else {
      // Collectible
      cfg.collectibles.push({ type: this.selectedTool, x: snapX, y: snapY });
    }

    audioManager.playSfx('sfx_select');
    this.renderAllObjects();
  }

  eraseAt(x, y) {
    const cfg = this.currentLevelConfig;
    const radius = 48;

    cfg.platforms = cfg.platforms.filter(p => !(x >= p.x && x <= p.x + p.w && y >= p.y - 20 && y <= p.y + p.h + 20));
    cfg.spikes = cfg.spikes.filter(s => Phaser.Math.Distance.Between(x, y, s.x, s.y) > radius);
    cfg.enemies = cfg.enemies.filter(e => Phaser.Math.Distance.Between(x, y, e.x, e.y) > radius);
    cfg.collectibles = cfg.collectibles.filter(c => Phaser.Math.Distance.Between(x, y, c.x, c.y) > radius);
    cfg.specialPlatforms = (cfg.specialPlatforms || []).filter(sp => !(x >= sp.x && x <= sp.x + sp.w && y >= sp.y - 10 && y <= sp.y + sp.h + 10));
    cfg.movingPlatforms = (cfg.movingPlatforms || []).filter(mp => Phaser.Math.Distance.Between(x, y, mp.x + (mp.w || 64), mp.y) > radius);

    // Special cases: single-point markers
    if (cfg.spawn && Phaser.Math.Distance.Between(x, y, cfg.spawn.x, cfg.spawn.y) < radius) cfg.spawn = null;
    if (cfg.exit && Phaser.Math.Distance.Between(x, y, cfg.exit.x, cfg.exit.y) < radius) cfg.exit = null;
    if (cfg.checkpoint && Phaser.Math.Distance.Between(x, y, cfg.checkpoint.x, cfg.checkpoint.y) < radius) cfg.checkpoint = null;
    if (cfg.bossSpawn && Phaser.Math.Distance.Between(x, y, cfg.bossSpawn.x, cfg.bossSpawn.y) < radius) {
      cfg.bossSpawn = null;
      cfg.hasBoss = false;
    }
  }

  buildToolbarUI() {
    const { width, height } = this.scale;

    const topBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    topBar.fillStyle(0x0f172a, 0.92);
    topBar.fillRect(0, 0, width, 68);
    topBar.lineStyle(2, 0x334155, 1);
    topBar.strokeLineShape(new Phaser.Geom.Line(0, 68, width, 68));

    this.add.text(20, 20, '🛠️ LEVEL DESIGNER & ADMIN PANEL', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setScrollFactor(0).setDepth(101);

    this.createHeaderButton(width - 540, 16, '▶ TEST PLAY', 0x10b981, () => this.testPlayLevel());
    this.createHeaderButton(width - 410, 16, '💾 SAVE LEVEL', 0x3b82f6, () => this.saveCustomLevel());
    this.createHeaderButton(width - 280, 16, '🗑️ CLEAR ALL', 0xef4444, () => this.clearLevel());
    this.createHeaderButton(width - 140, 16, '◀ EXIT MENU', 0x64748b, () => this.exitToMenu());

    const bottomBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    bottomBar.fillStyle(0x0f172a, 0.95);
    bottomBar.fillRect(0, height - 80, width, 80);
    bottomBar.lineStyle(2, 0x334155, 1);
    bottomBar.strokeLineShape(new Phaser.Geom.Line(0, height - 80, width, 80));

    const tools = [
      { id: 'platform', label: 'Platform', color: '#48bb78' },
      { id: 'eraser', label: 'Eraser', color: '#f56565' },
      { id: 'spawn', label: 'Spawn', color: '#63b3ed' },
      { id: 'exit', label: 'Goal Flag', color: '#ecc94b' },
      { id: 'checkpoint', label: 'Checkpoint', color: '#9f7aea' },
      { id: 'spikes', label: 'Spikes', color: '#e53e3e' },
      { id: 'special_bouncing', label: 'Bounce Pad', color: '#10b981' },
      { id: 'special_falling', label: 'Falling', color: '#ef4444' },
      { id: 'special_breakable', label: 'Breakable', color: '#f97316' },
      { id: 'moving_platform', label: 'Moving Plat', color: '#a78bfa' },
      { id: 'boss_spawn', label: 'Boss Spawn', color: '#dc2626' },
      { id: 'walking', label: 'Slime', color: '#48bb78' },
      { id: 'walking_snail', label: 'Snail', color: '#ed8936' },
      { id: 'flying', label: 'Bee', color: '#ecc94b' },
      { id: 'flying_buzz', label: 'Fly', color: '#f6e05e' },
      { id: 'strong', label: 'Fire Slime', color: '#f56565' },
      { id: 'spike_slime', label: 'Spike Slime', color: '#9f7aea' },
      { id: 'walking_mouse', label: 'Mouse', color: '#fc8181' },
      { id: 'frog', label: 'Frog', color: '#38b2ac' },
      { id: 'ladybug', label: 'Ladybug', color: '#f56565' },
      { id: 'boss_turret', label: 'Turret', color: '#c53030' },
      { id: 'coin', label: 'Coin', color: '#ffd166' },
      { id: 'gem_blue', label: 'Gem Blue', color: '#4fd1c5' },
      { id: 'gem_red', label: 'Gem Red', color: '#f56565' },
      { id: 'powerup_speed', label: 'Speed Star', color: '#f6e05e' },
      { id: 'powerup_jump', label: 'Super Jump', color: '#b794f4' },
      { id: 'powerup_shield', label: 'Shield', color: '#81e6d9' },
      { id: 'life', label: 'Extra Life', color: '#fc8181' }
    ];

    const startX = 20;
    const btnWidth = 70;
    this.toolButtons = {};

    tools.forEach((t, i) => {
      const bx = startX + i * (btnWidth + 4);
      if (bx + btnWidth > width) return;

      const btn = this.add.container(bx, height - 70).setScrollFactor(0).setDepth(101);
      const bg = this.add.graphics();
      const isSelected = this.selectedTool === t.id;
      bg.fillStyle(isSelected ? 0x3b82f6 : 0x1e293b, 1);
      bg.fillRoundedRect(0, 0, btnWidth, 60, 6);
      bg.lineStyle(2, isSelected ? 0x60a5fa : 0x475569, 1);
      bg.strokeRoundedRect(0, 0, btnWidth, 60, 6);

      const txt = this.add.text(btnWidth / 2, 30, t.label, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '11px',
        fontStyle: 'bold',
        color: t.color,
        align: 'center',
        wordWrap: { width: btnWidth - 4 }
      }).setOrigin(0.5);

      btn.add([bg, txt]);
      btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, btnWidth, 60), Phaser.Geom.Rectangle.Contains);

      btn.on('pointerdown', () => {
        this.selectedTool = t.id;
        audioManager.playSfx('sfx_select');
        this.updateToolButtonsSelection();
      });

      this.toolButtons[t.id] = { btn, bg, width: btnWidth };
    });
  }

  updateToolButtonsSelection() {
    Object.keys(this.toolButtons).forEach(id => {
      const { bg, width } = this.toolButtons[id];
      const isSelected = this.selectedTool === id;
      bg.clear();
      bg.fillStyle(isSelected ? 0x3b82f6 : 0x1e293b, 1);
      bg.fillRoundedRect(0, 0, width, 60, 6);
      bg.lineStyle(2, isSelected ? 0x60a5fa : 0x475569, 1);
      bg.strokeRoundedRect(0, 0, width, 60, 6);
    });
  }

  createHeaderButton(x, y, label, bgColor, callback) {
    const btn = this.add.container(x, y).setScrollFactor(0).setDepth(101);
    const bg = this.add.graphics();
    bg.fillStyle(bgColor, 0.9);
    bg.fillRoundedRect(0, 0, 120, 36, 6);

    const txt = this.add.text(60, 18, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, txt]);
    btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, 120, 36), Phaser.Geom.Rectangle.Contains);

    btn.on('pointerover', () => {
      bg.clear();
      bg.fillStyle(bgColor, 1);
      bg.fillRoundedRect(0, 0, 120, 36, 6);
    });
    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(bgColor, 0.9);
      bg.fillRoundedRect(0, 0, 120, 36, 6);
    });
    btn.on('pointerdown', callback);
  }

  saveCustomLevel() {
    localStorage.setItem('super_adventure_custom_level', JSON.stringify(this.currentLevelConfig));
    audioManager.playSfx('sfx_magic');
    this.updatePropCounts();
    const toast = this.add.text(this.scale.width / 2, 100, 'LEVEL SAVED SUCCESSFULLY!', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#10b981',
      backgroundColor: '#0f172a',
      padding: { x: 16, y: 8 }
    }).setOrigin(0.5).setScrollFactor(0).setDepth(200);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: 70,
      duration: 1500,
      onComplete: () => toast.destroy()
    });
  }

  testPlayLevel() {
    audioManager.playSfx('sfx_gem');
    this.scene.start('GameScene', {
      customLevelConfig: this.currentLevelConfig
    });
  }

  clearLevel() {
    this.currentLevelConfig = {
      number: 1,
      title: 'Custom Created Level',
      bgKey: 'background_color_trees',
      cloudKey: 'background_clouds',
      theme: 'forest',
      tilePrefix: 'terrain_grass',
      playerColor: 'green',
      levelWidth: 3200,
      levelHeight: 900,
      spawn: { x: 120, y: 700 },
      exit: { x: 3000, y: 700 },
      checkpoint: { x: 1500, y: 720 },
      platforms: [{ x: 0, y: 768, w: 900, h: 132 }],
      movingPlatforms: [],
      specialPlatforms: [],
      spikes: [],
      enemies: [],
      collectibles: [],
      hasBoss: false
    };
    this.renderAllObjects();
    audioManager.playSfx('sfx_bump');
    this.updatePropCounts();
  }

  exitToMenu() {
    audioManager.playSfx('sfx_select');
    this.scene.start('MenuScene');
  }

  // ─── Properties Panel ────────────────────────────────────────────────
  buildPropertiesPanel() {
    const { width } = this.scale;
    const panelX = width - 230;
    const panelW = 220;
    const panelY = 76;

    const panelBorder = this.add.rectangle(panelX + panelW / 2, panelY + 240, panelW, 480, 0x0f172a, 0.93)
      .setOrigin(0.5).setScrollFactor(0).setDepth(100);
    const borderGfx = this.add.graphics().setScrollFactor(0).setDepth(100);
    borderGfx.lineStyle(2, 0x334155);
    borderGfx.strokeRect(panelX, panelY, panelW, 480);

    this.add.text(panelX + panelW / 2, panelY + 8, '⚙ LEVEL SETTINGS', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '13px', fontStyle: 'bold', color: '#ffd166'
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);

    let cy = panelY + 36;
    const labelColor = '#a0aec0';
    const fieldColor = '#e2e8f0';
    const lineHeight = 34;

    // Title
    this.add.text(panelX + 12, cy, 'Title:', { fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', color: labelColor })
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    const titleInput = this.add.text(panelX + 12, cy, (this.currentLevelConfig.title || '').slice(0, 18), {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', color: fieldColor,
      backgroundColor: '#1e293b', padding: { x: 6, y: 3 }, wordWrap: { width: panelW - 70 }
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    titleInput.on('pointerdown', () => {
      const val = prompt('Enter level title:', this.currentLevelConfig.title || '');
      if (val !== null) {
        this.currentLevelConfig.title = val.trim() || 'Untitled Level';
        titleInput.setText(this.currentLevelConfig.title.slice(0, 18));
        this.updatePropCounts();
      }
    });
    this.propPanel.titleInput = titleInput;

    // Theme (cycle on click)
    cy += lineHeight;
    this.add.text(panelX + 12, cy, 'Theme:', { fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', color: labelColor })
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    const themes = ['forest', 'castle', 'desert', 'snow'];
    const themeLabel = this.add.text(panelX + 12, cy, (this.currentLevelConfig.theme || 'forest').toUpperCase(), {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', color: fieldColor,
      backgroundColor: '#1e293b', padding: { x: 6, y: 3 }
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    let themeIdx = themes.indexOf(this.currentLevelConfig.theme || 'forest');
    themeLabel.on('pointerdown', () => {
      themeIdx = (themeIdx + 1) % themes.length;
      const newTheme = themes[themeIdx];
      this.applyTheme(newTheme);
      themeLabel.setText(newTheme.toUpperCase());
      this.renderAllObjects();
      this.updatePropCounts();
    });
    this.propPanel.themeDropdown = themeLabel;

    // Player Color (cycle on click)
    cy += lineHeight;
    this.add.text(panelX + 12, cy, 'Player Color:', { fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', color: labelColor })
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    const colors = ['green', 'yellow', 'purple', 'pink', 'beige'];
    const playerColorLabel = this.add.text(panelX + 12, cy, (this.currentLevelConfig.playerColor || 'green').charAt(0).toUpperCase() + (this.currentLevelConfig.playerColor || 'green').slice(1), {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', color: fieldColor,
      backgroundColor: '#1e293b', padding: { x: 6, y: 3 }
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101).setInteractive({ useHandCursor: true });
    let colorIdx = colors.indexOf(this.currentLevelConfig.playerColor || 'green');
    playerColorLabel.on('pointerdown', () => {
      colorIdx = (colorIdx + 1) % colors.length;
      const c = colors[colorIdx];
      this.currentLevelConfig.playerColor = c;
      playerColorLabel.setText(c.charAt(0).toUpperCase() + c.slice(1));
      this.renderAllObjects();
    });
    this.propPanel.playerColorDropdown = playerColorLabel;

    // Boss Toggle
    cy += lineHeight;
    this.add.text(panelX + 12, cy, 'Boss Fight:', { fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', color: labelColor })
      .setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    const bossOn = !!(this.currentLevelConfig.hasBoss && this.currentLevelConfig.bossSpawn);
    const bossToggleBg = this.add.graphics().setScrollFactor(0).setDepth(101);
    bossToggleBg.fillStyle(bossOn ? 0x10b981 : 0x334155, 1);
    bossToggleBg.fillRoundedRect(panelX + 80, cy - 10, 44, 22, 4);
    const bossToggleKnob = this.add.circle(bossOn ? panelX + 111 : panelX + 89, cy, 9, 0xffffff).setScrollFactor(0).setDepth(102);
    const bossLabelEl = this.add.text(panelX + 134, cy, bossOn ? 'ON' : 'OFF', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold',
      color: bossOn ? '#10b981' : '#94a3b8'
    }).setOrigin(0, 0.5).setScrollFactor(0).setDepth(101);
    const bossSwitch = this.add.container(panelX + 80, cy).setScrollFactor(0).setDepth(103)
      .add([bossToggleBg, bossToggleKnob]).setInteractive({ useHandCursor: true });
    const toggleBoss = (on) => {
      bossToggleBg.clear();
      bossToggleBg.fillStyle(on ? 0x10b981 : 0x334155, 1);
      bossToggleBg.fillRoundedRect(0, 0, 44, 22, 4);
      bossToggleKnob.x = on ? 31 : 9;
      bossLabelEl.setText(on ? 'ON' : 'OFF');
      bossLabelEl.setStyle({ color: on ? '#10b981' : '#94a3b8' });
      this.currentLevelConfig.hasBoss = on;
      if (on && !this.currentLevelConfig.bossSpawn) {
        this.currentLevelConfig.bossSpawn = { x: (this.levelWidth || 3200) - 200, y: 680 };
      }
      if (!on) { this.currentLevelConfig.bossSpawn = null; }
      this.renderAllObjects();
      this.updatePropCounts();
    };
    bossSwitch.on('pointerdown', () => toggleBoss(!this.currentLevelConfig.hasBoss));
    this.propPanel.bossToggle = bossSwitch;
    this.propPanel.bossLabel = bossLabelEl;

    // Counts
    cy += lineHeight * 2;
    this.propPanel.countText = this.add.text(panelX + panelW / 2, cy, '', {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '10px', color: '#718096',
      align: 'center', lineSpacing: 3
    }).setOrigin(0.5).setScrollFactor(0).setDepth(101);
    this.updatePropCounts();

    // Export JSON Button
    cy += lineHeight * 2 + 6;
    const exportBtn = this.createPanelButton(panelX + 10, cy, panelW - 20, 28, '📋 EXPORT JSON', 0x6366f1, () => {
      const json = JSON.stringify(this.currentLevelConfig, null, 2);
      navigator.clipboard?.writeText(json).then(() => {
        const t = this.add.text(panelX + panelW / 2, cy - 20, 'JSON COPIED!', {
          fontFamily: 'Segoe UI, sans-serif', fontSize: '10px', color: '#48bb78'
        }).setOrigin(0.5).setScrollFactor(0).setDepth(200);
        this.time.delayedCall(1200, () => t.destroy());
      });
    });
  }

  createPanelButton(x, y, w, h, label, color, callback) {
    const btn = this.add.container(x, y).setScrollFactor(0).setDepth(101);
    const bg = this.add.graphics();
    bg.fillStyle(color, 0.85);
    bg.fillRoundedRect(0, 0, w, h, 6);
    const txt = this.add.text(w / 2, h / 2, label, {
      fontFamily: 'Segoe UI, sans-serif', fontSize: '11px', fontStyle: 'bold', color: '#ffffff'
    }).setOrigin(0.5);
    btn.add([bg, txt]);
    btn.setInteractive(new Phaser.Geom.Rectangle(0, 0, w, h), Phaser.Geom.Rectangle.Contains);
    btn.on('pointerover', () => { bg.clear(); bg.fillStyle(color, 1); bg.fillRoundedRect(0, 0, w, h, 6); });
    btn.on('pointerout',  () => { bg.clear(); bg.fillStyle(color, 0.85); bg.fillRoundedRect(0, 0, w, h, 6); });
    btn.on('pointerdown', callback);
    return btn;
  }

  updatePropCounts() {
    const cfg = this.currentLevelConfig;
    if (!this.propPanel.countText) return;
    const lines = [
      `Platforms: ${cfg.platforms?.length || 0}`,
      `Specials:  ${cfg.specialPlatforms?.length || 0}`,
      `Move Plat: ${cfg.movingPlatforms?.length || 0}`,
      `Spikes:    ${cfg.spikes?.length || 0}`,
      `Enemies:   ${cfg.enemies?.length || 0}`,
      `Collect:   ${cfg.collectibles?.length || 0}`,
      `Boss:      ${(cfg.hasBoss && cfg.bossSpawn) ? 'YES' : 'NO'}`
    ];
    this.propPanel.countText.setText(lines.join('\n'));
  }
}
