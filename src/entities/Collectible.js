export class Collectible extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type = 'coin') {
    let frame = 'coin_gold';
    if (type === 'gem_blue') frame = 'gem_blue';
    else if (type === 'gem_red') frame = 'gem_red';
    else if (type === 'powerup_speed') frame = 'star';
    else if (type === 'powerup_jump') frame = 'spring';
    else if (type === 'powerup_shield') frame = 'lock_blue';
    else if (type === 'life') frame = 'heart';

    super(scene, x, y, 'tiles', frame);
    this.scene = scene;
    this.itemType = type;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.body.setAllowGravity(false);
    this.body.setImmovable(true);

    // Floating bounce animation
    scene.tweens.add({
      targets: this,
      y: y - 8,
      duration: 700 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  collect() {
    this.body.enable = false;

    // Pop animation
    this.scene.tweens.add({
      targets: this,
      y: this.y - 30,
      scaleX: 1.4,
      scaleY: 1.4,
      alpha: 0,
      duration: 300,
      ease: 'Back.easeOut',
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
