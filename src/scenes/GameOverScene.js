import { saveManager } from '../systems/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.isVictory = !!data.isVictory;
    this.levelNumber = data.levelNumber || 1;
    this.score = data.score || 0;
    this.coins = data.coins || 0;
    this.lives = data.lives || 3;
  }

  create() {
    const { width, height } = this.scale;
    audioManager.init(this);

    // Dark gradient background
    const bg = this.add.rectangle(width / 2, height / 2, width, height, this.isVictory ? 0x0f2b1d : 0x2b0f14);

    const titleText = this.isVictory ? 'LEVEL COMPLETE!' : 'GAME OVER';
    const titleColor = this.isVictory ? '#48bb78' : '#e53e3e';

    const title = this.add.text(width / 2, 140, titleText, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '52px',
      fontStyle: 'bold',
      color: titleColor,
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    // Decorative mascot
    const frame = this.isVictory ? 'character_green_idle' : 'character_green_hit';
    const char = this.add.image(width / 2, 240, 'characters', frame).setScale(1.2);

    if (this.isVictory) {
      this.tweens.add({
        targets: char,
        y: 220,
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Stats Card
    const card = this.add.graphics();
    card.fillStyle(0x1a202c, 0.85);
    card.fillRoundedRect(width / 2 - 200, 310, 400, 160, 12);
    card.lineStyle(2, 0x4a5568, 1);
    card.strokeRoundedRect(width / 2 - 200, 310, 400, 160, 12);

    this.add.text(width / 2 - 160, 340, `Level Score:`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#a0aec0'
    });
    this.add.text(width / 2 + 160, 340, `${this.score}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(1, 0);

    this.add.text(width / 2 - 160, 380, `Coins Collected:`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#a0aec0'
    });
    this.add.text(width / 2 + 160, 380, `${this.coins}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(1, 0);

    this.add.text(width / 2 - 160, 420, `High Score:`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#a0aec0'
    });
    this.add.text(width / 2 + 160, 420, `${saveManager.data.highScore}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#4fd1c5'
    }).setOrigin(1, 0);

    // Buttons
    if (this.isVictory) {
      this.createButton(width / 2 - 130, 530, 'NEXT LEVEL', () => {
        const nextLvl = Math.min(5, this.levelNumber + 1);
        this.scene.start('GameScene', {
          levelNumber: nextLvl,
          score: this.score,
          coins: this.coins,
          lives: this.lives
        });
      });
    } else {
      this.createButton(width / 2 - 130, 530, 'TRY AGAIN', () => {
        this.scene.start('GameScene', {
          levelNumber: this.levelNumber,
          lives: 3
        });
      });
    }

    this.createButton(width / 2 + 130, 530, 'MAIN MENU', () => {
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }

  createButton(x, y, label, callback) {
    const btn = this.add.container(x, y);

    const bg = this.add.graphics();
    bg.fillStyle(0x2d3748, 1);
    bg.fillRoundedRect(-110, -22, 220, 44, 8);
    bg.lineStyle(2, 0x4a5568, 1);
    bg.strokeRoundedRect(-110, -22, 220, 44, 8);

    const txt = this.add.text(0, 0, label, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    btn.add([bg, txt]);

    const hit = new Phaser.Geom.Rectangle(-110, -22, 220, 44);
    btn.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    btn.on('pointerover', () => {
      audioManager.playSfx('sfx_select');
      bg.clear();
      bg.fillStyle(0x319795, 1);
      bg.fillRoundedRect(-110, -22, 220, 44, 8);
      txt.setColor('#ffd166');
    });

    btn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x2d3748, 1);
      bg.fillRoundedRect(-110, -22, 220, 44, 8);
      txt.setColor('#ffffff');
    });

    btn.on('pointerdown', () => {
      audioManager.playSfx('sfx_magic');
      callback();
    });
  }
}
