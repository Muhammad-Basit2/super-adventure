import { saveManager } from '../systems/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super('PreloadScene');
  }

  preload() {
    const { width, height } = this.scale;

    // Loading background & bar
    const bg = this.add.rectangle(width / 2, height / 2, width, height, 0x11151c);
    const progressBox = this.add.graphics();
    const progressBar = this.add.graphics();
    progressBox.fillStyle(0x222a38, 0.8);
    progressBox.fillRoundedRect(width / 2 - 200, height / 2 - 15, 400, 30, 10);

    const titleText = this.add.text(width / 2, height / 2 - 60, 'SUPER ADVENTURE', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '36px',
      fontStyle: 'bold',
      color: '#f6d365'
    }).setOrigin(0.5);

    const loadingText = this.add.text(width / 2, height / 2 + 35, 'Loading Assets 0%...', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      color: '#a0aec0'
    }).setOrigin(0.5);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0x48bb78, 1);
      progressBar.fillRoundedRect(width / 2 - 195, height / 2 - 10, 390 * value, 20, 6);
      loadingText.setText(`Loading Assets ${Math.floor(value * 100)}%...`);
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // 1. Load Kenney Spritesheets with XML Texture Atlases
    const basePath = 'assets/Spritesheets/';
    this.load.atlasXML('characters', basePath + 'spritesheet-characters-default.png', basePath + 'spritesheet-characters-default.xml');
    this.load.atlasXML('enemies', basePath + 'spritesheet-enemies-default.png', basePath + 'spritesheet-enemies-default.xml');
    this.load.atlasXML('tiles', basePath + 'spritesheet-tiles-default.png', basePath + 'spritesheet-tiles-default.xml');
    this.load.atlasXML('backgrounds', basePath + 'spritesheet-backgrounds-default.png', basePath + 'spritesheet-backgrounds-default.xml');

    // 1b. Load Kenney Pixel Platformer Assets (18x18 & 24x24 Packed)
    const pixelPath = 'assets/pixel-platformer/Tilemap/';
    this.load.spritesheet('pixel_tiles', pixelPath + 'tilemap_packed.png', {
      frameWidth: 18,
      frameHeight: 18
    });
    this.load.spritesheet('pixel_characters', pixelPath + 'tilemap-characters_packed.png', {
      frameWidth: 24,
      frameHeight: 24
    });
    this.load.spritesheet('pixel_backgrounds', pixelPath + 'tilemap-backgrounds_packed.png', {
      frameWidth: 24,
      frameHeight: 24
    });

    // 2. Load Kenney OGG Sound Effects
    const soundPath = 'assets/Sounds/';
    this.load.audio('sfx_jump', soundPath + 'sfx_jump.ogg');
    this.load.audio('sfx_jump_high', soundPath + 'sfx_jump-high.ogg');
    this.load.audio('sfx_coin', soundPath + 'sfx_coin.ogg');
    this.load.audio('sfx_gem', soundPath + 'sfx_gem.ogg');
    this.load.audio('sfx_hurt', soundPath + 'sfx_hurt.ogg');
    this.load.audio('sfx_disappear', soundPath + 'sfx_disappear.ogg');
    this.load.audio('sfx_magic', soundPath + 'sfx_magic.ogg');
    this.load.audio('sfx_select', soundPath + 'sfx_select.ogg');
    this.load.audio('sfx_bump', soundPath + 'sfx_bump.ogg');
    this.load.audio('sfx_throw', soundPath + 'sfx_throw.ogg');
  }

  async create() {
    // Initialize save system
    await saveManager.init();
    audioManager.init(this);

    // Create player animations
    this.createPlayerAnimations();
    this.createEnemyAnimations();

    this.time.delayedCall(400, () => {
      this.scene.start('MenuScene');
    });
  }

  createPlayerAnimations() {
    const chars = ['green', 'yellow', 'purple', 'pink', 'beige'];
    chars.forEach(c => {
      // Idle
      this.anims.create({
        key: `player_${c}_idle`,
        frames: [{ key: 'characters', frame: `character_${c}_idle` }],
        frameRate: 1,
        repeat: -1
      });

      // Walk
      this.anims.create({
        key: `player_${c}_walk`,
        frames: [
          { key: 'characters', frame: `character_${c}_walk_a` },
          { key: 'characters', frame: `character_${c}_walk_b` }
        ],
        frameRate: 10,
        repeat: -1
      });

      // Jump
      this.anims.create({
        key: `player_${c}_jump`,
        frames: [{ key: 'characters', frame: `character_${c}_jump` }],
        frameRate: 1
      });

      // Hurt / Hit
      this.anims.create({
        key: `player_${c}_hit`,
        frames: [{ key: 'characters', frame: `character_${c}_hit` }],
        frameRate: 1
      });

      // Duck / Crouch
      this.anims.create({
        key: `player_${c}_duck`,
        frames: [{ key: 'characters', frame: `character_${c}_duck` }],
        frameRate: 1
      });
    });
  }

  createEnemyAnimations() {
    // Snail
    this.anims.create({
      key: 'enemy_snail_idle',
      frames: [{ key: 'enemies', frame: 'snail_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_snail_walk',
      frames: [
        { key: 'enemies', frame: 'snail_walk_a' },
        { key: 'enemies', frame: 'snail_walk_b' }
      ],
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_snail_hurt',
      frames: [{ key: 'enemies', frame: 'snail_shell' }],
      frameRate: 1
    });

    // Slime Normal (Green)
    this.anims.create({
      key: 'enemy_slime_idle',
      frames: [{ key: 'enemies', frame: 'slime_normal_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_slime_walk',
      frames: [
        { key: 'enemies', frame: 'slime_normal_walk_a' },
        { key: 'enemies', frame: 'slime_normal_walk_b' }
      ],
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_slime_hurt',
      frames: [{ key: 'enemies', frame: 'slime_normal_flat' }],
      frameRate: 1
    });

    // Fire Slime (Orange / Strong)
    this.anims.create({
      key: 'enemy_fire_slime_idle',
      frames: [{ key: 'enemies', frame: 'slime_fire_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_fire_slime_walk',
      frames: [
        { key: 'enemies', frame: 'slime_fire_walk_a' },
        { key: 'enemies', frame: 'slime_fire_walk_b' }
      ],
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_fire_slime_hurt',
      frames: [{ key: 'enemies', frame: 'slime_fire_flat' }],
      frameRate: 1
    });

    // Spike Slime (Hazard / Strong)
    this.anims.create({
      key: 'enemy_spike_slime_idle',
      frames: [{ key: 'enemies', frame: 'slime_spike_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_spike_slime_walk',
      frames: [
        { key: 'enemies', frame: 'slime_spike_walk_a' },
        { key: 'enemies', frame: 'slime_spike_walk_b' }
      ],
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_spike_slime_hurt',
      frames: [{ key: 'enemies', frame: 'slime_spike_flat' }],
      frameRate: 1
    });

    // Bee (Flying)
    this.anims.create({
      key: 'enemy_bee_idle',
      frames: [{ key: 'enemies', frame: 'bee_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_bee_fly',
      frames: [
        { key: 'enemies', frame: 'bee_a' },
        { key: 'enemies', frame: 'bee_b' }
      ],
      frameRate: 12,
      repeat: -1
    });

    // Fly (Buzzing)
    this.anims.create({
      key: 'enemy_fly_idle',
      frames: [{ key: 'enemies', frame: 'fly_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_fly_buzz',
      frames: [
        { key: 'enemies', frame: 'fly_a' },
        { key: 'enemies', frame: 'fly_b' }
      ],
      frameRate: 14,
      repeat: -1
    });

    // Mouse (Fast walker)
    this.anims.create({
      key: 'enemy_mouse_idle',
      frames: [{ key: 'enemies', frame: 'mouse_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_mouse_walk',
      frames: [
        { key: 'enemies', frame: 'mouse_walk_a' },
        { key: 'enemies', frame: 'mouse_walk_b' }
      ],
      frameRate: 8,
      repeat: -1
    });

    // Frog
    this.anims.create({
      key: 'enemy_frog_idle',
      frames: [{ key: 'enemies', frame: 'frog_idle' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_frog_jump',
      frames: [{ key: 'enemies', frame: 'frog_jump' }],
      frameRate: 1
    });
    this.anims.create({
      key: 'enemy_frog_rest',
      frames: [{ key: 'enemies', frame: 'frog_rest' }],
      frameRate: 1
    });

    // Ladybug
    this.anims.create({
      key: 'enemy_ladybug_walk',
      frames: [
        { key: 'enemies', frame: 'ladybug_walk_a' },
        { key: 'enemies', frame: 'ladybug_walk_b' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_ladybug_fly',
      frames: [{ key: 'enemies', frame: 'ladybug_fly' }],
      frameRate: 1
    });

    // Barnacle / Boss Turret
    this.anims.create({
      key: 'enemy_barnacle_idle',
      frames: [{ key: 'enemies', frame: 'barnacle_attack_rest' }],
      frameRate: 1,
      repeat: -1
    });
    this.anims.create({
      key: 'enemy_barnacle_attack',
      frames: [
        { key: 'enemies', frame: 'barnacle_attack_a' },
        { key: 'enemies', frame: 'barnacle_attack_b' }
      ],
      frameRate: 8,
      repeat: -1
    });

    // Collectibles: Coins spin & Gem sparkle
    this.anims.create({
      key: 'anim_coin_gold',
      frames: [
        { key: 'tiles', frame: 'coin_gold' },
        { key: 'tiles', frame: 'coin_gold_side' }
      ],
      frameRate: 5,
      repeat: -1
    });
  }
}
