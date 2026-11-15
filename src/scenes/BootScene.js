export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Show minimalist loading indicator
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'Starting Super Adventure...', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);
  }

  create() {
    this.scene.start('PreloadScene');
  }
}
