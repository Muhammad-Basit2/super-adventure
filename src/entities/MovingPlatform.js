export class MovingPlatform extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, frame = 'terrain_grass_horizontal_middle', config = {}) {
    super(scene, x, y, 'tiles', frame);
    this.scene = scene;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);
    this.body.checkCollision.down = false;
    this.body.checkCollision.left = false;
    this.body.checkCollision.right = false;

    const distance = config.distance || 180;
    const duration = config.duration || 2600;
    const isVertical = !!config.vertical;

    scene.tweens.add({
      targets: this,
      x: isVertical ? x : x + distance,
      y: isVertical ? y + distance : y,
      duration: duration,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }
}
