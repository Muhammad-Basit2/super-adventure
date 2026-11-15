import { saveManager } from '../systems/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    const { width, height } = this.scale;
    audioManager.init(this);
    audioManager.startBgm('menu');

    // Dynamic animated background
    this.createAnimatedBackground(width, height);

    // Game Logo / Title
    this.createLogo(width, height);

    // Menu Buttons
    this.createMenuButtons(width, height);

    // Controls reminder at footer
    this.add.text(width / 2, height - 30, 'Controls: [A/D] or [Arrows] Move  •  [SPACE / W] Jump (Double Jump!)  •  [ESC] Pause', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '15px',
      color: '#a0aec0'
    }).setOrigin(0.5);

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  createAnimatedBackground(width, height) {
    const cols = Math.ceil(width / 256) + 1;
    this.bgTiles = [];
    for (let i = 0; i < cols; i++) {
      const bg = this.add.image(i * 256, height, 'backgrounds', 'background_color_trees')
        .setOrigin(0, 1)
        .setDisplaySize(256, height);
      this.bgTiles.push(bg);
    }

    // Floating cartoon character decoration
    this.mascot = this.add.image(width - 180, height - 260, 'characters', 'character_green_idle')
      .setScale(1.2);
    this.tweens.add({
      targets: this.mascot,
      y: height - 290,
      angle: 3,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Wandering snail
    this.snail = this.add.image(140, height - 120, 'enemies', 'snail_walk_a').setScale(1.1);
    this.tweens.add({
      targets: this.snail,
      x: 280,
      duration: 3500,
      yoyo: true,
      repeat: -1,
      onYoyo: () => this.snail.toggleFlipX(),
      onRepeat: () => this.snail.toggleFlipX()
    });
  }

  createLogo(width, height) {
    const logoContainer = this.add.container(width / 2, 130);

    const titleShadow = this.add.text(4, 4, 'SUPER ADVENTURE', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '62px',
      fontStyle: 'bold',
      color: '#000000',
      stroke: '#000000',
      strokeThickness: 10
    }).setOrigin(0.5).setAlpha(0.6);

    const title = this.add.text(0, 0, 'SUPER ADVENTURE', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '62px',
      fontStyle: 'bold',
      color: '#ffd166',
      stroke: '#2c1810',
      strokeThickness: 8
    }).setOrigin(0.5);

    const subtitle = this.add.text(0, 52, '★ 2D PLATFORMER ODYSSEY ★', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#4fd1c5',
      letterSpacing: 4
    }).setOrigin(0.5);

    logoContainer.add([titleShadow, title, subtitle]);

    this.tweens.add({
      targets: logoContainer,
      y: 138,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  createMenuButtons(width, height) {
    const startY = 240;
    const spacing = 56;

    const buttons = [
      { text: 'PLAY GAME', action: () => this.startGame(1) },
      { text: 'CONTINUE GAME', action: () => this.continueGame() },
      { text: 'LEVEL SELECT', action: () => this.openLevelSelect() },
      { text: 'LEVEL EDITOR / ADMIN', action: () => this.openLevelEditor() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'HOW TO PLAY', action: () => this.openHowToPlay() },
      { text: 'EXIT GAME', action: () => this.exitGame() }
    ];

    buttons.forEach((btn, idx) => {
      this.createMenuButton(width / 2, startY + idx * spacing, btn.text, btn.action);
    });
  }

  createMenuButton(x, y, label, callback) {
    const btnContainer = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x1a202c, 0.85);
    bg.fillRoundedRect(-160, -22, 320, 46, 10);
    bg.lineStyle(2, 0x4a5568, 1);
    bg.strokeRoundedRect(-160, -22, 320, 46, 10);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    btnContainer.add([bg, txt]);

    const hitArea = new Phaser.Geom.Rectangle(-160, -22, 320, 46);
    btnContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

    btnContainer.on('pointerover', () => {
      audioManager.playSfx('sfx_select');
      bg.clear();
      bg.fillStyle(0x2d3748, 1);
      bg.fillRoundedRect(-160, -22, 320, 46, 10);
      bg.lineStyle(2, 0x4fd1c5, 1);
      bg.strokeRoundedRect(-160, -22, 320, 46, 10);
      txt.setColor('#ffd166');
      this.tweens.add({ targets: btnContainer, scaleX: 1.05, scaleY: 1.05, duration: 100 });
    });

    btnContainer.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x1a202c, 0.85);
      bg.fillRoundedRect(-160, -22, 320, 46, 10);
      bg.lineStyle(2, 0x4a5568, 1);
      bg.strokeRoundedRect(-160, -22, 320, 46, 10);
      txt.setColor('#ffffff');
      this.tweens.add({ targets: btnContainer, scaleX: 1, scaleY: 1, duration: 100 });
    });

    btnContainer.on('pointerdown', () => {
      audioManager.playSfx('sfx_magic');
      callback();
    });
  }

  startGame(levelNum = 1) {
    audioManager.stopBgm();
    this.cameras.main.fade(300, 0, 0, 0);
    this.time.delayedCall(320, () => {
      this.scene.start('GameScene', { levelNumber: levelNum });
    });
  }

  continueGame() {
    const latest = saveManager.data.unlockedLevels || 1;
    this.startGame(latest);
  }

  openLevelSelect() {
    this.scene.start('LevelSelectScene');
  }

  openLevelEditor() {
    audioManager.stopBgm();
    this.scene.start('LevelEditorScene');
  }

  openSettings() {
    this.scene.launch('SettingsScene', { returnScene: 'MenuScene' });
  }

  openHowToPlay() {
    this.scene.launch('HowToPlayScene');
  }

  exitGame() {
    if (window.electronAPI && window.electronAPI.quitApp) {
      window.electronAPI.quitApp();
    } else {
      window.close();
    }
  }
}
