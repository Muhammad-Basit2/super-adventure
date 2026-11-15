export class GameHUD {
  constructor(scene) {
    this.scene = scene;
    this.createElements();
  }

  createElements() {
    const { width } = this.scene.scale;

    this.container = this.scene.add.container(0, 0);
    this.container.setScrollFactor(0);
    this.container.setDepth(100);

    const banner = this.scene.add.graphics();
    banner.fillStyle(0x0c0f17, 0.75);
    banner.fillRoundedRect(16, 12, width - 32, 54, 12);
    banner.lineStyle(2, 0x2d3748, 0.9);
    banner.strokeRoundedRect(16, 12, width - 32, 54, 12);
    this.container.add(banner);

    // Heart icon & Health text
    const heartIcon = this.scene.add.image(45, 38, 'tiles', 'heart').setScale(0.7);
    this.container.add(heartIcon);

    this.hpText = this.scene.add.text(70, 27, '100', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ff4d6d'
    });
    this.container.add(this.hpText);

    // Lives
    const lifeIcon = this.scene.add.image(155, 38, 'tiles', 'hud_player_green').setScale(0.85);
    this.container.add(lifeIcon);

    this.livesText = this.scene.add.text(182, 27, 'x 3', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#48bb78'
    });
    this.container.add(this.livesText);

    // Coins
    const coinIcon = this.scene.add.image(265, 38, 'tiles', 'coin_gold').setScale(0.75);
    this.container.add(coinIcon);

    this.coinText = this.scene.add.text(290, 27, 'x 0', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffd166'
    });
    this.container.add(this.coinText);

    // Score
    this.scoreText = this.scene.add.text(400, 27, 'SCORE: 00000', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '20px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    this.container.add(this.scoreText);

    // Level Title
    this.levelText = this.scene.add.text(width / 2 + 100, 27, 'LEVEL 1: GREEN FOREST', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#63b3ed'
    }).setOrigin(0, 0);
    this.container.add(this.levelText);

    // Pause Button
    const pauseBtn = this.scene.add.text(width - 45, 25, '❚❚', {
      fontFamily: 'Segoe UI, sans-serif',
      fontSize: '22px',
      color: '#e2e8f0'
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    pauseBtn.on('pointerover', () => pauseBtn.setColor('#f6d365'));
    pauseBtn.on('pointerout', () => pauseBtn.setColor('#e2e8f0'));
    pauseBtn.on('pointerdown', () => this.scene.togglePause());
    this.container.add(pauseBtn);
  }

  updateHUD(hp, lives, coins, score, levelTitle) {
    this.hpText.setText(`${Math.max(0, hp)}`);
    this.livesText.setText(`x ${lives}`);
    this.coinText.setText(`x ${coins}`);
    this.scoreText.setText(`SCORE: ${String(score).padStart(5, '0')}`);
    if (levelTitle) this.levelText.setText(levelTitle);
  }
}
