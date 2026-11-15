import { saveManager } from '../systems/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';

export class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.score = data.score || 0;
    this.coins = data.coins || 0;
  }

  create() {
    const { width, height } = this.scale;
    audioManager.init(this);
    audioManager.startBgm('menu');

    // Royal victory background
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a0f2b);

    // Confetti particles
    for (let i = 0; i < 40; i++) {
      const x = Phaser.Math.Between(50, width - 50);
      const y = Phaser.Math.Between(50, height - 100);
      const colors = [0xffd166, 0x48bb78, 0x4fd1c5, 0xf687b3, 0xfffc53];
      const color = Phaser.Utils.Array.GetRandom(colors);
      const star = this.add.circle(x, y, Phaser.Math.Between(4, 9), color, 0.85);

      this.tweens.add({
        targets: star,
        y: y + Phaser.Math.Between(20, 60),
        alpha: 0.2,
        duration: Phaser.Math.Between(1000, 2500),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Title
    const title = this.add.text(width / 2, 110, '🏆 GRAND VICTORY! 🏆', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '48px',
      fontStyle: 'bold',
      color: '#ffd166',
      stroke: '#000000',
      strokeThickness: 8
    }).setOrigin(0.5);

    this.tweens.add({
      targets: title,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const sub = this.add.text(width / 2, 175, 'You conquered all 5 realms and completed SUPER ADVENTURE!', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      color: '#e2e8f0'
    }).setOrigin(0.5);

    // Characters celebration lineup
    const colors = ['green', 'yellow', 'purple', 'pink', 'beige'];
    colors.forEach((c, idx) => {
      const spr = this.add.image(width / 2 - 200 + idx * 100, 280, 'characters', `character_${c}_idle`);
      this.tweens.add({
        targets: spr,
        y: 250,
        duration: 500 + idx * 80,
        yoyo: true,
        repeat: -1,
        ease: 'Bounce.easeOut'
      });
    });

    // Score Card
    const card = this.add.graphics();
    card.fillStyle(0x24143d, 0.9);
    card.fillRoundedRect(width / 2 - 220, 360, 440, 160, 14);
    card.lineStyle(2, 0xd69e2e, 1);
    card.strokeRoundedRect(width / 2 - 220, 360, 440, 160, 14);

    this.add.text(width / 2 - 180, 390, 'Total Final Score:', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      color: '#e2e8f0'
    });
    this.add.text(width / 2 + 180, 390, `${this.score}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(1, 0);

    this.add.text(width / 2 - 180, 435, 'Total Coins Stash:', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      color: '#e2e8f0'
    });
    this.add.text(width / 2 + 180, 435, `${saveManager.data.totalCoins}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(1, 0);

    this.add.text(width / 2 - 180, 480, 'All-Time High Score:', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      color: '#e2e8f0'
    });
    this.add.text(width / 2 + 180, 480, `${saveManager.data.highScore}`, {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '24px',
      fontStyle: 'bold',
      color: '#4fd1c5'
    }).setOrigin(1, 0);

    // Return to Menu Button
    const menuBtn = this.add.container(width / 2, 580);
    const bg = this.add.graphics();
    bg.fillStyle(0x319795, 1);
    bg.fillRoundedRect(-140, -24, 280, 48, 10);
    bg.lineStyle(2, 0x81e6d9, 1);
    bg.strokeRoundedRect(-140, -24, 280, 48, 10);

    const txt = this.add.text(0, 0, 'RETURN TO MAIN MENU', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);

    menuBtn.add([bg, txt]);

    const hit = new Phaser.Geom.Rectangle(-140, -24, 280, 48);
    menuBtn.setInteractive(hit, Phaser.Geom.Rectangle.Contains);

    menuBtn.on('pointerover', () => {
      audioManager.playSfx('sfx_select');
      bg.clear();
      bg.fillStyle(0x285e61, 1);
      bg.fillRoundedRect(-140, -24, 280, 48, 10);
      txt.setColor('#ffd166');
    });

    menuBtn.on('pointerout', () => {
      bg.clear();
      bg.fillStyle(0x319795, 1);
      bg.fillRoundedRect(-140, -24, 280, 48, 10);
      txt.setColor('#ffffff');
    });

    menuBtn.on('pointerdown', () => {
      audioManager.playSfx('sfx_magic');
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(400, 0, 0, 0);
  }
}
