import { Player } from '../entities/Player.js';
import { Enemy } from '../entities/Enemy.js';
import { Collectible } from '../entities/Collectible.js';
import { MovingPlatform } from '../entities/MovingPlatform.js';
import { SpecialPlatform } from '../entities/SpecialPlatform.js';
import { Boss } from '../entities/Boss.js';
import { GameHUD } from '../systems/GameHUD.js';
import { LEVEL_DEFINITIONS } from '../levels/LevelData.js';
import { audioManager } from '../systems/AudioManager.js';
import { saveManager } from '../systems/SaveManager.js';

export class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  init(data) {
    const custom = data.customLevelConfig;
    this.isCustomLevel = !!custom;
    this.customLevelConfig = custom;
    this.levelNumber = data.levelNumber || (this.isCustomLevel ? 'CUSTOM' : 1);
    this.levelConfig = custom || LEVEL_DEFINITIONS[this.levelNumber] || LEVEL_DEFINITIONS[1];
    this.lives = data.lives !== undefined ? data.lives : 3;
    this.score = data.score !== undefined ? data.score : 0;
    this.coins = data.coins !== undefined ? data.coins : 0;
    this.hp = 100;
    this.checkpointReached = false;
    this.isLevelTransitioning = false;
  }

  create() {
    const config = this.levelConfig;
    this.physics.world.setBounds(0, 0, config.levelWidth, config.levelHeight);
    this.isLevelTransitioning = false;

    audioManager.init(this);
    audioManager.startBgm(config.theme);

    this.createBackgrounds(config);
    this.createLevelGeometry(config);

    const spawnX = this.checkpointReached ? config.checkpoint.x : config.spawn.x;
    const spawnY = this.checkpointReached ? config.checkpoint.y : config.spawn.y;
    this.player = new Player(this, spawnX, spawnY, config.playerColor);

    this.createInteractiveObjects(config);
    this.createEnemies(config);
    this.createCollectibles(config);
    this.setupCollisions();
    this.setupCamera(config);
    this.setupInput();

    this.hud = new GameHUD(this);
    this.updateHUD();

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  createBackgrounds(config) {
    const count = Math.ceil(config.levelWidth / 256) + 2;
    for (let i = 0; i < count; i++) {
      const bg = this.add.image(i * 256, config.levelHeight - 128, 'backgrounds', config.bgKey);
      bg.setOrigin(0, 1);
      bg.setDisplaySize(256, config.levelHeight);
      bg.setScrollFactor(0.25);
      bg.setDepth(-10);

      if (config.cloudKey) {
        const cloud = this.add.image(i * 256, 120, 'backgrounds', config.cloudKey);
        cloud.setOrigin(0, 0);
        cloud.setScrollFactor(0.4);
        cloud.setDepth(-8);
        cloud.setAlpha(0.65);
      }
    }
  }

  createLevelGeometry(config) {
    this.platforms = this.physics.add.staticGroup();
    this.spikes = this.physics.add.staticGroup();
    this.movingPlatformsGroup = this.physics.add.group();

    const prefix = config.tilePrefix || 'terrain_grass';

    config.platforms.forEach(plat => {
      const tileWidth = 64;
      const countX = Math.ceil(plat.w / tileWidth);
      for (let i = 0; i < countX; i++) {
        const posX = plat.x + i * tileWidth;
        let frame = `${prefix}_horizontal_middle`;
        if (i === 0) frame = `${prefix}_horizontal_left`;
        else if (i === countX - 1) frame = `${prefix}_horizontal_right`;

        const tile = this.platforms.create(posX + 32, plat.y + 24, 'tiles', frame);
        tile.body.setSize(64, 48);
        tile.body.setOffset(0, 0);
        tile.refreshBody();

        if (plat.h > 48) {
          const rows = Math.ceil((plat.h - 48) / 64);
          for (let r = 1; r <= rows; r++) {
            const fillTile = this.add.image(posX + 32, plat.y + 24 + r * 64, 'tiles', `${prefix}_block_center`);
            fillTile.setDepth(-1);
          }
        }
      }
    });

    if (config.movingPlatforms) {
      config.movingPlatforms.forEach(mp => {
        const platform = new MovingPlatform(this, mp.x, mp.y, `${prefix}_horizontal_middle`, mp);
        this.movingPlatformsGroup.add(platform);
      });
    }

    this.specialPlatformsGroup = this.physics.add.group();

    if (config.specialPlatforms) {
      config.specialPlatforms.forEach(sp => {
        const platform = new SpecialPlatform(this, sp.x, sp.y, sp.type, `${prefix}_horizontal_middle`, sp);
        this.specialPlatformsGroup.add(platform);
      });
    }

    if (config.spikes) {
      config.spikes.forEach(sp => {
        const spike = this.spikes.create(sp.x, sp.y, 'tiles', 'spikes');
        spike.body.setSize(48, 30);
        spike.body.setOffset(8, 34);
        spike.refreshBody();
      });
    }
  }

  createInteractiveObjects(config) {
    if (config.checkpoint) {
      this.checkpointFlag = this.physics.add.staticSprite(config.checkpoint.x, config.checkpoint.y, 'tiles', 'flag_off');
      this.checkpointFlag.body.setSize(40, 64);
      this.checkpointFlag.refreshBody();
    }

    this.exitFlag = this.physics.add.staticSprite(config.exit.x, config.exit.y, 'tiles', 'flag_green_a');
    this.exitFlag.body.setSize(48, 64);
    this.exitFlag.refreshBody();

    this.tweens.add({
      targets: this.exitFlag,
      angle: 4,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
  createEnemies(config) {
    this.enemiesGroup = this.physics.add.group();
    if (!config.enemies) return;
    config.enemies.forEach(e => {
      const enemy = new Enemy(this, e.x, e.y, e.type, e);
      this.enemiesGroup.add(enemy);
    });

    // Spawn Boss if Level 5 or hasBoss configured
    if (config.hasBoss && config.bossSpawn) {
      this.boss = new Boss(this, config.bossSpawn.x, config.bossSpawn.y);
    }
  }

  createCollectibles(config) {
    this.collectiblesGroup = this.physics.add.group();
    if (!config.collectibles) return;
    config.collectibles.forEach(c => {
      const item = new Collectible(this, c.x, c.y, c.type);
      this.collectiblesGroup.add(item);
    });
  }

  setupCollisions() {
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.movingPlatformsGroup);
    this.physics.add.collider(this.enemiesGroup, this.platforms);

    // Special Platforms (bouncing, falling, breakable)
    if (this.specialPlatformsGroup) {
      this.physics.add.collider(this.player, this.specialPlatformsGroup, (player, sp) => {
        if (sp.onPlayerStep) sp.onPlayerStep(player);
      });
    }

    // Boss Collisions & Projectiles
    if (this.boss) {
      this.physics.add.overlap(this.player, this.boss, () => {
        this.handlePlayerBossCollision();
      });

      this.physics.add.overlap(this.player, this.boss.fireballs, (player, fb) => {
        fb.destroy();
        this.handlePlayerDamage(30);
      });
    }

    this.physics.add.overlap(this.player, this.spikes, () => {
      this.handlePlayerDamage(35);
    });

    if (this.checkpointFlag) {
      this.physics.add.overlap(this.player, this.checkpointFlag, () => {
        if (!this.checkpointReached) {
          this.checkpointReached = true;
          this.checkpointFlag.setFrame('flag_blue_a');
          audioManager.playSfx('sfx_magic');
          this.showPopupText(this.checkpointFlag.x, this.checkpointFlag.y - 40, 'CHECKPOINT!', '#48bb78');
        }
      });
    }

    this.physics.add.overlap(this.player, this.exitFlag, () => {
      this.handleLevelComplete();
    });

    this.physics.add.overlap(this.player, this.collectiblesGroup, (player, item) => {
      this.handleCollect(item);
    });

    this.physics.add.overlap(this.player, this.enemiesGroup, (player, enemy) => {
      this.handlePlayerEnemyCollision(enemy);
    });
  }

  setupCamera(config) {
    const cam = this.cameras.main;
    cam.setBounds(0, 0, config.levelWidth, config.levelHeight);
    cam.startFollow(this.player, true, 0.08, 0.08);
    cam.setDeadzone(100, 80);
  }

  setupInput() {
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys({
      A: Phaser.Input.Keyboard.KeyCodes.A,
      D: Phaser.Input.Keyboard.KeyCodes.D,
      W: Phaser.Input.Keyboard.KeyCodes.W,
      SPACE: Phaser.Input.Keyboard.KeyCodes.SPACE,
      ESC: Phaser.Input.Keyboard.KeyCodes.ESC
    });

    this.input.keyboard.on('keydown-ESC', () => {
      this.togglePause();
    });
  }

  update(time, delta) {
    if (this.isLevelTransitioning) return;
    this.player.update(this.cursors, this.keys, delta);

    this.enemiesGroup.getChildren().forEach(e => {
      if (e.update) e.update();
    });

    if (this.boss && this.boss.update) {
      this.boss.update(this.player);
    }

    if (this.player.y > this.levelConfig.levelHeight + 80 && !this.player.isDead) {
      this.handlePlayerDamage(100, true);
    }
  }

  handlePlayerBossCollision() {
    if (this.player.isDead || !this.boss || this.boss.isDead) return;

    const playerBottom = this.player.body.y + this.player.body.height;
    const bossTop = this.boss.body.y;
    const isFalling = this.player.body.velocity.y > 0;

    if (isFalling && playerBottom <= bossTop + 35) {
      const defeated = this.boss.hit();
      this.player.setVelocityY(-480);
      this.score += 250;
      this.updateHUD();

      if (defeated) {
        this.showPopupText(this.boss.x, this.boss.y - 40, '+2500 BOSS CLEARED!', '#ffd166');
        this.score += 2500;
        this.updateHUD();
      }
    } else {
      this.handlePlayerDamage(30);
    }
  }

  handlePlayerEnemyCollision(enemy) {
    if (this.player.isDead || enemy.isDead) return;

    const playerBottom = this.player.body.y + this.player.body.height;
    const enemyTop = enemy.body.y;
    const isFalling = this.player.body.velocity.y > 0;

    if (isFalling && playerBottom <= enemyTop + 24) {
      const defeated = enemy.hit();
      this.player.setVelocityY(-400);
      this.score += 150;
      this.updateHUD();
      if (defeated) {
        this.showPopupText(enemy.x, enemy.y - 20, '+150', '#ffd166');
      }
    } else {
      this.handlePlayerDamage(25);
    }
  }

  handlePlayerDamage(amount, instantKill = false) {
    if (this.player.isDead) return;

    if (instantKill) {
      this.hp = 0;
    } else {
      const damaged = this.player.takeDamage(amount);
      if (!damaged) return;
      this.hp -= amount;
    }

    this.updateHUD();

    if (this.hp <= 0) {
      this.player.die();
      this.lives--;
      this.updateHUD();

      this.time.delayedCall(1200, () => {
        if (this.lives > 0) {
          this.respawnPlayer();
        } else {
          this.handleGameOver();
        }
      });
    }
  }

  handleCollect(item) {
    const type = item.itemType;
    item.collect();

    if (type === 'coin') {
      this.coins++;
      this.score += 100;
      audioManager.playSfx('sfx_coin');
      this.showPopupText(item.x, item.y - 15, '+100', '#ffd166');
    } else if (type === 'gem_blue' || type === 'gem_red') {
      this.score += 300;
      audioManager.playSfx('sfx_gem');
      this.showPopupText(item.x, item.y - 15, '+300', '#63b3ed');
    } else if (type === 'life') {
      this.lives++;
      audioManager.playSfx('sfx_magic');
      this.showPopupText(item.x, item.y - 15, '+1 LIFE!', '#48bb78');
    } else if (type === 'powerup_speed') {
      this.player.applyPowerUp('speed');
      this.showPopupText(item.x, item.y - 15, 'SPEED BOOST!', '#ecc94b');
    } else if (type === 'powerup_jump') {
      this.player.applyPowerUp('jump');
      this.showPopupText(item.x, item.y - 15, 'SUPER JUMP!', '#9f7aea');
    } else if (type === 'powerup_shield') {
      this.player.applyPowerUp('shield');
      this.showPopupText(item.x, item.y - 15, 'SHIELD ON!', '#4fd1c5');
    }

    this.updateHUD();
  }

  showPopupText(x, y, text, color) {
    const popup = this.add.text(x, y, text, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: color,
      stroke: '#000000',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: popup,
      y: y - 40,
      alpha: 0,
      duration: 800,
      ease: 'Power2',
      onComplete: () => popup.destroy()
    });
  }

  respawnPlayer() {
    this.hp = 100;
    const spawnX = this.checkpointReached ? this.levelConfig.checkpoint.x : this.levelConfig.spawn.x;
    const spawnY = this.checkpointReached ? this.levelConfig.checkpoint.y : this.levelConfig.spawn.y;

    this.player.destroy();
    this.player = new Player(this, spawnX, spawnY, this.levelConfig.playerColor);
    this.setupCollisions();
    this.setupCamera(this.levelConfig);
    this.updateHUD();
    this.cameras.main.fadeIn(300, 0, 0, 0);
  }

  handleLevelComplete() {
    if (this.isLevelTransitioning) return;
    this.isLevelTransitioning = true;

    audioManager.stopBgm();
    audioManager.playSfx('sfx_gem');

    saveManager.completeLevel(this.levelNumber, this.score, this.coins);

    this.cameras.main.fade(600, 0, 0, 0);
    this.time.delayedCall(700, () => {
      if (this.levelNumber >= 5) {
        this.scene.start('VictoryScene', {
          score: this.score,
          coins: this.coins
        });
      } else {
        this.scene.start('GameOverScene', {
          isVictory: true,
          levelNumber: this.levelNumber,
          score: this.score,
          coins: this.coins,
          lives: this.lives
        });
      }
    });
  }

  handleGameOver() {
    if (this.isLevelTransitioning) return;
    this.isLevelTransitioning = true;
    audioManager.stopBgm();

    this.cameras.main.fade(800, 0, 0, 0);
    this.time.delayedCall(850, () => {
      this.scene.start('GameOverScene', {
        isVictory: false,
        levelNumber: this.levelNumber,
        score: this.score,
        coins: this.coins,
        lives: 3
      });
    });
  }

  togglePause() {
    if (this.isLevelTransitioning) return;
    this.scene.pause();
    this.scene.launch('PauseScene', {
      parentSceneKey: 'GameScene',
      levelNumber: this.levelNumber
    });
  }

  updateHUD() {
    if (this.hud) {
      this.hud.updateHUD(
        this.hp,
        this.lives,
        this.coins,
        this.score,
        `LEVEL ${this.levelNumber}: ${this.levelConfig.title.toUpperCase()}`
      );
    }
  }
}
