import { saveManager } from '../systems/SaveManager.js';
import { audioManager } from '../systems/AudioManager.js';

export class LevelSelectScene extends Phaser.Scene {
  constructor() {
    super('LevelSelectScene');
  }

  create() {
    const { width, height } = this.scale;
    audioManager.init(this);

    // Dark slate background
    this.add.rectangle(width / 2, height / 2, width, height, 0x111625);

    // Title
    this.add.text(width / 2, 70, 'SELECT LEVEL', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '40px',
      fontStyle: 'bold',
      color: '#ffd166'
    }).setOrigin(0.5);

    const levels = [
      { id: 1, name: 'Level 1: Green Forest', desc: 'Lush grass and basic platforms', bg: 0x2e7d32 },
      { id: 2, name: 'Level 2: Dark Cave', desc: 'Underground cavern with flying pests', bg: 0x4a148c },
      { id: 3, name: 'Level 3: Desert Adventure', desc: 'Scorching dunes and tricky jumps', bg: 0xbf360c },
      { id: 4, name: 'Level 4: Snow Mountains', desc: 'Icy peaks and floating ledges', bg: 0x0277bd },
      { id: 5, name: 'Level 5: Dark Castle', desc: 'Fortress showdown and final victory', bg: 0x212121 }
    ];

    const unlocked = saveManager.data.unlockedLevels;
    const completed = saveManager.data.completedLevels || [];

    const startY = 160;
    const cardHeight = 85;

    levels.forEach((lvl, idx) => {
      const isUnlocked = lvl.id <= unlocked;
      const isCompleted = completed.includes(lvl.id);
      const y = startY + idx * (cardHeight + 14);

      const card = this.add.container(width / 2, y);

      const bg = this.add.graphics();
      bg.fillStyle(isUnlocked ? lvl.bg : 0x1f2430, isUnlocked ? 0.85 : 0.5);
      bg.fillRoundedRect(-320, -35, 640, 70, 12);
      bg.lineStyle(2, isUnlocked ? 0x63b3ed : 0x4a5568, 1);
      bg.strokeRoundedRect(-320, -35, 640, 70, 12);

      const title = this.add.text(-290, -18, lvl.name, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '22px',
        fontStyle: 'bold',
        color: isUnlocked ? '#ffffff' : '#718096'
      });

      const desc = this.add.text(-290, 8, lvl.desc, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '14px',
        color: isUnlocked ? '#cbd5e0' : '#4a5568'
      });

      const statusText = isCompleted ? '★ COMPLETED' : (isUnlocked ? '▶ UNLOCKED' : '🔒 LOCKED');
      const statusColor = isCompleted ? '#ffd166' : (isUnlocked ? '#48bb78' : '#e53e3e');

      const status = this.add.text(280, 0, statusText, {
        fontFamily: 'Segoe UI, sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        color: statusColor
      }).setOrigin(1, 0.5);

      card.add([bg, title, desc, status]);

      if (isUnlocked) {
        const hitArea = new Phaser.Geom.Rectangle(-320, -35, 640, 70);
        card.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);

        card.on('pointerover', () => {
          audioManager.playSfx('sfx_select');
          this.tweens.add({ targets: card, scaleX: 1.02, scaleY: 1.02, duration: 100 });
        });

        card.on('pointerout', () => {
          this.tweens.add({ targets: card, scaleX: 1, scaleY: 1, duration: 100 });
        });

        card.on('pointerdown', () => {
          audioManager.stopBgm();
          audioManager.playSfx('sfx_magic');
          this.cameras.main.fade(300, 0, 0, 0);
          this.time.delayedCall(320, () => {
            this.scene.start('GameScene', { levelNumber: lvl.id });
          });
        });
      }
    });

    // Back Button
    const backBtn = this.add.text(width / 2, height - 45, '◀ BACK TO MENU', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#e2e8f0'
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    backBtn.on('pointerover', () => backBtn.setColor('#ffd166'));
    backBtn.on('pointerout', () => backBtn.setColor('#e2e8f0'));
    backBtn.on('pointerdown', () => {
      audioManager.playSfx('sfx_select');
      this.scene.start('MenuScene');
    });

    this.cameras.main.fadeIn(300, 0, 0, 0);
  }
}
