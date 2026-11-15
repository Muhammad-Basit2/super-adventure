import { audioManager } from '../systems/AudioManager.js';

export class HowToPlayScene extends Phaser.Scene {
  constructor() {
    super('HowToPlayScene');
  }

  create() {
    const { width, height } = this.scale;
    audioManager.init(this);

    // Overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    // Dialog card
    const card = this.add.graphics();
    card.fillStyle(0x1a202c, 0.98);
    card.fillRoundedRect(width / 2 - 280, height / 2 - 240, 560, 480, 16);
    card.lineStyle(2, 0x4fd1c5, 1);
    card.strokeRoundedRect(width / 2 - 280, height / 2 - 240, 560, 480, 16);

    this.add.text(width / 2, height / 2 - 195, 'HOW TO PLAY', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '32px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5);

    const guides = [
      { key: 'A / D or Left / Right Arrows', desc: 'Move character left and right across platforms' },
      { key: 'SPACE or W or Up Arrow', desc: 'Jump once, and press again in mid-air to DOUBLE JUMP!' },
      { key: 'Jumping on Enemies', desc: 'Stomp on enemy heads from above to defeat them' },
      { key: 'Coins & Rare Gems', desc: 'Gather gold coins (+100) and gems (+300) to boost score' },
      { key: 'Power-ups', desc: 'Collect Star (Speed), Spring (Super Jump), and Shield (Armor)' },
      { key: 'Checkpoints & Goal', desc: 'Touch the blue flag for checkpoint, reach the green flag to win' }
    ];

    let startY = height / 2 - 130;
    guides.forEach((g) => {
      this.add.text(width / 2 - 240, startY, `• ${g.key}:`, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#4fd1c5'
      });

      this.add.text(width / 2 - 240, startY + 20, `   ${g.desc}`, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '14px',
        color: '#e2e8f0'
      });

      startY += 50;
    });

    const closeBtn = this.add.text(width / 2, height / 2 + 200, 'BACK TO MENU', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    closeBtn.on('pointerover', () => closeBtn.setColor('#ffffff'));
    closeBtn.on('pointerout', () => closeBtn.setColor('#ffd166'));
    closeBtn.on('pointerdown', () => {
      audioManager.playSfx('sfx_select');
      this.scene.stop();
    });
  }
}
