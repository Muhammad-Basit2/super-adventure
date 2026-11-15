import { audioManager } from '../systems/AudioManager.js';

export class PauseScene extends Phaser.Scene {
  constructor() {
    super('PauseScene');
  }

  init(data) {
    this.parentSceneKey = data.parentSceneKey || 'GameScene';
    this.levelNumber = data.levelNumber || 1;
  }

  create() {
    const { width, height } = this.scale;

    // Semi-transparent overlay
    const overlay = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Pause Dialog Box
    const box = this.add.graphics();
    box.fillStyle(0x1a202c, 0.95);
    box.fillRoundedRect(width / 2 - 200, height / 2 - 220, 400, 440, 16);
    box.lineStyle(3, 0x4fd1c5, 1);
    box.strokeRoundedRect(width / 2 - 200, height / 2 - 220, 400, 440, 16);

    const title = this.add.text(width / 2, height / 2 - 160, 'GAME PAUSED', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5);

    const buttons = [
      { text: 'RESUME', action: () => this.resumeGame() },
      { text: 'RESTART LEVEL', action: () => this.restartLevel() },
      { text: 'SETTINGS', action: () => this.openSettings() },
      { text: 'MAIN MENU', action: () => this.goToMenu() }
    ];

    buttons.forEach((btn, idx) => {
      this.createButton(width / 2, height / 2 - 70 + idx * 64, btn.text, btn.action);
    });

    // ESC to resume
    this.input.keyboard.once('keydown-ESC', () => {
      this.resumeGame();
    });
  }

  createButton(x, y, label, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x2d3748, 1);
    bg.fillRoundedRect(-140, -22, 280, 44, 8);
    bg.lineStyle(2, 0x4a5568, 1);
    bg.strokeRoundedRect(-140, -22, 280, 44, 8);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, txt]);

    const hit = new Phaser.Geom.Rectangle(-140, -22, 280, 44);
    btn.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    btn.on('pointerover', () => {
      audioManager.playSfx('sfx_select');
      bg.clear();
      bg.fillStyle(0x319795, 1);
      bg.fillRoundedRect(-140, -22, 280, 44, 8);
      txt.setColor('#ffd166');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2d3748, 1);
      bg.fillRoundedRect(-140, -22, 280, 44, 8);
      txt.setColor('#ffffff');
    });

    btn.on('pointerdown', () => {
      audioManager.playSfx('sfx_magic');
      callback();
    });
  }

  resumeGame() {
    this.scene.stop();
    this.scene.resume(this.parentSceneKey);
  }

  restartLevel() {
    this.scene.stop();
    this.scene.stop(this.parentSceneKey);
    this.scene.start('GameScene', { levelNumber: this.levelNumber });
  }

  openSettings() {
    this.scene.launch('SettingsScene', { returnScene: 'PauseScene' });
  }

  goToMenu() {
    audioManager.stopBgm();
    this.scene.stop();
    this.scene.stop(this.parentSceneKey);
    this.scene.start('MenuScene');
  }
}
